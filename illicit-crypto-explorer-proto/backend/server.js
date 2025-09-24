require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { readAll, find } = require('./services/store');
const { upsert } = require('./services/store');
const { getAddressEnrichment } = require('./services/nansen');
const { classifyWithGemini } = require('./services/gemini');

const PORT = process.env.PORT || 5000;
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Frontend usage examples:
// GET /api/addresses - populate the left list in your dashboard
// GET /api/address/:addr - when user clicks an item to populate right panels  
// GET /api/graph/:addr - to build interactive canvas/network graph

// LIST - Returns summary of all addresses for the main list view
app.get('/api/addresses', async (req, res) => {
  try {
    const all = await readAll();
    // return lightweight summary to populate list
    const summary = all.map(a => ({
      address: a.address,
      tags: a.tags || [],
      ai: a.ai || {},
      lastSeen: a.lastSeen,
      snippet: a.nansen?.shortText || (a.nansen?.summary || '').slice(0,200)
    }));
    res.json(summary);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// DETAIL - Returns full details for a single address
app.get('/api/address/:addr', async (req, res) => {
  try {
    const addr = req.params.addr;
    const obj = await find(addr);
    if (!obj) return res.status(404).json({ message: 'Address not found' });
    res.json(obj);
  } catch (error) {
    console.error('Error fetching address details:', error);
    res.status(500).json({ error: 'Failed to fetch address details' });
  }
});

// GRAPH - Returns network graph data for visualization
app.get('/api/graph/:addr', async (req, res) => {
  try {
    const addr = req.params.addr;
    const obj = await find(addr);
    if (!obj) return res.status(404).json({ message: 'Address not found' });
    
    // ensure nodes are unique
    const nodesMap = {};
    (obj.graph.nodes || []).forEach(n => { nodesMap[n.id] = n; });
    const nodes = Object.values(nodesMap);
    const links = (obj.graph.links || []);
    
    // Format for react-force-graph or D3 rendering
    res.json({ nodes, links });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({ error: 'Failed to fetch graph data' });
  }
});

// SEED - On-demand enrichment/seeding of single address (protected route)
app.post('/api/seed', async (req, res) => {
  try {
    // protect this route with a simple env token to prevent accidental runs
    const token = req.headers['x-seed-key'] || req.query.key;
    if (token !== process.env.SEED_PROTECT_KEY) {
      return res.status(403).json({ error: 'Forbidden - invalid seed key' });
    }
    
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address required in request body' });
    
    console.log('Seeding address:', address);
    const nansen = await getAddressEnrichment(address);
    const contextText = `Nansen summary: ${JSON.stringify(nansen).slice(0,800)}`;
    const ai = await classifyWithGemini(contextText, address);
    
    const sampleTxs = (nansen?.txs || []).slice(0,6).map(t => ({ 
      txHash: t.hash || t.txHash, 
      from: t.from, 
      to: t.to, 
      amount: t.value || t.amount 
    }));
    
    const nodes = [{ id: address, label: address, type: 'address', riskScore: ai.confidence || 0.5 }];
    const links = sampleTxs.map((t, i) => {
      const other = t.from && t.from !== address ? t.from : (t.to && t.to !== address ? t.to : `node_${i}`);
      nodes.push({ id: other, label: other, type: 'address' });
      return { 
        source: address, 
        target: other, 
        value: t.amount || 0, 
        txHash: t.txHash || t.txHash, 
        token: t.token || 'ETH' 
      };
    });
    
    const obj = { 
      address, 
      nansen, 
      ai, 
      tags: (ai?.suggested_tags || []).slice(0,5), 
      lastSeen: nansen?.lastSeen || new Date().toISOString(), 
      sampleTx: sampleTxs, 
      graph: { nodes, links } 
    };
    
    await upsert(obj);
    res.json({ status: 'ok', obj });
  } catch (error) {
    console.error('Error seeding address:', error);
    res.status(500).json({ error: 'Failed to seed address: ' + error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Illicit Crypto Explorer Backend listening on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`🔍 Frontend should call these endpoints for data`);
});
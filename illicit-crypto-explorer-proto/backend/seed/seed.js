require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { getAddressEnrichment } = require('../services/nansen');
const { classifyWithGemini } = require('../services/gemini');
const { upsert } = require('../services/store');

const RATE_MS = 350; // wait between calls
// Replace these sample addresses with your real 20 illicit addresses or paste into seed/addresses.txt
const fallbackAddresses = [
  "0xabc1230000000000000000000000000000000001",
  "0xdef4560000000000000000000000000000000002",
  "0x111222333444555666777888999000aaaabbbb00",
  "0x1a2b3c4d5e6f7890abcdef1234567890abcdef01",
  "0x9876543210fedcba0987654321fedcba09876543",
  "0xdeadbeefcafebabe1234567890abcdef12345678",
  "0x0123456789abcdef0123456789abcdef01234567",
  "0xfedcba9876543210fedcba9876543210fedcba98",
  "0x1111222233334444555566667777888899990000",
  "0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff",
  "0x1234567890abcdef1234567890abcdef12345678",
  "0xffffff0000000011111111222222223333333344",
  "0x555555666666777777888888999999aaaaaabbbb",
  "0xccccccddddddeeeeeeffffffffff000000111111",
  "0x777777888888999999aaaaaabbbbbbccccccdddd",
  "0x222222333333444444555555666666777777888",
  "0xeeeeeeffffffffff000000111111222222333333",
  "0x999999aaaaaabbbbbbccccccddddddeeeeeefffff",
  "0x444444555555666666777777888888999999aaaa",
  "0x000000111111222222333333444444555555666"
];

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function run() {
  const fromFile = path.join(__dirname, 'addresses.txt');
  let list = fallbackAddresses;
  if (fs.existsSync(fromFile)) {
    const txt = fs.readFileSync(fromFile, 'utf8').trim();
    if (txt) list = txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  }

  console.log(`Starting to process ${list.length} addresses...`);
  
  const { getAddressLabels } = require('../services/nansen');
  for (const addr of list) {
    console.log('Processing', addr);
    const nansen = await getAddressLabels(addr, "ethereum");
    // build context text for AI
    const contextText = `Nansen summary: ${JSON.stringify(nansen).slice(0,800)}\nPublic scraped context: (simulated) This address was reported on public sources for suspicious activity.`;
    const ai = await classifyWithGemini(contextText, addr);
    // No txs in label response, so sampleTxs and graph will be empty or mock
    const sampleTxs = [];
    const nodes = [{ id: addr, label: addr, type: 'address', riskScore: ai.confidence || 0.5 }];
    const links = [];
    const obj = {
      address: addr,
      nansen,
      ai,
      tags: (ai?.suggested_tags || []).concat(nansen?.labels || []).slice(0,10),
      lastSeen: new Date().toISOString(),
      sampleTx: sampleTxs,
      graph: { nodes, links }
    };
    await upsert(obj);
    await sleep(RATE_MS);
  }
  console.log('Seeding completed');
}

run().catch(e => { console.error(e); process.exit(1); });
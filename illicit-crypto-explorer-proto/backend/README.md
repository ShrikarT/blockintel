# Illicit Crypto Explorer Backend

A Node.js backend prototype that integrates Nansen API and Gemini AI to fetch, enrich, and analyze illicit cryptocurrency addresses.

## Setup Instructions

### 1. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your API keys:
# - NANSEN_API_KEY: Your Nansen API key
# - NANSEN_BASE_URL: Nansen API base URL (update if different from placeholder)
# - GEMINI_API_KEY: Your Gemini API key  
# - GEMINI_API_URL: Gemini API URL (update if using Vertex AI or different endpoint)
# - SEED_PROTECT_KEY: Secret key to protect the seed endpoint
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Initial Data
```bash
# Option A: Use the fallback addresses in seed/seed.js
npm run seed

# Option B: Create seed/addresses.txt with your 20 real addresses (one per line)
# Then run: npm run seed
```

### 4. Start Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

The server runs on `http://localhost:5000` by default.

### GET /api/addresses
Returns list of addresses with summary fields for the main dashboard list.

### GET /api/address/:address
Returns detailed information for a specific address.

### GET /api/graph/:address
Returns network graph data formatted for react-force-graph or D3.

### POST /api/seed
Protected endpoint to seed/enrich a single address on demand.
- Requires `x-seed-key` header or `key` query param matching `SEED_PROTECT_KEY`
- Body: `{ "address": "0x..." }`

## Configuration Notes

### Nansen API Integration
- Update `services/nansen.js` if your Nansen endpoint paths differ from the placeholder
- The current placeholder uses: `/v1/address/${address}/enrichment`
- Includes retry logic with exponential backoff (3 attempts)
- Rate limited to 300ms between calls

### Gemini AI Integration  
- Update `services/gemini.js` if using Vertex AI or different endpoint format
- Current placeholder uses: `/classify` endpoint
- Configured for zero-shot classification into: Drugs, Ransomware, Fraud/Scam, Money Laundering, Terror Financing, Other
- Returns confidence scores and explanations

### Frontend Integration
Your frontend should call these endpoints:
- `GET /api/addresses` - to populate the address list
- `GET /api/address/:addr` - when user clicks an item for details  
- `GET /api/graph/:addr` - to build the interactive network visualization

## Data Storage
- Simple JSON file storage at `backend/data/addresses.json`
- Automatically created when seeding runs
- Each address object includes Nansen data, AI classification, tags, and graph structure

## Security
- API keys stored in `.env` (not committed to git)
- Seed endpoint protected by secret key
- CORS enabled for frontend integration
- Helmet.js for basic security headers

## Debugging Tips
- Check console logs for API response shapes during first runs
- Test Nansen endpoints with curl first if having issues
- Modify response parsing in services if API formats differ
- Use small test batches before running full seed process




# BlockIntel - Crypto Intelligence Platform

A prototype crypto intelligence platform for analyzing blockchain addresses and detecting illicit activities.

## Features
- Real-time address analysis with AI-powered classification
- Integration with Nansen API for enhanced address labeling  
- Gemini AI for intelligent threat assessment
- Interactive network graph visualization
- Case management and investigation tracking
- Professional dashboard with advanced analytics

## Setup Instructions

### Backend:
1. `cd backend`
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and fill in API keys and URLs (leave empty to use mock fallback)
4. `uvicorn main:app --reload --port 8000`

### Frontend:
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Optional: Create `frontend/.env.local` and set `VITE_API_BASE_URL=http://localhost:8000`

## API Configuration
- **NANSEN_API_URL**: Replace with actual Nansen API endpoint for address labels
- **GEMINI_API_URL**: Replace with official Gemini Generative AI endpoint and auth method

### Build and serve frontend from backend (optional)
1. From workspace root: `./build-and-deploy.ps1`
2. This runs `frontend npm run build:deploy` and copies the built assets to `backend/static`.
3. Then FastAPI serves the app at `http://127.0.0.1:8000`.

## Notes
- Nansen: Update `NANSEN_API_URL` with the correct endpoint that returns labels for an address
- Gemini: Update `GEMINI_API_URL` and payload format with official Generative AI endpoint and authentication method
- The sample payload in `backend/main.py` is intentionally generic to be adapted to your provider's specifications

## Endpoints (FastAPI mode)
- `GET /addresses` → list addresses
- `GET /address/{addr}` → enriched details
- `GET /graph/{addr}` → simple star graph for the address
- `GET /export/json`, `GET /export/csv` → exports




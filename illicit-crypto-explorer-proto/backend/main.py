# FastAPI backend with placeholder Nansen and Gemini integration
import os
import csv
import json
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

NANSEN_API_KEY = os.getenv("NANSEN_API_KEY")
NANSEN_API_URL = os.getenv("NANSEN_API_URL")  # placeholder URL - replace per Nansen docs
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = os.getenv("GEMINI_API_URL")  # placeholder URL - replace per Gemini docs

DATA_FILE = "data/addresses.json"

app = FastAPI(title="Illicit Crypto Explorer - Prototype API")

# Allow frontend to call backend during dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (for serving the built frontend)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Load mock DB on startup
def load_addresses():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

addresses = load_addresses()
# simple in-memory cache for enrichment results
_enrichment_cache = {}

def call_nansen(address: str):
    """
    Placeholder call to Nansen. Replace NANSEN_API_URL in .env with real endpoint.
    Returns a dict or None.
    """
    if not NANSEN_API_KEY or not NANSEN_API_URL:
        return None
    if address in _enrichment_cache and "nansen" in _enrichment_cache[address]:
        return _enrichment_cache[address]["nansen"]
    try:
        url = NANSEN_API_URL.replace("{address}", address)
        headers = {"Authorization": f"Bearer {NANSEN_API_KEY}", "Accept": "application/json"}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            _enrichment_cache.setdefault(address, {})["nansen"] = data
            return data
        else:
            # return basic info for debugging
            return {"error": "nansen_status", "status_code": resp.status_code, "text": resp.text[:200]}
    except Exception as e:
        return {"error": "nansen_exception", "message": str(e)}

def call_gemini_classify(text: str):
    """
    Placeholder call to Gemini / generative API. Replace GEMINI_API_URL with actual endpoint and adjust payload.
    Returns model response or None.
    """
    if not GEMINI_API_KEY or not GEMINI_API_URL:
        return None
    # simple caching
    if text in _enrichment_cache and "gemini" in _enrichment_cache[text]:
        return _enrichment_cache[text]["gemini"]
    try:
        headers = {
            "Authorization": f"Bearer {GEMINI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "prompt": f"Classify the following context into categories: Scam, Drugs, Ransomware, Laundering, Fraud, Other. Explain briefly and give confidence (0-1).\n\nContext:\n{text}\n\nReturn as JSON: {{'label':..., 'explanation':..., 'confidence':...}}",
            "max_tokens": 200
        }
        resp = requests.post(GEMINI_API_URL, json=payload, headers=headers, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            _enrichment_cache.setdefault(text, {})["gemini"] = data
            return data
        else:
            return {"error": "gemini_status", "status_code": resp.status_code, "text": resp.text[:200]}
    except Exception as e:
        return {"error": "gemini_exception", "message": str(e)}

@app.get("/addresses")
def list_addresses(tag: Optional[str] = None):
    if tag:
        filtered = [a for a in addresses if a.get("tag", "").lower() == tag.lower()]
        return {"count": len(filtered), "results": filtered}
    return {"count": len(addresses), "results": addresses}

@app.get("/address/{addr}")
def get_address(addr: str):
    # naive match - match substring or exact
    match = next((a for a in addresses if a["address"].lower() == addr.lower()), None)
    if not match:
        # try to match when user passes truncated or without 0x
        match = next((a for a in addresses if addr.lower() in a["address"].lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail="Address not found in mock DB")
    # Enrich synchronously (non-blocking is better for prod)
    nansen = call_nansen(match["address"])
    gemini = call_gemini_classify(match.get("context", ""))
    # Merge enrichments (if any)
    enriched = dict(match)
    if nansen:
        enriched["nansen_enrichment"] = nansen
    if gemini:
        enriched["gemini_enrichment"] = gemini
    return enriched

@app.get("/export/json")
def export_json():
    return JSONResponse(content=addresses)

@app.get("/export/csv")
def export_csv():
    csv_path = "data/export.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=addresses[0].keys())
        writer.writeheader()
        writer.writerows(addresses)
    return FileResponse(csv_path, filename="addresses.csv", media_type="text/csv")

# Simple graph endpoint: build a small star graph around the queried address
@app.get("/graph/{addr}")
def get_graph(addr: str):
    # Find center node
    center = next((a for a in addresses if a["address"].lower() == addr.lower()), None)
    if not center:
        # fallback: if not found, create a synthetic center
        center = {
            "address": addr,
            "tag": "Queried Address",
            "category": "Wallet",
            "confidence": 3,
            "last_seen": None,
            "source": "Local",
        }

    # Pick up to 6 related nodes from dataset (excluding center)
    related = [a for a in addresses if a["address"].lower() != center["address"].lower()]
    # Prefer same category if available
    same_cat = [a for a in related if a.get("category") == center.get("category")]
    sample = (same_cat or related)[:6]

    # Build nodes
    def to_node(a):
        return {
            "id": a["address"],
            "address": a["address"],
            "label": a.get("tag") or a["address"][:6] + "…" + a["address"][-4:],
            "category": a.get("category") or "Unknown",
            "confidence": a.get("confidence") or 3,
            "last_seen": a.get("last_seen"),
            "source": a.get("source") or "Unknown",
        }

    nodes = [to_node(center)] + [to_node(a) for a in sample]

    # Build edges center -> related
    edges = [{"source": center["address"], "target": a["address"], "type": "transfer"} for a in sample]

    return {"nodes": nodes, "edges": edges}

# Catch-all route to serve the frontend (for client-side routing)
@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    # If it's an API route, return 404
    if full_path.startswith("api/") or full_path.startswith("addresses") or full_path.startswith("export"):
        raise HTTPException(status_code=404, detail="Not found")
    
    # Serve the frontend's index.html for all other routes
    static_path = "static/index.html"
    if os.path.exists(static_path):
        return FileResponse(static_path)
    else:
        return {"message": "Frontend not built yet. Run 'npm run build:deploy' in the frontend folder."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)



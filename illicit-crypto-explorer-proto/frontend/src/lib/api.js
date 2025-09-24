// API service with robust backend detection (supports Node/Express on :5001 with /api prefix and FastAPI on :8000 without prefix)
const ENV_BASE = import.meta?.env?.VITE_API_BASE_URL;
const API_BASE_CANDIDATES = [
  ENV_BASE,
  'http://localhost:5001',
  'http://127.0.0.1:5001',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
].filter(Boolean);

const API_PREFIXES = ['', '/api'];

class ApiService {
  async request(path, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    };

    let lastError;
    for (const base of API_BASE_CANDIDATES) {
      for (const prefix of API_PREFIXES) {
        const url = `${base}${prefix}${path}`;
        try {
          const response = await fetch(url, config);
          if (!response.ok) {
            lastError = new Error(`HTTP error ${response.status} for ${url}`);
            continue;
          }
          // Try json first, fallback to blob/text as needed by caller
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            return await response.json();
          }
          // Non-JSON; let caller decide (e.g., CSV)
          return response;
        } catch (err) {
          lastError = err;
          // try next candidate
        }
      }
    }
    console.error('API request failed across all candidates:', lastError);
    throw lastError || new Error('API request failed');
  }

  // Normalize array responses from various backends
  normalizeListResponse(resp) {
    if (Array.isArray(resp)) return resp;
    if (resp && Array.isArray(resp.results)) return resp.results;
    if (resp && Array.isArray(resp.addresses)) return resp.addresses;
    if (resp && Array.isArray(resp.data)) return resp.data;
    return [];
  }

  // Get all addresses with optional filtering
  async getAddresses(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.category) queryParams.append('category', params.category);
    if (params.confidence) queryParams.append('confidence', params.confidence);
    if (params.search) queryParams.append('search', params.search);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);

    const queryString = queryParams.toString();
    const path = queryString ? `/addresses?${queryString}` : '/addresses';
    const resp = await this.request(path);
    return this.normalizeListResponse(resp);
  }

  // Get specific address details
  async getAddress(address) {
    return this.request(`/address/${address}`);
  }

  // Get network graph data for an address
  async getAddressGraph(address) {
    return this.request(`/graph/${address}`);
  }

  // Export addresses as JSON
  async exportJson() {
    const resp = await this.request('/export/json');
    // Some backends may return wrapped JSON array or object
    return resp;
  }

  // Export addresses as CSV
  async exportCsv() {
    // Let request() return the raw Response when not JSON
    const response = await this.request('/export/csv');
    if (response instanceof Response) {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.blob();
    }
    // If some backend returns JSON with a URL, attempt to fetch it
    if (response && typeof response === 'object' && response.url) {
      const res = await fetch(response.url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.blob();
    }
    throw new Error('Unexpected CSV response');
  }
}

export default new ApiService();

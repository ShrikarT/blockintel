
const axios = require("axios");
const pRetry = require("p-retry").default;

const NANSEN_BASE = process.env.NANSEN_BASE_URL || "https://api.nansen.ai/api/v1";
const NANSEN_KEY = process.env.NANSEN_API_KEY;

if (!NANSEN_KEY) {
  console.warn("⚠️ Nansen API key not set in .env");
}

async function callNansen(path, payload = {}) {
  return pRetry(
    async () => {
      const res = await axios.post(`${NANSEN_BASE}${path}`, payload, {
        headers: {
          apiKey: NANSEN_KEY,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      if (res.status >= 400) throw new Error("Nansen error " + res.status);
      return res.data;
    },
    { retries: 2 }
  );
}

// Example enrichment call using v1 API
async function getAddressEnrichment(address) {
  try {
    const data = await callNansen("/profiler/address/current-balance", {
      address: address,
      chain: "ethereum"
    });
    return data;
  } catch (err) {
    console.error("❌ Nansen error for", address, err.message);
    return { error: true, message: err.message };
  }
}

// New: getAddressLabels for seeder using v1 API
async function getAddressLabels(address, chain = "ethereum") {
  try {
    const data = await callNansen("/profiler/address/current-balance", {
      address: address,
      chain: chain
    });
    // API returns balance data, we'll use this as enrichment
    return data || {};
  } catch (err) {
    console.error("❌ Nansen labels error for", address, err.message);
    return {};
  }
}

// Additional v1 API functions you can use
async function getAddressTransactions(address, chain = "ethereum") {
  try {
    const data = await callNansen("/profiler/address/transactions", {
      address: address,
      chain: chain
    });
    return data || {};
  } catch (err) {
    console.error("❌ Nansen transactions error for", address, err.message);
    return {};
  }
}

async function getAddressHoldings(address, chain = "ethereum") {
  try {
    const data = await callNansen("/profiler/address/holdings", {
      address: address,
      chain: chain
    });
    return data || {};
  } catch (err) {
    console.error("❌ Nansen holdings error for", address, err.message);
    return {};
  }
}

module.exports = { getAddressEnrichment, getAddressLabels, getAddressTransactions, getAddressHoldings };
// Google Gemini AI wrapper using the official SDK approach
const axios = require('axios');
const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_KEY) console.warn('Gemini API key not set.');

// --- Rate Limiter and Retry Setup ---
const MAX_CONCURRENT = 5;
const DELAY_MS = 500;
const MAX_RETRIES = 3;
const BASE_BACKOFF = 1000; // 1s

let activeRequests = 0;
const queue = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function rateLimitedGeminiCall(fn, ...args) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, args, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (activeRequests >= MAX_CONCURRENT || queue.length === 0) return;
  const { fn, args, resolve, reject } = queue.shift();
  activeRequests++;
  fn(...args)
    .then(resolve)
    .catch(reject)
    .finally(async () => {
      activeRequests--;
      await sleep(DELAY_MS);
      processQueue();
    });
}

// --- Enhanced classifyWithGemini with retry + backoff ---
async function classifyWithGemini(textContext, address) {
  async function callGeminiAPI(retryCount = 0) {
    // Build a clear zero-shot prompt
    const prompt = `
You are an intelligence classifier. Given the context below about a cryptocurrency address (on-chain info + off-chain textual context),
classify the activity into one of: Drugs, Ransomware, Fraud/Scam, Money Laundering, Terror Financing, Other.
Return a JSON object with keys: "category", "confidence" (0.0-1.0), "explanation" (one-line), "suggested_tags" (array).
Context:
${textContext}
Address: ${address}
Respond ONLY with a JSON object.
    `;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
      const res = await axios.post(url, {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000
      });

      const body = res.data;
      const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        try {
          const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();
          return JSON.parse(cleanText);
        } catch (e) {
          return { category: 'Other', confidence: 0.0, explanation: 'Could not parse Gemini response', raw: text };
        }
      }
      return { category: 'Other', confidence: 0.0, explanation: 'No Gemini response', raw: body };
    } catch (err) {
      const status = err.response?.status;
      // Retry on 429 (rate limit) or 503 (service unavailable) or timeout
      if ((status === 429 || status === 503 || err.code === 'ECONNABORTED') && retryCount < MAX_RETRIES) {
        const backoff = BASE_BACKOFF * Math.pow(2, retryCount);
        await sleep(backoff);
        return callGeminiAPI(retryCount + 1);
      }
      console.error('Gemini error', err.message);
      return { category: 'Other', confidence: 0.0, explanation: 'AI error: ' + err.message };
    }
  }

  // Use the rate limiter for all Gemini calls
  return rateLimitedGeminiCall(callGeminiAPI);
}

module.exports = { classifyWithGemini };
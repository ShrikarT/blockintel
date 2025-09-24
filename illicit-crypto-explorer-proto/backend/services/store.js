const fs = require('fs').promises;
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'addresses.json');

async function readAll() {
  try {
    const txt = await fs.readFile(FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (e) {
    if (e.code === 'ENOENT') { await saveAll([]); return []; }
    throw e;
  }
}
async function saveAll(arr) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(arr, null, 2), 'utf8');
}
async function upsert(addressObj) {
  const all = await readAll();
  const idx = all.findIndex(a => a.address.toLowerCase() === addressObj.address.toLowerCase());
  if (idx >= 0) all[idx] = { ...all[idx], ...addressObj, updatedAt: new Date().toISOString() };
  else all.push({ ...addressObj, createdAt: new Date().toISOString() });
  await saveAll(all);
  return addressObj;
}
async function find(address) {
  const all = await readAll();
  return all.find(a => a.address.toLowerCase() === address.toLowerCase());
}

module.exports = { readAll, saveAll, upsert, find };
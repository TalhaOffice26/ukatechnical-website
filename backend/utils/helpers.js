// Express async handler wrapper
const ah = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Pick specified keys from an object
const pick = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return {};
  const res = {};
  for (const k of keys) {
    if (k in obj) res[k] = obj[k];
  }
  return res;
};

// Safe string conversion and trimming
const str = v => (v === undefined || v === null ? '' : String(v).trim());

// URL slug generator
const slugify = text => {
  return String(text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

module.exports = {
  ah,
  pick,
  str,
  slugify
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function userFromCookie(req) {
  const t = req.cookies && req.cookies.token;
  if (!t) return null;
  const { id } = jwt.verify(t, process.env.JWT_SECRET);
  const u = await User.findById(id);
  return u && u.active !== false ? u : null;
}

exports.protect = async (req, res, next) => {
  try {
    const u = await userFromCookie(req);
    if (!u) return res.status(401).json({ error: 'Please log in' });
    req.user = u; next();
  } catch { res.status(401).json({ error: 'Session expired, please log in again' }); }
};

// login thakle req.user set kore, na thakleo cholte dey
exports.optional = async (req, res, next) => {
  try { req.user = (await userFromCookie(req)) || undefined; } catch {}
  next();
};

exports.role = (...roles) => (req, res, next) =>
  req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Not allowed' });
exports.adminOnly = exports.role('admin');

exports.adminPage = async (req, res, next) => {
  try { const u = await userFromCookie(req); if (u && u.role === 'admin') return next(); } catch {}
  res.redirect('/admin/login');
};
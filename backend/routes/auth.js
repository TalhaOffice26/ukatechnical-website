const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many attempts, try again later' } });
const h = fn => (req, res, next) => fn(req, res, next).catch(next);
const pub = u => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role });
const send = (res, u, code = 200) => {
  const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 864e5 });
  res.status(code).json({ user: pub(u) });
};

router.post('/signup', limiter, h(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').trim();
  const password = String(req.body.password || '');
  if (name.length < 2) return res.status(400).json({ error: 'Please enter your name' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (await User.findOne({ email })) return res.status(409).json({ error: 'This email is already registered' });
  const u = await User.create({ name, email, phone, password: await bcrypt.hash(password, 12) }); // role is always "student"
  send(res, u, 201);
}));

router.post('/login', limiter, h(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const u = await User.findOne({ email }).select('+password');
  if (!u || !(await bcrypt.compare(String(req.body.password || ''), u.password)))
    return res.status(401).json({ error: 'Invalid email or password' });
  if (!u.active) return res.status(403).json({ error: 'This account is disabled' });
  send(res, u);
}));

router.post('/logout', (req, res) => { res.clearCookie('token'); res.json({ ok: true }); });
router.get('/me', protect, (req, res) => res.json({ user: pub(req.user) }));

module.exports = router;
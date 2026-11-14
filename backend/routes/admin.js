const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Admission = require('../models/Admission');
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/auth');

const h = fn => (req, res, next) => fn(req, res, next).catch(next);
router.use(protect, adminOnly);

router.get('/stats', h(async (req, res) => {
  const wk = new Date(Date.now() - 7 * 864e5);
  const [total, admins, week, totalAdmissions, pendingAdmissions, unreadMessages, courses] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ createdAt: { $gte: wk } }),
    Admission.countDocuments(),
    Admission.countDocuments({ status: 'pending' }),
    Message.countDocuments({ isRead: { $ne: true } }),
    Course.countDocuments({ isActive: true })
  ]);
  res.json({
    total,
    admins,
    students: total - admins,
    week,
    totalAdmissions,
    pendingAdmissions,
    unreadMessages,
    courses
  });
}));

router.get('/users', h(async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 50).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = q ? { $or: ['name', 'email', 'phone'].map(f => ({ [f]: new RegExp(q, 'i') })) } : {};
  res.json({ users: await User.find(filter).sort('-createdAt').limit(200) });
}));

const blocked = (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) { res.status(400).json({ error: 'Invalid id' }); return true; }
  if (req.params.id === String(req.user._id)) { res.status(400).json({ error: 'You cannot change your own account here' }); return true; }
  return false;
};

router.patch('/users/:id', h(async (req, res) => {
  if (blocked(req, res)) return;
  const set = {};
  if (['student', 'admin'].includes(req.body.role)) set.role = req.body.role;
  if (typeof req.body.active === 'boolean') set.active = req.body.active;
  const u = await User.findByIdAndUpdate(req.params.id, set, { new: true });
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json({ user: u });
}));
router.delete('/users/:id', h(async (req, res) => {
  if (blocked(req, res)) return;
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

module.exports = router;
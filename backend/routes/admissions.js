const router = require('express').Router(), Admission = require('../models/Admission'), Course = require('../models/Course');
const { protect, optional, role } = require('../middleware/auth');
const { ah, pick, str } = require('../utils/helpers');
const staff = [protect, role('admin', 'staff')];

router.post('/', optional, ah(async (req, res) => {
  const b = req.body, name = str(b.name), phone = str(b.phone), email = str(b.email).toLowerCase();
  if (name.length < 2) return res.status(400).json({ message: 'Please enter your name' });
  if (!/^[0-9+\-\s]{6,20}$/.test(phone)) return res.status(400).json({ message: 'Please enter a valid phone number' });
  let course = null;
  if (typeof b.courseId === 'string' && /^[a-f\d]{24}$/i.test(b.courseId)) course = await Course.findOne({ _id: b.courseId, isActive: true });
  const a = await Admission.create({ course: course?._id, courseTitle: course?.title || str(b.courseTitle).slice(0, 120), user: req.user?._id, name, phone, email, message: str(b.message).slice(0, 1000) });
  res.status(201).json({ message: 'Admission request received', id: a._id });
}));

router.get('/mine', protect, ah(async (req, res) => res.json(await Admission.find({ user: req.user._id }).sort('-createdAt'))));

router.get('/', ...staff, ah(async (req, res) => {
  const q = {};
  const st = str(req.query.status);
  if (st) q.status = st;

  const type = str(req.query.type).toLowerCase();
  if (type === 'mock') {
    q.courseTitle = /mock/i;
  } else if (type === 'exam') {
    q.courseTitle = /exam/i;
  } else if (type === 'course') {
    q.courseTitle = { $not: /mock|exam/i };
  }

  const search = str(req.query.q).trim();
  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    q.$or = [{ name: regex }, { phone: regex }, { email: regex }, { courseTitle: regex }];
  }

  const page = Math.max(1, +req.query.page || 1), limit = Math.min(100, +req.query.limit || 20);
  const [items, total] = await Promise.all([Admission.find(q).sort('-createdAt').skip((page - 1) * limit).limit(limit), Admission.countDocuments(q)]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));
router.patch('/:id', ...staff, ah(async (req, res) => {
  const a = await Admission.findByIdAndUpdate(req.params.id, pick(req.body, ['status', 'note']), { new: true, runValidators: true });
  if (!a) return res.status(404).json({ message: 'Not found' });
  res.json(a);
}));
router.delete('/:id', protect, role('admin'), ah(async (req, res) => { await Admission.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }));
module.exports = router;
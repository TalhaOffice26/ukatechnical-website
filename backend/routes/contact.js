const router = require('express').Router(), Message = require('../models/Message');
const { protect, role } = require('../middleware/auth');
const { ah, pick, str } = require('../utils/helpers');
const staff = [protect, role('admin', 'staff')];

router.post('/', ah(async (req, res) => {
  const b = req.body, name = str(b.name), message = str(b.message), email = str(b.email).toLowerCase(), phone = str(b.phone);
  if (name.length < 2 || message.length < 5) return res.status(400).json({ message: 'Please enter your name and message' });
  if (!email && !phone) return res.status(400).json({ message: 'Please give an email or phone number' });
  await Message.create({ name, email, phone, subject: str(b.subject).slice(0, 150), message: message.slice(0, 2000) });
  res.status(201).json({ message: 'Message sent. We will contact you soon.' });
}));
router.get('/', ...staff, ah(async (req, res) => {
  const page = Math.max(1, +req.query.page || 1), limit = Math.min(100, +req.query.limit || 20);
  const [items, total] = await Promise.all([Message.find().sort('-createdAt').skip((page - 1) * limit).limit(limit), Message.countDocuments()]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));
router.patch('/:id', ...staff, ah(async (req, res) => {
  const m = await Message.findByIdAndUpdate(req.params.id, pick(req.body, ['isRead', 'replied']), { new: true });
  if (!m) return res.status(404).json({ message: 'Not found' });
  res.json(m);
}));
router.delete('/:id', protect, role('admin'), ah(async (req, res) => { await Message.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }));
module.exports = router;
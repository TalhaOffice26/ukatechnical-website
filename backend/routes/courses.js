const router = require('express').Router(), Course = require('../models/Course');
const { protect, role } = require('../middleware/auth');
const { ah, pick, slugify, str } = require('../utils/helpers');
const F = ['title', 'category', 'shortDesc', 'description', 'fee', 'originalFee', 'discountBadge', 'feeType', 'duration', 'level', 'seats', 'syllabus', 'image', 'isActive', 'order'];
const adm = [protect, role('admin')];

router.get('/', ah(async (req, res) => {
  const q = { isActive: true };
  if (req.query.category) q.category = str(req.query.category);
  res.json(await Course.find(q).sort('order title'));
}));
router.get('/admin/all', protect, role('admin', 'staff'), ah(async (req, res) => res.json(await Course.find().sort('order title'))));
router.get('/:slug', ah(async (req, res) => {
  const c = await Course.findOne({ slug: str(req.params.slug), isActive: true });
  if (!c) return res.status(404).json({ message: 'Course not found' });
  res.json(c);
}));
router.post('/', ...adm, ah(async (req, res) => {
  const d = pick(req.body, F); if (req.body.slug) d.slug = slugify(req.body.slug);
  res.status(201).json(await Course.create(d));
}));
router.put('/:id', ...adm, ah(async (req, res) => {
  const d = pick(req.body, F); if (req.body.slug) d.slug = slugify(req.body.slug);
  const c = await Course.findByIdAndUpdate(req.params.id, d, { new: true, runValidators: true });
  if (!c) return res.status(404).json({ message: 'Course not found' });
  res.json(c);
}));
router.delete('/:id', ...adm, ah(async (req, res) => {
  if (!(await Course.findByIdAndDelete(req.params.id))) return res.status(404).json({ message: 'Course not found' });
  res.json({ message: 'Deleted' });
}));
module.exports = router;
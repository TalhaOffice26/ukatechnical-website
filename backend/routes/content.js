const express = require('express'), path = require('path'), fs = require('fs'), multer = require('multer');
const Item = require('../models/Item');
const { protect, adminOnly } = require('../middleware/auth');

const TYPES = ['course', 'mock', 'teacher', 'team', 'gallery', 'achiever', 'slot', 'branch', 'job', 'faq', 'news', 'testimonial', 'result', 'exam_center'];
const upDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(upDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: upDir,
    filename: (req, f, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(f.originalname).toLowerCase())
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, f, cb) => cb(/^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(f.mimetype) ? null : new Error('Only images allowed'), /^image\//.test(f.mimetype))
});

const r = express.Router();
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const okType = (req, res, next) => TYPES.includes(req.params.type) ? next() : res.status(400).json({ error: 'Bad type' });

// PUBLIC: frontend eta theke data ane
r.get('/:type', okType, wrap(async (req, res) => {
  const queryType = (req.params.type === 'team' || req.params.type === 'teacher')
    ? { $in: ['team', 'teacher'] }
    : req.params.type;
  res.json(await Item.find({ type: queryType, active: true }).sort({ order: 1, createdAt: -1 }));
}));

// ADMIN: shob (inactive shoho)
r.get('/:type/all', protect, adminOnly, okType, wrap(async (req, res) => {
  const queryType = (req.params.type === 'team' || req.params.type === 'teacher')
    ? { $in: ['team', 'teacher'] }
    : req.params.type;
  res.json(await Item.find({ type: queryType }).sort({ order: 1, createdAt: -1 }));
}));

// ADMIN: create / update (photo optional, file upload OR imageUrl)
const body = req => {
  const b = { ...req.body };
  if (typeof b.extra === 'string') { try { b.extra = JSON.parse(b.extra); } catch { delete b.extra; } }
  if (req.file) {
    b.image = '/uploads/' + req.file.filename;
  } else if (b.imageUrl && String(b.imageUrl).trim()) {
    b.image = String(b.imageUrl).trim();
  }
  delete b.imageUrl;
  delete b._id; delete b.type;
  return b;
};

r.post('/:type', protect, adminOnly, okType, upload.single('image'), wrap(async (req, res) => {
  res.status(201).json(await Item.create({ ...body(req), type: req.params.type }));
}));

r.put('/:type/:id', protect, adminOnly, okType, upload.single('image'), wrap(async (req, res) => {
  res.json(await Item.findOneAndUpdate({ _id: req.params.id, type: req.params.type }, body(req), { new: true, runValidators: true }));
}));

r.delete('/:type/:id', protect, adminOnly, okType, wrap(async (req, res) => {
  const it = await Item.findOneAndDelete({ _id: req.params.id, type: req.params.type });
  if (it && it.image && it.image.startsWith('/uploads/')) fs.unlink(path.join(upDir, path.basename(it.image)), () => {});
  res.json({ ok: true });
}));

module.exports = r;

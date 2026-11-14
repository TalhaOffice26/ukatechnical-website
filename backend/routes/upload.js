const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { protect, role } = require('../middleware/auth');

const upDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(upDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, upDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, (safeBase ? safeBase + '-' : '') + unique + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif|svg\+xml)$/i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, WebP, GIF, SVG) are allowed'));
    }
  }
});

// POST /api/upload
router.post('/', protect, role('admin', 'staff'), (req, res, next) => {
  upload.single('image')(req, res, err => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image must be under 10MB' });
      }
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Please choose an image file to upload' });
    }
    const publicUrl = '/uploads/' + req.file.filename;
    res.json({ url: publicUrl, filename: req.file.filename });
  });
});

module.exports = router;

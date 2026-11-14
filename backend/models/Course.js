const m = require('mongoose'), { slugify } = require('../utils/helpers');
const s = new m.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, unique: true, trim: true },
  category: { type: String, trim: true, default: 'general' },
  shortDesc: { type: String, trim: true, maxlength: 300 },
  description: { type: String, trim: true },
  fee: { type: Number, min: 0, default: 0 },
  originalFee: { type: Number, min: 0, default: 0 },
  discountBadge: { type: String, trim: true },
  feeType: { type: String, trim: true, default: 'one-time' },
  duration: { type: String, trim: true },
  level: { type: String, trim: true },
  seats: { type: Number, min: 0 },
  syllabus: [String],
  image: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });
s.pre('validate', function () { if (!this.slug && this.title) this.slug = slugify(this.title); });
module.exports = m.model('Course', s);
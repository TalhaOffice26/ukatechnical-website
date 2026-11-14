const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },
  title: { type: String, trim: true },
  subtitle: { type: String, trim: true },
  description: { type: String, trim: true },
  image: { type: String, trim: true },
  badge: { type: String, trim: true },
  link: { type: String, trim: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  extra: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Item', itemSchema);

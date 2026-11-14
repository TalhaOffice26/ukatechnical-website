const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, trim: true, lowercase: true, maxlength: 120 },
  phone: { type: String, trim: true, maxlength: 30 },
  subject: { type: String, trim: true, maxlength: 150, default: '' },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  isRead: { type: Boolean, default: false },
  replied: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

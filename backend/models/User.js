const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 80 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, trim: true, default: '', maxlength: 20 },
  password: { type: String, required: true, select: false },
  role:     { type: String, enum: ['student', 'admin'], default: 'student' },
  active:   { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
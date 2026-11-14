const mongoose = require('mongoose');
// kind: 'date' = exam date row, 'fee' = fee row (testType + fee)
module.exports = mongoose.model('ExamDate', new mongoose.Schema({
  kind: { type: String, enum: ['date', 'fee'], default: 'date', index: true },
  testType: { type: String, required: true, trim: true, maxlength: 120 },
  examDate: Date,
  deadline: Date,
  mode: { type: String, trim: true, maxlength: 60, default: 'Computer-delivered' },
  slot: { type: String, trim: true, maxlength: 80, default: 'Morning Slot (LRW 9:00 AM)' },
  venue: { type: String, trim: true, maxlength: 150, default: 'UKA British Council Computer Lab' },
  fee: { type: Number, min: 0, default: 0 },
  seats: { type: Number, min: 0, default: 10 },
  note: { type: String, trim: true, maxlength: 300 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true }));
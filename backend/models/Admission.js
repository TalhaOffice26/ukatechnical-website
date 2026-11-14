const m = require('mongoose');
module.exports = m.model('Admission', new m.Schema({
  course: { type: m.Schema.Types.ObjectId, ref: 'Course' },
  courseTitle: String,
  user: { type: m.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  message: { type: String, maxlength: 1000 },
  status: { type: String, enum: ['pending', 'contacted', 'approved', 'rejected'], default: 'pending' },
  note: { type: String, maxlength: 1000 }
}, { timestamps: true }));
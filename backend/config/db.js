const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing in .env');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
  if (email && process.env.ADMIN_PASSWORD && !(await User.findOne({ email }))) {
    await User.create({ name: process.env.ADMIN_NAME || 'Admin', email, role: 'admin', password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12) });
    console.log('Admin account created:', email);
  }
};
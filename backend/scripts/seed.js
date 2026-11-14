require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose'), bcrypt = require('bcryptjs'), User = require('../models/User'), Course = require('../models/Course');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const { ADMIN_NAME = 'Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    if (!(await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }))) {
      await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL.toLowerCase(), password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: 'admin' });
      console.log('Admin created:', ADMIN_EMAIL);
    }
    else console.log('Admin already exists');
  }
  if (!(await Course.countDocuments())) {
    const c = (order, title, slug, category, shortDesc) => ({ order, title, slug, category, shortDesc, fee: 0 });
    await Course.create([
      c(1, 'IELTS Preparation', 'ielts-preparation', 'ielts', 'Structured prep for all four skills with weekly mock tests.'),
      c(2, 'Spoken English (Adult)', 'spoken-adult', 'spoken', 'Speak fluently at work, in interviews and daily life.'),
      c(3, 'Junior Spoken English', 'junior-spoken', 'junior', 'Playful, confidence-building classes for kids.'),
      c(4, 'Secondary English Test', 'secondary-test', 'secondary', 'Exam-focused English for secondary students.'),
      c(5, 'Primary English Test', 'primary-test', 'primary', 'A gentle foundation for primary learners.'),
      c(6, 'Online & One to One', 'online-courses', 'online', 'Learn live from anywhere, at your own pace.')
    ]);
    console.log('Sample courses added (fees are 0, set them from the admin panel)');
  }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
const router = require('express').Router(), Setting = require('../models/Setting');
const { protect, role } = require('../middleware/auth');
const { ah } = require('../utils/helpers');

const D = {
  students: 12000,
  satisfaction: 98,
  teachers: 40,
  branches: 5,
  whatsapp: '8801516579760',
  phone: '+880 1516-579760',
  phone2: '+880 1407-063460',
  phone3: '+880 1407-063431',
  email: 'info@ukatechnical.com',
  address: 'House 12, Road Avenue-8, Block M, Banasree, Dhaka (দক্ষিণ বনশ্রী মেরাদিয়া বাজার আড়ং শপিং মলের একদম পাশে, ইউকা স্কুল বিল্ডিং)',
  privacy: '',
  story: '',
  about: '',
  callAgentUrl: '',
  callAgentPhone: '+8801516579760',
  ieltsOffers: '5 Full-length Mock Tests FREE upon registration\n1 Month Practice Facility TOTALLY FREE in main British Council computer exam lab after registration',
  mockPackages: JSON.stringify([
    { name: "1 MOCK", price: 750, oldPrice: 1500, discount: "50% OFF" },
    { name: "2 MOCK", price: 1400, oldPrice: 2800, discount: "50% OFF" },
    { name: "5 MOCK", price: 3000, oldPrice: 6000, discount: "50% OFF" },
    { name: "10 MOCK", price: 5000, oldPrice: 10000, discount: "50% OFF" }
  ]),
  mockFeatures: 'Real exam environment\nExam in main exam center\nResult in 24 hours\nDetailed examiner feedback\nExam in real exam server',
  ieltsSlotsInfo: 'Morning Slot: LRW 9:00 AM - 11:45 AM (10 Seats) | Speaking from 1:20 PM (20m slots)\nDay Slot: Speaking from 9:00 AM (20m slots) | LRW 1:00 PM - 3:45 PM (10 Seats)',
  heroShowcasePhoto: '/images/british-council-meet.png',
  ieltsVenuePhoto: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80',
  ieltsAcademicPhoto: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
  ieltsGeneralPhoto: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
  supervisorPhone: '+880 1516-579760',
  supervisorWhatsapp: '8801516579760',

  // Branch Building & Campus Photos
  branchBuildingPhoto: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
  branchGalleryPhoto1: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80',
  branchGalleryPhoto2: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
  branchGalleryPhoto3: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',

  // Our Chairman Profile & Message
  chairmanName: 'Engr. Md. Faruk Hossain',
  chairmanTitle: 'Founder & Honorable Chairman, UKA Group',
  chairmanPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
  chairmanMessage: 'At UKA Technical Institute and UKA Group, our core mission is to empower the young minds of Bangladesh with world-class language fluency, official British Council certifications, and moral leadership. We believe quality education is the ultimate catalyst for personal transformation and national progress.',
  chairmanBio: 'Engr. Md. Faruk Hossain is an eminent educator, engineer, and visionary entrepreneur. With decades of leadership in education and technical development, he established UKA Group to provide students in Bangladesh with equal access to global academic standards, language mastery, and foreign education pathways.',

  // UKA Collegiate School
  schoolTitle: 'UKA Collegiate School',
  schoolSubtitle: 'Nurturing Future Leaders with Academic Excellence & Moral Values',
  schoolDesc: 'UKA Collegiate School is a premier academic institution located at Banasree, Dhaka. From Playgroup through Class 10, we combine rigorous academic curriculum with native English phonetics, modern science labs, interactive smart classrooms, and character-building extracurricular activities.',
  schoolWebsiteUrl: 'https://www.ukabd.info/',
  schoolPhoto1: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
  schoolPhoto2: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
  schoolPhoto3: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80'
};

router.get('/', ah(async (req, res) => {
  const out = { ...D };
  const all = await Setting.find();
  all.forEach(r => { out[r.key] = r.value; });
  res.json(out);
}));

router.put('/', protect, role('admin'), ah(async (req, res) => {
  const allowed = Object.keys(req.body).filter(k => /^[a-zA-Z0-9_-]{1,60}$/.test(k));
  const ops = allowed.map(k => ({
    updateOne: {
      filter: { key: k },
      update: { $set: { value: req.body[k] } },
      upsert: true
    }
  }));
  if (ops.length) await Setting.bulkWrite(ops);
  res.json({ message: 'Saved' });
}));

module.exports = router;
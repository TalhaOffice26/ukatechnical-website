const express = require('express');
const router = express.Router();
const ExamDate = require('../models/ExamDate');
const { protect, role } = require('../middleware/auth');
const { ah } = require('../utils/helpers');

const adminOrStaff = [protect, role('admin', 'staff')];

// PUBLIC: Get active exam dates and fees
router.get('/', ah(async (req, res) => {
  const query = { isActive: true };
  if (req.query.kind) query.kind = req.query.kind;
  if (req.query.testType) query.testType = new RegExp(req.query.testType, 'i');

  const items = await ExamDate.find(query).sort({ order: 1, examDate: 1, createdAt: -1 });
  // Support both array and { dates: items } responses
  res.json({ dates: items, items });
}));

// ADMIN: Get all exam dates and fee configurations (including inactive)
router.get('/admin/all', ...adminOrStaff, ah(async (req, res) => {
  const items = await ExamDate.find().sort({ order: 1, examDate: 1, createdAt: -1 });
  res.json(items);
}));

// ADMIN: Create new exam slot or fee row
router.post('/', ...adminOrStaff, ah(async (req, res) => {
  const b = req.body || {};
  const data = {
    kind: b.kind === 'fee' ? 'fee' : 'date',
    testType: String(b.testType || '').trim(),
    fee: Number(b.fee) || 0,
    order: Number(b.order) || 0,
    note: String(b.note || '').trim(),
    isActive: b.isActive !== undefined ? !!b.isActive : true
  };

  if (data.kind === 'date') {
    if (b.examDate) data.examDate = new Date(b.examDate);
    if (b.deadline) data.deadline = new Date(b.deadline);
    data.slot = String(b.slot || '').trim() || 'Morning Slot (LRW 9:00 AM)';
    data.mode = String(b.mode || '').trim() || 'Computer-delivered';
    data.venue = String(b.venue || '').trim() || 'UKA British Council Computer Lab';
    data.seats = b.seats !== undefined && b.seats !== '' ? Number(b.seats) : 10;
  }

  if (!data.testType) {
    return res.status(400).json({ message: 'Test type is required' });
  }

  const created = await ExamDate.create(data);
  res.status(201).json(created);
}));

// ADMIN: Update exam slot or fee row
router.put('/:id', ...adminOrStaff, ah(async (req, res) => {
  const b = req.body || {};
  const data = {};

  if (b.kind !== undefined) data.kind = b.kind;
  if (b.testType !== undefined) data.testType = String(b.testType).trim();
  if (b.fee !== undefined) data.fee = Number(b.fee);
  if (b.order !== undefined) data.order = Number(b.order);
  if (b.note !== undefined) data.note = String(b.note).trim();
  if (b.isActive !== undefined) data.isActive = !!b.isActive;

  if (b.examDate !== undefined) data.examDate = b.examDate ? new Date(b.examDate) : null;
  if (b.deadline !== undefined) data.deadline = b.deadline ? new Date(b.deadline) : null;
  if (b.slot !== undefined) data.slot = String(b.slot).trim();
  if (b.mode !== undefined) data.mode = String(b.mode).trim();
  if (b.venue !== undefined) data.venue = String(b.venue).trim();
  if (b.seats !== undefined) data.seats = Number(b.seats);

  const updated = await ExamDate.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ message: 'Slot/Fee not found' });
  res.json(updated);
}));

// ADMIN: Delete exam slot or fee row
router.delete('/:id', ...adminOrStaff, ah(async (req, res) => {
  const deleted = await ExamDate.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Slot/Fee not found' });
  res.json({ message: 'Deleted successfully' });
}));

module.exports = router;

const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');
const { protect, admin } = require('../middleware/auth');

// GET - Lấy danh sách bài đọc
router.get('/', async (req, res) => {
  try {
    const readings = await Reading.find().sort({ createdAt: -1 });
    res.json({ success: true, data: readings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET - Lấy chi tiết bài đọc
router.get('/:id', async (req, res) => {
  try {
    const reading = await Reading.findById(req.params.id);
    if (!reading) {
      return res.status(404).json({ success: false, message: 'Reading not found' });
    }
    res.json({ success: true, data: reading });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Tạo bài đọc mới (Admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const body = { ...req.body, createdBy: req.user.id };
    const reading = await Reading.create(body);
    res.status(201).json({ success: true, data: reading });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT - Cập nhật bài đọc (Admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const reading = await Reading.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!reading) {
      return res.status(404).json({ success: false, message: 'Reading not found' });
    }
    res.json({ success: true, data: reading });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE - Xóa bài đọc (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const reading = await Reading.findByIdAndDelete(req.params.id);
    if (!reading) {
      return res.status(404).json({ success: false, message: 'Reading not found' });
    }
    res.json({ success: true, message: 'Reading deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

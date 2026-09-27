const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const { protect, admin } = require('../middleware/auth');

// GET - Lấy tất cả tag
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ display_order: 1 });
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Tạo tag
router.post('/', protect, admin, async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT - Cập nhật tag
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tag) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE - Xóa tag
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

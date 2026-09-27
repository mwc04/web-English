const express = require('express');
const router = express.Router();
const Transcript = require('../models/Transcript');
const { protect, admin } = require('../middleware/auth');

// GET - Lấy transcript theo video_id
router.get('/:videoId', async (req, res) => {
  try {
    const transcripts = await Transcript.find({ video_id: req.params.videoId }).sort({ order_index: 1 });
    res.json({ success: true, data: transcripts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Tạo transcript
router.post('/', protect, admin, async (req, res) => {
  try {
    const t = await Transcript.create(req.body);
    res.status(201).json({ success: true, data: t });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT - Cập nhật transcript
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const t = await Transcript.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: t });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE - Xóa transcript
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Transcript.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Bulk save transcripts cho 1 video (xóa cũ, tạo mới)
router.post('/bulk/:videoId', protect, admin, async (req, res) => {
  try {
    await Transcript.deleteMany({ video_id: req.params.videoId });
    const items = req.body.map((item, i) => ({ ...item, video_id: req.params.videoId, order_index: i }));
    const created = await Transcript.insertMany(items);
    res.json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const MediaVideo = require('../models/MediaVideo');
const { protect, admin } = require('../middleware/auth');

function parseYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// GET - Lấy danh sách video (có filter theo category, level, tags, search)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.level) filter.level = req.query.level;
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.pro === 'true') filter.pro = true;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };
    const videos = await MediaVideo.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET - Lấy chi tiết video
router.get('/:id', async (req, res) => {
  try {
    const video = await MediaVideo.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Tạo video mới (Admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.videoUrl) {
      const yid = parseYoutubeId(body.videoUrl);
      if (yid) body.youtube_id = yid;
    }
    const video = await MediaVideo.create({ ...body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT - Cập nhật video (Admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.videoUrl) {
      const yid = parseYoutubeId(body.videoUrl);
      if (yid) body.youtube_id = yid;
    }
    const video = await MediaVideo.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE - Xóa video (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const video = await MediaVideo.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

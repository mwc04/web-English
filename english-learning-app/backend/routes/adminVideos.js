const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const Transcript = require('../models/Transcript');
const { protect, admin } = require('../middleware/auth');

function parseYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// GET - Danh sách video (có filter, search)
router.get('/', async (req, res) => {
  try {
    const { tag, level, pro, search } = req.query;
    const filter = {};
    if (tag) filter.tags = tag;
    if (level) filter.level = level;
    if (pro === 'true') filter.is_pro = true;
    if (pro === 'false') filter.is_pro = false;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const videos = await Video.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET - Chi tiết video + transcript
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Not found' });
    const transcripts = await Transcript.find({ video_id: req.params.id }).sort({ order_index: 1 });
    res.json({ success: true, data: { video, transcripts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Tạo video
router.post('/', protect, admin, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.youtube_url) {
      const yid = parseYoutubeId(body.youtube_url);
      if (yid) {
        body.youtube_id = yid;
        body.thumbnail_url = `https://img.youtube.com/vi/${yid}/hqdefault.jpg`;
      }
    }
    const video = await Video.create({ ...body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT - Cập nhật video
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.youtube_url) {
      const yid = parseYoutubeId(body.youtube_url);
      if (yid) {
        body.youtube_id = yid;
        body.thumbnail_url = `https://img.youtube.com/vi/${yid}/hqdefault.jpg`;
      }
    }
    const video = await Video.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!video) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE - Xóa video + transcripts
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    await Transcript.deleteMany({ video_id: req.params.id });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

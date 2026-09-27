const ListeningExercise = require('../models/ListeningExercise');
const path = require('path');
const fs = require('fs');

// @desc    Lấy danh sách bài nghe
// @route   GET /api/listening
const getListeningExercises = async (req, res) => {
  try {
    const { level, page = 1, limit = 20 } = req.query;
    let query = {};
    if (level) query.level = level;
    
    const exercises = await ListeningExercise.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await ListeningExercise.countDocuments(query);
    
    res.json({
      success: true,
      data: exercises,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy chi tiết bài nghe
// @route   GET /api/listening/:id
const getListeningById = async (req, res) => {
  try {
    const exercise = await ListeningExercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    res.json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo bài nghe mới
// @route   POST /api/listening
const createListeningExercise = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    if (!req.body.audio_url && req.body.audio_type === 'uploaded') {
      req.body.audio_url = '/uploads/audio/' + (req.body.audio_filename || '');
    }
    const exercise = await ListeningExercise.create(req.body);
    res.status(201).json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật bài nghe
// @route   PUT /api/listening/:id
const updateListeningExercise = async (req, res) => {
  try {
    const existing = await ListeningExercise.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    // Xoá file audio cũ nếu chuyển từ uploaded sang url hoặc đổi file
    if (existing.audio_type === 'uploaded' && existing.audio_filename &&
        (req.body.audio_type === 'url' || (req.body.audio_filename && req.body.audio_filename !== existing.audio_filename))) {
      const filePath = path.join(__dirname, '..', 'uploads', 'audio', existing.audio_filename);
      try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
    }
    if (!req.body.audio_url && req.body.audio_type === 'uploaded' && req.body.audio_filename) {
      req.body.audio_url = '/uploads/audio/' + req.body.audio_filename;
    }
    const exercise = await ListeningExercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa bài nghe
// @route   DELETE /api/listening/:id
const deleteListeningExercise = async (req, res) => {
  try {
    const exercise = await ListeningExercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    // Xoá file audio nếu là uploaded
    if (exercise.audio_type === 'uploaded' && exercise.audio_filename) {
      const filePath = path.join(__dirname, '..', 'uploads', 'audio', exercise.audio_filename);
      try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
    }
    await ListeningExercise.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getListeningExercises,
  getListeningById,
  createListeningExercise,
  updateListeningExercise,
  deleteListeningExercise
};   
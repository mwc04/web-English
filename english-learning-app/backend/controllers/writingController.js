const WritingExercise = require('../models/WritingExercise');

// @desc    Lấy danh sách bài viết
// @route   GET /api/writing
const getWritingExercises = async (req, res) => {
  try {
    const { level, page = 1, limit = 20 } = req.query;
    let query = {};
    if (level) query.level = level;
    
    const exercises = await WritingExercise.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await WritingExercise.countDocuments(query);
    
    res.json({
      success: true,
      data: exercises,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy chi tiết bài viết
// @route   GET /api/writing/:id
const getWritingById = async (req, res) => {
  try {
    const exercise = await WritingExercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    res.json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo bài viết mới
// @route   POST /api/writing
const createWritingExercise = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const exercise = await WritingExercise.create(req.body);
    res.status(201).json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật bài viết
// @route   PUT /api/writing/:id
const updateWritingExercise = async (req, res) => {
  try {
    const exercise = await WritingExercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    res.json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa bài viết
// @route   DELETE /api/writing/:id
const deleteWritingExercise = async (req, res) => {
  try {
    const exercise = await WritingExercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    res.json({ success: true, message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWritingExercises,
  getWritingById,
  createWritingExercise,
  updateWritingExercise,
  deleteWritingExercise
};
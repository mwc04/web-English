const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const UserTestResult = require('../models/UserTestResult');

// @desc    Lấy lịch sử kết quả của user
// @route   GET /api/results/history
router.get('/history', protect, async (req, res) => {
  try {
    const results = await UserTestResult.find({ user_id: req.user.id })
      .populate('test_id', 'title description')
      .sort({ completed_at: -1 });
    
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Lấy chi tiết 1 kết quả
// @route   GET /api/results/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await UserTestResult.findById(req.params.id)
      .populate('test_id')
      .populate('user_id', 'username full_name');
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
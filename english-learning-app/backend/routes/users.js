const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/me/placement', protect, async (req, res) => {
  try {
    const { level, score } = req.body;
    const allowed = ['A1', 'A2', 'B1', 'B2', 'C1'];
    if (!allowed.includes(level)) {
      return res.status(400).json({ success: false, message: 'Invalid level' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          level,
          placementTaken: true,
          placementScore: score ?? 0,
          placementDate: new Date()
        }
      },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

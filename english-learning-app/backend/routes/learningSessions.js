const express = require('express');
const router = express.Router();
const {
  startSession,
  endSession,
  heartbeatSession,
  getLearningStats,
  getLearningSessions
} = require('../controllers/learningSessionController');
const { protect } = require('../middleware/auth');

// Tất cả routes cần authentication
router.use(protect);

router.post('/learning-sessions/start', startSession);
router.post('/learning-sessions/heartbeat', heartbeatSession);
router.post('/learning-sessions/end', endSession);
router.get('/learning-stats', getLearningStats);
router.get('/learning-sessions', getLearningSessions);

module.exports = router;
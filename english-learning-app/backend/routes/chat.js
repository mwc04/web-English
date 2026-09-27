const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, getChatSessions } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/message', protect, sendMessage);
router.get('/sessions', protect, getChatSessions);
router.get('/history/:sessionId', protect, getChatHistory);

module.exports = router;
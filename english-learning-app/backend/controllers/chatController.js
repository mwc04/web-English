const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');

// @desc    Gửi tin nhắn AI
// @route   POST /api/chat/message
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;
    
    let session = null;
    
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, user_id: userId });
    }
    
    if (!session) {
      session = await ChatSession.create({
        user_id: userId,
        session_title: message.substring(0, 50)
      });
    }
    
    // Lưu tin nhắn user
    const userMessage = await ChatMessage.create({
      session_id: session._id,
      sender: 'user',
      message_text: message
    });
    
    // TODO: Gọi AI API (OpenAI, Gemini, etc.)
    // Tạm thời dùng response mẫu
    const aiResponseText = `Thank you for your message: "${message}". I'm an AI assistant helping you learn English. How can I help you today?`;
    
    // Lưu tin nhắn AI
    const aiMessage = await ChatMessage.create({
      session_id: session._id,
      sender: 'ai',
      message_text: aiResponseText,
      pronunciation_score: null
    });
    
    res.json({
      success: true,
      data: {
        session_id: session._id,
        user_message: userMessage,
        ai_message: aiMessage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy lịch sử chat
// @route   GET /api/chat/history/:sessionId
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    const session = await ChatSession.findOne({ _id: sessionId, user_id: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const messages = await ChatMessage.find({ session_id: sessionId })
      .sort({ createdAt: 1 });
    
    res.json({
      success: true,
      data: {
        session: session,
        messages: messages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy danh sách chat sessions
// @route   GET /api/chat/sessions
const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user_id: req.user.id })
      .sort({ updated_at: -1 });
    
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage, getChatHistory, getChatSessions };
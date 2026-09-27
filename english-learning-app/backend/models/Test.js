const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add title'],
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['toeic', 'thpt', 'ielts', 'general'],
    default: 'general'
  },
  type: {
    type: String,
    enum: ['full_test', 'mini_test', 'part_practice'],
    default: 'full_test'
  },
  total_questions: {
    type: Number,
    required: true,
    min: 1
  },
  duration_minutes: {
    type: Number,
    required: true,
    min: 1
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: null
    // Lưu cấu trúc đề thi đặc biệt (THPT, IELTS, ...)
    // VD: { sections: [{ type, instruction, passage, questions }] }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Test', testSchema);

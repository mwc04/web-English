const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  word: {
    type: String,
    required: [true, 'Please add word'],
    trim: true,
    index: true
  },
  meaning: {
    type: String,
    required: [true, 'Please add meaning']
  },
  example: {
    type: String,
    default: null
  },
  pronunciation: {
    type: String,
    default: null
  },
  category: {
    type: String,
    default: 'General',
    enum: ['Du lịch', 'Công nghệ', 'Sức khỏe', 'Ẩm thực', 'Thiên nhiên', 'Kinh doanh', 'Giáo dục', 'Thể thao', 'Nghệ thuật', 'General']
  },
  audio_url: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Tạo index để tìm kiếm nhanh
vocabularySchema.index({ word: 'text', meaning: 'text' });

module.exports = mongoose.model('Vocabulary', vocabularySchema);
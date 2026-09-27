const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  test_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  part: {
    type: Number,
    default: null
    // TOEIC: 1-7, THPT: null
  },
  question_type: {
    type: String,
    enum: ['listening_photo', 'listening_question', 'listening_conversation', 'listening_talk',
           'reading_grammar', 'reading_text', 'reading_passage', 'multiple_choice'],
    default: 'multiple_choice'
  },
  instruction: {
    type: String,
    default: ''
  },
  question_text: {
    type: String,
    default: ''
  },
  passage: {
    type: String,
    default: null
  },
  audio_url: {
    type: String,
    default: null
  },
  image_url: {
    type: String,
    default: null
  },
  group_label: {
    type: String,
    default: null
    // VD: "Questions 147-148 refer to the following notice"
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null
    // Dùng cho sub-questions của 1 passage/audio
  },
  options_json: {
    type: mongoose.Schema.Types.Mixed,
    required: true
    // Format: ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"]
  },
  correct_answer: {
    type: String,
    required: [true, 'Please add correct answer'],
    maxlength: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
questionSchema.index({ test_id: 1 });
questionSchema.index({ parent_id: 1 });

module.exports = mongoose.model('Question', questionSchema);
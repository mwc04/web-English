const mongoose = require('mongoose');

const userTestResultSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  total_questions: {
    type: Number,
    required: true
  },
  correct_answers: Number,
  wrong_answers: Number,
  answers: [{
    question_id: mongoose.Schema.Types.ObjectId,
    user_answer: String,
    is_correct: Boolean
  }],
  time_spent: Number,
  completed_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserTestResult', userTestResultSchema);
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  type: {
    type: String,
    enum: ['vocabulary', 'grammar', 'listening', 'writing', 'speaking', 'full_test'],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: Number,
  wrongAnswers: Number,
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    userAnswer: String,
    isCorrect: Boolean,
    points: Number
  }],
  timeSpent: Number,
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;
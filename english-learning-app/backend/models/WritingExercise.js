const mongoose = require('mongoose');

const writingExerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add title'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Please add topic']
  },
  requirements: {
    type: String,
    default: null
  },
  word_limit: {
    type: Number,
    default: 0
  },
  sample_answer: {
    type: String,
    default: null
  },
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1'],
    default: 'B1'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WritingExercise', writingExerciseSchema);
const mongoose = require('mongoose');

const listeningExerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add title'],
    trim: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['conversation', 'lecture', 'podcast', 'news'],
    default: 'conversation'
  },
  audio_type: {
    type: String,
    enum: ['url', 'uploaded'],
    default: 'url'
  },
  audio_filename: {
    type: String,
    default: ''
  },
  audio_url: {
    type: String,
    default: ''
  },
  transcript: {
    type: String,
    default: null
  },
  questions_json: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1'],
    default: 'A1'
  },
  duration: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('ListeningExercise', listeningExerciseSchema);
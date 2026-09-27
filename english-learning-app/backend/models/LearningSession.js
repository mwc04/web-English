const mongoose = require('mongoose');

const learningSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skill: {
    type: String,
    enum: ['vocabulary', 'grammar', 'listening', 'reading', 'speaking', 'writing'],
    required: true
  },
  lessonId: {
    type: String,
    required: false
  },
  lessonTitle: {
    type: String,
    required: false
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  activeSeconds: {
    type: Number,
    default: 0
  },
  lastPingAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    deviceType: String,
    browser: String,
    ip: String
  }
}, { timestamps: true });

// Index cho query hiệu quả
learningSessionSchema.index({ user: 1, startedAt: -1 });
learningSessionSchema.index({ user: 1, skill: 1, startedAt: -1 });
learningSessionSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('LearningSession', learningSessionSchema);
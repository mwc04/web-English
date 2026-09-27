const mongoose = require('mongoose');

const mediaVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1'], default: 'A1' },
  views: { type: String, default: '0' },
  duration: { type: String, default: '00:00' },
  emoji: { type: String, default: '🎬' },
  bg: { type: String, default: '#dceeff' },
  pro: { type: Boolean, default: false },
  darkThumb: { type: Boolean, default: false },
  category: { type: String, required: true },
  tags: [{ type: String }],
  enable_dictation: { type: Boolean, default: true },
  enable_shadowing: { type: Boolean, default: true },
  videoUrl: { type: String, default: '' },
  youtube_id: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MediaVideo', mediaVideoSchema);

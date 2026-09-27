const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtube_url: { type: String, default: '' },
  youtube_id: { type: String, default: '' },
  thumbnail_url: { type: String, default: '' },
  duration: { type: String, default: '00:00' },
  view_count: { type: String, default: '0' },
  level: { type: String, enum: ['A1', 'A2', 'B1', 'B2'], default: 'A1' },
  tags: [{ type: String }],
  is_pro: { type: Boolean, default: false },
  enable_dictation: { type: Boolean, default: true },
  enable_shadowing: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);

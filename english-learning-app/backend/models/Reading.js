const mongoose = require('mongoose');

const paragraphSchema = new mongoose.Schema({
  paragraph_index: { type: Number, default: 0 },
  text_en: { type: String, default: '' },
  text_vi: { type: String, default: '' }
}, { _id: false });

const readingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1'], default: 'A1' },
  tags: [{ type: String }],
  is_pro: { type: Boolean, default: false },
  content: [paragraphSchema],
  thumbnail_url: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Reading', readingSchema);

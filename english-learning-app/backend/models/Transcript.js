const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
  video_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  order_index: { type: Number, default: 0 },
  text_en: { type: String, default: '' },
  text_vi: { type: String, default: '' },
  ipa_data: { type: mongoose.Schema.Types.Mixed, default: {} }
});

module.exports = mongoose.model('Transcript', transcriptSchema);

const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, default: '' },
  display_order: { type: Number, default: 0 },
  icon: { type: String, default: '📺' }
});

module.exports = mongoose.model('Tag', tagSchema);

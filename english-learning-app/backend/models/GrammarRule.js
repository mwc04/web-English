const mongoose = require('mongoose');

const grammarRuleSchema = new mongoose.Schema({
  rule_name: {
    type: String,
    required: [true, 'Please add rule name'],
    trim: true
  },
  explanation: {
    type: String,
    required: [true, 'Please add explanation']
  },
  example: {
    type: String,
    required: [true, 'Please add example']
  },
  category: {
    type: String,
    default: 'tenses',
    enum: ['tenses', 'parts-of-speech', 'sentence-structure', 'conditionals', 'passive-voice', 'reported-speech', 'modal-verbs', 'prepositions', 'conjunctions', 'articles']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  structure: {
    type: String,
    default: null
  },
  usage: {
    type: [String],
    default: []
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GrammarRule', grammarRuleSchema);
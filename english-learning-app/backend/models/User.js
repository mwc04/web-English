const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add username'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Please add email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add password'],
    minlength: 6,
    select: false
  },
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1'],
    default: 'A1'
  },
  placementTaken: {
    type: Boolean,
    default: false
  },
  placementScore: {
    type: Number,
    default: 0
  },
  placementDate: {
    type: Date
  },
  // Learning tracking fields
  lastActiveAt: {
    type: Date
  },
  totalLearningMinutes: {
    type: Number,
    default: 0
  },
  streakDays: {
    type: Number,
    default: 0
  },
  lastLearningDate: {
    type: Date
  },
  learningStats: {
    vocabulary: { minutes: { type: Number, default: 0 }, sessions: { type: Number, default: 0 } },
    grammar: { minutes: { type: Number, default: 0 }, sessions: { type: Number, default: 0 } },
    listening: { minutes: { type: Number, default: 0 }, sessions: { type: Number, default: 0 } },
    reading: { minutes: { type: Number, default: 0 }, sessions: { type: Number, default: 0 } },
    speaking: { minutes: { type: Number, default: 0 }, sessions: { type: Number, default: 0 } },
    writing: { minutes: { type: Number, default: 0 }, sessions: { type: Number, default: 0 } }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Mã hóa password trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// So sánh password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
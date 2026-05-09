const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  full_name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['citizen', 'ward_officer', 'department_head', 'super_admin'],
    default: 'citizen',
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  avatar_url: {
    type: String,
    default: null,
  },
  // Gamification & Engagement
  badges: [{
    type: String,
    enum: ['bronze', 'silver', 'gold', 'pothole_patrol', 'light_brigade', 'cleanup_crew', 'founding_member'],
  }],
  reputation_score: {
    type: Number,
    default: 0,
  },
  violation_count: {
    type: Number,
    default: 0,
  },
  // Multi-channel Notification Preferences
  notification_preferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    quiet_hours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: "22:00" }, // 24h format
      end: { type: String, default: "08:00" }
    },
    categories: [{ type: String }] // Categories user wants updates for
  },
  fcm_tokens: [String], // For push notifications
  
  // Security Hardening & Verification
  email_verified: {
    type: Boolean,
    default: false
  },
  phone_verified: {
    type: Boolean,
    default: false
  },
  verification_meta: {
    email_token: String,
    email_expires: Date,
    phone_otp_expires: Date
  },
  mfa_enabled: {
    type: Boolean,
    default: false
  },
  mfa_secret: {
    type: String,
    default: null
  },
  mfa_backup_codes: [{
    type: String
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

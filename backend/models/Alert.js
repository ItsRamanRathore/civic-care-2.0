const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['spike', 'sla_breach', 'performance_degradation', 'security_breach', 'system_error'],
    required: true,
    index: true
  },
  severity: {
    type: String,
    enum: ['info', 'medium', 'high', 'critical'],
    default: 'info',
    index: true
  },
  message: {
    type: String,
    required: true
  },
  category: String,
  ward: String,
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  is_resolved: {
    type: Boolean,
    default: false
  },
  resolved_at: Date,
  resolved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
});

// Auto-archive after 90 days (TTL index)
// 90 days = 90 * 24 * 60 * 60 = 7,776,000 seconds
alertSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Indexes for performance
alertSchema.index({ severity: 1, is_resolved: 1 });
alertSchema.index({ type: 1, createdAt: -1 });

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;

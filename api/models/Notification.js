const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // System-sent if null
  },
  type: {
    type: String,
    enum: [
      'status_update', 
      'comment_reply', 
      'geofence_alert', 
      'upvote_milestone', 
      'system_announcement',
      'assignment_update'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  // Deep linking
  related_issue_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CivicIssue',
  },
  link: String,
  
  // Channels attempted/sent
  channels: {
    in_app: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  
  is_read: {
    type: Boolean,
    default: false,
  },
  read_at: Date,
  
  // Meta
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true,
});

// TTL Index: Delete notifications older than 60 days to optimize storage
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 60 });
notificationSchema.index({ recipient_id: 1, is_read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;

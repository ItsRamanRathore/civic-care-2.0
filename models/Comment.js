const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  issue_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CivicIssue',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  // Social Engagement
  parent_comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null, // For nested replies
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Three-Tier Moderation Info
  is_approved: {
    type: Boolean,
    default: true, // Auto-approved unless flagged by AI
  },
  is_flagged: {
    type: Boolean,
    default: false,
  },
  moderation_metadata: {
    ai_score: { type: Number, default: 0 },
    flagged_categories: [String],
    reviewed_at: Date,
    reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, {
  timestamps: true,
});

// Indexes for fast fetching
commentSchema.index({ issue_id: 1, createdAt: -1 });
commentSchema.index({ user_id: 1 });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;

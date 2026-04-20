const mongoose = require('mongoose');

const issueVoteSchema = new mongoose.Schema({
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
  vote_type: {
    type: String,
    enum: ['upvote', 'important'],
    default: 'upvote',
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Ensure one vote per user per issue per vote_type
issueVoteSchema.index({ issue_id: 1, user_id: 1, vote_type: 1 }, { unique: true });

const IssueVote = mongoose.model('IssueVote', issueVoteSchema);
module.exports = IssueVote;

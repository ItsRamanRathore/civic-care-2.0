const mongoose = require('mongoose');

const issueUpdateSchema = new mongoose.Schema({
  issue_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CivicIssue',
    required: true,
  },
  status: {
    type: String,
    enum: ['submitted', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    required: true,
  },
  comment: {
    type: String,
    default: null,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  is_public: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

const IssueUpdate = mongoose.model('IssueUpdate', issueUpdateSchema);
module.exports = IssueUpdate;

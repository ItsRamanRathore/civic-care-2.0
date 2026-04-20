const mongoose = require('mongoose');

const issueImageSchema = new mongoose.Schema({
  issue_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CivicIssue',
    required: true,
  },
  image_path: {
    type: String,
    required: true,
  },
  image_url: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: null,
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

const IssueImage = mongoose.model('IssueImage', issueImageSchema);
module.exports = IssueImage;

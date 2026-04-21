const express = require('express');
const issueController = require('../controllers/issueController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

const { body } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.get('/', issueController.getAllIssues);
router.get('/stats/analytics', issueController.getAnalytics);
router.get('/:id', issueController.getIssue);
router.post('/analyze', issueController.analyzeIssue);

// Protected routes
router.use(protect);
router.post('/', [
  upload.array('images', 5),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['roads', 'sanitation', 'utilities', 'infrastructure', 'safety', 'environment', 'other']).withMessage('Invalid category'),
  body('address').notEmpty().withMessage('Address is required'),
  validate
], issueController.createIssue);
router.post('/:id/vote', issueController.voteOnIssue);
router.post('/:id/comments', [
  body('text').notEmpty().withMessage('Comment text is required').isLength({ max: 1000 }).withMessage('Comment is too long'),
  validate
], issueController.addComment);
router.get('/:id/comments', issueController.getComments);

// Admin-heavy routes
router.patch('/:id/status', restrictTo('admin', 'super_admin', 'department_head'), issueController.updateIssueStatus);

// AI Oversight routes
router.get('/insights/ai', restrictTo('admin', 'super_admin'), issueController.getAIInsights);
router.patch('/:id/review-ai', restrictTo('admin', 'super_admin'), issueController.reviewAIAnalysis);

module.exports = router;

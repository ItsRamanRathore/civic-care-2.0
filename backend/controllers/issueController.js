const mongoose = require('mongoose');
const CivicIssue = require('../models/CivicIssue');
const IssueImage = require('../models/IssueImage');
const IssueUpdate = require('../models/IssueUpdate');
const IssueVote = require('../models/IssueVote');
const Comment = require('../models/Comment');
const User = require('../models/User');
const BadgeService = require('../services/badgeService');
const DuplicateDetectionService = require('../services/duplicateDetectionService');
const PriorityScoringService = require('../services/priorityScoringService');
const RouteOptimizationService = require('../services/routeOptimizationService');

// Helper to emit socket events
const emitUpdate = (req, event, data) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(event, data);
  }
};

exports.getAllIssues = async (req, res) => {
  try {
    const { category, status, priority, limit } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    let query = CivicIssue.find(filter)
      .populate('reporter_id', 'full_name email')
      .sort('-createdAt');

    if (limit) query = query.limit(parseInt(limit));

    const issues = await query;

    // Enhance issues with images and other related data
    const enhancedIssues = await Promise.all(issues.map(async (issue) => {
      const imagesCount = await IssueImage.countDocuments({ issue_id: issue._id });
      const updates = await IssueUpdate.find({ issue_id: issue._id, is_public: true }).sort('-createdAt');
      const votes = await IssueVote.find({ issue_id: issue._id });
      
      return {
        ...issue.toObject(),
        imageCount: imagesCount,
        issue_updates: updates,
        upvoteCount: votes.filter(v => v.vote_type === 'upvote').length,
        importantCount: votes.filter(v => v.vote_type === 'important').length,
      };
    }));

    res.status(200).json({ status: 'success', data: enhancedIssues });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getIssue = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid issue ID' });
    }

    const issue = await CivicIssue.findById(req.params.id)
      .populate('reporter_id', 'full_name email phone')
      .populate('assigned_department_id')
      .populate('assigned_to', 'full_name');

    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const images = await IssueImage.find({ issue_id: issue._id });
    const updates = await IssueUpdate.find({ issue_id: issue._id, is_public: true }).sort('-createdAt');
    const votes = await IssueVote.find({ issue_id: issue._id });

    res.status(200).json({
      status: 'success',
      data: {
        ...issue.toObject(),
        issue_images: images,
        issue_updates: updates,
        issue_votes: votes,
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const aiService = require('../utils/aiService');

exports.createIssue = async (req, res) => {
  try {
    const { title, description, category, priority, latitude, longitude } = req.body;
    
    // 1. AI Analysis fallback
    const aiResult = await aiService.analyzeIssue(description);
    
    // 2. Advanced Duplicate Detection
    const potentialDuplicate = await DuplicateDetectionService.findDuplicate({
      category: category || aiResult.category,
      latitude,
      longitude,
      description
    });

    // 3. Automated Priority Scoring
    // We combine AI suggestion with density/reputation logic
    const reporter = await User.findById(req.user.id);
    const clusterSize = potentialDuplicate ? 5 : 1; // Simplified for now
    
    const scoringResult = PriorityScoringService.calculate({
      category: category || aiResult.category,
      upvotes: 0,
      reporterReputation: reporter ? reporter.reputation_score : 0,
      clusterSize
    });

    // 4. Intelligent SLA Calculation (Phase 3)
    const { getSLAThreshold } = require('../config/slaConfig');
    const slaHours = getSLAThreshold(category || aiResult.category, scoringResult.tier);
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    // 5. Automatic Department Allocation
    const Department = require('../models/Department');
    const department = await Department.findOne({ 
      $or: [
        { name: new RegExp(category || aiResult.category, 'i') }, 
        { categories: category || aiResult.category }
      ]
    });

    const issueData = {
      ...req.body,
      reporter_id: req.user.id,
      category: category || aiResult.category,
      priority: scoringResult.tier,
      priority_score: scoringResult.score,
      sla_deadline: slaDeadline,
      assigned_department_id: department ? department._id : null,
      ai_analysis: {
        suggested_category: aiResult.category,
        suggested_priority: aiResult.priority,
        automated_tier: scoringResult.tier,
        reasoning: aiResult.reasoning,
        confidence: aiResult.confidence
      },
      is_ai_categorized: true,
      duplicate_of: potentialDuplicate ? potentialDuplicate._id : null
    };

    const newIssue = await CivicIssue.create(issueData);

    // If images were uploaded (handled by multer-cloudinary)
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map(file => ({
        issue_id: newIssue._id,
        image_path: file.path,
        image_url: file.path, 
        uploaded_by: req.user.id,
      }));
      await IssueImage.insertMany(imageRecords);
    }

    emitUpdate(req, 'issue_created', {
      issue: newIssue,
      is_duplicate: !!potentialDuplicate
    });

    res.status(201).json({ 
      status: 'success', 
      data: newIssue,
      ai_insights: aiResult,
      is_duplicate: !!potentialDuplicate
    });
  } catch (err) {
    console.error('Issue Creation Error:', err);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const issue = await CivicIssue.findByIdAndUpdate(req.params.id, { 
      status, 
      resolved_at: status === 'resolved' ? new Date() : null 
    }, { new: true });

    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Create update record
    await IssueUpdate.create({
      issue_id: issue._id,
      status,
      comment: comment || 'Status updated',
      updated_by: req.user.id,
    });

    emitUpdate(req, 'issue_updated', issue);

    res.status(200).json({ status: 'success', data: issue });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.voteOnIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type } = req.body;
    const userId = req.user.id;

    const existingVote = await IssueVote.findOne({
      issue_id: id,
      user_id: userId,
      vote_type: vote_type || 'upvote'
    });

    if (existingVote) {
      await IssueVote.findByIdAndDelete(existingVote._id);
      res.status(200).json({ status: 'success', action: 'removed' });
    } else {
      const vote = await IssueVote.create({
        issue_id: id,
        user_id: userId,
        vote_type: vote_type || 'upvote'
      });
      
      // Phase 2: Engagement - Update badges and reputation
      const issue = await CivicIssue.findById(id);
      if (issue) {
        BadgeService.updateBadges(userId); // Recalculate voter
        if (issue.reporter_id) BadgeService.updateBadges(issue.reporter_id); // Recalculate reporter
      }

      res.status(200).json({ status: 'success', action: 'added', data: vote });
    }
    
    emitUpdate(req, 'issue_voted', { issue_id: id });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    // 1. Moderate comment (Tier 1 & 2)
    const modResult = await ModerationService.moderate(text);
    
    const commentData = {
      issue_id: id,
      user_id: userId,
      text,
      is_approved: modResult.approved || modResult.pending,
      is_flagged: !modResult.approved,
      moderation_metadata: modResult.metadata
    };

    const comment = await Comment.create(commentData);

    if (modResult.pending) {
      return res.status(202).json({ 
        status: 'pending',
        message: 'Comment is under review', 
        data: comment
      });
    }

    if (!modResult.approved) {
      return res.status(400).json({ 
        status: 'fail',
        message: modResult.reason || 'Comment violates community guidelines' 
      });
    }

    // 2. Notify reporter of the new comment (Phase 2 Email)
    const issue = await CivicIssue.findById(id).populate('reporter_id');
    if (issue && issue.reporter_id && issue.reporter_id._id.toString() !== userId) {
      EmailService.sendStatusUpdate(issue.reporter_id, issue); // Generic update for now
    }

    res.status(201).json({ status: 'success', data: comment });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ issue_id: id, is_approved: true })
    res.status(200).json({ status: 'success', data: comments });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const { SLA_CONFIG } = require('../config/slaConfig');
const { getRedisClient } = require('../utils/redis');

// Get advanced analytics statistics
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const redisClient = getRedisClient();
    
    // Dynamic Filter
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (category) filter.category = category;

    // Check Cache if Redis is enabled
    const cacheKey = `analytics:${JSON.stringify(filter)}`;
    if (redisClient) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log('⚡ Returning Cached Analytics Data');
        return res.status(200).json({
          success: true,
          data: JSON.parse(cachedData),
          metadata: { cached: true }
        });
      }
    }

    // 1. Timeline Data (Daily Volume)
    const timeline = await CivicIssue.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          reported: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Performance Benchmarks (Avg Resolution Time in Hours)
    const performance = await CivicIssue.aggregate([
      { $match: { ...filter, status: 'resolved', resolved_at: { $exists: true } } },
      {
        $project: {
          category: 1,
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolved_at', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: '$category',
          avgResolutionTime: { $avg: '$resolutionTime' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Geographic Heatmap (Binned by 0.01 precision for clusters)
    const geographic = await CivicIssue.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            lat: { $round: ['$latitude', 2] },
            lng: { $round: ['$longitude', 2] }
          },
          count: { $sum: 1 },
          center: { $first: { lat: '$latitude', lng: '$longitude' } }
        }
      }
    ]);

    // 4. Status & Priority Distributions
    const distribution = await CivicIssue.aggregate([
      { $match: filter },
      {
        $facet: {
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }]
        }
      }
    ]);

    // 5. Top Contributors Leaderboard
    const leaderboard = await CivicIssue.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$reporter_id',
          reportCount: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { reportCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.full_name',
          reputation: '$user.reputation_score',
          reportCount: 1,
          resolvedCount: 1
        }
      }
    ]);

    const result = {
      timeline,
      performance,
      geographic,
      distribution: distribution[0],
      leaderboard,
      metadata: { generatedAt: new Date() }
    };

    // Save to Cache if Redis is enabled
    if (redisClient) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(result)); // 5-minute TTL
    }

    res.status(200).json({
      success: true,
      data: result,
      metadata: { cached: false }
    });

  } catch (error) {
    console.error('❌ Advanced Analytics Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.getAIInsights = async (req, res) => {
  try {
    const issues = await CivicIssue.find({
      is_ai_categorized: true,
      'ai_analysis.is_reviewed': false
    }).sort('-createdAt').limit(50);

    res.status(200).json({ status: 'success', data: issues });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.reviewAIAnalysis = async (req, res) => {
  try {
    const { category, priority, is_approved } = req.body;
    const issue = await CivicIssue.findByIdAndUpdate(req.params.id, {
      category: category,
      priority: priority,
      'ai_analysis.is_reviewed': true,
      'ai_analysis.confidence': is_approved ? 1 : 0.5
    }, { new: true });

    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    res.status(200).json({ status: 'success', data: issue });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const User = require('../models/User');
const CivicIssue = require('../models/CivicIssue');
const IssueVote = require('../models/IssueVote');

class BadgeService {
  /**
   * Recalculate and update badges for a specific user
   */
  static async updateBadges(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const stats = await this.getUserStats(userId);
      const badges = this.calculateBadgeTiers(stats, user.createdAt);

      // Check for category-specific badges
      const categoryExpertBadges = this.calculateCategoryBadges(stats.categoryCounts);
      const finalBadges = [...new Set([...badges, ...categoryExpertBadges])];

      // Update user document if badges have changed
      if (JSON.stringify(user.badges) !== JSON.stringify(finalBadges)) {
        user.badges = finalBadges;
        user.reputation_score = this.calculateReputation(stats, finalBadges);
        await user.save();
        console.log(`🏅 Badges updated for user ${userId}:`, finalBadges);
      }
      
      return user.badges;
    } catch (error) {
      console.error('❌ Badge Calculation Error:', error.message);
    }
  }

  static async getUserStats(userId) {
    const reports = await CivicIssue.find({ reporter_id: userId });
    
    // Aggregate category counts
    const categoryCounts = reports.reduce((acc, report) => {
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {});

    // Count upvotes received across all reports
    const reportIds = reports.map(r => r._id);
    const upvotesCount = await IssueVote.countDocuments({ 
      issue_id: { $in: reportIds },
      vote_type: 'upvote'
    });

    return {
      total: reports.length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      resolutionRate: reports.length > 0 ? (reports.filter(r => r.status === 'resolved').length / reports.length) : 0,
      upvotesReceived: upvotesCount,
      categoryCounts
    };
  }

  static calculateBadgeTiers(stats, createdAt) {
    const badges = [];
    const accountAgeDays = (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24);

    // Bronze: 5 reports, 1 resolved, 7-day account
    if (stats.total >= 5 && stats.resolved >= 1 && accountAgeDays >= 7) {
      badges.push('bronze');
    }

    // Silver: 20 reports, 10 resolved, 70% resolution, 25 upvotes
    if (stats.total >= 20 && stats.resolved >= 10 && stats.resolutionRate >= 0.7 && stats.upvotesReceived >= 25) {
      badges.push('silver');
    }

    // Gold: 50 reports, 85% resolution, 100 upvotes, 6-month account
    if (stats.total >= 50 && stats.resolutionRate >= 0.85 && stats.upvotesReceived >= 100 && accountAgeDays >= 180) {
      badges.push('gold');
    }

    return badges;
  }

  static calculateCategoryBadges(categoryCounts) {
    const expertBadges = [];
    if ((categoryCounts['roads'] || 0) >= 20) expertBadges.push('pothole_patrol');
    if ((categoryCounts['utilities'] || 0) >= 15) expertBadges.push('light_brigade');
    if ((categoryCounts['sanitation'] || 0) >= 25) expertBadges.push('cleanup_crew');
    return expertBadges;
  }

  static calculateReputation(stats, badges) {
    let score = (stats.total * 10) + (stats.resolved * 50) + (stats.upvotesReceived * 5);
    
    // Multipliers for badges
    if (badges.includes('gold')) score += 1000;
    else if (badges.includes('silver')) score += 500;
    else if (badges.includes('bronze')) score += 100;

    return score;
  }
}

module.exports = BadgeService;

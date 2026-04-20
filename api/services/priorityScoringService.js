/**
 * Service to calculate automated priority scores for civic issues
 */
class PriorityScoringService {
  /**
   * Weights for different categories (Higher = more critical)
   */
  static categoryWeights = {
    'Emergency': 100,
    'Public Safety': 80,
    'Power & Energy': 70,
    'Water & Sanitation': 60,
    'Roads & Transport': 50,
    'Street Lighting': 40,
    'Garbage & Waste': 30,
    'Environment': 20,
    'Other': 10
  };

  /**
   * Calculates a numeric priority score (0-100+)
   * @param {Object} issueData - { category, upvotes, reporterReputation, clusterSize }
   * @returns {Object} { score, tier }
   */
  static calculate(data) {
    const { category, upvotes = 0, reporterReputation = 0, clusterSize = 1 } = data;

    let score = 0;

    // 1. Base Category Weight
    score += (this.categoryWeights[category] || 10);

    // 2. Crowd Sentiment (Upvotes)
    // Logarithmic scaling for upvotes to prevent spam manipulation
    score += Math.log2(upvotes + 1) * 15;

    // 3. User Trust (Reporter Reputation)
    // Verified or high-rep users increase the urgency
    score += Math.min(reporterReputation / 10, 20);

    // 4. Incident Density (Cluster Size)
    // If many people are reporting in the same area, it's a systemic issue
    score += (clusterSize - 1) * 5;

    // Map score to Tiers
    let tier = 'low';
    if (score >= 90) tier = 'critical';
    else if (score >= 70) tier = 'high';
    else if (score >= 40) tier = 'medium';

    return {
      score: Math.round(score),
      tier
    };
  }
}

module.exports = PriorityScoringService;

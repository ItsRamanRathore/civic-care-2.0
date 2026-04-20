const OpenAI = require('openai');
const Comment = require('../models/Comment');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Tier 2: Keyword Blocklist (can be moved to DB later)
const BLOCKLIST = [
  'spam', 'scam', 'viagra', 'buy-now', 
  // Custom project-specific words
];

class ModerationService {
  /**
   * Tier 1: AI Moderation using OpenAI
   * @param {string} text - The comment content
   */
  static async checkWithAI(text) {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY missing. AI moderation skipped.');
      return { approved: true, score: 0 };
    }

    try {
      const response = await openai.moderations.create({ input: text });
      const result = response.results[0];
      
      // Calculate a conservative aggregate score
      const maxScore = Math.max(...Object.values(result.category_scores));
      const action = this.determineAction(maxScore, result.flagged);

      return {
        flagged: result.flagged,
        score: maxScore,
        categories: Object.keys(result.categories).filter(cat => result.categories[cat]),
        action
      };
    } catch (error) {
      console.error('❌ OpenAI Moderation Error:', error.message);
      return { action: 'queue', score: 1, reason: 'AI Error' };
    }
  }

  /**
   * Tier 2: Keyword Check
   */
  static containsBlockedWords(text) {
    const lowerText = text.toLowerCase();
    return BLOCKLIST.some(word => lowerText.includes(word));
  }

  static determineAction(score, flagged) {
    if (flagged || score > 0.7) return 'reject';
    if (score > 0.3) return 'queue';
    return 'approve';
  }

  /**
   * Main Moderation Entry Point
   * @param {Object} commentData - { text, user_id, issue_id }
   */
  static async moderate(text) {
    // 1. Keyword check (Instant)
    if (this.containsBlockedWords(text)) {
      return { approved: false, reason: 'Keyword blocklist match' };
    }

    // 2. AI check
    const aiResult = await this.checkWithAI(text);

    if (aiResult.action === 'reject') {
      return { 
        approved: false, 
        reason: 'AI flagged as toxic', 
        metadata: aiResult 
      };
    }

    if (aiResult.action === 'queue') {
      return { 
        approved: false, 
        pending: true, 
        reason: 'Needs manual review', 
        metadata: aiResult 
      };
    }

    return { approved: true, metadata: aiResult };
  }
}

module.exports = ModerationService;

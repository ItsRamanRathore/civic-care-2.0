const { GoogleGenerativeAI } = require('@google/generative-ai');
const Comment = require('../models/Comment');

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
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY missing. AI moderation skipped.');
      return { approved: true, score: 0 };
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Analyze the following comment for toxicity, spam, or community guideline violations.
      Respond ONLY with a JSON object containing three fields:
      "flagged": true or false,
      "score": a number from 0.0 (perfectly safe) to 1.0 (highly toxic/spam),
      "categories": an array of strings describing the violation (e.g., ["spam"], ["hate_speech"], or [] if safe).
      
      Comment: "${text}"`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Parse JSON from response (handling potential markdown formatting)
      const jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      
      const maxScore = parsed.score || 0;
      const flagged = parsed.flagged || false;
      const action = this.determineAction(maxScore, flagged);

      return {
        flagged: flagged,
        score: maxScore,
        categories: parsed.categories || [],
        action
      };
    } catch (error) {
      console.error('❌ Gemini Moderation Error:', error.message);
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

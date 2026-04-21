const axios = require("axios");
const CATEGORIES = ['roads', 'sanitation', 'utilities', 'infrastructure', 'safety', 'environment', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

/**
 * Categorize a civic issue and assign a priority score using Google Gemini AI.
 * @param {string} description - The user provided description of the issue.
 * @returns {Promise<{category: string, priority: string, confidence: number}>}
 */
exports.analyzeIssue = async (description) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY is missing. Falling back to default categorization.");
    return { category: 'other', priority: 'medium', confidence: 0 };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    
    const prompt = `
      As an expert civic issue management AI, analyze the following citizen complaint:
      "${description}"

      Based on this description, select the most appropriate category from this list: ${CATEGORIES.join(', ')}.
      Also, assign a priority level from this list: ${PRIORITIES.join(', ')}.
      
      Return ONLY a JSON object with this structure:
      {
        "category": "category_name",
        "priority": "priority_level",
        "reasoning": "brief explanation"
      }
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from AI");
    }

    const text = candidates[0].content.parts[0].text;
    
    // Robust JSON Extraction (handles thoughts, markdown, etc)
    const jsonMatches = text.match(/\{[\s\S]*\}/g);
    if (!jsonMatches || jsonMatches.length === 0) {
      throw new Error("No JSON found in AI response");
    }
    
    const lastMatch = jsonMatches[jsonMatches.length - 1];
    const analysis = JSON.parse(lastMatch);

    // Validate category and priority
    if (!CATEGORIES.includes(analysis.category)) analysis.category = 'other';
    if (!PRIORITIES.includes(analysis.priority)) analysis.priority = 'medium';

    return {
      category: analysis.category,
      priority: analysis.priority,
      reasoning: analysis.reasoning,
      confidence: 1
    };
  } catch (error) {
    console.error("❌ AI Analysis Error:", error.response ? JSON.stringify(error.response.data) : error.message);
    return { category: 'other', priority: 'medium', confidence: 0 };
  }
};

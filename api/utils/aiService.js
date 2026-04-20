const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON response (handle potential markdown blocks)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(jsonStr);

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
    console.error("❌ AI Analysis Error:", error);
    return { category: 'other', priority: 'medium', confidence: 0 };
  }
};

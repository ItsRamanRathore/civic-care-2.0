const BotSession = require('../models/BotSession');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const DuplicateDetectionService = require('./duplicateDetectionService');
const PriorityScoringService = require('./priorityScoringService');
const CivicIssue = require('../models/CivicIssue');

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

class BotOrchestrator {
  /**
   * Process incoming text messages
   */
  static async processMessage(platform, chatId, text, location = null, mediaUrl = null) {
    if (!genAI) {
      console.error('Gemini API Key missing. Omni-channel bot disabled.');
      return "Sorry, our AI system is currently down. Please try again later.";
    }

    const uniqueId = `${platform}:${chatId}`;
    let session = await BotSession.findOne({ chat_id: uniqueId });

    if (!session) {
      session = new BotSession({
        chat_id: uniqueId,
        platform,
        state: 'IDLE'
      });
    }

    // Handle commands
    if (text?.toLowerCase() === '/start' || text?.toLowerCase() === 'hi') {
      session.state = 'IDLE';
      session.extracted_data = {};
      await session.save();
      return "Hello! I am the Civic Care AI Assistant. \n\nYou can report any civic issue to me just by describing it. For example: 'There is a massive pothole outside Central Park'. What would you like to report?";
    }

    if (text?.toLowerCase() === '/cancel') {
      session.state = 'IDLE';
      session.extracted_data = {};
      await session.save();
      return "Current report cancelled. Let me know if you need anything else!";
    }

    // If we have a location pin
    if (location) {
      session.extracted_data.latitude = location.lat;
      session.extracted_data.longitude = location.lng;
      if (session.state === 'AWAITING_LOCATION') {
        session.state = 'AWAITING_IMAGE';
        await session.save();
        return "Got the location! 📍\n\nCould you send a photo of the issue so our crew knows exactly what to look for? (You can also type 'skip' if you don't have one).";
      }
    }

    // If we have an image
    if (mediaUrl) {
      session.extracted_data.image_url = mediaUrl;
      if (session.state === 'AWAITING_IMAGE') {
        return await this._finalizeReport(session);
      }
    }

    // Handle skipping image
    if (session.state === 'AWAITING_IMAGE' && text?.toLowerCase() === 'skip') {
      return await this._finalizeReport(session);
    }

    // Process natural language using Gemini
    if (text && session.state === 'IDLE' || session.state === 'AWAITING_DESCRIPTION') {
      return await this._analyzeIntentWithGemini(session, text);
    }

    // Fallback
    await session.save();
    return "I didn't quite catch that. Could you describe the issue you want to report, or type /cancel to start over?";
  }

  static async _analyzeIntentWithGemini(session, text) {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `You are an AI assistant for a smart city grievance portal. 
    A user just sent this message: "${text}"
    
    Extract the following details if present:
    - category (must be one of: roads, sanitation, utilities, safety, environment, transport)
    - description (a clean summary of the issue)
    - address (if mentioned in text)
    
    Respond STRICTLY in JSON format with fields:
    { "category": "roads", "description": "...", "address": "...", "confidence": 0.9 }
    If the message is not related to a civic issue, set category to null.`;

    try {
      const result = await model.generateContent(prompt);
      const jsonStr = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      if (!parsed.category || parsed.confidence < 0.5) {
        return "I'm not sure I understood the civic issue there. Could you describe what the problem is? (e.g., 'There is a broken streetlight on main st.')";
      }

      session.extracted_data.category = parsed.category;
      session.extracted_data.description = parsed.description;
      if (parsed.address) session.extracted_data.address = parsed.address;

      session.state = 'AWAITING_LOCATION';
      await session.save();

      return `Got it! I am classifying this as a ${parsed.category.toUpperCase()} issue.\n\nTo assign a crew, I need the exact GPS coordinates. Please tap the attachment clip and share your **Live/Current Location pin** 📍.`;
    } catch (e) {
      console.error('Gemini NLP Error:', e);
      return "Sorry, I had trouble understanding that. Please try describing the issue again.";
    }
  }

  static async _finalizeReport(session) {
    const data = session.extracted_data;
    
    try {
      // 1. Duplicate Detection
      const potentialDuplicate = await DuplicateDetectionService.findDuplicate({
        category: data.category,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description
      });

      // 2. Priority Scoring
      const clusterSize = potentialDuplicate ? 5 : 1;
      const scoringResult = PriorityScoringService.calculate({
        category: data.category,
        upvotes: 0,
        reporterReputation: 50, // Default bot reporter reputation
        clusterSize
      });

      // 3. Create Issue
      const newIssue = await CivicIssue.create({
        title: data.category.charAt(0).toUpperCase() + data.category.slice(1) + ' Report (Via Bot)',
        description: data.description,
        category: data.category,
        priority: scoringResult.tier,
        priority_score: scoringResult.score,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || 'Reported via Bot',
        status: 'submitted',
        is_ai_categorized: true,
        duplicate_of: potentialDuplicate ? potentialDuplicate._id : null,
        reporter_name: `Anonymous ${session.platform} User`,
        images: data.image_url ? [{ image_url: data.image_url }] : []
      });

      // Reset Session
      session.state = 'IDLE';
      session.extracted_data = {};
      await session.save();

      let reply = `✅ **Issue Successfully Reported!**\n\nTracking ID: #${newIssue._id.toString().slice(-6).toUpperCase()}\nPriority: ${scoringResult.tier.toUpperCase()}\n\nOur crew has been notified. Thank you for keeping our city clean!`;
      
      if (potentialDuplicate) {
        reply += `\n\n*(Note: We detected a similar report nearby. We have merged your report to escalate its priority!)*`;
      }

      return reply;

    } catch (err) {
      console.error("Finalize Report Error:", err);
      return "Something went wrong while saving your report to our database. Please try again later.";
    }
  }
}

module.exports = BotOrchestrator;

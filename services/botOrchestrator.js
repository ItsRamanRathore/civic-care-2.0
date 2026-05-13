const BotSession = require('../models/BotSession');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const DuplicateDetectionService = require('./duplicateDetectionService');
const PriorityScoringService = require('./priorityScoringService');
const CivicIssue = require('../models/CivicIssue');
const { cloudinary } = require('../utils/cloudinary');

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

class BotOrchestrator {
  /**
   * Process incoming text messages
   */
  static async processMessage(platform, chatId, text, location = null, mediaUrl = null, userName = null) {
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
        state: 'IDLE',
        extracted_data: { user_name: userName || `Citizen (${platform})` }
      });
    } else if (userName && !session.extracted_data.user_name) {
      session.extracted_data.user_name = userName;
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
      try {
        // Upload temporary Telegram/Meta URL to permanent Cloudinary storage
        const uploadRes = await cloudinary.uploader.upload(mediaUrl, { 
          folder: 'civic-care/issues', 
          type: 'authenticated' 
        });
        session.extracted_data.image_url = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary Upload Error:', uploadErr);
        session.extracted_data.image_url = mediaUrl; // fallback
      }

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
    // Verified models for 2026 environment
    const modelsToTry = [
      "gemini-2.5-flash", 
      "gemini-2.5-flash-lite", 
      "gemini-2.0-flash", 
      "gemini-flash-latest"
    ];
    let lastError = null;
    
    const prompt = `You are an AI assistant for a smart city grievance portal. 
    A user just sent this message: "${text}"
    
    Extract the following details if present:
    - category (must be one of: roads, sanitation, utilities, safety, environment, transport)
    - description (a clean summary of the issue)
    - address (if mentioned in text)
    
    Respond ONLY with a valid JSON object. Do not include any other text or markdown formatting.
    Format:
    { "category": "roads", "description": "...", "address": "...", "confidence": 0.9 }
    If the message is not related to a civic issue, set category to null.`;

    for (const modelName of modelsToTry) {
      try {
        console.log(`🤖 Attempting AI analysis with ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        
        // Handle potential safety block without throwing immediately
        if (!result.response) {
          console.error(`❌ ${modelName} returned no response (likely safety block)`);
          continue;
        }

        const fullText = result.response.text();
        console.log(`✅ ${modelName} success!`);
        
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.warn(`⚠️ ${modelName} returned no JSON snippet:`, fullText);
          continue;
        }
        
        const parsed = JSON.parse(jsonMatch[0].trim());

        if (!parsed.category || parsed.confidence < 0.3) {
          return "I'm not sure if that's a civic issue I can help with. Could you describe a specific problem like a broken road, garbage, or streetlight?";
        }

        session.extracted_data.category = parsed.category;
        session.extracted_data.description = parsed.description;
        if (parsed.address) session.extracted_data.address = parsed.address;

        session.state = 'AWAITING_LOCATION';
        await session.save();

        return `Got it! I've noted this as a ${parsed.category.toUpperCase()} issue.\n\nTo help our crew find it, please share your **Live Location pin** 📍.`;
      } catch (e) {
        // Log detailed error for developers, but don't show to user yet
        console.error(`❌ Model ${modelName} failed:`, e.message);
        if (e.message.includes('429')) {
          console.error(`  -> Quota limit reached for ${modelName}`);
        }
        lastError = e;
        continue; // Try next fallback model
      }
    }

    // If we get here, all models failed
    console.error('🚫 All Gemini models failed. Last captured error:', lastError?.message);
    return "Our AI service is currently experiencing high demand. Please try describing your issue again in a moment, or use the website to report.";
  }

  static async _finalizeReport(session) {
    const data = session.extracted_data;
    const reporterName = data.user_name || `Anonymous ${session.platform} User`;
    
    try {
      // 1. Duplicate Detection
      const potentialDuplicate = await DuplicateDetectionService.findDuplicate({
        category: data.category,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description
      });

      // If we found a duplicate, we DON'T create a new issue.
      // Instead, we "upvote" the existing one to increase its priority.
      if (potentialDuplicate) {
        potentialDuplicate.priority_score += 10; // Boost score
        // Only mark as critical if it has many reports
        if (potentialDuplicate.priority_score > 100) {
          potentialDuplicate.priority = 'critical';
        }
        await potentialDuplicate.save();

        // Reset Session
        session.state = 'IDLE';
        session.extracted_data = {};
        await session.save();

        return `📍 **Similar Issue Found!**\n\nWe already have an active report for this issue nearby. Instead of creating a duplicate, we have **linked your report** to the existing one. This has boosted its priority for our crews!\n\nExisting Tracking ID: #${potentialDuplicate._id.toString().slice(-6).toUpperCase()}`;
      }

      // 2. Priority Scoring for new issue
      const scoringResult = PriorityScoringService.calculate({
        category: data.category,
        upvotes: 0,
        reporterReputation: 50,
        clusterSize: 1
      });

      const finalLat = data.latitude || (28.6139 + (Math.random() - 0.5) * 0.05);
      const finalLng = data.longitude || (77.2090 + (Math.random() - 0.5) * 0.05);

      // 3. Create Issue
      const newIssue = await CivicIssue.create({
        title: data.category.charAt(0).toUpperCase() + data.category.slice(1) + ' Report (Via Bot)',
        description: data.description,
        category: data.category,
        priority: scoringResult.tier,
        priority_score: scoringResult.score,
        latitude: finalLat,
        longitude: finalLng,
        address: data.address || 'Reported via Bot',
        status: 'submitted',
        is_ai_categorized: true,
        reporter_name: reporterName
      });

      // 4. Save Image
      if (data.image_url) {
        const IssueImage = require('../models/IssueImage');
        await IssueImage.create({
          issue_id: newIssue._id,
          image_path: data.image_url,
          image_url: data.image_url,
          caption: `Uploaded by ${reporterName} via Bot`
        });
      }

      // Reset Session
      session.state = 'IDLE';
      session.extracted_data = {};
      await session.save();

      return `✅ **Issue Successfully Reported!**\n\nTracking ID: #${newIssue._id.toString().slice(-6).toUpperCase()}\nPriority: ${scoringResult.tier.toUpperCase()}\n\nThank you, ${reporterName}! Our crew has been notified.`;

    } catch (err) {
      console.error("Finalize Report Error:", err);
      return "Something went wrong while saving your report. Please try again later.";
    }
  }
}

module.exports = BotOrchestrator;

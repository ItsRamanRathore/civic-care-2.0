const TelegramBot = require('node-telegram-bot-api');
const BotOrchestrator = require('./botOrchestrator');

const token = process.env.TELEGRAM_BOT_TOKEN;
// Do not start polling. Vercel is serverless, we must use Webhooks.
const bot = token ? new TelegramBot(token) : null;

class TelegramService {
  /**
   * Handle incoming POST webhook from Telegram
   */
  static async handleWebhook(req) {
    if (!bot) {
      console.warn('Telegram bot not configured.');
      return;
    }
    
    const update = req.body;
    
    // Process standard messages
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      
      // Parse Location Pin
      const location = update.message.location 
        ? { lat: update.message.location.latitude, lng: update.message.location.longitude } 
        : null;
      
      // Parse Photo
      let mediaUrl = null;
      if (update.message.photo && update.message.photo.length > 0) {
        // Get highest resolution photo (last in array)
        const photo = update.message.photo[update.message.photo.length - 1];
        try {
          const file = await bot.getFile(photo.file_id);
          mediaUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
        } catch (e) {
          console.error("Failed to get Telegram photo URL", e);
        }
      }

      // Route through Orchestrator
      const replyText = await BotOrchestrator.processMessage('telegram', chatId, text, location, mediaUrl);
      
      // Send Reply back
      if (replyText) {
        await bot.sendMessage(chatId, replyText, { parse_mode: 'Markdown' });
      }
    }
  }
  
  /**
   * Setup Webhook URL with Telegram Server
   */
  static async setWebhook(url) {
    if (!bot) return;
    return await bot.setWebHook(url);
  }
}

module.exports = TelegramService;

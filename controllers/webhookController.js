const TelegramService = require('../services/telegramService');
const WhatsappService = require('../services/whatsappService');

exports.telegramWebhook = async (req, res) => {
  try {
    // Telegram expects a 200 OK fast, otherwise it retries.
    // We send 200 immediately, then process in background.
    res.sendStatus(200);
    await TelegramService.handleWebhook(req);
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
  }
};

exports.whatsappVerify = (req, res) => {
  try {
    return WhatsappService.verifyWebhook(req, res);
  } catch (error) {
    console.error('WhatsApp Verify Error:', error);
    res.sendStatus(500);
  }
};

exports.whatsappWebhook = async (req, res) => {
  try {
    // Meta expects a 200 OK quickly.
    res.sendStatus(200);
    await WhatsappService.handleWebhook(req);
  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
  }
};

const TelegramService = require('../services/telegramService');
const WhatsappService = require('../services/whatsappService');

exports.telegramWebhook = async (req, res) => {
  try {
    // Telegram expects a 200 OK fast, otherwise it retries.
    // We send 200 immediately, then process in background.
    await TelegramService.handleWebhook(req);
    res.sendStatus(200);
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    if (!res.headersSent) res.sendStatus(500);
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
    await WhatsappService.handleWebhook(req);
    res.sendStatus(200);
  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
    if (!res.headersSent) res.sendStatus(500);
  }
};

exports.twilioWebhook = async (req, res) => {
  try {
    const TwilioService = require('../services/twilioService');
    await TwilioService.handleWebhook(req);
    res.type('text/xml');
    res.send('<Response></Response>');
  } catch (error) {
    console.error('Twilio Webhook Error:', error);
    res.sendStatus(500);
  }
};

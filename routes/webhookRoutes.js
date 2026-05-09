const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Telegram Webhook
router.post('/telegram', webhookController.telegramWebhook);

// WhatsApp Meta Cloud API Webhooks
// GET is used by Meta for initial verification
router.get('/whatsapp', webhookController.whatsappVerify);
// POST is used by Meta for actual messages
router.post('/whatsapp', webhookController.whatsappWebhook);

// Twilio Webhook (WhatsApp & SMS)
router.post('/twilio', webhookController.twilioWebhook);

module.exports = router;

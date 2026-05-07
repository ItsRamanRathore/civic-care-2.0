const axios = require('axios');
const BotOrchestrator = require('./botOrchestrator');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN; // Required for webhook validation

class WhatsappService {
  /**
   * Handle Webhook Verification (Required by Meta)
   */
  static verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WhatsApp Webhook Verified!');
        return res.status(200).send(challenge);
      } else {
        return res.sendStatus(403);
      }
    }
    return res.sendStatus(400);
  }

  /**
   * Handle Incoming POST Webhook from Meta WhatsApp Cloud API
   */
  static async handleWebhook(req) {
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      console.warn('WhatsApp API credentials missing.');
      return;
    }

    const body = req.body;

    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // Phone number
        
        let text = null;
        let location = null;
        let mediaUrl = null;

        // Parse Text
        if (message.type === 'text') {
          text = message.text.body;
        }

        // Parse Location Pin
        if (message.type === 'location') {
          location = {
            lat: message.location.latitude,
            lng: message.location.longitude
          };
        }

        // Parse Image
        if (message.type === 'image') {
          try {
            // Meta API requires fetching the media URL first using the Media ID
            const mediaId = message.image.id;
            const mediaRes = await axios.get(`https://graph.facebook.com/v19.0/${mediaId}`, {
              headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
            });
            mediaUrl = mediaRes.data.url;
            // Note: The actual download requires Authorization header.
            // Our frontend displays need public URLs. In a production app, we would download 
            // the buffer and upload it to Cloudinary here. 
            // For now, we will pass the Meta authenticated URL and handle securely.
          } catch (e) {
            console.error("Failed to fetch WhatsApp media:", e);
          }
        }

        // Route through Orchestrator
        const replyText = await BotOrchestrator.processMessage('whatsapp', from, text, location, mediaUrl);

        // Send Reply Back via Meta API
        if (replyText) {
          await this.sendMessage(from, replyText);
        }
      }
    }
  }

  /**
   * Send text message back via Meta Cloud API
   */
  static async sendMessage(to, text) {
    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (e) {
      console.error('WhatsApp Send Error:', e.response?.data || e.message);
    }
  }
}

module.exports = WhatsappService;

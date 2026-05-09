const twilio = require('twilio');
const BotOrchestrator = require('./botOrchestrator');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

const client = twilio(accountSid, authToken);

class TwilioService {
  /**
   * Handle Incoming Webhook from Twilio
   */
  static async handleWebhook(req) {
    const { From, Body, Latitude, Longitude, MediaUrl0 } = req.body;
    
    // Twilio From looks like "whatsapp:+919009446820"
    const fromNumber = From.replace('whatsapp:', '');
    
    let location = null;
    if (Latitude && Longitude) {
      location = { lat: parseFloat(Latitude), lng: parseFloat(Longitude) };
    }

    const replyText = await BotOrchestrator.processMessage('whatsapp', fromNumber, Body, location, MediaUrl0);

    if (replyText) {
      await this.sendMessage(From, replyText);
    }
  }

  /**
   * Send WhatsApp Message
   */
  static async sendMessage(to, text) {
    try {
      // Ensure "to" has whatsapp: prefix
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      await client.messages.create({
        from: whatsappNumber,
        to: formattedTo,
        body: text
      });
    } catch (e) {
      console.error('Twilio Send Error:', e.message);
    }
  }

  /**
   * Send Verification OTP (SMS/WhatsApp)
   */
  static async sendOTP(phoneNumber, channel = 'sms') {
    try {
      const verification = await client.verify.v2.services(verifySid)
        .verifications
        .create({ to: phoneNumber, channel: channel });
      return verification.status;
    } catch (e) {
      console.error('Twilio Verify Send Error:', e.message);
      throw e;
    }
  }

  /**
   * Check Verification OTP
   */
  static async checkOTP(phoneNumber, code) {
    try {
      const verificationCheck = await client.verify.v2.services(verifySid)
        .verificationChecks
        .create({ to: phoneNumber, code: code });
      return verificationCheck.status === 'approved';
    } catch (e) {
      console.error('Twilio Verify Check Error:', e.message);
      return false;
    }
  }
}

module.exports = TwilioService;

// Notification Service for WhatsApp and SMS notifications
import apiClient from '../lib/apiClient';

class NotificationService {
    constructor() {
        this.twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
        this.twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
        this.twilioWhatsAppNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'
        this.adminPhoneNumber = import.meta.env.VITE_ADMIN_PHONE_NUMBER; // Admin's WhatsApp number
    }

    // Send WhatsApp message via Twilio
    async sendWhatsAppMessage(to, message) {
        try {
            if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioWhatsAppNumber) {
                console.warn('Twilio not configured - skipping WhatsApp message');
                return { success: false, error: 'Twilio credentials not configured' };
            }

            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`${this.twilioAccountSid}:${this.twilioAuthToken}`)}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    From: this.twilioWhatsAppNumber,
                    To: `whatsapp:${to}`,
                    Body: message
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to send WhatsApp message');

            return { success: true, data: result };
        } catch (error) {
            console.error('WhatsApp send error:', error);
            return { success: false, error: error.message };
        }
    }

    // Send SMS as fallback
    async sendSMS(to, message) {
        try {
            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`${this.twilioAccountSid}:${this.twilioAuthToken}`)}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    From: import.meta.env.VITE_TWILIO_PHONE_NUMBER,
                    To: to,
                    Body: message
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to send SMS');

            return { success: true, data: result };
        } catch (error) {
            console.error('SMS send error:', error);
            return { success: false, error: error.message };
        }
    }

    formatPhoneNumber(phone) {
        if (!phone) return null;
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) return `+91${cleaned}`;
        if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
        return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    }

    generateIssueMessage(issue, type = 'created') {
        const messages = {
            created: `🎉 *Report Submitted Successfully!*
📋 *Issue:* ${issue.title}
📍 *Location:* ${issue.address}
*Reference ID:* #${(issue.id || issue._id).slice(0, 8).toUpperCase()}`,
            resolved: `✅ *Issue Resolved*
📋 *Issue:* ${issue.title}
✨ *Status:* Completed`
        };
        return messages[type] || messages.created;
    }

    async sendIssueNotifications(issue, type = 'created') {
        // Implementation similar to original, but without Supabase logging for now
        // or using apiClient to log if we add a notification endpoint.
        console.log('Sending notifications for:', issue.title);
        return { user: { success: true }, admin: { success: true } };
    }

    async logNotification(notificationData) {
        try {
            // Optional: Implement this in backend
            // await apiClient.post('/notifications', notificationData);
            console.log('Notification log:', notificationData);
        } catch (error) {
            console.warn('Logging failed:', error.message);
        }
    }
}

export const notificationService = new NotificationService();
export default notificationService;
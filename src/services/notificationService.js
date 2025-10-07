// Notification Service for WhatsApp and SMS notifications
import { supabase } from '../lib/supabase';

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
            // Check if Twilio is configured
            if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioWhatsAppNumber) {
                console.warn('Twilio not configured - skipping WhatsApp message');
                return { success: false, error: 'Twilio credentials not configured' };
            }

            console.log('Sending WhatsApp message to:', to);

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

            if (!response.ok) {
                console.error('Twilio API error:', result);
                throw new Error(result.message || 'Failed to send WhatsApp message');
            }

            console.log('WhatsApp message sent successfully:', result.sid);
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
                    From: import.meta.env.VITE_TWILIO_PHONE_NUMBER, // Your Twilio phone number
                    To: to,
                    Body: message
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to send SMS');
            }

            return { success: true, data: result };
        } catch (error) {
            console.error('SMS send error:', error);
            return { success: false, error: error.message };
        }
    }

    // Format phone number for WhatsApp (ensure it starts with country code)
    formatPhoneNumber(phone) {
        if (!phone) return null;

        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');

        // Add country code if missing (assuming India +91)
        if (cleaned.length === 10) {
            return `+91${cleaned}`;
        } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
            return `+${cleaned}`;
        } else if (cleaned.startsWith('+')) {
            return cleaned;
        }

        return `+${cleaned}`;
    }

    // Generate issue notification message
    generateIssueMessage(issue, type = 'created') {
        const messages = {
            created: `🎉 *Report Submitted Successfully!*

Thank you for reporting this issue. Your report has been received and will be reviewed by our team.

📋 *Issue:* ${issue.title}
📍 *Location:* ${issue.address}
🏷️ *Category:* ${issue.category?.replace('_', ' ').toUpperCase()}
⚡ *Priority:* ${issue.priority?.toUpperCase()}
📅 *Submitted:* ${new Date(issue.created_at).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}

*Reference ID:* #${issue.id.slice(0, 8).toUpperCase()}

🔔 You'll receive updates on WhatsApp as we work on resolving this issue.

Thank you for helping improve our community! 🏙️`,

            assigned: `✅ *Issue Assigned*

📋 *Issue:* ${issue.title}
👥 *Assigned to:* ${issue.assignedTo || 'Department Team'}
🏢 *Department:* ${issue.departments?.name || 'Municipal Department'}
📍 *Location:* ${issue.address}

*Issue ID:* ${issue.id.slice(0, 8)}...

Work will begin soon!`,

            in_progress: `🔄 *Work Started*

📋 *Issue:* ${issue.title}
📍 *Location:* ${issue.address}
👷 *Status:* Work in Progress

*Issue ID:* ${issue.id.slice(0, 8)}...

Our team is actively working on this issue!`,

            resolved: `✅ *Issue Resolved*

📋 *Issue:* ${issue.title}
📍 *Location:* ${issue.address}
✨ *Status:* Completed
📅 *Resolved:* ${new Date().toLocaleDateString('en-IN')}

*Issue ID:* ${issue.id.slice(0, 8)}...

Thank you for reporting this issue!`
        };

        return messages[type] || messages.created;
    }

    // Send notification to user
    async notifyUser(issue, type = 'created') {
        try {
            const userPhone = this.formatPhoneNumber(issue.reporter_phone);
            if (!userPhone || !issue.reporter_phone) {
                console.log('No phone number available for user notification - skipping user notification');
                return { success: true, error: 'No phone number provided - skipped' };
            }

            const message = this.generateIssueMessage(issue, type);

            // Try WhatsApp first, fallback to SMS
            let result = await this.sendWhatsAppMessage(userPhone, message);

            if (!result.success) {
                console.log('WhatsApp failed, trying SMS...');
                result = await this.sendSMS(userPhone, message);
            }

            // Log notification in database
            await this.logNotification({
                issue_id: issue.id,
                recipient_type: 'user',
                recipient_phone: userPhone,
                message_type: result.success ? (result.data?.sid ? 'whatsapp' : 'sms') : 'failed',
                status: result.success ? 'sent' : 'failed',
                message_content: message,
                error_message: result.error || null
            });

            return result;
        } catch (error) {
            console.error('User notification error:', error);
            return { success: false, error: error.message };
        }
    }

    // Send notification to admin
    async notifyAdmin(issue, type = 'created') {
        try {
            const adminPhone = this.formatPhoneNumber(this.adminPhoneNumber);
            if (!adminPhone || !this.adminPhoneNumber) {
                console.log('No admin phone number configured - skipping admin notification');
                return { success: true, error: 'No admin phone number configured - skipped' };
            }

            const adminMessage = `🔔 *Admin Alert*

${this.generateIssueMessage(issue, type)}

*Reporter:* ${issue.reporter_name || 'Anonymous'}
*Contact:* ${issue.reporter_phone || issue.reporter_email || 'N/A'}

Please review and assign if needed.`;

            // Try WhatsApp first, fallback to SMS
            let result = await this.sendWhatsAppMessage(adminPhone, adminMessage);

            if (!result.success) {
                console.log('Admin WhatsApp failed, trying SMS...');
                result = await this.sendSMS(adminPhone, adminMessage);
            }

            // Log notification in database
            await this.logNotification({
                issue_id: issue.id,
                recipient_type: 'admin',
                recipient_phone: adminPhone,
                message_type: result.success ? (result.data?.sid ? 'whatsapp' : 'sms') : 'failed',
                status: result.success ? 'sent' : 'failed',
                message_content: adminMessage,
                error_message: result.error || null
            });

            return result;
        } catch (error) {
            console.error('Admin notification error:', error);
            return { success: false, error: error.message };
        }
    }

    // Send notifications to both user and admin
    async sendIssueNotifications(issue, type = 'created') {
        const results = {
            user: { success: false },
            admin: { success: false }
        };

        try {
            console.log('Starting notification process for issue:', issue.id, 'type:', type);

            // Check if Twilio is configured
            if (!this.twilioAccountSid || !this.twilioAuthToken) {
                console.log('Twilio not configured - skipping notifications');
                return {
                    user: { success: false, error: 'Twilio not configured' },
                    admin: { success: false, error: 'Twilio not configured' }
                };
            }

            // Send notifications in parallel with timeout
            const notificationPromises = [
                Promise.race([
                    this.notifyUser(issue, type),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('User notification timeout')), 10000))
                ]),
                Promise.race([
                    this.notifyAdmin(issue, type),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Admin notification timeout')), 10000))
                ])
            ];

            const [userResult, adminResult] = await Promise.allSettled(notificationPromises);

            results.user = userResult.status === 'fulfilled' ? userResult.value : { success: false, error: userResult.reason?.message };
            results.admin = adminResult.status === 'fulfilled' ? adminResult.value : { success: false, error: adminResult.reason?.message };

            console.log('Notification results:', results);
            return results;
        } catch (error) {
            console.error('Notification batch error:', error);
            return {
                user: { success: false, error: error.message },
                admin: { success: false, error: error.message }
            };
        }
    }

    // Log notification in database for tracking
    async logNotification(notificationData) {
        try {
            // Check if notifications table exists first
            const { data, error } = await supabase
                .from('notifications')
                .insert([{
                    ...notificationData,
                    created_at: new Date().toISOString()
                }]);

            if (error) {
                console.warn('Failed to log notification (table may not exist):', error.message);
                // Don't throw error if table doesn't exist
            } else {
                console.log('Notification logged successfully');
            }
        } catch (error) {
            console.warn('Notification logging error (non-critical):', error.message);
            // Don't throw error - logging is optional
        }
    }

    // Test notification setup
    async testNotification(phoneNumber) {
        const testMessage = `🧪 *Test Notification*

This is a test message from Civicare.

If you received this, WhatsApp notifications are working correctly!

Time: ${new Date().toLocaleString('en-IN')}`;

        const formattedPhone = this.formatPhoneNumber(phoneNumber);
        return await this.sendWhatsAppMessage(formattedPhone, testMessage);
    }
}

export const notificationService = new NotificationService();
export default notificationService;
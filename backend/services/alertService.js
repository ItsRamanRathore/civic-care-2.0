const Alert = require('../models/Alert');
const AuditLog = require('../models/AuditLog');

/**
 * Service to handle system alerts, notifications, and real-time socket updates
 */
class AlertService {
  /**
   * Create an alert and distribute it via real-time and persistent channels
   * @param {Object} alertData - { type, severity, message, category, ward, data }
   * @param {Object} io - Socket.io instance
   */
  static async notifyAdmins(alertData, io) {
    try {
      // 1. Persist to Database (Compliance Audit Trail)
      const alert = await Alert.create({
        ...alertData,
        is_resolved: false
      });

      // 2. Real-Time Distribution (WebSocket)
      if (io) {
        console.log(`📣 Sending Real-Time Alert: ${alert.type} - ${alert.severity}`);
        
        // Broadcast to general admin room
        io.to('admin_room').emit('new_alert', {
          id: alert._id,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          timestamp: alert.createdAt
        });

        // Broadcast to category-specific/ward-specific rooms if applicable
        if (alert.category) io.to(`category_${alert.category}`).emit('category_alert', alert);
        if (alert.ward) io.to(`ward_${alert.ward}`).emit('ward_alert', alert);
      }

      // 3. Multi-Channel Escalation (Placeholders)
      if (alert.severity === 'critical' || alert.severity === 'high') {
        await this.sendEmailNotification(alert);
        
        if (alert.severity === 'critical') {
          await this.sendSMSNotification(alert);
        }
      }

      return alert;
    } catch (error) {
      console.error('❌ Alert Notification Failed:', error);
      throw error;
    }
  }

  /**
   * Placeholder for Email Notification service integration
   */
  static async sendEmailNotification(alert) {
    // Logic for nodemailer or SendGrid would go here
    console.log(`📧 [EMAIL MOCK] Notifying admins of ${alert.severity} alert: ${alert.type}`);
  }

  /**
   * Placeholder for SMS Notification service integration (Twilio)
   */
  static async sendSMSNotification(alert) {
    // Logic for Twilio or AWS SNS would go here
    console.log(`📱 [SMS MOCK] URGENT: ${alert.type} in ${alert.ward || 'General'}`);
  }

  /**
   * Log an administrative action to the Audit Trail
   */
  static async logAdminAction(data) {
    try {
      await AuditLog.create(data);
    } catch (error) {
      console.error('❌ Audit Logging Failed:', error);
    }
  }
}

module.exports = AlertService;

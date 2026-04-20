const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@civiccare.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

class EmailService {
  /**
   * Generic mail sender (SendGrid focused currently)
   */
  static async send(to, subject, text, html, templateData = null) {
    if (!SENDGRID_API_KEY) {
      console.warn('⚠️ SENDGRID_API_KEY missing. Email suppressed.');
      return false;
    }

    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      text,
      html,
      // If using dynamic templates later
      templateId: templateData?.templateId,
      dynamicTemplateData: templateData?.data
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('❌ SendGrid Error:', error.response?.body || error.message);
      return false;
    }
  }

  /**
   * Status change alert for citizens
   */
  static async sendStatusUpdate(user, issue) {
    const subject = `Update on your reported issue: ${issue.title}`;
    const statusLabel = issue.status.replace('_', ' ').toUpperCase();
    
    const html = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563EB;">Civic Care Update</h2>
        <p>Hello ${user.full_name || 'Citizen'},</p>
        <p>The status of your reported issue "<strong>${issue.title}</strong>" has been updated to:</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 5px; font-weight: bold; text-align: center; margin: 20px 0;">
          ${statusLabel}
        </div>
        <p>Location: ${issue.address}</p>
        <a href="${process.env.FRONTEND_URL}/issue/${issue._id}" style="display: block; background: #2563EB; color: white; padding: 12px; text-align: center; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Report Details</a>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">This is an automated notification from Civic Care. Please do not reply directly to this email.</p>
      </div>
    `;

    return this.send(user.email, subject, `Your issue status is now ${statusLabel}`, html);
  }

  /**
   * Alert for Ward Officers on high-priority issues
   */
  static async sendAdminAlert(officer, issue) {
    const subject = `[URGENT] High Priority Issue in Your Ward`;
    const html = `
      <h3>Action Required: High Priority Issue</h3>
      <p>A new <strong>${issue.priority}</strong> priority issue has been reported in your jurisdiction.</p>
      <p>Category: ${issue.category}</p>
      <p>Description: ${issue.description}</p>
      <a href="${process.env.FRONTEND_URL}/admin/issue/${issue._id}">Open Admin Dashboard</a>
    `;
    return this.send(officer.email, subject, `Urgent: ${issue.title}`, html);
  }
}

module.exports = EmailService;

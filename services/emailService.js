const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

class EmailService {
  /**
   * Send a generic email
   */
  static async sendEmail(to, subject, text, html) {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API Key missing. Email not sent.');
      return;
    }

    const msg = {
      to,
      from: 'noreply@civiccare.org', // Use your verified sender here
      subject,
      text,
      html: html || text,
    };

    try {
      await sgMail.send(msg);
      console.log(`📧 Email sent to ${to}`);
    } catch (error) {
      console.error('SendGrid Error:', error.response?.body || error.message);
    }
  }

  /**
   * Send Verification Email
   */
  static async sendVerificationEmail(to, token) {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Welcome to Civic Care 2.0!</h2>
        <p>Please click the button below to verify your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
        <p>If you did not sign up for this account, you can ignore this email.</p>
      </div>
    `;

    await this.sendEmail(to, 'Verify Your Civic Care Account', 'Please verify your email.', html);
  }

  /**
   * Send Complaint Status Update
   */
  static async sendStatusUpdate(to, issueId, status, category) {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h3 style="color: #2563eb;">Complaint Status Update</h3>
        <p>Your report <strong>${issueId}</strong> (${category}) has been updated.</p>
        <div style="padding: 10px; background: #f8fafc; border-left: 4px solid #2563eb;">
          <strong>New Status:</strong> ${status.toUpperCase()}
        </div>
        <p style="margin-top: 20px; font-size: 0.9em; color: #666;">Thank you for contributing to a better city!</p>
      </div>
    `;
    
    await this.sendEmail(to, `Update on Complaint ${issueId}`, `Status: ${status}`, html);
  }
}

module.exports = EmailService;

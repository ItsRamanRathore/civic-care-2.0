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
   * Send Verification Email with OTP
   */
  static async sendVerificationEmail(to, otp) {
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; text-align: center; border: 1px solid #eee; border-radius: 12px; max-width: 500px; margin: auto;">
        <h2 style="color: #2563eb;">Verify Your Email</h2>
        <p>Please use the 6-digit code below to verify your email address on Civic Care 2.0.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; background: #f8fafc; border-radius: 8px; margin: 20px 0; color: #1e293b; border: 1px dashed #cbd5e1;">
          ${otp}
        </div>
        <p style="font-size: 0.85em; color: #64748b;">This code will expire in 15 minutes.</p>
      </div>
    `;

    await this.sendEmail(to, 'Your Civic Care Verification Code', `Your OTP is: ${otp}`, html);
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

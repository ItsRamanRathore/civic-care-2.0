# WhatsApp Setup Guide

## Complete WhatsApp Integration with Twilio

### Prerequisites
- Twilio account
- WhatsApp Business account (for production)
- Supabase project set up

### 1. Twilio Account Setup

#### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/
2. Sign up for a free account
3. Verify your phone number

#### Step 2: Get Account Credentials
1. Go to Twilio Console Dashboard
2. Note down:
   - Account SID
   - Auth Token

### 2. WhatsApp Sandbox Setup (Development)

#### Step 1: Enable WhatsApp Sandbox
1. In Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Follow the instructions to join the sandbox
3. Send the join code to the sandbox number
4. Note the sandbox WhatsApp number (e.g., `whatsapp:+14155238886`)

#### Step 2: Test WhatsApp Sandbox
1. Send a test message from the console
2. Verify you receive it on your WhatsApp

### 3. Environment Configuration

Add these variables to your `.env` file:

```env
# Twilio Configuration
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
VITE_TWILIO_PHONE_NUMBER=+1234567890
VITE_ADMIN_PHONE_NUMBER=+919876543210
```

### 4. Phone Number Format

#### Supported Formats:
- `+919876543210` (with country code)
- `919876543210` (will auto-add +)
- `9876543210` (will auto-add +91 for India)

#### Auto-formatting Logic:
The system automatically formats phone numbers:
- 10 digits → adds +91 (India)
- 12 digits starting with 91 → adds +
- Already has + → uses as-is

### 5. Message Templates

#### Issue Submission Confirmation:
```
🎉 Report Submitted Successfully!

Thank you for reporting this issue. Your report has been received and will be reviewed by our team.

📋 Issue: [Issue Title]
📍 Location: [Address]
🏷️ Category: INFRASTRUCTURE
⚡ Priority: MEDIUM
📅 Submitted: Monday, January 20, 2025

Reference ID: #A1B2C3D4

🔔 You'll receive updates on WhatsApp as we work on resolving this issue.

Thank you for helping improve our community! 🏙️
```

#### Admin Notification:
```
🔔 Admin Alert

🚨 New Issue Reported

📋 Issue: [Issue Title]
📍 Location: [Address]
🏷️ Category: INFRASTRUCTURE
⚡ Priority: MEDIUM
📅 Reported: [Date]

Reporter: [Name]
Contact: [Phone/Email]

Issue ID: [ID]

Please review and assign if needed.
```

### 6. Testing WhatsApp Integration

#### Test Script (Run in Browser Console):
```javascript
// Test WhatsApp notification
async function testWhatsApp() {
    const { notificationService } = await import('./src/services/notificationService.js');
    
    const result = await notificationService.testNotification('+919876543210');
    console.log('Test result:', result);
}

testWhatsApp();
```

#### Manual Testing:
1. Sign up with a valid phone number
2. Submit an issue report
3. Check WhatsApp for confirmation message
4. Check admin phone for admin notification

### 7. Production Setup

#### Step 1: WhatsApp Business Account
1. Apply for WhatsApp Business API access
2. Get approved WhatsApp Business number
3. Update environment variables with production number

#### Step 2: Message Templates
1. Create approved message templates in Twilio
2. Update notification service to use approved templates
3. Test thoroughly before going live

#### Step 3: Rate Limits
- Sandbox: 1 message per second
- Production: Higher limits based on your plan
- Implement proper rate limiting in your application

### 8. Troubleshooting

#### Common Issues:

**"Twilio not configured"**
- Check environment variables are set correctly
- Restart development server after adding variables

**"Invalid phone number"**
- Ensure phone number includes country code
- Check phone number format (+919876543210)

**"Message not received"**
- Verify you've joined the WhatsApp sandbox
- Check if phone number is correct
- Ensure WhatsApp is installed and working

**"Authentication failed"**
- Verify Account SID and Auth Token
- Check for typos in environment variables

#### Debug Steps:
1. Check browser console for error messages
2. Verify environment variables are loaded
3. Test with the debug script above
4. Check Twilio console for message logs

### 9. Cost Considerations

#### Sandbox (Free):
- Limited to pre-approved numbers
- Good for development and testing
- No cost for messages

#### Production:
- $0.005 per WhatsApp message (varies by region)
- Monthly phone number fees
- Consider message volume for budgeting

### 10. Security Best Practices

#### Environment Variables:
- Never commit `.env` file to version control
- Use different credentials for development/production
- Rotate credentials regularly

#### Phone Number Validation:
- Validate phone numbers before sending
- Implement rate limiting to prevent abuse
- Log all notification attempts for monitoring

### 11. Advanced Features

#### Message Status Tracking:
- Track delivery status
- Handle failed messages
- Implement retry logic

#### Rich Media:
- Send images with issue reports
- Location sharing
- Document attachments

#### Two-way Communication:
- Handle incoming WhatsApp messages
- Status update requests
- Feedback collection

### Support Resources

- Twilio Documentation: https://www.twilio.com/docs/whatsapp
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- Twilio Console: https://console.twilio.com/
import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { notificationService } from '../../../services/notificationService';

const NotificationSettings = () => {
  const [testPhone, setTestPhone] = useState(import.meta.env.VITE_ADMIN_PHONE_NUMBER || '');
  const [isTestingSMS, setIsTestingSMS] = useState(false);
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const handleTestWhatsApp = async () => {
    if (!testPhone.trim()) {
      npm
      alert('Please enter a phone number in the input field above');
      return;
    }

    setIsTestingWhatsApp(true);
    setTestResults(null);

    try {
      const result = await notificationService.testNotification(testPhone);
      setTestResults({
        type: 'whatsapp',
        success: result.success,
        message: result.success ? 'WhatsApp test message sent successfully!' : result.error
      });
    } catch (error) {
      setTestResults({
        type: 'whatsapp',
        success: false,
        message: error.message
      });
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  const handleTestSMS = async () => {
    if (!testPhone.trim()) {
      alert('Please enter a phone number in the input field above');
      return;
    }

    setIsTestingSMS(true);
    setTestResults(null);

    try {
      const testMessage = `🧪 SMS Test from Civicare

This is a test SMS message.

If you received this, SMS notifications are working correctly!

Time: ${new Date().toLocaleString('en-IN')}`;

      const result = await notificationService.sendSMS(
        notificationService.formatPhoneNumber(testPhone),
        testMessage
      );

      setTestResults({
        type: 'sms',
        success: result.success,
        message: result.success ? 'SMS test message sent successfully!' : result.error
      });
    } catch (error) {
      setTestResults({
        type: 'sms',
        success: false,
        message: error.message
      });
    } finally {
      setIsTestingSMS(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Icon name="MessageCircle" size={20} color="white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Notification Settings</h3>
          <p className="text-sm text-muted-foreground">
            Test and configure WhatsApp/SMS notifications
          </p>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Settings" size={16} className="text-primary" />
            <span className="text-sm font-medium">Twilio Configuration</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Account SID:</span>
              <span className={import.meta.env.VITE_TWILIO_ACCOUNT_SID ? 'text-green-600' : 'text-red-600'}>
                {import.meta.env.VITE_TWILIO_ACCOUNT_SID ? '✓ Configured' : '✗ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auth Token:</span>
              <span className={import.meta.env.VITE_TWILIO_AUTH_TOKEN ? 'text-green-600' : 'text-red-600'}>
                {import.meta.env.VITE_TWILIO_AUTH_TOKEN ? '✓ Configured' : '✗ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>WhatsApp Number:</span>
              <span className={import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER ? 'text-green-600' : 'text-red-600'}>
                {import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER ? '✓ Configured' : '✗ Missing'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Phone" size={16} className="text-primary" />
            <span className="text-sm font-medium">Admin Contact</span>
          </div>
          <div className="text-xs">
            <div className="flex justify-between">
              <span>Admin Phone:</span>
              <span className={import.meta.env.VITE_ADMIN_PHONE_NUMBER ? 'text-green-600' : 'text-red-600'}>
                {import.meta.env.VITE_ADMIN_PHONE_NUMBER ? '✓ Configured' : '✗ Missing'}
              </span>
            </div>
            {import.meta.env.VITE_ADMIN_PHONE_NUMBER && (
              <div className="mt-1 text-muted-foreground">
                {import.meta.env.VITE_ADMIN_PHONE_NUMBER}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-text-primary">Test Notifications</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Test Phone Number
            </label>
            <Input
              type="tel"
              placeholder="Enter phone number (e.g., +91xxxxxxxxxx)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the phone number you want to test notifications with
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={handleTestWhatsApp}
              loading={isTestingWhatsApp}
              disabled={isTestingWhatsApp || isTestingSMS}
              iconName="MessageCircle"
              iconPosition="left"
              variant="outline"
            >
              Test WhatsApp
            </Button>
            <Button
              onClick={handleTestSMS}
              loading={isTestingSMS}
              disabled={isTestingWhatsApp || isTestingSMS}
              iconName="Phone"
              iconPosition="left"
              variant="outline"
            >
              Test SMS
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className={`p-4 rounded-lg border ${testResults.success
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
            }`}>
            <div className="flex items-center space-x-2">
              <Icon
                name={testResults.success ? 'CheckCircle' : 'AlertCircle'}
                size={16}
              />
              <span className="text-sm font-medium">
                {testResults.type === 'whatsapp' ? 'WhatsApp' : 'SMS'} Test Result
              </span>
            </div>
            <p className="text-sm mt-1">{testResults.message}</p>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-2">Setup Instructions:</p>
              <ol className="text-blue-700 space-y-1 text-xs list-decimal list-inside">
                <li>Get your Twilio Account SID and Auth Token from Twilio Console</li>
                <li>Enable WhatsApp Sandbox in Twilio Console</li>
                <li>Add the Twilio credentials to your .env file</li>
                <li>Set your admin phone number for notifications</li>
                <li>Test the configuration using the buttons above</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
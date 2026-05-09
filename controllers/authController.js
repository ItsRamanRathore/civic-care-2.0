const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate Access Token (Short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '15m' }
  );
};

// Generate Refresh Token (Long-lived)
const generateRefreshToken = async (user, ipAddress) => {
  const token = crypto.randomBytes(40).toString('hex');
  const refreshToken = await RefreshToken.create({
    user: user._id,
    token: token,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdByIp: ipAddress
  });
  return refreshToken;
};

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const AlertService = require('../services/alertService');

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, role, phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate Verification Token for Email
    const emailToken = crypto.randomBytes(32).toString('hex');
    const emailExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      email,
      password,
      full_name,
      phone,
      role: role || 'citizen',
      email_verified: false,
      phone_verified: false,
      verification_meta: {
        email_token: emailToken,
        email_expires: emailExpires
      }
    });

    // Send Verification Email
    const EmailService = require('../services/emailService');
    await EmailService.sendVerificationEmail(email, emailToken);

    // Send Phone Verification (OTP)
    const TwilioService = require('../services/twilioService');
    await TwilioService.sendOTP(phone, 'sms');

    // Audit Log
    await AlertService.logAdminAction({
      user_id: user._id,
      action: 'USER_REGISTER_PENDING_VERIFY',
      resource: 'User',
      resource_id: user._id,
      ip_address: req.ip,
      status: 'success'
    });

    res.status(201).json({
      status: 'success',
      message: 'Account created. Please verify your email and phone number.',
      data: { 
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          email_verified: false,
          phone_verified: false
        }
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.sendPhoneVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.phone_verified) return res.status(400).json({ message: 'Phone already verified' });

    const TwilioService = require('../services/twilioService');
    await TwilioService.sendOTP(user.phone, 'sms');

    res.status(200).json({ status: 'success', message: 'OTP sent successfully' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.verifyPhone = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    const TwilioService = require('../services/twilioService');
    const isApproved = await TwilioService.checkOTP(user.phone, code);

    if (!isApproved) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.phone_verified = true;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Phone verified successfully' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({
      'verification_meta.email_token': token,
      'verification_meta.email_expires': { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.email_verified = true;
    user.verification_meta.email_token = undefined;
    user.verification_meta.email_expires = undefined;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Email verified successfully' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Block unverified users
    if (!user.email_verified || !user.phone_verified) {
      return res.status(403).json({ 
        status: 'verification_required',
        message: 'Please verify your email and phone number to access your account.',
        data: {
          email_verified: user.email_verified,
          phone_verified: user.phone_verified
        }
      });
    }

    // Check for MFA
    if (user.mfa_enabled) {
      return res.status(200).json({
        status: 'mfa_required',
        message: 'Multi-factor authentication required',
        mfa_token: jwt.sign({ id: user._id, type: 'mfa_verification' }, process.env.JWT_SECRET, { expiresIn: '5m' })
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user, req.ip);

    // Audit Log
    await AlertService.logAdminAction({
      user_id: user._id,
      action: 'USER_LOGIN',
      resource: 'Auth',
      ip_address: req.ip,
      status: 'success'
    });

    res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken: refreshToken.token,
      data: { user },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// MFA Setup: Step 1 - Generate Secret & QR
exports.setupMFA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.mfa_enabled) return res.status(400).json({ message: 'MFA already enabled' });

    const secret = speakeasy.generateSecret({ name: `Civic Care (${user.email})` });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    user.mfa_secret = secret.base32;
    await user.save();

    res.status(200).json({ status: 'success', qrCodeUrl, secret });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// MFA Setup: Step 2 - Verify & Enable
exports.verifyMFA = async (req, res) => {
  try {
    const { token, mfa_token } = req.body;
    let userId = req.user?.id;

    // Support both setup flow (req.user) and login flow (mfa_token)
    if (mfa_token) {
      const decoded = jwt.verify(mfa_token, process.env.JWT_SECRET);
      if (decoded.type !== 'mfa_verification') throw new Error('Invalid MFA token');
      userId = decoded.id;
    }

    const user = await User.findById(userId).select('+mfa_secret');
    const isValid = speakeasy.totp.verify({ 
      secret: user.mfa_secret, 
      encoding: 'base32',
      token 
    });

    if (!isValid) return res.status(400).json({ message: 'Invalid TOTP token' });

    if (!user.mfa_enabled) {
      user.mfa_enabled = true;
      await user.save();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user, req.ip);

    await AlertService.logAdminAction({
      user_id: user._id,
      action: 'MFA_VERIFY',
      resource: 'Auth',
      ip_address: req.ip,
      status: 'success'
    });

    res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken: refreshToken.token,
      data: { user }
    });
  } catch (err) {
    res.status(401).json({ status: 'fail', message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Refresh token is required' });

    const refreshToken = await RefreshToken.findOne({ token }).populate('user');
    if (!refreshToken || !refreshToken.isActive) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Replace old refresh token with a new one (Rotation)
    const newRefreshToken = await generateRefreshToken(refreshToken.user, req.ip);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = req.ip;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();

    // Generate new access token
    const accessToken = generateAccessToken(refreshToken.user);

    res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken: newRefreshToken.token
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.revokeToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const refreshToken = await RefreshToken.findOne({ token });
    if (!refreshToken) return res.status(404).json({ message: 'Token not found' });

    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = req.ip;
    await refreshToken.save();

    res.status(200).json({ status: 'success', message: 'Token revoked' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { notification_preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notification_preferences },
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

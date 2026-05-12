const request = require('supertest');
const app = require('../../api/index');
const User = require('../../models/User');
const AlertService = require('../../services/alertService');

// Mock AlertService
jest.mock('../../services/alertService', () => ({
  logAdminAction: jest.fn().mockResolvedValue(true)
}));

describe('Auth Controller Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          full_name: 'New User'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toEqual('newuser@example.com');
      
      const user = await User.findOne({ email: 'newuser@example.com' });
      expect(user).toBeDefined();
    });

    it('should fail if user already exists', async () => {
      await User.create({
        email: 'existing@example.com',
        password: 'password123',
        full_name: 'Existing User'
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          full_name: 'Another User'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('User already exists');
    });

    it('should fail if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'not-an-email',
          password: 'password123',
          full_name: 'Invalid User'
        });

      expect(res.statusCode).toEqual(422);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        email: 'login@example.com',
        password: 'password123',
        full_name: 'Login User'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Incorrect email or password');
    });
  });

  describe('GET /api/auth/getMe', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await User.create({
        email: 'me@example.com',
        password: 'password123',
        full_name: 'Me User'
      });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'me@example.com',
          password: 'password123'
        });
      token = res.body.accessToken;
    });

    it('should return user profile when authenticated', async () => {
      // Note: We need a middleware that handles auth and sets req.user
      // In the app, it's likely handled by a passport or custom middleware
      // Looking at authRoutes.js might help
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // If auth middleware is working, it should return 200
      // If not yet implemented or misconfigured in tests, it might fail
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.user.email).toEqual('me@example.com');
    });
  });

  describe('MFA Flow', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await User.create({
        email: 'mfa@example.com',
        password: 'password123',
        full_name: 'MFA User'
      });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'mfa@example.com',
          password: 'password123'
        });
      token = res.body.accessToken;
    });

    it('should setup MFA successfully', async () => {
      const res = await request(app)
        .post('/api/auth/mfa/setup')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.qrCodeUrl).toBeDefined();
      expect(res.body.secret).toBeDefined();
      
      const updatedUser = await User.findOne({ email: 'mfa@example.com' });
      expect(updatedUser.mfa_secret).toBeDefined();
    });

    it('should verify MFA successfully', async () => {
      // Setup first
      const setupRes = await request(app)
        .post('/api/auth/mfa/setup')
        .set('Authorization', `Bearer ${token}`);
      
      const secret = setupRes.body.secret.base32;
      
      // Generate a TOTP token (we might need speakeasy for this in tests too)
      const speakeasy = require('speakeasy');
      const totpToken = speakeasy.totp({
        secret: secret,
        encoding: 'base32'
      });

      const res = await request(app)
        .post('/api/auth/mfa/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: totpToken });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.accessToken).toBeDefined();
      
      const updatedUser = await User.findOne({ email: 'mfa@example.com' });
      expect(updatedUser.mfa_enabled).toBe(true);
    });
  });
});

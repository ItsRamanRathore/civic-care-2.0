const mongoose = require('mongoose');
const User = require('../../../models/User');

describe('User Model Unit Tests', () => {
  it('should hash the password before saving', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User'
    };
    const user = await User.create(userData);
    
    expect(user.password).not.toBe(userData.password);
    expect(user.password).toHaveLength(60); // bcrypt hash length
  });

  it('should correctly compare password', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User'
    };
    const user = await User.create(userData);
    
    const isMatch = await user.comparePassword('password123');
    const isNotMatch = await user.comparePassword('wrongpassword');
    
    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });

  it('should fail if email is missing', async () => {
    const userData = {
      password: 'password123',
      full_name: 'Test User'
    };
    
    try {
      await User.create(userData);
    } catch (error) {
      expect(error.errors.email).toBeDefined();
    }
  });

  it('should fail if password is too short', async () => {
    const userData = {
      email: 'test@example.com',
      password: '123',
      full_name: 'Test User'
    };
    
    try {
      await User.create(userData);
    } catch (error) {
      expect(error.errors.password).toBeDefined();
    }
  });
});

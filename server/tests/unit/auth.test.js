import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import { createTestUser, extractCookie } from '../utils/testHelpers.js';

describe('Authentication Endpoints', () => {
  let testUser;

  beforeEach(async () => {
    await global.cleanupTestUsers();
    testUser = createTestUser();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('created successfully');
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await request(app).post('/api/auth/signup').send(testUser);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email already registered');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create user for login tests
      await request(app).post('/api/auth/signup').send(testUser);
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('success');
      
      const cookie = extractCookie(response);
      expect(cookie).toBeTruthy();
      expect(cookie).toContain('token=');
    });

    it('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.example.com',
          password: 'password123'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout');
    });
  });
});

import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import { createTestUser, createUserAndLogin } from '../utils/testHelpers.js';

describe('Settings Endpoints', () => {
  let testUser;
  let cookie;

  beforeEach(async () => {
    await global.cleanupTestUsers();
    testUser = createTestUser();
    const result = await createUserAndLogin(request, app, testUser);
    cookie = result.cookie;
  });

  describe('PUT /api/settings/profile', () => {
    it('should update user profile', async () => {
      const timestamp = Date.now();
      const newName = `UpdatedName_${timestamp}`;
      const newEmail = `updated_${timestamp}@test.example.com`;
      const response = await request(app)
        .put('/api/settings/profile')
        .set('Cookie', cookie)
        .send({
          name: newName,
          email: newEmail
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe(newName);
      expect(response.body.user.email).toBe(newEmail);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .put('/api/settings/profile')
        .send({
          name: 'Updated Name',
          email: 'updated@test.example.com'
        });

      expect(response.status).toBe(401);
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .put('/api/settings/profile')
        .set('Cookie', cookie)
        .send({
          name: 'Updated Name',
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/settings/password', () => {
    it('should change password successfully', async () => {
      const response = await request(app)
        .put('/api/settings/password')
        .set('Cookie', cookie)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('changed successfully');
    });

    it('should reject incorrect current password', async () => {
      const response = await request(app)
        .put('/api/settings/password')
        .set('Cookie', cookie)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .put('/api/settings/password')
        .send({
          currentPassword: 'password123',
          newPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/settings/account', () => {
    it('should delete account successfully', async () => {
      const response = await request(app)
        .delete('/api/settings/account')
        .set('Cookie', cookie)
        .send({
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should reject incorrect password', async () => {
      const response = await request(app)
        .delete('/api/settings/account')
        .set('Cookie', cookie)
        .send({
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .delete('/api/settings/account')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(401);
    });
  });
});

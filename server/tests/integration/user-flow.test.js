import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import { createTestUser, extractCookie } from '../utils/testHelpers.js';

describe('Complete User Flow Integration', () => {
  let testUser;

  beforeEach(async () => {
    await global.cleanupTestUsers();
    testUser = createTestUser();
  });

  it('should complete full user lifecycle', async () => {
    // 1. Signup
    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(signupResponse.status).toBe(200);
    expect(signupResponse.body.success).toBe(true);

    // Wait for user creation
    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);

    const cookie = extractCookie(loginResponse);
    expect(cookie).toBeTruthy();

    // 3. Access protected route (get notes)
    const notesResponse = await request(app)
      .get('/api/notes/')
      .set('Cookie', cookie);

    expect(notesResponse.status).toBe(200);
    expect(notesResponse.body.success).toBe(true);
    expect(Array.isArray(notesResponse.body.notes)).toBe(true);

    // 4. Update profile
    const timestamp = Date.now();
    const newName = `UpdatedName_${timestamp}`;
    const newEmail = `updated_${timestamp}@test.example.com`;
    const profileResponse = await request(app)
      .put('/api/settings/profile')
      .set('Cookie', cookie)
      .send({
        name: newName,
        email: newEmail
      });

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.success).toBe(true);
    expect(profileResponse.body.user.name).toBe(newName);

    // 5. Change password
    const passwordResponse = await request(app)
      .put('/api/settings/password')
      .set('Cookie', cookie)
      .send({
        currentPassword: testUser.password,
        newPassword: 'NewPassword123!'
      });

    expect(passwordResponse.status).toBe(200);
    expect(passwordResponse.body.success).toBe(true);

    // 6. Logout
    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.success).toBe(true);

    // 7. Verify cannot access protected route after logout
    const unauthorizedResponse = await request(app)
      .get('/api/notes/');

    expect(unauthorizedResponse.status).toBe(401);
  });
});

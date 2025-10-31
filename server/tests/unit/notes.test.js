import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import { createTestUser, createUserAndLogin } from '../utils/testHelpers.js';

describe('Notes Endpoints', () => {
  let testUser;
  let cookie;

  beforeEach(async () => {
    await global.cleanupTestUsers();
    testUser = createTestUser();
    const result = await createUserAndLogin(request, app, testUser);
    cookie = result.cookie;
  });

  describe('GET /api/notes/', () => {
    it('should fetch all user notes', async () => {
      const response = await request(app)
        .get('/api/notes/')
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.notes)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/notes/');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/notes/upload', () => {
    it('should reject upload without authentication', async () => {
      const response = await request(app)
        .post('/api/notes/upload')
        .attach('file', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(401);
    });

    it('should reject upload without file', async () => {
      const response = await request(app)
        .post('/api/notes/upload')
        .set('Cookie', cookie);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No file');
    });

    it('should reject invalid file type', async () => {
      const response = await request(app)
        .post('/api/notes/upload')
        .set('Cookie', cookie)
        .attach('file', Buffer.from('test'), 'test.txt');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid file type');
    });
  });
});

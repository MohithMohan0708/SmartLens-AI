import jwt from 'jsonwebtoken';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

// Use test database
const testDbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const sql = postgres(testDbUrl);

let userCounter = 0;

// Generate unique test user with UUID-like uniqueness
export const createTestUser = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000000);
  const processId = process.pid || 0;
  userCounter++;
  const uniqueId = `${timestamp}_${random}_${processId}_${userCounter}`;
  return {
    name: `TestUser_${uniqueId}`,
    email: `test_${uniqueId}@test.example.com`,
    password: 'TestPass123!'
  };
};

// Extract cookie from response
export const extractCookie = (response) => {
  const cookies = response.headers['set-cookie'];
  if (!cookies) return '';
  return Array.isArray(cookies) ? cookies[0] : cookies;
};

// Wait for user in database
const waitForUser = async (email, maxAttempts = 8) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const users = await sql`SELECT id FROM users WHERE email = ${email}`;
      if (users && users.length > 0) return true;
    } catch (error) {
      // Retry on error
    }
    // Progressive delays: 100, 200, 300, 500, 700, 1000, 1500, 2000ms
    const delay = i < 3 ? (i + 1) * 100 : i < 5 ? (i + 1) * 200 : (i - 3) * 500;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return false;
};

// Create user and login
export const createUserAndLogin = async (request, app, testUser) => {
  // Signup
  const signupResponse = await request(app)
    .post('/api/auth/signup')
    .send(testUser);

  if (signupResponse.status !== 200 || !signupResponse.body.success) {
    throw new Error(`Signup failed: ${JSON.stringify(signupResponse.body)}`);
  }

  // Wait for user in database
  const userExists = await waitForUser(testUser.email);
  if (!userExists) {
    throw new Error(`User not found in database after signup`);
  }

  // Login
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: testUser.email,
      password: testUser.password
    });

  if (loginResponse.status !== 200 || !loginResponse.body.success) {
    throw new Error(`Login failed: ${JSON.stringify(loginResponse.body)}`);
  }

  const cookie = extractCookie(loginResponse);
  return { cookie, loginResponse };
};

export const createTestToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_KEY || 'test-jwt-secret',
    { expiresIn: '1h' }
  );
};

export const mockFile = {
  fieldname: 'file',
  originalname: 'test-note.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('fake-image-data'),
  size: 1024
};

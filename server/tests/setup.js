import { jest } from '@jest/globals';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

// Test configuration
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'test-jwt-secret';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key';

// Use dedicated test database
const testDbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const sql = postgres(testDbUrl, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10
});

// Suppress console noise
global.console = {
  ...console,
  log: () => {},
  warn: () => {},
  error: console.error,
};

jest.setTimeout(30000);

// Cleanup test data
global.cleanupTestUsers = async () => {
  try {
    await sql`DELETE FROM notes WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.example.com' OR name LIKE 'TestUser_%')`;
    await sql`DELETE FROM users WHERE email LIKE '%@test.example.com' OR name LIKE 'TestUser_%'`;
  } catch (error) {
    // Silently ignore cleanup errors
  }
};

global.beforeAll(async () => {
  await global.cleanupTestUsers();
});

global.afterEach(async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
});

global.afterAll(async () => {
  await global.cleanupTestUsers();
  await sql.end({ timeout: 5 });
  // Force exit to prevent hanging
  await new Promise(resolve => setTimeout(resolve, 500));
});

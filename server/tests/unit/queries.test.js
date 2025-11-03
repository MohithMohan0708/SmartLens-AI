import { describe, it, expect, beforeEach } from '@jest/globals';
import { queries } from '../../db/queries.js';
import { createTestUser } from '../utils/testHelpers.js';
import bcrypt from 'bcrypt';

describe('Database Queries', () => {
  let testUser;

  beforeEach(async () => {
    await global.cleanupTestUsers();
    testUser = createTestUser();
  });

  describe('User Operations', () => {
    it('should create a new user', async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const result = await queries.createUser(
        testUser.name,
        testUser.email,
        hashedPassword
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('User created successfully');
    });

    it('should get user by email', async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await queries.createUser(testUser.name, testUser.email, hashedPassword);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = await queries.getUserCredentials(testUser.email);

      expect(result).toBeDefined();
      expect(result.email).toBe(testUser.email);
      expect(result.name).toBe(testUser.name);
    });

    it('should get user by ID', async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await queries.createUser(testUser.name, testUser.email, hashedPassword);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      const createdUser = await queries.getUserCredentials(testUser.email);
      const result = await queries.getUserById(createdUser.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdUser.id);
      expect(result.email).toBe(testUser.email);
    });

    it('should update user profile', async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await queries.createUser(testUser.name, testUser.email, hashedPassword);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      const createdUser = await queries.getUserCredentials(testUser.email);
      const timestamp = Date.now();
      const newEmail = `updated_${timestamp}@test.example.com`;
      const newName = `UpdatedUser_${timestamp}`;
      
      const result = await queries.updateUserProfile(
        createdUser.id,
        newName,
        newEmail
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(newName);
      expect(result.email).toBe(newEmail);
    });

    it('should update user password', async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await queries.createUser(testUser.name, testUser.email, hashedPassword);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      const createdUser = await queries.getUserCredentials(testUser.email);
      const newHashedPassword = await bcrypt.hash('newpassword', 10);
      
      const result = await queries.updateUserPassword(createdUser.id, newHashedPassword);

      expect(result).toBe(true);
    });

    it('should delete user', async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await queries.createUser(testUser.name, testUser.email, hashedPassword);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      const createdUser = await queries.getUserCredentials(testUser.email);
      const result = await queries.deleteUser(createdUser.id);

      expect(result).toBe(true);

      const deletedUser = await queries.getUserById(createdUser.id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate email', async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      
      const firstResult = await queries.createUser(
        testUser.name,
        testUser.email,
        hashedPassword
      );
      expect(firstResult.success).toBe(true);

      const secondResult = await queries.createUser(
        'Another Name',
        testUser.email,
        hashedPassword
      );
      expect(secondResult.success).toBe(false);
      expect(secondResult.message).toContain('Email already registered');
    });

    it('should return null for non-existent user', async () => {
      const result = await queries.getUserById(99999);
      expect(result).toBeNull();
    });

    it('should return null for non-existent email', async () => {
      const result = await queries.getUserCredentials('nonexistent@test.example.com');
      expect(result).toBeNull();
    });
  });
});

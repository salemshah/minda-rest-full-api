// Updated auth.test.ts

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../jest.setup';

const prisma = new PrismaClient();

describe('Authentication Endpoints', () => {
  // for registration
  const parentData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'parent@example.com',
    password: 'parentPass123',
  };

  beforeAll(async () => {
    // Clean up the database before running tests
    await prisma.child.deleteMany();
    await prisma.parent.deleteMany();
  });

  afterEach(async () => {
    // Clean up the database after each test
    await prisma.child.deleteMany();
    await prisma.parent.deleteMany();
  });

  describe('POST /api/auth/parent-register', () => {
    it('should register a new parent successfully', async () => {
      const res = await request(app)
        .post('/api/auth/parent-register')
        .send(parentData);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message');
    });

    it('should not register a parent with an existing email', async () => {
      // First registration
      await request(app).post('/api/auth/parent-register').send(parentData);

      // Attempt to register again with the same email
      const res = await request(app)
        .post('/api/auth/parent-register')
        .send(parentData);
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 409);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid input data', async () => {
      const res = await request(app).post('/api/auth/parent-register').send({
        firstName: '',
        lastName: 'Doe',
        email: 'invalidemail',
        password: '123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // Validate the specific validation errors if validation middleware provides detailed errors
    });
  });

  describe('POST /api/auth/parent-login', () => {
    beforeEach(async () => {
      // Register and verify a parent for login tests
      await request(app).post('/api/auth/parent-register').send(parentData);

      await prisma.parent.update({
        where: { email: parentData.email },
        data: {
          isVerified: true,
          status: true,
        },
      });
    });

    it('should login a parent successfully', async () => {
      const res = await request(app).post('/api/auth/parent-login').send({
        email: parentData.email,
        password: parentData.password,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('parent');
      expect(res.body.parent).toHaveProperty('email', parentData.email);
      expect(res.body.parent).not.toHaveProperty('password');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app).post('/api/auth/parent-login').send({
        email: parentData.email,
        password: 'WrongPassword',
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not login with incorrect email', async () => {
      const res = await request(app).post('/api/auth/parent-login').send({
        email: 'nonexistent@example.com',
        password: parentData.password,
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not login unverified parent', async () => {
      // Unverify the parent
      await prisma.parent.update({
        where: { email: parentData.email },
        data: {
          isVerified: false,
        },
      });

      const res = await request(app).post('/api/auth/parent-login').send({
        email: parentData.email,
        password: parentData.password,
      });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 403);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not login deactivated parent', async () => {
      // Deactivate the parent
      await prisma.parent.update({
        where: { email: parentData.email },
        data: {
          status: false,
        },
      });

      const res = await request(app).post('/api/auth/parent-login').send({
        email: parentData.email,
        password: parentData.password,
      });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 403);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid input data', async () => {
      const res = await request(app).post('/api/auth/parent-login').send({
        email: 'invalidemail',
        password: '123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toContain('Invalid email address');
      expect(res.body.errors).toContain(
        'Password must be at least 6 characters long'
      );
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login a parent to obtain refreshToken
      await request(app).post('/api/auth/parent-register').send(parentData);

      await prisma.parent.update({
        where: { email: parentData.email },
        data: {
          isVerified: true,
          status: true,
        },
      });

      const res = await request(app).post('/api/auth/parent-login').send({
        email: parentData.email,
        password: parentData.password,
      });

      refreshToken = res.body.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty(
        'message',
        'Token refreshed successfully'
      );
    });

    it('should not refresh tokens with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalidtoken' });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty(
        'message',
        'Invalid or expired refresh token'
      );
      expect(res.body).toHaveProperty('statusCode', 403);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for missing refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh-token').send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
    });
  });
});

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../jest.setup';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Child Endpoints', () => {
  // Test data for parent and child
  const parentData = {
    firstName: 'Salem',
    lastName: 'Shah',
    email: 'parent2@example.com',
    password: 'parentPass456',
  };

  const childData = {
    birthDate: '2010-05-15T00:00:00.000Z',
    firstName: 'Alice',
    lastName: 'Shah',
    username: 'alice_alice',
    password: 'childPass123',
    email: 'alice@example.com',
    status: true,
    profilePictureUrl: 'http://example.com/old-pic.jpg',
  };

  beforeAll(async () => {
    // Clean up the database before running tests
    await prisma.child.deleteMany();
    await prisma.parent.deleteMany();

    // Register the parent
    await request(app).post('/api/auth/parent-register').send(parentData);

    // Verify the parent
    await prisma.parent.update({
      where: { email: parentData.email },
      data: { isVerified: true, status: true },
    });
  });

  afterEach(async () => {
    // Clean up children after each test
    await prisma.child.deleteMany();
    jest.clearAllMocks(); // Clear mock history
  });

  afterAll(async () => {
    // Clean up and disconnect Prisma
    await prisma.child.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.$disconnect();
  });

  /**
   * Helper function to create a child in the database
   */
  const createChild = async () => {
    const hashedPassword = await bcrypt.hash(childData.password, 10);
    return prisma.child.create({
      data: {
        firstName: childData.firstName,
        lastName: childData.lastName,
        username: childData.username,
        password: hashedPassword,
        birthDate: new Date('2011-05-15T00:00:00.000Z'),
        status: childData.status,
        profilePictureUrl: childData.profilePictureUrl,
        gender: 'Male',
        schoolLevel: 'Grade 5',
        parent: { connect: { email: parentData.email } },
      },
    });
  };

  /**
   * Helper function to login a child and retrieve tokens
   */
  const loginChild = async () => {
    const res = await request(app).post('/api/child/login').send({
      username: childData.username,
      password: childData.password,
    });
    return res.body;
  };

  describe('POST /api/child/login', () => {
    beforeEach(async () => {
      // Create a child for login tests
      await createChild();
    });

    it('should login a child successfully', async () => {
      const res = await request(app).post('/api/child/login').send({
        username: childData.username,
        password: childData.password,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('child');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.child).toHaveProperty('username', childData.username);
      expect(res.body.child).not.toHaveProperty('password');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app).post('/api/child/login').send({
        username: childData.username,
        password: 'WrongPassword',
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not login with non-existent username', async () => {
      const res = await request(app).post('/api/child/login').send({
        username: 'nonexistent',
        password: childData.password,
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not login a deactivated child account', async () => {
      // Deactivate the child
      await prisma.child.update({
        where: { username: childData.username },
        data: { status: false },
      });

      const res = await request(app).post('/api/child/login').send({
        username: childData.username,
        password: childData.password,
      });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 403);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for missing username or password', async () => {
      const res = await request(app).post('/api/child/login').send({
        username: '',
        password: '',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // Further validation can be added based on validation middleware
    });
  });

  describe('POST /api/child/forgot-password', () => {
    beforeEach(async () => {
      // Create a child with a parent
      await createChild();
    });

    it('should send password reset email to parent successfully', async () => {
      const res = await request(app).post('/api/child/forgot-password').send({
        username: childData.username,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should not send password reset email if child does not exist', async () => {
      const res = await request(app).post('/api/child/forgot-password').send({
        username: 'nonexistent',
      });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 404);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for missing username', async () => {
      const res = await request(app).post('/api/child/forgot-password').send({
        username: '',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // Further validation can be added based on validation middleware
    });
  });

  describe('GET /api/child/profile', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create and login a child to get accessToken
      await createChild();

      const loginRes = await loginChild();
      accessToken = loginRes.accessToken;
    });

    it('should retrieve child profile successfully', async () => {
      const res = await request(app)
        .get('/api/child/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('child');
      expect(res.body.child).toHaveProperty('username', childData.username);
      expect(res.body.child).not.toHaveProperty('password');
    });

    it('should not retrieve profile without authorization', async () => {
      const res = await request(app).get('/api/child/profile');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
      // Further validation based on auth middleware response
    });

    it('should return 404 if child not found', async () => {
      // Delete the child
      await prisma.child.deleteMany();

      const res = await request(app)
        .get('/api/child/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 404);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/child/profile-picture', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create and login a child to get accessToken
      await createChild();

      const loginRes = await loginChild();
      accessToken = loginRes.accessToken;
    });

    it('should update profile picture successfully', async () => {
      const newProfilePictureUrl = 'http://example.com/new-pic.jpg';
      const res = await request(app)
        .put('/api/child/profile-picture')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ profilePictureUrl: newProfilePictureUrl });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('child');
      expect(res.body.child).toHaveProperty(
        'profilePictureUrl',
        newProfilePictureUrl
      );
    });

    it('should not update profile picture without authorization', async () => {
      const res = await request(app)
        .put('/api/child/profile-picture')
        .send({ profilePictureUrl: 'http://example.com/new-pic.jpg' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
      // Further validation based on auth middleware response
    });

    it('should not update profile picture with invalid URL', async () => {
      const res = await request(app)
        .put('/api/child/profile-picture')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ profilePictureUrl: 'invalid-url' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // Further validation can be added based on validation middleware
    });

    it('should return 404 if child not found', async () => {
      // Delete the child
      await prisma.child.deleteMany();

      const res = await request(app)
        .put('/api/child/profile-picture')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ profilePictureUrl: 'http://example.com/new-pic.jpg' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 404);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for missing profilePictureUrl', async () => {
      const res = await request(app)
        .put('/api/child/profile-picture')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
  });
});

import request from 'supertest';
import { app } from '../jest.setup';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Parent Endpoints', () => {
  const newEmail = 'salem.jam@example.com';
  const parentData = {
    firstName: 'Salem',
    lastName: 'Shah',
    email: 'salem@example.com',
    password: '123456',
  };

  let accessToken: string;
  let parentId: number;

  const childData = {
    username: 'child_user', // same username as previous test
    password: '123456',
    birthDate: '2010-05-15T00:00:00.000Z',
    firstName: 'Ahmad',
    lastName: 'Rhamani',
    gender: 'Male',
    schoolLevel: 'Grade 5',
    parentEmail: parentData.email,
  };

  beforeAll(async () => {
    // Clean up the database before running tests
    await prisma.child.deleteMany();
    await prisma.parent.deleteMany();
  });

  beforeEach(async () => {
    // Register and login a parent to obtain accessToken
    const hash = await bcrypt.hash(parentData.password, 10);
    const parent = await prisma.parent.create({
      data: {
        firstName: parentData.firstName,
        lastName: parentData.lastName,
        email: parentData.email,
        password: hash,
        isVerified: true,
        status: true,
      },
    });

    parentId = parent.id;

    const res = await request(app).post('/api/auth/parent-login').send({
      email: parentData.email,
      password: parentData.password,
    });

    accessToken = res.body.accessToken;
  });

  afterEach(async () => {
    await prisma.child.deleteMany();
    await prisma.parent.deleteMany();
  });

  describe('GET /api/parent/profile', () => {
    it('should retrieve parent profile successfully', async () => {
      const res = await request(app)
        .get('/api/parent/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('parent');
      expect(res.body.parent).toHaveProperty('email', parentData.email);
      expect(res.body.parent).not.toHaveProperty('password');
    });

    it('should not retrieve profile without authentication', async () => {
      const res = await request(app).get('/api/parent/profile');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should not retrieve profile with invalid token', async () => {
      const res = await request(app)
        .get('/api/parent/profile')
        .set('Authorization', `Bearer invalidtoken`);

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/parent/update-email', () => {
    it('should update email successfully', async () => {
      const res = await request(app)
        .put('/api/parent/update-email')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ newEmail });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('parent');
      expect(res.body.parent).toHaveProperty('email', newEmail);
    });

    it('should not update email to one already in use', async () => {
      // Create another parent with the target email
      const email = 'shuld.update.email.already.in.use@example.com';
      await prisma.parent.create({
        data: {
          firstName: 'Mark',
          lastName: 'Twain',
          email: email,
          password: await bcrypt.hash('AnotherPass123', 10),
          isVerified: true,
          status: true,
        },
      });

      const res = await request(app)
        .put('/api/parent/update-email')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ newEmail: email });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 409);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .put('/api/parent/update-email')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ newEmail: 'invalidemail' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // expect(res.body.errors).toContain('Invalid email address');
    });
  });

  describe('PUT /api/parent/update-password', () => {
    it('should update password successfully', async () => {
      const res = await request(app)
        .put('/api/parent/update-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: parentData.password,
          newPassword: '1234567',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty(
        'message',
        'Password updated successfully'
      );
    });

    it('should not update password with incorrect old password', async () => {
      const res = await request(app)
        .put('/api/parent/update-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'WrongOldPass',
          newPassword: 'NewSecurePass789',
        });

      expect(res.statusCode).toEqual(401);

      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid input data', async () => {
      const res = await request(app)
        .put('/api/parent/update-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'short',
          newPassword: '123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // expect(res.body.errors).toContain('Old password must be at least 6 characters long');
      // expect(res.body.errors).toContain('New password must be at least 6 characters long');
    });
  });

  describe('PUT /api/parent/complete-registration', () => {
    it('should complete registration successfully', async () => {
      const additionalData = {
        birthDate: '1992-05-20T00:00:00.000Z',
        phoneNumber: '1234567890',
        addressPostal: '12345',
      };

      const res = await request(app)
        .put('/api/parent/complete-registration')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(additionalData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('parent');
      expect(res.body.parent).toHaveProperty(
        'birthDate',
        '1992-05-20T00:00:00.000Z'
      );
      expect(res.body.parent).toHaveProperty('phoneNumber', '1234567890');
      expect(res.body.parent).toHaveProperty('addressPostal', '12345');
    });

    it('should return 400 for invalid input data', async () => {
      const res = await request(app)
        .put('/api/parent/complete-registration')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          birthDate: 'invalid-date',
          phoneNumber: '123',
          addressPostal: '',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // expect(res.body.errors).toContain('Invalid date format');
      // expect(res.body.errors).toContain('Phone number must be at least 10 digits');
      // expect(res.body.errors).toContain('Postal address is too short');
    });
  });

  describe('DELETE /api/parent/remove-account', () => {
    it('should deactivate account successfully', async () => {
      const res = await request(app)
        .delete('/api/parent/remove-account')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ password: parentData.password });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty(
        'message',
        'Account deactivated successfully'
      );

      // Verify that status is set to false in the database
      const parent = await prisma.parent.findUnique({
        where: { email: parentData.email },
      });
      expect(parent?.status).toBe(false);
    });

    it('should not deactivate account with incorrect password', async () => {
      const res = await request(app)
        .delete('/api/parent/remove-account')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ password: 'WrongPassword' });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid input data', async () => {
      const res = await request(app)
        .delete('/api/parent/remove-account')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ password: '123' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // expect(res.body.errors).toContain('Password must be at least 6 characters long');
    });
  });

  describe('POST /api/parent/forgot-password', () => {
    it('should initiate password reset successfully', async () => {
      const res = await request(app)
        .post('/api/parent/forgot-password')
        .send({ email: parentData.email });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 404 for non-existing email', async () => {
      const res = await request(app)
        .post('/api/parent/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 404);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/parent/forgot-password')
        .send({ email: 'invalidemail' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // expect(res.body.errors).toContain('Invalid email address');
    });
  });

  describe('PUT /api/parent/reset-password', () => {
    let resetToken: string;

    beforeEach(async () => {
      // Initiate password reset to get the reset token
      await prisma.parent.update({
        where: { email: parentData.email },
        data: {
          resetPasswordToken: 'valid-reset-token',
          resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
        },
      });

      resetToken = 'valid-reset-token';
    });

    it('should reset password successfully', async () => {
      const res = await request(app).put('/api/parent/reset-password').send({
        token: resetToken,
        newPassword: 'NewSecurePass789',
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Password reset successfully');

      // Verify that the password was updated
      const parent = await prisma.parent.findUnique({
        where: { email: parentData.email },
      });
      const isMatch = await bcrypt.compare(
        'NewSecurePass789',
        parent!.password
      );
      expect(isMatch).toBe(true);

      // Verify that reset tokens are cleared
      expect(parent!.resetPasswordToken).toBeNull();
      expect(parent!.resetPasswordExpires).toBeNull();
    });

    it('should not reset password with invalid token', async () => {
      const res = await request(app).put('/api/parent/reset-password').send({
        token: 'invalid-token',
        newPassword: 'NewSecurePass789',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not reset password with expired token', async () => {
      // Expire the token
      await prisma.parent.update({
        where: { email: parentData.email },
        data: {
          resetPasswordExpires: new Date(Date.now() - 1000), // 1 second in the past
        },
      });

      const res = await request(app).put('/api/parent/reset-password').send({
        token: resetToken,
        newPassword: 'NewSecurePass789',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for invalid input data', async () => {
      const res = await request(app).put('/api/parent/reset-password').send({
        token: '',
        newPassword: '123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // expect(res.body.errors).toContain('Reset token is required');
      // expect(res.body.errors).toContain('New password must be at least 6 characters long');
    });
  });

  describe('POST /api/parent/verify-email', () => {
    beforeEach(async () => {
      // Set a verification token for the parent
      await prisma.parent.update({
        where: { email: parentData.email },
        data: {
          verificationToken: 'valid-verification-token',
          isVerified: false,
        },
      });
    });

    it('should verify email successfully', async () => {
      const res = await request(app)
        .post('/api/parent/verify-email')
        .send({ token: 'valid-verification-token' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');

      // Verify that the parent's isVerified is true
      const parent = await prisma.parent.findUnique({
        where: { email: parentData.email },
      });
      expect(parent!.isVerified).toBe(true);
      expect(parent!.verificationToken).toBeNull();
    });

    it('should not verify email with invalid token', async () => {
      const res = await request(app)
        .post('/api/parent/verify-email')
        .send({ token: 'invalid-token' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not verify already verified email', async () => {
      // First, verify the email
      await prisma.parent.update({
        where: { email: parentData.email },
        data: {
          isVerified: true,
          verificationToken: 'valid-verification-token',
        },
      });

      const res = await request(app)
        .post('/api/parent/verify-email')
        .send({ token: 'valid-verification-token' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should not verify email with expired token', async () => {
      // Expire the verification token
      await prisma.parent.update({
        where: { email: parentData.email },
        data: {
          verificationTokenExpires: new Date(Date.now() - 1000), // 1 second in the past
        },
      });

      const res = await request(app)
        .post('/api/parent/verify-email')
        .send({ token: 'valid-verification-token' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should return 400 for missing token', async () => {
      const res = await request(app).post('/api/parent/verify-email').send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      // expect(res.body.errors).toContain('Verification token is required');
    });
  });

  describe('POST /api/parent/resend-verification-email', () => {
    beforeEach(async () => {
      // Set a verification token for the parent
      await prisma.parent.update({
        where: { email: parentData.email },
        data: {
          verificationToken: 'valid-verification-token',
          isVerified: false,
        },
      });
    });

    it('should resend verification email successfully', async () => {
      const res = await request(app)
        .post('/api/parent/resend-verification-email')
        .send({ email: parentData.email });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');

      // // Verify that sendEmail was called
      // expect(sendEmail).toHaveBeenCalledTimes(1);
      // expect(sendEmail).toHaveBeenCalledWith({
      //     to: parentData.email,
      //     subject: 'Verify Your Email',
      //     html: expect.stringContaining('Verify Email'),
      // });
    });

    it('should not resend verification email if already verified', async () => {
      // Verify the parent
      await prisma.parent.update({
        where: { email: parentData.email },
        data: {
          isVerified: true,
          verificationToken: null,
        },
      });

      const res = await request(app)
        .post('/api/parent/resend-verification-email')
        .send({ email: parentData.email });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('success', false);
      // expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existing email', async () => {
      const res = await request(app)
        .post('/api/parent/resend-verification-email')
        .send({ email: 'nonexistent@example.com' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('statusCode', 404);
      expect(res.body).toHaveProperty('success', false);
      // expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/parent/resend-verification-email')
        .send({ email: 'invalidemail' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toContain('Invalid email address');
      // expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  // =============================== Child Operations Tests ===============================

  describe('Child Operations', () => {
    let childId: number;

    describe('POST /api/parent/children', () => {
      it('should register a new child under the parent', async () => {
        const res = await request(app)
          .post('/api/parent/children')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(childData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('child');
        expect(res.body.child).toHaveProperty('username', childData.username);
        expect(res.body.child).not.toHaveProperty('password');
        expect(res.body.child).toHaveProperty('parentId', parentId);

        childId = res.body.child.id;
      });

      it('should not register a child with an existing username', async () => {
        await prisma.child.create({
          data: {
            username: childData.username,
            password: await bcrypt.hash('anotherChildPass', 10),
            birthDate: new Date('2010-05-15T00:00:00.000Z'),
            firstName: 'AnotherChild',
            lastName: 'LastName',
            gender: 'Female',
            schoolLevel: 'Grade 4',
            parentId: parentId,
          },
        });
        const res = await request(app)
          .post('/api/parent/children')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(childData);

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'Username already in use');
        expect(res.body).toHaveProperty('statusCode', 409);
        expect(res.body).toHaveProperty('success', false);
      });

      it('should return 400 for invalid input data', async () => {
        const childData = {
          username: '',
          password: 'short',
          birthDate: 'invalid-date',
          firstName: '',
          lastName: '',
          gender: 'Unknown',
          schoolLevel: '',
          parentEmail: parentData.email,
        };

        const res = await request(app)
          .post('/api/parent/children')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(childData);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('errors');
        // Validate the specific validation errors if validation middleware provides detailed errors
      });
    });

    describe('PUT /api/parent/children/:childId', () => {
      beforeEach(async () => {
        const res = await request(app)
          .post('/api/parent/children')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(childData);
        childId = res.body.child.id;
      });

      it('should update child information successfully', async () => {
        const updateData = {
          ...childData,
          password: '123456',
          birthDate: '2010-05-15T00:00:00.000Z',
          firstName: 'Ahmad',
          lastName: 'karimi',
          gender: 'Female',
          schoolLevel: 'Grade 8',
          status: true,
        };

        const res = await request(app)
          .put(`/api/parent/children/${childId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateData);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('child');
        expect(res.body.child).toHaveProperty('username', updateData.username);
        expect(res.body.child).toHaveProperty(
          'firstName',
          updateData.firstName
        );
        expect(res.body.child).toHaveProperty('lastName', updateData.lastName);
        expect(res.body.child).toHaveProperty(
          'schoolLevel',
          updateData.schoolLevel
        );
      });

      it('should not update child with existing username', async () => {
        // Register another child to have a username conflict
        await prisma.child.create({
          data: {
            username: 'existingUsername',
            password: await bcrypt.hash('anotherChildPass', 10),
            birthDate: new Date('2010-05-15T00:00:00.000Z'),
            firstName: 'AnotherChild',
            lastName: 'LastName',
            gender: 'Female',
            schoolLevel: 'Grade 4',
            parentId: parentId,
            status: true,
          },
        });

        const updateData = {
          username: 'existingUsername',
          password: await bcrypt.hash('anotherChildPass', 10),
          birthDate: new Date('2010-05-15T00:00:00.000Z'),
          firstName: 'AnotherChild',
          lastName: 'LastName',
          gender: 'Female',
          schoolLevel: 'Grade 4',
          parentEmail: childData.parentEmail,
          status: true,
        };

        const res = await request(app)
          .put(`/api/parent/children/${childId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateData);

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('statusCode', 409);
        expect(res.body).toHaveProperty('success', false);
      });

      it('should not update child that does not belong to the parent', async () => {
        // Create a new parent and child not associated with the current parent
        const anotherParent = await prisma.parent.create({
          data: {
            firstName: 'OtherParent',
            lastName: 'LastName',
            email: 'otherparent@example.com',
            password: await bcrypt.hash('otherParentPass', 10),
            isVerified: true,
            status: true,
          },
        });

        const otherChild = await prisma.child.create({
          data: {
            username: 'otherChild',
            password: await bcrypt.hash('otherChildPass', 10),
            birthDate: new Date('2011-05-15T00:00:00.000Z'),
            firstName: 'OtherChild',
            lastName: 'LastName',
            gender: 'Male',
            schoolLevel: 'Grade 5',
            parentId: anotherParent.id,
          },
        });

        const updateData = {
          username: 'attemptedUpdateUsername',
          password: await bcrypt.hash('anotherChildPass', 10),
          birthDate: new Date('2010-05-15T00:00:00.000Z'),
          firstName: 'AnotherChild',
          lastName: 'LastName',
          gender: 'Female',
          schoolLevel: 'Grade 4',
          parentEmail: childData.parentEmail,
          status: true,
        };

        const res = await request(app)
          .put(`/api/parent/children/${otherChild.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateData);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty(
          'message',
          'Child not found or unauthorized'
        );
        expect(res.body).toHaveProperty('statusCode', 404);
        expect(res.body).toHaveProperty('success', false);
      });

      it('should return 400 for invalid input data', async () => {
        const updateData = {
          username: '',
          password: 'short',
          birthDate: 'invalid-date',
        };

        const res = await request(app)
          .put(`/api/parent/children/${childId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateData);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('errors');
        // Validate the specific validation errors if validation middleware provides detailed errors
      });
    });

    describe('GET /api/parent/children', () => {
      beforeEach(async () => {
        // Register multiple children under the parent
        const childData1 = {
          username: 'child1',
          password: 'childPass123',
          birthDate: '2010-05-15T00:00:00.000Z',
          firstName: 'ChildFirstName1',
          lastName: 'ChildLastName1',
          gender: 'Male',
          parentEmail: childData.parentEmail,
          schoolLevel: 'Grade 5',
          status: true,
        };

        const childData2 = {
          username: 'child2',
          password: 'childPass123',
          birthDate: '2011-05-15T00:00:00.000Z',
          firstName: 'ChildFirstName2',
          lastName: 'ChildLastName2',
          gender: 'Female',
          parentEmail: childData.parentEmail,
          schoolLevel: 'Grade 4',
          status: true,
        };

        await request(app)
          .post('/api/parent/children')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(childData1);

        await request(app)
          .post('/api/parent/children')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(childData2);
      });

      it('should list all children of the authenticated parent', async () => {
        const res = await request(app)
          .get('/api/parent/children')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('children');
        expect(Array.isArray(res.body.children)).toBe(true);
        expect(res.body.children.length).toBeGreaterThanOrEqual(2);
      });

      it('should return an empty array if the parent has no children', async () => {
        // Clean up children
        await prisma.child.deleteMany({ where: { parentId } });

        const res = await request(app)
          .get('/api/parent/children')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('children');
        expect(Array.isArray(res.body.children)).toBe(true);
        expect(res.body.children.length).toEqual(0);
      });

      it('should not list children without authentication', async () => {
        const res = await request(app).get('/api/parent/children');

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message');
      });
    });
  });
});

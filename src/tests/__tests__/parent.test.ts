// tests/parent.test.ts

import request from 'supertest';
import {app} from '../jest.setup';
import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Parent Endpoints', () => {

    const newEmail = 'salemshah686@gmail.com';
    const parentData = {
        firstName: 'salem',
        lastName: 'shah',
        email: 'salemshahdev@gmail.com',
        password: '123456',
    };

    let accessToken: string;

    beforeEach(async () => {
        await prisma.parent.deleteMany();
        // Register and login a parent to obtain accessToken
        const hash = await bcrypt.hash(parentData.password, 10);
        await prisma.parent.create({
            data: {
                firstName: parentData.firstName,
                lastName: parentData.lastName,
                email: parentData.email,
                password: hash,
                isVerified: true, status: true
            },
        });

        const res = await request(app)
            .post('/api/auth/parent-login')
            .send({
                email: parentData.email,
                password: parentData.password,
            });

        accessToken = res.body.accessToken;
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
            const res = await request(app)
                .get('/api/parent/profile');

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
                .send({newEmail});

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
                .send({newEmail: email});

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 409);
            expect(res.body).toHaveProperty('success', false);

        });

        it('should return 400 for invalid email', async () => {
            const res = await request(app)
                .put('/api/parent/update-email')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({newEmail: 'invalidemail'});

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
            expect(res.body).toHaveProperty('message', 'Password updated successfully');
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
            expect(res.body.parent).toHaveProperty('birthDate', '1992-05-20T00:00:00.000Z');
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
                .send({password: parentData.password});

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Account deactivated successfully');

            // Verify that status is set to false in the database
            const parent = await prisma.parent.findUnique({
                where: {email: parentData.email},
            });
            expect(parent?.status).toBe(false);
        });

        it('should not deactivate account with incorrect password', async () => {
            const res = await request(app)
                .delete('/api/parent/remove-account')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({password: 'WrongPassword'});

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 401);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should return 400 for invalid input data', async () => {
            const res = await request(app)
                .delete('/api/parent/remove-account')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({password: '123'});

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            // expect(res.body.errors).toContain('Password must be at least 6 characters long');
        });
    });

    describe('POST /api/parent/forgot-password', () => {
        it('should initiate password reset successfully', async () => {
            const res = await request(app)
                .post('/api/parent/forgot-password')
                .send({email: parentData.email});

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message');

        });

        it('should return 404 for non-existing email', async () => {
            const res = await request(app)
                .post('/api/parent/forgot-password')
                .send({email: 'nonexistent@example.com'});

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 404);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/parent/forgot-password')
                .send({email: 'invalidemail'});

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
                where: {email: parentData.email},
                data: {
                    resetPasswordToken: 'valid-reset-token',
                    resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
                },
            });

            resetToken = 'valid-reset-token';
        });

        it('should reset password successfully', async () => {
            const res = await request(app)
                .put('/api/parent/reset-password')
                .send({
                    token: resetToken,
                    newPassword: 'NewSecurePass789',
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Password reset successfully');

            // Verify that the password was updated
            const parent = await prisma.parent.findUnique({
                where: {email: parentData.email},
            });
            const isMatch = await bcrypt.compare('NewSecurePass789', parent!.password);
            expect(isMatch).toBe(true);

            // Verify that reset tokens are cleared
            expect(parent!.resetPasswordToken).toBeNull();
            expect(parent!.resetPasswordExpires).toBeNull();
        });

        it('should not reset password with invalid token', async () => {
            const res = await request(app)
                .put('/api/parent/reset-password')
                .send({
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
                where: {email: parentData.email},
                data: {
                    resetPasswordExpires: new Date(Date.now() - 1000), // 1 second in the past
                },
            });

            const res = await request(app)
                .put('/api/parent/reset-password')
                .send({
                    token: resetToken,
                    newPassword: 'NewSecurePass789',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should return 400 for invalid input data', async () => {
            const res = await request(app)
                .put('/api/parent/reset-password')
                .send({
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
                where: {email: parentData.email},
                data: {
                    verificationToken: 'valid-verification-token',
                    isVerified: false,
                },
            });
        });

        it('should verify email successfully', async () => {
            const res = await request(app)
                .post('/api/parent/verify-email')
                .send({token: 'valid-verification-token'});

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message');

            // Verify that the parent's isVerified is true
            const parent = await prisma.parent.findUnique({
                where: {email: parentData.email},
            });
            expect(parent!.isVerified).toBe(true);
            expect(parent!.verificationToken).toBeNull();
        });

        it('should not verify email with invalid token', async () => {
            const res = await request(app)
                .post('/api/parent/verify-email')
                .send({token: 'invalid-token'});

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should not verify already verified email', async () => {
            // First, verify the email
            await prisma.parent.update({
                where: {email: parentData.email},
                data: {
                    isVerified: true,
                    verificationToken: 'valid-verification-token',
                },
            });

            const res = await request(app)
                .post('/api/parent/verify-email')
                .send({token: 'valid-verification-token'});

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should not verify email with expired token', async () => {
            // Expire the verification token
            await prisma.parent.update({
                where: {email: parentData.email},
                data: {
                    verificationTokenExpires: new Date(Date.now() - 1000), // 1 second in the past
                },
            });

            const res = await request(app)
                .post('/api/parent/verify-email')
                .send({token: 'valid-verification-token'});

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should return 400 for missing token', async () => {
            const res = await request(app)
                .post('/api/parent/verify-email')
                .send({});

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            // expect(res.body.errors).toContain('Verification token is required');
        });
    });

    describe('POST /api/parent/resend-verification-email', () => {
        beforeEach(async () => {
            // Set a verification token for the parent
            await prisma.parent.update({
                where: {email: parentData.email},
                data: {
                    verificationToken: 'valid-verification-token',
                    isVerified: false,
                },
            });
        });

        it('should resend verification email successfully', async () => {
            const res = await request(app)
                .post('/api/parent/resend-verification-email')
                .send({email: parentData.email});

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
                where: {email: parentData.email},
                data: {
                    isVerified: true,
                    verificationToken: null,
                },
            });

            const res = await request(app)
                .post('/api/parent/resend-verification-email')
                .send({email: parentData.email});

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 400);
            expect(res.body).toHaveProperty('success', false);
            // expect(sendEmail).not.toHaveBeenCalled();
        });

        it('should return 404 for non-existing email', async () => {
            const res = await request(app)
                .post('/api/parent/resend-verification-email')
                .send({email: 'nonexistent@example.com'});

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 404);
            expect(res.body).toHaveProperty('success', false);
            // expect(sendEmail).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/parent/resend-verification-email')
                .send({email: 'invalidemail'});

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors).toContain('Invalid email address');
            // expect(sendEmail).not.toHaveBeenCalled();
        });
    });
});

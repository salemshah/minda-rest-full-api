// tests/__tests__/auth.test.ts

import request from 'supertest';
import {PrismaClient} from '@prisma/client';
import {app} from '../jest.setup';

const prisma = new PrismaClient();

describe('Authentication Endpoints', () => {

    // for registration
    const parentData = {
        firstName: 'salem',
        lastName: 'shah',
        email: 'salemshahdev@gmail.com',
        password: '123456',
    };

    describe('POST /api/auth/parent-register', () => {
        it('should register a new parent successfully', async () => {
            const res = await request(app)
                .post('/api/auth/parent-register')
                .send(parentData);
            expect(res.statusCode).toEqual(201);
        });

        it('should not register a parent with an existing email', async () => {
            const res = await request(app)
                .post('/api/auth/parent-register')
                .send(parentData);
            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 409);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should return 400 for invalid input data', async () => {
            const res = await request(app)
                .post('/api/auth/parent-register')
                .send({
                    firstName: '',
                    lastName: 'salem',
                    email: 'invalidemail',
                    password: '123',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            // expect(res.body.errors).toContain('First name is required');
            // expect(res.body.errors).toContain('Invalid email address');
            // expect(res.body.errors).toContain('Password must be at least 6 characters long');
        });
    });


    describe('POST /api/auth/parent-login', () => {
        it('should login a parent successfully', async () => {

            await prisma.parent.update({
                where: {email: parentData.email},
                data: {
                    isVerified: true,
                    status: true,
                },
            });
            const res = await request(app)
                .post('/api/auth/parent-login')
                .send({
                    email: parentData.email,
                    password: parentData.password,
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Login successful');
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('parent');
            expect(res.body.parent).toHaveProperty('email', parentData.email);
            expect(res.body.parent).not.toHaveProperty('password');
        });

        it('should not login with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/parent-login')
                .send({
                    email: parentData.email,
                    password: 'WrongPassword',
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 401);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should not login with incorrect email', async () => {
            const res = await request(app)
                .post('/api/auth/parent-login')
                .send({
                    email: 'no.email' + parentData.email,
                    password: 'WrongPassword',
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 401);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should not login unverified parent', async () => {
            // Create an unverified parent
            await prisma.parent.update({
                where: {email: parentData.email},
                data: {
                    isVerified: false,
                    status: true,
                },
            });

            const res = await request(app)
                .post('/api/auth/parent-login')
                .send({
                    email: parentData.email,
                    password: parentData.password,
                });

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 403);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should not login inactive parent', async () => {
            // Create an unverified parent
            await prisma.parent.update({
                where: {email: parentData.email},
                data: {
                    isVerified: true,
                    status: false,
                },
            });

            const res = await request(app)
                .post('/api/auth/parent-login')
                .send({
                    email: parentData.email,
                    password: parentData.password,
                });

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 403);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should return 400 for invalid input data', async () => {
            const res = await request(app)
                .post('/api/auth/parent-login')
                .send({
                    email: 'invalidemail',
                    password: '123',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors).toContain('Invalid email address');
            expect(res.body.errors).toContain('Password must be at least 6 characters long');
        });
    });

    describe('POST /api/auth/refresh-token', () => {
        let refreshToken: string;

        beforeEach(async () => {
            await prisma.parent.update({
                where: {email: parentData.email},
                data: {
                    isVerified: true,
                    status: true,
                }
            })

            const res = await request(app)
                .post('/api/auth/parent-login')
                .send({
                    email: parentData.email,
                    password: parentData.password,
                });

            refreshToken = res.body.refreshToken;
        });

        it('should refresh tokens successfully', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .send({refreshToken});

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('message', 'Token refreshed successfully');
        });

        it('should not refresh tokens with invalid refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .send({refreshToken: 'invalidtoken'});

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('statusCode', 403);
            expect(res.body).toHaveProperty('success', false);

        });

        it('should not refresh tokens without refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .send({});

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
        });
    });

    describe('POST /api/auth/logout', () => {

        it('should logout successfully', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Logged out successfully');
        });
    });
});

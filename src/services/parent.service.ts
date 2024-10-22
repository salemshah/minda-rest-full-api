import {Service} from 'typedi';
import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import {Parent} from '@prisma/client';
import CustomError from '../utils/customError';
import {Request} from "express";
import {v4 as uuidv4} from 'uuid';
import {sendEmail} from '../utils/sendEmail';
import config from "../config";
import {generateAccessToken, generateRefreshToken} from "../utils/jwt";
import {excludeField} from "../utils/helper-functions";
import {AuthResponse, SafeParent} from "../interfaces/mainda.app.interface";


@Service()
export class ParentService {
    private readonly frontendUrlVerifyEmail: string = config.client.frontendUrlVerifyEmail;
    private readonly frontendUrlForgotPassword: string = config.client.frontendUrlForgotPassword

    /**
     * Registers a new parent.
     * @param firstName - Parent's first name.
     * @param lastName - Parent's last name.
     * @param email - Parent's email.
     * @param password - Parent's password.
     * @returns The newly created parent object (excluding password and sensitive fields).
     */
    async registerParent(firstName: string, lastName: string, email: string, password: string): Promise<SafeParent> {
        const existingParent = await prisma.parent.findUnique({
            where: {email},
        });
        if (existingParent) {
            throw new CustomError('Email already in use', 409, 'EMAIL_IN_USE');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = uuidv4();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        const newParent = await prisma.parent.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                verificationToken,
                verificationTokenExpires,
            }
        });

        // Send verification email
        const verificationLink = `${this.frontendUrlVerifyEmail}?token=${verificationToken}`;
        const emailContent = `
            <h1>Welcome to Our Platform, ${firstName}!</h1>
            <p>Thank you for registering. Please verify your email by clicking the link below:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>If you did not register, please ignore this email.</p>
        `;

        await sendEmail({
            to: email,
            subject: 'Verify Your Email',
            html: emailContent,
        });

        return this.getParentData(newParent);
    }

    getParentData(parent: Parent): SafeParent {

        return excludeField(parent, ['password', 'verificationToken', 'verificationTokenExpires', 'resetPasswordToken', 'resetPasswordExpires'])
    }

    /**
     * Authenticates a parent and returns a JWT token.
     * Only allows login if the email is verified.
     * @param email - Parent's email.
     * @param password - Parent's password.
     * @returns JWT token and parent profile.
     */
    async loginParent(email: string, password: string): Promise<AuthResponse> {
        const parent = await prisma.parent.findUnique({
            where: {email}
        });

        if (!parent) {
            throw new CustomError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }

        const isMatch = await bcrypt.compare(password, parent.password);
        if (!isMatch) {
            throw new CustomError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
        }

        if (!parent.isVerified) {
            throw new CustomError('Email not verified', 403, 'EMAIL_NOT_VERIFIED');
        }

        if (!parent.status) {
            throw new CustomError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            id: parent.id,
            email: parent.email,
            firstName: parent.firstName,
            lastName: parent.lastName
        });
        const refreshToken = generateRefreshToken({id: parent.id});
        const parentData = this.getParentData(parent)
        return {parent: parentData, accessToken, refreshToken};
    }


    async completeRegistration(req: Request, id: number, email: string): Promise<SafeParent> {
        const {birthDate, phoneNumber, addressPostal} = req.body
        const stringToDate = new Date(birthDate);
        const parent = await prisma.parent.update({
            where: {id, email},
            data: {birthDate: stringToDate, phoneNumber, addressPostal}
        })
        return this.getParentData(parent)
    }


    /**
     * Verifies a parent's email using the provided token.
     * @param token - Verification token sent to the parent's email.
     * @returns Confirmation message.
     */
    async verifyEmail(token: string): Promise<{ message: string }> {
        const parent = await prisma.parent.findUnique({
            where: {verificationToken: token}
        });

        if (!parent) {
            throw new CustomError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN');
        }

        if (parent.isVerified) {
            throw new CustomError('Email is already verified', 400, 'EMAIL_ALREADY_VERIFIED');
        }

        if (parent.verificationTokenExpires && parent.verificationTokenExpires < new Date()) {
            throw new CustomError('Verification token has expired', 400, 'VERIFICATION_TOKEN_EXPIRED');
        }

        await prisma.parent.update({
            where: {id: parent.id},
            data: {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpires: null,
            },
        });

        return {message: 'Email verified successfully'};
    }

    /**
     * Resends the email verification link to the parent.
     * @param email - Parent's email.
     * @returns Confirmation message.
     */
    async resendVerificationEmail(email: string): Promise<{ message: string }> {
        const parent = await prisma.parent.findUnique({
            where: {email},
            select: {
                id: true,
                firstName: true,
                isVerified: true,
            },
        });

        if (!parent) {
            throw new CustomError('Parent not found', 404, 'PARENT_NOT_FOUND');
        }

        if (parent.isVerified) {
            throw new CustomError('Email is already verified', 400, 'EMAIL_ALREADY_VERIFIED');
        }

        // Generate a new verification token
        const verificationToken = uuidv4();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        await prisma.parent.update({
            where: {email},
            data: {
                verificationToken,
                verificationTokenExpires,
            },
        });

        // Send verification email
        const verificationLink = `${this.frontendUrlVerifyEmail}?token=${verificationToken}`;
        const emailContent = `
            <h1>Verify Your Email</h1>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

        await sendEmail({
            to: email,
            subject: 'Verify Your Email',
            html: emailContent,
        });

        return {message: 'Verification email resent successfully'};
    }

    /**
     * Retrieves a parent's profile by ID.
     * @param id - Parent's ID.
     * @returns Parent object (excluding password and sensitive fields).
     */
    async getParentById(id: number): Promise<SafeParent> {
        const parent = await prisma.parent.findUnique({
            where: {id}
        });

        return this.getParentData(parent!);
    }

    /**
     * Updates a parent's email.
     * @param parentId - Parent's ID.
     * @param newEmail - New email address.
     * @returns Updated parent object (excluding password and sensitive fields).
     */
    async updateParentEmail(parentId: number, newEmail: string): Promise<SafeParent> {
        const existingParent = await prisma.parent.findUnique({
            where: {email: newEmail},
            select: {id: true},
        });

        if (existingParent) {
            throw new CustomError('Email already in use', 409, 'EMAIL_IN_USE');
        }

        const verificationToken = uuidv4();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        const updatedParent = await prisma.parent.update({
            where: {id: parentId},
            data: {
                email: newEmail,
                isVerified: false,
                verificationToken,
                verificationTokenExpires,
            }
        });

        // Send verification email to the new email address
        const verificationLink = `${this.frontendUrlVerifyEmail}?token=${verificationToken}`;
        const emailContent = `
            <h1>Verify Your New Email</h1>
            <p>You updated your email address. Please verify your new email by clicking the link below:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>If you did not perform this action, please contact support.</p>
        `;

        await sendEmail({
            to: newEmail,
            subject: 'Verify Your New Email',
            html: emailContent,
        });

        return this.getParentData(updatedParent);
    }

    /**
     * Deletes (deactivates) a parent's account.
     * @param parentId - Parent's ID.
     * @param password - Parent's current password for verification.
     * @returns Confirmation message.
     */
    async deleteParentAccount(parentId: number, password: string): Promise<void> {
        const parent = await prisma.parent.findUnique({
            where: {id: parentId},
            select: {password: true},
        });

        const isMatch = await bcrypt.compare(password, parent!.password);

        if (!isMatch) {
            throw new CustomError('Invalid password', 401, 'INVALID_CREDENTIALS');
        }

        await prisma.parent.update({
            where: {id: parentId},
            data: {status: false},
        });
    }

    /**
     * Updates a parent's password.
     * @param parentId - Parent's ID.
     * @param oldPassword - Parent's current password.
     * @param newPassword - New password.
     * @returns Confirmation message.
     */
    async updateParentPassword(parentId: number, oldPassword: string, newPassword: string): Promise<void> {
        const parent = await prisma.parent.findUnique({
            where: {id: parentId},
            select: {password: true},
        });

        const isMatch = await bcrypt.compare(oldPassword, parent!.password);

        if (!isMatch) {
            throw new CustomError('Old password is incorrect', 401, 'INVALID_CREDENTIALS');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.parent.update({
            where: {id: parentId},
            data: {password: hashedPassword},
        });
    }

    /**
     * Initiates the password reset process by sending a reset link to the parent's email.
     * @param email - Parent's email.
     * @returns Confirmation message.
     */
    async forgotPassword(email: string): Promise<void> {
        const parent = await prisma.parent.findUnique({
            where: {email},
            select: {id: true, firstName: true},
        });

        if (!parent) {
            throw new CustomError('Email not found', 404, 'EMAIL_NOT_FOUND');
        }

        const resetToken = uuidv4();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        await prisma.parent.update({
            where: {email},
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetTokenExpiry,
            },
        });

        const resetLink = `${this.frontendUrlForgotPassword}?token=${resetToken}`;

        const emailContent = `
            <h1>Password Reset Request</h1>
            <p>You requested to reset your password. Click the link below to reset it:</p>
            <a href="${resetLink}">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

        await sendEmail({
            to: email,
            subject: 'Password Reset Request',
            html: emailContent,
        });
    }

    /**
     * Resets the parent's password using the provided reset token.
     * @param token - Password reset token.
     * @param newPassword - New password.
     * @returns Confirmation message.
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        const parent = await prisma.parent.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    gt: new Date(),
                },
            },
            select: {id: true},
        });

        if (!parent) {
            throw new CustomError('Invalid or expired password reset token', 400, 'INVALID_RESET_TOKEN');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.parent.update({
            where: {id: parent.id},
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });
    }

    /**
     * Logs the parent out by invalidating the JWT token.
     * @returns Confirmation message.
     */
    async logoutParent(): Promise<void> {
        // const decoded: any = jwt.decode(token);
        // if (!decoded || !decoded.exp) {
        //     throw new CustomError('Invalid token', 400, 'INVALID_TOKEN');
        // }
        //
        // const expiration = decoded.exp - Math.floor(Date.now() / 1000);
        // if (expiration > 0) {
        //     // Assuming you have Redis set up for token blacklisting
        //     await redisClient.set(`blacklist_${token}`, 'blacklisted', 'EX', expiration);
        // }
    }

    /**
     * Checks if a token is blacklisted.
     * @param token - JWT token.
     * @returns Boolean indicating if the token is blacklisted.
     */
    // async isTokenBlacklisted(token: string): Promise<boolean> {
    //     const result = await promisify(redisClient.get).bind(redisClient)(`blacklist_${token}`);
    //     return result === 'blacklisted';
    // }
}

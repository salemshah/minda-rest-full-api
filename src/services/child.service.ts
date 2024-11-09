import { Service } from 'typedi';
import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import { Child } from '@prisma/client';
import CustomError from '../utils/customError';
import { sendEmail } from '../utils/sendEmail';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { excludeField } from '../utils/helper-functions';
import {
  AuthChildResponse,
  SafeChild,
} from '../interfaces/mainda.app.interface';

@Service()
export class ChildService {
  /**
   * Authenticates a child and returns a JWT token.
   * @param username - Child's username.
   * @param password - Child's password.
   * @returns JWT token and child profile.
   */
  async loginChild(
    username: string,
    password: string
  ): Promise<AuthChildResponse> {
    const child = await prisma.child.findUnique({
      where: { username },
    });

    if (!child) {
      throw new CustomError(
        'Invalid username or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const isMatch = await bcrypt.compare(password, child.password);
    if (!isMatch) {
      throw new CustomError(
        'Invalid username or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    if (!child.status) {
      throw new CustomError(
        'Account is deactivated',
        403,
        'ACCOUNT_DEACTIVATED'
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: child.id,
      username: child.username,
      firstName: child.firstName,
      lastName: child.lastName,
    });
    const refreshToken = generateRefreshToken({ id: child.id });
    const childData = this.getChildData(child);
    return { child: childData, accessToken, refreshToken };
  }

  /**
   * Logs the child out by invalidating the JWT token.
   * @returns Confirmation message.
   */
  async logoutChild(): Promise<void> {
    // Implementation depends on your token management strategy (e.g., token blacklisting)
    // Example using Redis for token blacklisting:
    // const decoded: any = jwt.decode(token);
    // if (!decoded || !decoded.exp) {
    //     throw new CustomError('Invalid token', 400, 'INVALID_TOKEN');
    // }
    // const expiration = decoded.exp - Math.floor(Date.now() / 1000);
    // if (expiration > 0) {
    //     await redisClient.set(`blacklist_${token}`, 'blacklisted', 'EX', expiration);
    // }
  }

  /**
   * Retrieves a child's profile by ID.
   * @param childId - Child's ID.
   * @param requesterId - ID of the requester (either parent or child).
   * @param isParent - Boolean indicating if the requester is a parent.
   * @returns Child object (excluding password and sensitive fields).
   */
  async getChildById(
    childId: number,
    requesterId: number,
    isParent: boolean
  ): Promise<SafeChild> {
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new CustomError('Child not found', 404, 'CHILD_NOT_FOUND');
    }

    if (isParent && child.parentId !== requesterId) {
      throw new CustomError('Unauthorized access', 403, 'UNAUTHORIZED_ACCESS');
    }

    if (!isParent && child.id !== requesterId) {
      throw new CustomError('Unauthorized access', 403, 'UNAUTHORIZED_ACCESS');
    }

    return this.getChildData(child);
  }

  /**
   * Changes a child's profile picture URL.
   * @param childId - Child's ID.
   * @param profilePictureUrl - New profile picture URL.
   * @param requesterId - ID of the requester.
   * @param isParent - Boolean indicating if the requester is a parent.
   * @returns Updated child object (excluding password and sensitive fields).
   */
  async changeProfilePicture(
    childId: number,
    profilePictureUrl: string,
    requesterId: number,
    isParent: boolean
  ): Promise<SafeChild> {
    // Verify authorization
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new CustomError('Child not found', 404, 'CHILD_NOT_FOUND');
    }

    if (isParent && child.parentId !== requesterId) {
      throw new CustomError('Unauthorized access', 403, 'UNAUTHORIZED_ACCESS');
    }

    if (!isParent && child.id !== requesterId) {
      throw new CustomError('Unauthorized access', 403, 'UNAUTHORIZED_ACCESS');
    }

    const updatedChild = await prisma.child.update({
      where: { id: childId },
      data: { profilePictureUrl },
    });

    return this.getChildData(updatedChild);
  }

  /**
   * Initiates the password reset process by sending a reset request to the parent.
   * @param childId - Child's ID.
   * @returns Confirmation message.
   */
  async forgotPassword(childId: number): Promise<void> {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: { parent: true },
    });

    if (!child) {
      throw new CustomError('Child not found', 404, 'CHILD_NOT_FOUND');
    }

    if (!child.parent) {
      throw new CustomError('Parent not found', 404, 'PARENT_NOT_FOUND');
    }

    // Notify the parent via email
    const emailContent = `
      <h1>Password Reset Request for ${child.firstName}</h1>
      <p>Your child has requested to reset their password. Please imforme the password to your child ${child.firstName}</p>
      <p>If you did not authorize this request, please contact support.</p>
    `;

    await sendEmail({
      to: child.parent.email,
      subject: 'Child Password Reset Request',
      html: emailContent,
    });
  }

  /**
   * Retrieves child data excluding sensitive fields.
   * @param child - Child object from Prisma.
   * @returns SafeChild object.
   */
  getChildData(child: Child): SafeChild {
    return excludeField(child, ['password']);
  }
}

import { Request, Response } from 'express';
import { ParentService } from '../services/parent.service';
import { Container } from 'typedi';
import { asyncWrapper } from '../utils/asyncWrapper';
import CustomError from '../utils/customError';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import {
  setRefreshTokenCookie,
  setAccessTokenCookie,
} from '../utils/helper-functions';
import { TokenPayload } from '../interfaces/mainda.app.interface';
import logger from '../utils/logger';

export class AuthController {
  static parentRegister = asyncWrapper(async (req: Request, res: Response) => {
    const data = req.body;
    const parentService = Container.get(ParentService);
    await parentService.registerParent(
      data.firstName,
      data.lastName,
      data.email,
      data.password
    );
    res.status(201).json({
      message:
        'Parent registered successfully. Please check your email to verify your account.',
    });
  });

  static parentLogin = asyncWrapper(async (req: Request, res: Response) => {
    const parentService = Container.get(ParentService);
    const { parent, accessToken, refreshToken } =
      await parentService.loginParent(req.body.email, req.body.password);

    // Set refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);
    setAccessTokenCookie(res, accessToken);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      parent,
    });
  });

  static refreshToken = asyncWrapper(async (req: Request, res: Response) => {
    const refreshToken = req.body?.refreshToken;

    try {
      // Verify the refresh token
      const decoded = verifyRefreshToken(refreshToken) as TokenPayload;

      // Generate new tokens
      const newAccessToken = generateAccessToken({
        id: decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      });

      // Optionally, generate a new refresh token
      const newRefreshToken = generateRefreshToken({ id: decoded.id });

      // Set the new refresh token in HTTP-only cookie
      setRefreshTokenCookie(res, newRefreshToken);

      // Return the new tokens
      res.status(200).json({
        accessToken: newAccessToken,
        message: 'Token refreshed successfully',
      });
    } catch (err) {
      logger.error(err);
      throw new CustomError(
        'Invalid or expired refresh token',
        403,
        'INVALID_REFRESH_TOKEN'
      );
    }
  });

  static logout = asyncWrapper(async (req: Request, res: Response) => {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  });
}

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { Child, Parent } from '@prisma/client';
import logger from '../utils/logger';
import { isParent } from '../utils/helper-functions';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string = '';
  if (req?.cookies?.accessToken) {
    token = req.cookies.accessToken as string;
    console.log({ token });
  } else if (
    req?.headers?.authorization &&
    req?.headers?.authorization?.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1] as string;

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  try {
    const decoded = verifyAccessToken(token) as Parent | Child;
    if (isParent(decoded)) req.parent = decoded;
    else req.child = decoded;

    next();
  } catch (err) {
    logger.error(err);
    return res.status(401).json({ message: `Invalid or expired access token` });
  }
};

import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';

const accessTokenSecret = config.jwt.accessTokenSecret;
const refreshTokenSecret = config.jwt.refreshTokenSecret;

// Token expiration times
const accessTokenExpiresIn = config.jwt.accessTokenExpiresIn;
const refreshTokenExpiresIn = config.jwt.refreshTokenExpiresIn;

// Generate Access Token
export const generateAccessToken = (payload: object): string => {
    return jwt.sign(payload, accessTokenSecret, {
        expiresIn: accessTokenExpiresIn,
    });
};

// Generate Refresh Token
export const generateRefreshToken = (payload: object): string => {
    return jwt.sign(payload, refreshTokenSecret, {
        expiresIn: refreshTokenExpiresIn,
    });
};

// Verify Access Token
export const verifyAccessToken = (token: string): JwtPayload | string => {
    return jwt.verify(token, accessTokenSecret);
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): JwtPayload | string => {
    return jwt.verify(token, refreshTokenSecret);
};

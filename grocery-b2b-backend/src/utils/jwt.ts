import jwt from 'jsonwebtoken';
import { createError } from '../middleware/errorHandler';

export interface JwtPayload {
  userId: string;
  email: string;
  userType: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw createError('JWT_SECRET is not defined', 500);
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
    issuer: 'grocery-b2b-app',
    audience: 'grocery-b2b-users'
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw createError('JWT_REFRESH_SECRET is not defined', 500);
  }
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    issuer: 'grocery-b2b-app',
    audience: 'grocery-b2b-users'
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  if (!process.env.JWT_SECRET) {
    throw createError('JWT_SECRET is not defined', 500);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'grocery-b2b-app',
      audience: 'grocery-b2b-users'
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError('Token expired', 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid token', 401);
    }
    throw createError('Token verification failed', 401);
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw createError('JWT_REFRESH_SECRET is not defined', 500);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'grocery-b2b-app',
      audience: 'grocery-b2b-users'
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError('Refresh token expired', 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid refresh token', 401);
    }
    throw createError('Refresh token verification failed', 401);
  }
};
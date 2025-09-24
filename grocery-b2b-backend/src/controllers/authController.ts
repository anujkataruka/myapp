import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, userType, companyName, contactPerson, phone, address } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('User with this email already exists', 409);
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      userType,
      companyName,
      contactPerson,
      phone,
      address
    },
    select: {
      id: true,
      email: true,
      userType: true,
      companyName: true,
      contactPerson: true,
      phone: true,
      address: true,
      isVerified: true,
      createdAt: true
    }
  });

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    userType: user.userType
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  logger.info(`New user registered: ${email} (${userType})`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      accessToken,
      refreshToken
    },
    timestamp: new Date().toISOString()
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw createError('Account is deactivated', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    userType: user.userType
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const userResponse = {
    id: user.id,
    email: user.email,
    userType: user.userType,
    companyName: user.companyName,
    contactPerson: user.contactPerson,
    phone: user.phone,
    address: user.address,
    isVerified: user.isVerified
  };

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      accessToken,
      refreshToken
    },
    timestamp: new Date().toISOString()
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token required', 400);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      throw createError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      userType: user.userType
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw createError('Invalid refresh token', 401);
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // In a more complete implementation, you would blacklist the token
  // For now, we'll just return a success response
  res.json({
    success: true,
    message: 'Logged out successfully',
    timestamp: new Date().toISOString()
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      userType: true,
      companyName: true,
      contactPerson: true,
      phone: true,
      address: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user },
    timestamp: new Date().toISOString()
  });
});
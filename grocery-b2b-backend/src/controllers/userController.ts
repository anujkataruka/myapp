import { Request, Response } from 'express';
import { prisma } from '../server';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { companyName, contactPerson, phone, address } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
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
      updatedAt: true
    }
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
    timestamp: new Date().toISOString()
  });
});

export const getVendors = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '20',
    search
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  const where: any = {
    userType: 'VENDOR',
    isActive: true,
    isVerified: true
  };

  if (search) {
    where.OR = [
      { companyName: { contains: search as string, mode: 'insensitive' } },
      { contactPerson: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  const [vendors, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        companyName: true,
        contactPerson: true,
        address: true,
        createdAt: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: { companyName: 'asc' },
      skip: offset,
      take: limitNum
    }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: {
      vendors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    },
    timestamp: new Date().toISOString()
  });
});

export const getVendor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const vendor = await prisma.user.findUnique({
    where: {
      id,
      userType: 'VENDOR',
      isActive: true,
      isVerified: true
    },
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      address: true,
      createdAt: true,
      _count: {
        select: {
          products: {
            where: {
              isActive: true
            }
          }
        }
      }
    }
  });

  if (!vendor) {
    throw createError('Vendor not found', 404);
  }

  res.json({
    success: true,
    data: { vendor },
    timestamp: new Date().toISOString()
  });
});
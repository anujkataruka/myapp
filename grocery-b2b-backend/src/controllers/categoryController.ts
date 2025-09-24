import { Request, Response } from 'express';
import { prisma } from '../server';
import { createError, asyncHandler } from '../middleware/errorHandler';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const { active = 'true' } = req.query;

  const where: any = {};
  if (active === 'true') {
    where.isActive = true;
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
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

  res.json({
    success: true,
    data: { categories },
    timestamp: new Date().toISOString()
  });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
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

  if (!category || !category.isActive) {
    throw createError('Category not found', 404);
  }

  res.json({
    success: true,
    data: { category },
    timestamp: new Date().toISOString()
  });
});
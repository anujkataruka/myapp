import { Request, Response } from 'express';
import { prisma } from '../server';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '20',
    search,
    category,
    vendorId,
    featured,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {
    isActive: true
  };

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (category) {
    where.categoryId = category as string;
  }

  if (vendorId) {
    where.vendorId = vendorId as string;
  }

  if (featured === 'true') {
    where.isFeatured = true;
  }

  // Build orderBy clause
  const orderBy: any = {};
  orderBy[sortBy as string] = sortOrder as string;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy,
      skip: offset,
      take: limitNum
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: {
      products,
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

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      vendor: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          phone: true,
          address: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  });

  if (!product || !product.isActive) {
    throw createError('Product not found', 404);
  }

  res.json({
    success: true,
    data: { product },
    timestamp: new Date().toISOString()
  });
});

export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    description,
    categoryId,
    price,
    unit,
    stockQuantity,
    minOrderQty = 1,
    images = [],
    isFeatured = false
  } = req.body;

  const vendorId = req.user!.userId;

  // Verify vendor exists and is active
  const vendor = await prisma.user.findUnique({
    where: { id: vendorId, userType: 'VENDOR', isActive: true }
  });

  if (!vendor) {
    throw createError('Vendor not found or inactive', 404);
  }

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId, isActive: true }
  });

  if (!category) {
    throw createError('Category not found', 404);
  }

  const product = await prisma.product.create({
    data: {
      vendorId,
      categoryId,
      name,
      description,
      price,
      unit,
      stockQuantity,
      minOrderQty,
      images,
      isFeatured
    },
    include: {
      vendor: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product },
    timestamp: new Date().toISOString()
  });
});

export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const vendorId = req.user!.userId;
  const updateData = req.body;

  // Check if product exists and belongs to vendor
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    throw createError('Product not found', 404);
  }

  if (existingProduct.vendorId !== vendorId) {
    throw createError('Not authorized to update this product', 403);
  }

  // If category is being updated, verify it exists
  if (updateData.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: updateData.categoryId, isActive: true }
    });

    if (!category) {
      throw createError('Category not found', 404);
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      vendor: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: { product },
    timestamp: new Date().toISOString()
  });
});

export const deleteProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const vendorId = req.user!.userId;

  // Check if product exists and belongs to vendor
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    throw createError('Product not found', 404);
  }

  if (existingProduct.vendorId !== vendorId) {
    throw createError('Not authorized to delete this product', 403);
  }

  // Soft delete by setting isActive to false
  await prisma.product.update({
    where: { id },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'Product deleted successfully',
    timestamp: new Date().toISOString()
  });
});

export const getVendorProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const vendorId = req.user!.userId;
  const {
    page = '1',
    limit = '20',
    search,
    category,
    active
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {
    vendorId
  };

  if (active !== undefined) {
    where.isActive = active === 'true';
  }

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (category) {
    where.categoryId = category as string;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limitNum
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: {
      products,
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
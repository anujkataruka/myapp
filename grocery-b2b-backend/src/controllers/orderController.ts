import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../server';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId, items, deliveryAddress, notes } = req.body;
  const customerId = req.user!.userId;

  // Verify customer exists
  const customer = await prisma.user.findUnique({
    where: { id: customerId, userType: 'CUSTOMER', isActive: true }
  });

  if (!customer) {
    throw createError('Customer not found', 404);
  }

  // Verify vendor exists
  const vendor = await prisma.user.findUnique({
    where: { id: vendorId, userType: 'VENDOR', isActive: true }
  });

  if (!vendor) {
    throw createError('Vendor not found', 404);
  }

  // Verify all products exist and belong to the vendor
  const productIds = items.map((item: any) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      vendorId,
      isActive: true
    }
  });

  if (products.length !== productIds.length) {
    throw createError('Some products not found or not available from this vendor', 400);
  }

  // Check stock and calculate total
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      throw createError(`Product ${item.productId} not found`, 400);
    }

    if (product.stockQuantity < item.quantity) {
      throw createError(`Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`, 400);
    }

    if (item.quantity < product.minOrderQty) {
      throw createError(`Minimum order quantity for ${product.name} is ${product.minOrderQty}`, 400);
    }

    const itemTotal = Number(product.price) * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price,
      totalPrice: itemTotal
    });
  }

  // Generate unique order number
  const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

  // Create order with items in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        customerId,
        vendorId,
        orderNumber,
        totalAmount,
        deliveryAddress,
        notes,
        orderItems: {
          create: orderItems
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
            phone: true
          }
        },
        vendor: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                images: true
              }
            }
          }
        }
      }
    });

    // Update product stock quantities
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity
          }
        }
      });
    }

    return newOrder;
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order },
    timestamp: new Date().toISOString()
  });
});

export const getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const userType = req.user!.userType;
  const {
    page = '1',
    limit = '20',
    status,
    startDate,
    endDate
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  // Build where clause based on user type
  const where: any = {};

  if (userType === 'CUSTOMER') {
    where.customerId = userId;
  } else if (userType === 'VENDOR') {
    where.vendorId = userId;
  }

  if (status) {
    where.status = status as string;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate as string);
    }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
            phone: true
          }
        },
        vendor: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limitNum
    }),
    prisma.order.count({ where })
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: {
      orders,
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

export const getOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const userType = req.user!.userType;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          email: true,
          phone: true,
          address: true
        }
      },
      vendor: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          email: true,
          phone: true,
          address: true
        }
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              unit: true,
              images: true
            }
          }
        }
      }
    }
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  // Check if user has access to this order
  if (userType === 'CUSTOMER' && order.customerId !== userId) {
    throw createError('Not authorized to view this order', 403);
  }

  if (userType === 'VENDOR' && order.vendorId !== userId) {
    throw createError('Not authorized to view this order', 403);
  }

  res.json({
    success: true,
    data: { order },
    timestamp: new Date().toISOString()
  });
});

export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user!.userId;

  // Only vendors can update order status
  if (req.user!.userType !== 'VENDOR') {
    throw createError('Only vendors can update order status', 403);
  }

  const order = await prisma.order.findUnique({
    where: { id }
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  if (order.vendorId !== userId) {
    throw createError('Not authorized to update this order', 403);
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      customer: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          email: true
        }
      },
      vendor: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true
        }
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              unit: true
            }
          }
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: { order: updatedOrder },
    timestamp: new Date().toISOString()
  });
});

export const cancelOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true
    }
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  // Check authorization
  if (order.customerId !== userId && order.vendorId !== userId) {
    throw createError('Not authorized to cancel this order', 403);
  }

  // Can only cancel pending or confirmed orders
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw createError('Order cannot be cancelled at this stage', 400);
  }

  // Cancel order and restore stock in a transaction
  const cancelledOrder = await prisma.$transaction(async (tx) => {
    // Update order status
    const updated = await tx.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Restore product stock quantities
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            increment: item.quantity
          }
        }
      });
    }

    return updated;
  });

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order: cancelledOrder },
    timestamp: new Date().toISOString()
  });
});
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createProductSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priceCents: z.number().int().positive(),
  currency: z.string().min(1),
  imageUrl: z.string().url().optional(),
  inventoryQuantity: z.number().int().nonnegative(),
});

export const productRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', async (request, reply) => {
    const { search, vendorId, cursor, limit } = request.query as Record<string, string | undefined>;
    const take = Math.min(Number(limit || 20), 100);

    const where: any = {};
    if (vendorId) where.vendorId = vendorId;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const products = await server.prisma.product.findMany({
      where,
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    const hasMore = products.length > take;
    const items = hasMore ? products.slice(0, take) : products;
    return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
  });
};


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

export const vendorRoutes: FastifyPluginAsync = async (server) => {
  server.addHook('preHandler', server.authenticate);

  // List vendor's products
  server.get('/products', async (request: any, reply) => {
    const user = request.user as { id: string; role: string };
    if (user.role !== 'VENDOR' && user.role !== 'ADMIN') return reply.forbidden('Only vendors');

    const vendor = await server.prisma.vendor.findUnique({ where: { userId: user.id } });
    if (!vendor) return reply.forbidden('Vendor profile not found');

    const products = await server.prisma.product.findMany({ where: { vendorId: vendor.id }, orderBy: { createdAt: 'desc' } });
    return { items: products };
  });

  // Create product
  server.post('/products', async (request: any, reply) => {
    const user = request.user as { id: string; role: string };
    if (user.role !== 'VENDOR' && user.role !== 'ADMIN') return reply.forbidden('Only vendors');
    const parse = createProductSchema.safeParse(request.body);
    if (!parse.success) return reply.badRequest('Invalid input');
    const vendor = await server.prisma.vendor.findUnique({ where: { userId: user.id } });
    if (!vendor) return reply.forbidden('Vendor profile not found');

    const product = await server.prisma.product.create({
      data: { vendorId: vendor.id, ...parse.data },
    });
    return reply.code(201).send(product);
  });
};


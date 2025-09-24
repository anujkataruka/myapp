import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const orderSchema = z.object({
	items: z
		.array(
			z.object({
				productId: z.string().min(1),
				quantity: z.number().int().positive(),
			})
		)
		.min(1),
	currency: z.string().min(1),
});

export const orderRoutes: FastifyPluginAsync = async (server) => {
	server.addHook('preHandler', server.authenticate);

	server.get('/', async (request: any) => {
		const user = request.user as { id: string };
		const orders = await server.prisma.order.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' },
			include: { items: true },
		});
		return { items: orders };
	});

	server.post('/', async (request: any, reply) => {
		const user = request.user as { id: string };
		const parse = orderSchema.safeParse(request.body);
		if (!parse.success) return reply.badRequest('Invalid input');
		const { items, currency } = parse.data;

		const products = await server.prisma.product.findMany({
			where: { id: { in: items.map((i) => i.productId) } },
		});
		const productMap = new Map(products.map((p) => [p.id, p]));

		let totalCents = 0;
		for (const item of items) {
			const product = productMap.get(item.productId);
			if (!product) return reply.badRequest(`Product not found: ${item.productId}`);
			if (product.inventoryQuantity < item.quantity)
				return reply.badRequest(`Insufficient inventory for ${product.title}`);
			totalCents += product.priceCents * item.quantity;
		}

		const order = await server.prisma.$transaction(async (tx) => {
			const created = await tx.order.create({
				data: {
					userId: user.id,
					totalCents,
					currency,
					status: 'PENDING',
					items: {
						create: items.map((i) => ({
							productId: i.productId,
							quantity: i.quantity,
							priceCentsAtPurchase: productMap.get(i.productId)!.priceCents,
						})),
					},
				},
				include: { items: true },
			});

			for (const item of items) {
				await tx.product.update({
					where: { id: item.productId },
					data: { inventoryQuantity: { decrement: item.quantity } },
				});
			}
			return created;
		});

		// TODO: enqueue payment processing/email in real app
		return reply.code(201).send(order);
	});
};


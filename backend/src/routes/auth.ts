import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import type { Role } from '../types/roles';

const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	role: z.enum(['USER', 'VENDOR', 'ADMIN']).default('USER'),
	businessName: z.string().optional(),
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const authRoutes: FastifyPluginAsync = async (server) => {
	server.post('/register', async (request, reply) => {
		const parse = registerSchema.safeParse(request.body);
		if (!parse.success) return reply.badRequest('Invalid input');
		const { email, password, role, businessName } = parse.data;

		const existing = await server.prisma.user.findUnique({ where: { email } });
		if (existing) return reply.conflict('Email already in use');

		const passwordHash = await bcrypt.hash(password, 10);
		const user = await server.prisma.user.create({
			data: {
				email,
				passwordHash,
				role,
			},
		});

		if (role === 'VENDOR') {
			await server.prisma.vendor.create({
				data: {
					userId: user.id,
					businessName: businessName || 'My Store',
				},
			});
		}

		const token = server.jwt.sign({ id: user.id, role: user.role as Role }, { expiresIn: '15m' });
		const refreshToken = server.jwt.sign({ id: user.id, role: user.role as Role }, { expiresIn: '7d' });
		return reply.send({ token, refreshToken });
	});

	server.post('/login', async (request, reply) => {
		const parse = loginSchema.safeParse(request.body);
		if (!parse.success) return reply.badRequest('Invalid input');
		const { email, password } = parse.data;

		const user = await server.prisma.user.findUnique({ where: { email } });
		if (!user) return reply.unauthorized('Invalid credentials');
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return reply.unauthorized('Invalid credentials');

		const token = server.jwt.sign({ id: user.id, role: user.role as Role }, { expiresIn: '15m' });
		const refreshToken = server.jwt.sign({ id: user.id, role: user.role as Role }, { expiresIn: '7d' });
		return reply.send({ token, refreshToken });
	});
};


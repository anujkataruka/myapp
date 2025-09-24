import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { vendorRoutes } from './routes/vendor';
import { orderRoutes } from './routes/orders';
import type { Role } from './types/roles';

const prisma = new PrismaClient();

export const buildServer = () => {
  const server = Fastify({ logger: true });

  server.register(sensible);
  server.register(cors, { origin: true });
  server.register(jwt, { secret: process.env.JWT_SECRET || 'dev_secret' });

  server.decorate('prisma', prisma);
  server.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.unauthorized('Invalid token');
    }
  });

  server.get('/health', async () => ({ ok: true }));

  server.register(authRoutes, { prefix: '/auth' });
  server.register(productRoutes, { prefix: '/products' });
  server.register(vendorRoutes, { prefix: '/vendor' });
  server.register(orderRoutes, { prefix: '/orders' });

  return server;
};

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (request: any, reply: any) => Promise<void>;
  }
  interface FastifyRequest {
    user?: { id: string; role: Role };
  }
}

const start = async () => {
  const server = buildServer();
  const port = Number(process.env.PORT || 4000);
  await server.listen({ port, host: '0.0.0.0' });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});


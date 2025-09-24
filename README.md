## B2B Grocery Mobile App — Sample Monorepo

This is a production-minded sample of a B2B grocery marketplace: vendors can publish products; users can browse and purchase. It’s designed to start small and scale to millions.

### Monorepo Layout
- `backend`: Fastify + TypeScript API with Prisma/PostgreSQL and JWT auth
- `mobile`: React Native (Expo) app with React Query and Zustand

### Core Features
- **Auth**: Email/password with JWT (roles: USER, VENDOR, ADMIN)
- **Vendors**: Create/update products, manage inventory
- **Users**: Browse products, cart, create orders/checkout placeholder
- **Catalog**: Search/filter products, pagination

### Tech Stack
- **Mobile**: React Native (Expo), TypeScript, React Navigation, @tanstack/react-query, Zustand, Axios
- **Backend**: Node.js, Fastify, TypeScript, Prisma ORM, PostgreSQL, Zod validation, bcrypt, JSON Web Tokens
- **Infra (local)**: SQLite for local dev (zero-setup). Postgres via Docker optional.
- **Future**: Redis cache/queues, S3 for images, CDN, Search (OpenSearch), Payments (Stripe/Adyen)

---

## System Design

### Logical Architecture
- **Mobile App**: thin client, fetches via REST, caches with React Query, optimistic UI for cart.
- **API Gateway/Service**: Fastify service exposing REST endpoints.
- **Data Layer**: PostgreSQL (normalized schema). Prisma for access and migrations.
- **Auth**: JWT access+refresh (short-lived access, longer refresh). Simple RBAC via user role.
- **Media**: Image URLs stored on S3 (stubbed locally). CDN in production.
- **Async** (later): Redis + BullMQ for jobs (inventory sync, emails, webhooks).
- **Observability**: Structured logs (pino), health checks, metrics/traces later.

### Data Model (high level)
- `User(id, email, passwordHash, role)`
- `Vendor(id, userId, businessName)`
- `Product(id, vendorId, title, description, priceCents, currency, imageUrl, inventoryQuantity)`
- `Order(id, userId, totalCents, currency, status)`
- `OrderItem(id, orderId, productId, quantity, priceCentsAtPurchase)`

### API Surface (MVP)
- `POST /auth/register` (role: USER | VENDOR)
- `POST /auth/login`
- `GET /products?search=&vendorId=&cursor=&limit=`
- `GET /vendor/products` (auth: VENDOR)
- `POST /vendor/products` (auth: VENDOR)
- `POST /orders` (auth: USER)
- `GET /orders` (auth: USER)

### Scaling Path
1) **MVP**: Single service + Postgres, vertical scaling, read/write splitting later
2) **Caching**: Redis for hot product lists, rate limiting, and session blacklists if needed
3) **Async**: Queue for events (order placed → inventory reconciliation, emails)
4) **Search**: Move from SQL ILIKE to trigram index → OpenSearch when catalog grows
5) **Files**: S3 for images + CloudFront CDN
6) **Payments**: Stripe/Adyen, webhooks via queue, idempotency keys
7) **Sharding**: Read replicas, partitioning by tenant/vendor or time for orders
8) **Multi-region**: Global CDN, regional read replicas, sticky write region, eventual consistency
9) **Security/Compliance**: Secrets manager, audit logs, PII encryption, GDPR tooling

### Security & Reliability
- Hash passwords (bcrypt), short JWT expirations, refresh rotation
- Input validation (Zod), RBAC on routes, rate limiting and request size limits
- Idempotent order creation, optimistic concurrency for inventory
- Backups, migrations, feature flags, progressive rollout

---

## Local Development

### Prerequisites
- Node.js 20+
- Docker + Docker Compose

### Quick Start
1. Backend
   - `cd backend`
   - `cp .env.example .env` and set `DATABASE_URL` and `JWT_SECRET`
   - `npm install`
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
   - `npm run prisma:seed`
   - `npm run dev` (starts on `http://localhost:4000`)
2. Mobile (Expo)
   - `cd mobile`
   - `cp .env.example .env` and set `EXPO_PUBLIC_API_URL=http://localhost:4000`
   - `npm install`
   - `npm run start`

### Environment
- Backend `.env`
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/b2b_grocery?schema=public`
  - `JWT_SECRET=replace_me`
  - `PORT=4000`
- Mobile `.env`
  - `EXPO_PUBLIC_API_URL=http://localhost:4000`

---

## Deployment (outline)
- Containerize API, deploy to Render/Fly.io or Kubernetes
- Managed Postgres (RDS/Cloud SQL). Add read replicas when needed
- Object storage (S3) + CDN (CloudFront/Fastly)
- Secrets manager, centralized logs/metrics/traces

---

## Repository Scripts
- Backend
  - `npm run dev` — start Fastify in watch mode
  - `npm run build && npm start` — production build/run
  - `npm run prisma:migrate` — apply migrations
- Mobile
  - `npm run start` — start Expo

---

## Notes
- This sample purposely keeps payments and image uploads stubbed. Wire those to real providers for production.


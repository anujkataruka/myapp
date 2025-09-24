# Grocery B2B Backend

A robust Node.js backend API for the Grocery B2B platform, built with Express.js, TypeScript, and PostgreSQL.

## 🚀 Features

- **RESTful API**: Comprehensive REST API with proper HTTP status codes
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (Customer/Vendor/Admin)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session management and caching
- **Validation**: Input validation using Joi
- **Rate Limiting**: Redis-based rate limiting
- **Error Handling**: Centralized error handling with proper logging
- **Security**: Helmet.js, CORS, and input sanitization
- **Logging**: Winston-based structured logging

## 📁 Project Structure

```
grocery-b2b-backend/
├── src/
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── server.ts          # Application entry point
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Database seeding
├── logs/                  # Application logs
└── uploads/              # File uploads (local storage)
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Setup

1. **Clone and navigate**
   ```bash
   git clone <repository-url>
   cd grocery-b2b-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/grocery_b2b"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-refresh-secret-key"
   REDIS_URL="redis://localhost:6379"
   PORT=3000
   NODE_ENV="development"
   ```

5. **Database setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run migrate
   
   # Seed sample data
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 📊 Database Schema

### Users
- Unified user table supporting both customers and vendors
- Role-based differentiation (CUSTOMER, VENDOR, ADMIN)
- Company information and contact details

### Products
- Vendor-owned products with categories
- Inventory management with stock quantities
- Featured products and pricing information

### Orders
- Customer orders with multiple line items
- Order status tracking and history
- Vendor-specific order management

### Categories
- Product categorization system
- Hierarchical category support

## 🔐 Authentication & Authorization

### JWT Token Flow
1. User logs in with credentials
2. Server validates and returns access + refresh tokens
3. Access token used for API requests (15-minute expiry)
4. Refresh token used to get new access tokens (7-day expiry)
5. Automatic token refresh handling

### Role-Based Access
- **Customer**: Can browse products, place orders, manage profile
- **Vendor**: Can manage own products, process orders, view analytics
- **Admin**: Full system access (future implementation)

## 🛡️ Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Security**: Short-lived access tokens with refresh mechanism
- **Rate Limiting**: Configurable request limits per IP
- **Input Validation**: Joi schema validation for all inputs
- **CORS Protection**: Configurable CORS policies
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Prevention**: Prisma ORM protection

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/refresh      # Refresh JWT token
POST   /api/auth/logout       # User logout
GET    /api/auth/profile      # Get user profile
```

### Products
```
GET    /api/products                    # List products (with filters)
GET    /api/products/:id               # Get product details
POST   /api/products                   # Create product (vendor only)
PUT    /api/products/:id               # Update product (vendor only)
DELETE /api/products/:id               # Delete product (vendor only)
GET    /api/products/vendor/my-products # Get vendor's products
```

### Orders
```
GET    /api/orders          # List orders (role-based filtering)
GET    /api/orders/:id      # Get order details
POST   /api/orders          # Create order (customer only)
PUT    /api/orders/:id/status # Update order status (vendor only)
POST   /api/orders/:id/cancel # Cancel order
```

### Categories
```
GET    /api/categories      # List all categories
GET    /api/categories/:id  # Get category details
```

### Users
```
PUT    /api/users/profile   # Update user profile
GET    /api/users/vendors   # List all vendors
GET    /api/users/vendors/:id # Get vendor details
```

## 📋 Request/Response Format

### Standard Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "timestamp": "2025-09-24T10:30:00Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-09-24T10:30:00Z"
}
```

### Pagination Format
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🧪 Testing

### Sample Test Accounts
```
Vendor 1: vendor1@example.com / password123
Vendor 2: vendor2@example.com / password123
Customer: customer1@example.com / password123
```

### API Testing
```bash
# Health check
curl http://localhost:3000/health

# Login example
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor1@example.com","password":"password123"}'

# Protected route example (replace JWT_TOKEN)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer JWT_TOKEN"
```

## 🔧 Development

### Available Scripts
```bash
npm run dev       # Start development server with hot reload
npm run build     # Build for production
npm run start     # Start production server
npm run migrate   # Run database migrations
npm run db:seed   # Seed database with sample data
npm run lint      # Run ESLint
npm test          # Run tests
```

### Adding New Features

1. **Create Route**: Add new route in `src/routes/`
2. **Add Controller**: Implement logic in `src/controllers/`
3. **Add Validation**: Define Joi schema in `src/utils/validation.ts`
4. **Update Types**: Add TypeScript types in `src/types/`
5. **Test**: Create tests and validate functionality

## 📊 Monitoring & Logging

### Logging
- Structured logging with Winston
- Log levels: error, warn, info, debug
- Separate error logs and combined logs
- Request/response logging

### Health Monitoring
- Health check endpoint: `GET /health`
- Database connection monitoring
- Redis connection monitoring

## 🚀 Production Deployment

### Environment Configuration
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/grocery_b2b"
REDIS_URL="redis://host:6379"
JWT_SECRET="strong-production-secret"
RATE_LIMIT_MAX_REQUESTS=100
```

### Deployment Steps
1. Build the application: `npm run build`
2. Set production environment variables
3. Run database migrations: `npm run migrate`
4. Start with process manager: `pm2 start dist/server.js`
5. Configure reverse proxy (NGINX)
6. Set up SSL certificates

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔄 Database Migrations

### Creating Migrations
```bash
# Generate migration from schema changes
npx prisma migrate dev --name description-of-changes

# Apply migrations in production
npx prisma migrate deploy
```

### Schema Updates
1. Modify `prisma/schema.prisma`
2. Generate migration: `npx prisma migrate dev`
3. Update TypeScript types: `npm run db:generate`
4. Update seed data if needed

## 📈 Performance Optimization

### Database Optimization
- Use database indexes for frequently queried fields
- Implement connection pooling
- Use read replicas for heavy read operations
- Optimize queries with Prisma

### Caching Strategy
- Cache frequently accessed data in Redis
- Implement API response caching
- Cache session data and user preferences

### Rate Limiting
- Implement per-IP rate limiting
- API-specific rate limits
- User-based rate limiting for authenticated requests

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists and migrations are applied

**Redis Connection Errors**
- Check Redis is running
- Verify REDIS_URL in .env
- Check Redis configuration

**JWT Token Issues**
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper token format in Authorization header

### Debug Mode
```bash
DEBUG=grocery-b2b:* npm run dev
```

## 📞 Support

For backend-specific issues:
- Check application logs in `logs/` directory
- Use health check endpoint for system status
- Review error logs for detailed error information
- Check database connection and Redis status

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Update tests for new features
5. Follow existing code style
6. Update documentation

---

Built with 💚 Node.js, Express.js, and TypeScript
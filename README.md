# Grocery B2B Platform

A comprehensive B2B mobile application for grocery products that connects vendors with business customers. The platform enables vendors to list their products and customers to browse, order, and manage their purchases through a beautiful, fast mobile interface.

## 🚀 Features

### For Customers
- **Product Discovery**: Browse products by category, search, and filter
- **Vendor Marketplace**: Discover and order from multiple verified vendors
- **Smart Shopping Cart**: Multi-vendor cart with intelligent grouping
- **Order Management**: Track order status from placement to delivery
- **User Profiles**: Manage company information and delivery addresses

### For Vendors
- **Product Management**: Add, edit, and manage product inventory
- **Order Processing**: Receive and process customer orders
- **Dashboard Analytics**: Track sales, inventory, and performance
- **Multi-vendor Support**: Each vendor manages their own products independently

### Technical Highlights
- **Cross-platform Mobile App**: Built with React Native for iOS and Android
- **Real-time Updates**: Live order status and inventory updates
- **Secure Authentication**: JWT-based auth with refresh tokens
- **Scalable Architecture**: Designed to handle millions of users
- **Offline Capabilities**: Cart persistence and basic offline functionality

## 🏗️ System Architecture

### Backend Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for sessions and caching
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 (configurable)
- **Rate Limiting**: Redis-based rate limiting

### Mobile Frontend Stack
- **Framework**: React Native with Expo
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation v6
- **UI Components**: React Native Paper
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form

### Infrastructure
- **Containerization**: Docker support
- **Database**: PostgreSQL with read replicas
- **Caching**: Redis cluster
- **Load Balancing**: NGINX
- **Monitoring**: Winston logging

## 📱 Screenshots & Demo

The application includes:
- Beautiful onboarding and authentication flows
- Intuitive product browsing with search and filters
- Smart shopping cart with multi-vendor support
- Comprehensive order tracking
- Vendor dashboard with analytics
- Clean, modern UI following Material Design principles

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Expo CLI for mobile development

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd grocery-b2b-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database and service configurations
   ```

4. **Database setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run migrate
   
   # Seed sample data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The backend will be running at `http://localhost:3000`

### Mobile App Setup

1. **Navigate to mobile directory**
   ```bash
   cd grocery-b2b-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For iOS (requires Xcode)
   npm run ios
   
   # For Android (requires Android Studio)
   npm run android
   
   # For web development
   npm run web
   ```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/grocery_b2b"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRE="15m"
JWT_REFRESH_EXPIRE="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
PORT=3000
NODE_ENV="development"

# Email (Optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

**Mobile App**
Update `src/constants/api.ts` to point to your backend URL:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://your-backend-url:3000/api',
  TIMEOUT: 10000,
};
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/refresh - Refresh JWT token
POST /api/auth/logout - User logout
GET  /api/auth/profile - Get user profile
```

### Product Endpoints
```
GET    /api/products - List products (with filters)
GET    /api/products/:id - Get product details
POST   /api/products - Create product (vendor only)
PUT    /api/products/:id - Update product (vendor only)
DELETE /api/products/:id - Delete product (vendor only)
GET    /api/products/vendor/my-products - Get vendor's products
```

### Order Endpoints
```
GET  /api/orders - List orders (customer/vendor specific)
GET  /api/orders/:id - Get order details
POST /api/orders - Create order (customer only)
PUT  /api/orders/:id/status - Update order status (vendor only)
POST /api/orders/:id/cancel - Cancel order
```

### Category Endpoints
```
GET /api/categories - List all categories
GET /api/categories/:id - Get category details
```

### User Endpoints
```
PUT /api/users/profile - Update user profile
GET /api/users/vendors - List all vendors
GET /api/users/vendors/:id - Get vendor details
```

## 🧪 Testing

### Test Accounts (from seed data)
```
Vendor 1: vendor1@example.com / password123
Vendor 2: vendor2@example.com / password123
Customer: customer1@example.com / password123
```

### Running Tests
```bash
# Backend tests
cd grocery-b2b-backend
npm test

# Mobile app tests
cd grocery-b2b-mobile
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Start with PM2: `pm2 start dist/server.js`
4. Configure NGINX reverse proxy
5. Set up SSL certificates

### Mobile App Deployment
```bash
# Build for production
npm run build:android  # Android APK
npm run build:ios      # iOS IPA

# Or use EAS Build for cloud building
eas build --platform all
```

## 📊 Scalability Considerations

The application is designed with scalability in mind:

### Database Scaling
- **Read Replicas**: Separate read and write operations
- **Connection Pooling**: Efficient database connections
- **Indexing**: Optimized queries for large datasets
- **Partitioning**: Table partitioning for order history

### Application Scaling
- **Horizontal Scaling**: Load balancer with multiple app instances
- **Caching Strategy**: Redis for sessions, API responses, and product data
- **Rate Limiting**: Prevent abuse and ensure fair usage
- **Background Jobs**: Async processing for heavy operations

### Performance Optimizations
- **Image Optimization**: CDN with optimized image delivery
- **API Pagination**: Efficient data loading
- **Mobile Optimization**: Offline support and intelligent prefetching
- **Database Optimization**: Query optimization and proper indexing

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet.js**: Security headers
- **SQL Injection Prevention**: Prisma ORM protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Future Roadmap

### Phase 1 (Current)
- ✅ Core B2B marketplace functionality
- ✅ Multi-vendor support
- ✅ Order management system
- ✅ Mobile-first responsive design

### Phase 2 (Next)
- 📱 Image upload and management
- 🔔 Push notifications
- 📊 Advanced analytics dashboard
- 💳 Payment gateway integration
- 🚚 Delivery tracking
- 📈 Inventory management tools

### Phase 3 (Future)
- 🤖 AI-powered product recommendations
- 📱 PWA support
- 🌐 Multi-language support
- 📊 Business intelligence dashboard
- 🔗 Third-party integrations
- 🛡️ Advanced security features

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in `/docs`
- Review the API examples in `/examples`

## 🙏 Acknowledgments

- React Native community for excellent mobile development tools
- Prisma team for the amazing database toolkit
- Material Design for UI/UX inspiration
- All contributors and testers

---

Built with ❤️ using modern web technologies for the future of B2B commerce.
# 🚀 Complete Setup Guide - Grocery B2B Platform

This guide will walk you through setting up the complete Grocery B2B platform from scratch, including both the backend API and mobile application.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 18+
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control

### Backend Requirements
- **PostgreSQL**: Version 14 or higher
- **Redis**: Version 6 or higher

### Mobile Development Requirements
- **Expo CLI**: `npm install -g @expo/cli`
- **For iOS Development**: 
  - macOS with Xcode 14+
  - iOS Simulator
- **For Android Development**:
  - Android Studio
  - Android SDK (API level 21+)
  - Android Emulator or physical device

## 🗃️ Database Setup

### PostgreSQL Installation

#### Windows
1. Download PostgreSQL from [official website](https://www.postgresql.org/download/windows/)
2. Run installer and follow setup wizard
3. Remember the password you set for 'postgres' user
4. Default port is 5432

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create a database user
createuser -s postgres
```

#### Ubuntu/Linux
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user
sudo -u postgres createuser --superuser $USER
```

### Redis Installation

#### Windows
1. Download Redis from [releases page](https://github.com/microsoftarchive/redis/releases)
2. Extract and run `redis-server.exe`

#### macOS
```bash
# Using Homebrew
brew install redis
brew services start redis
```

#### Ubuntu/Linux
```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start service
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Database Creation

1. **Connect to PostgreSQL**
   ```bash
   psql -U postgres
   ```

2. **Create database**
   ```sql
   CREATE DATABASE grocery_b2b;
   \q
   ```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd grocery-b2b-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/grocery_b2b"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
JWT_EXPIRE="15m"
JWT_REFRESH_EXPIRE="7d"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Email Configuration (Optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# File Upload Configuration
MAX_FILE_SIZE="5242880"
UPLOAD_PATH="./uploads"

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run migrate

# Seed sample data
npm run db:seed
```

### 5. Start Backend Server
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The backend server will start at `http://localhost:3000`

### 6. Verify Backend Setup
Test the health endpoint:
```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "2025-09-24T10:30:00.000Z",
  "environment": "development"
}
```

## 📱 Mobile App Setup

### 1. Navigate to Mobile Directory
```bash
cd ../grocery-b2b-mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Endpoint
Edit `src/constants/api.ts`:

```typescript
export const API_CONFIG = {
  // For Android Emulator, use 10.0.2.2
  // For iOS Simulator, use localhost
  // For physical device, use your computer's IP address
  BASE_URL: __DEV__ ? 'http://10.0.2.2:3000/api' : 'https://your-production-api.com/api',
  TIMEOUT: 10000,
};
```

**Finding Your IP Address:**
- **Windows**: `ipconfig` (look for IPv4 Address)
- **macOS/Linux**: `ifconfig` or `ip addr show`

### 4. Start Development Server
```bash
npm start
```

This will start the Expo development server and show a QR code.

### 5. Run on Device/Simulator

#### Option A: Physical Device (Recommended for beginners)
1. Install **Expo Go** app from App Store/Google Play
2. Scan the QR code with your camera (iOS) or Expo Go app (Android)

#### Option B: iOS Simulator (macOS only)
```bash
npm run ios
```

#### Option C: Android Emulator
```bash
npm run android
```

## 🧪 Testing the Application

### Backend API Testing

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

2. **User Registration**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!",
       "userType": "CUSTOMER",
       "companyName": "Test Company"
     }'
   ```

3. **User Login**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "vendor1@example.com",
       "password": "password123"
     }'
   ```

### Mobile App Testing

Use these test accounts (from seed data):

**Vendor Account:**
- Email: `vendor1@example.com`
- Password: `password123`

**Customer Account:**
- Email: `customer1@example.com`
- Password: `password123`

### Test Scenarios

1. **Customer Flow**
   - Register/Login as customer
   - Browse products and categories
   - Add products to cart from different vendors
   - Place an order
   - Track order status

2. **Vendor Flow**
   - Register/Login as vendor
   - View dashboard analytics
   - Add new products
   - Manage inventory
   - Process customer orders
   - Update order status

## 🔧 Development Tools

### Useful Commands

**Backend:**
```bash
# View logs
tail -f logs/combined.log

# Reset database
npm run migrate -- --reset
npm run db:seed

# Run in debug mode
DEBUG=* npm run dev
```

**Mobile App:**
```bash
# Clear cache
npx expo start --clear

# Run type checking
npx tsc --noEmit

# Run linter
npm run lint
```

### Development Tips

1. **Backend Development**
   - Use Postman or Thunder Client for API testing
   - Monitor logs in `logs/` directory
   - Use `npm run dev` for hot reload

2. **Mobile Development**
   - Use Expo DevTools for debugging
   - Enable "Debug remote JS" for better debugging
   - Use React Native Debugger for advanced debugging

## 🚨 Troubleshooting

### Common Issues

#### Backend Issues

**Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Solution: Ensure PostgreSQL is running and connection string is correct

**Redis Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
- Solution: Ensure Redis is running on port 6379

**JWT Secret Error**
```
JWT_SECRET is not defined
```
- Solution: Check your `.env` file has JWT_SECRET defined

#### Mobile App Issues

**Metro Bundler Issues**
```
Error: Unable to resolve module
```
- Solution: 
  ```bash
  npx expo start --clear
  rm -rf node_modules
  npm install
  ```

**Network Request Failed**
```
Network request failed
```
- Solution: Check API_CONFIG in `src/constants/api.ts` has correct IP address

**Expo CLI Issues**
- Solution: Update Expo CLI: `npm install -g @expo/cli@latest`

### Getting Help

1. **Check Logs**
   - Backend: `logs/error.log` and `logs/combined.log`
   - Mobile: Expo DevTools console

2. **Verify Services**
   ```bash
   # Check PostgreSQL
   pg_isready -h localhost -p 5432
   
   # Check Redis
   redis-cli ping
   ```

3. **Test API Manually**
   ```bash
   curl http://localhost:3000/health
   ```

## 🎯 Next Steps

Once you have the platform running:

1. **Explore Features**
   - Test all user flows
   - Try different user types (customer/vendor)
   - Test cart and order functionality

2. **Customize for Your Needs**
   - Modify product categories
   - Adjust UI themes and colors
   - Add your branding

3. **Prepare for Production**
   - Set up production database
   - Configure production environment variables
   - Set up monitoring and logging

4. **Deploy**
   - Follow deployment guides in respective README files
   - Set up CI/CD pipelines
   - Configure production hosting

## 📚 Additional Resources

- [Backend API Documentation](./grocery-b2b-backend/README.md)
- [Mobile App Documentation](./grocery-b2b-mobile/README.md)
- [System Design Document](./SYSTEM_DESIGN.md)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter issues:
1. Check this setup guide
2. Review the troubleshooting section
3. Check existing GitHub issues
4. Create a new issue with detailed error information

---

🎉 **Congratulations!** You now have a fully functional B2B grocery platform running locally. Happy coding!
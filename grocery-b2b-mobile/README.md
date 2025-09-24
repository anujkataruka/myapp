# Grocery B2B Mobile App

A beautiful, high-performance React Native mobile application for the Grocery B2B platform. Provides seamless shopping experience for customers and comprehensive management tools for vendors.

## 🌟 Features

### Customer Features
- **Product Discovery**: Browse products with advanced search and filtering
- **Multi-Vendor Shopping**: Add products from multiple vendors to cart
- **Smart Cart Management**: Organized by vendor with real-time updates
- **Order Tracking**: Real-time order status updates
- **User Profiles**: Manage company information and preferences

### Vendor Features
- **Dashboard Analytics**: Sales overview and key metrics
- **Product Management**: Add, edit, and manage inventory
- **Order Processing**: Receive and manage customer orders
- **Real-time Updates**: Live order notifications and status updates

### Technical Features
- **Offline Support**: Cart persistence and basic offline functionality
- **Real-time Sync**: Automatic data synchronization
- **Push Notifications**: Order updates and important alerts
- **Responsive Design**: Optimized for all screen sizes
- **Performance Optimized**: Fast loading with intelligent caching

## 🏗️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation v6
- **UI Library**: React Native Paper (Material Design)
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form
- **Image Handling**: React Native Fast Image
- **Storage**: Expo Secure Store for sensitive data
- **Notifications**: React Native Toast Message

## 📁 Project Structure

```
grocery-b2b-mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Common components
│   │   └── forms/          # Form components
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── customer/      # Customer screens
│   │   └── vendor/        # Vendor screens
│   ├── navigation/         # Navigation configuration
│   ├── store/             # Redux store and slices
│   │   └── slices/        # Redux slices
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── constants/         # App constants and config
├── assets/                # Static assets
└── app.json              # Expo configuration
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Setup

1. **Clone and navigate**
   ```bash
   git clone <repository-url>
   cd grocery-b2b-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   Edit `src/constants/api.ts`:
   ```typescript
   export const API_CONFIG = {
     BASE_URL: 'http://your-backend-url:3000/api',
     TIMEOUT: 10000,
   };
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS (requires macOS and Xcode)
   npm run ios
   
   # Android
   npm run android
   
   # Web (for testing)
   npm run web
   ```

## 📱 App Navigation

### Authentication Flow
- **Login Screen**: Email/password authentication
- **Register Screen**: User registration with role selection
- **Auto-login**: Persistent authentication with token refresh

### Customer Navigation
```
Main Tabs:
├── Home              # Dashboard with featured products
├── Products          # Product listing with search/filter
├── Cart              # Shopping cart management
├── Orders            # Order history and tracking
└── Profile           # User profile and settings

Stack Screens:
├── ProductDetail     # Detailed product view
├── OrderDetail       # Detailed order view
└── EditProfile       # Profile editing
```

### Vendor Navigation
```
Main Tabs:
├── Dashboard         # Analytics and quick actions
├── My Products       # Product inventory management
├── Orders            # Order processing
└── Profile           # Vendor profile and settings

Stack Screens:
├── AddProduct        # Add new product
├── EditProduct       # Edit existing product
├── ProductDetail     # Product details view
└── OrderDetail       # Order processing view
```

## 🔐 Authentication & Security

### Token Management
- **Secure Storage**: Tokens stored in Expo Secure Store
- **Auto Refresh**: Automatic token refresh on expiry
- **Session Persistence**: Persistent login across app restarts

### API Security
- **Interceptors**: Automatic token attachment to requests
- **Error Handling**: Centralized error handling and user feedback
- **Network Security**: HTTPS enforcement and request validation

## 🎨 UI/UX Design

### Design System
- **Material Design**: Following Material Design principles
- **Theme Support**: Consistent color scheme and typography
- **Responsive Layout**: Adaptive design for different screen sizes
- **Accessibility**: Screen reader support and accessibility features

### Key Components
- **Product Cards**: Beautiful product displays with images
- **Cart Management**: Intuitive cart interface with vendor grouping
- **Order Timeline**: Visual order status tracking
- **Form Components**: Consistent form design with validation

## 📊 State Management

### Redux Store Structure
```
store/
├── auth/             # Authentication state
├── products/         # Product catalog and vendor products
├── cart/             # Shopping cart state
├── orders/           # Order management
└── categories/       # Product categories
```

### Data Flow
1. **Actions**: User interactions trigger Redux actions
2. **API Calls**: Async thunks handle API communication
3. **State Updates**: Reducers update application state
4. **UI Updates**: Components re-render based on state changes
5. **Persistence**: Important data persisted locally

## 🚀 Performance Optimization

### Image Optimization
- **Fast Image**: React Native Fast Image for better performance
- **Lazy Loading**: Images loaded on demand
- **Caching**: Intelligent image caching strategy

### Data Management
- **Pagination**: Efficient data loading with pagination
- **Caching**: API response caching with Redux Persist
- **Background Sync**: Data sync in background

### Memory Management
- **Component Optimization**: Memoized components where needed
- **List Optimization**: FlatList for large data sets
- **Navigation Optimization**: Lazy loading of screens

## 🧪 Testing

### Test Accounts
Use these accounts for testing (from backend seed data):
```
Vendor: vendor1@example.com / password123
Customer: customer1@example.com / password123
```

### Development Testing
```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Cart functionality
- [ ] Order placement and tracking
- [ ] Vendor product management
- [ ] Order processing (vendor)
- [ ] Offline functionality
- [ ] Push notifications

## 📱 Platform Specific Features

### iOS Features
- **Face ID/Touch ID**: Biometric authentication (future)
- **iOS Design Guidelines**: Native iOS look and feel
- **App Store Optimization**: Optimized for iOS App Store

### Android Features
- **Material Design**: Native Android Material Design
- **Android Permissions**: Proper permission handling
- **Google Play Optimization**: Optimized for Google Play Store

## 🔔 Push Notifications

### Notification Types
- **Order Updates**: Status changes and delivery notifications
- **Vendor Alerts**: New orders and inventory alerts
- **Marketing**: Promotional notifications (opt-in)

### Implementation
- React Native Push Notifications
- Firebase Cloud Messaging (FCM)
- Background notification handling

## 🌐 Offline Support

### Offline Features
- **Cart Persistence**: Cart data stored locally
- **Basic Product Browsing**: Cached product data
- **Queue Management**: Offline actions queued for sync

### Sync Strategy
- **Auto Sync**: Automatic sync when connection restored
- **Conflict Resolution**: Handle data conflicts gracefully
- **User Feedback**: Clear offline/online status indication

## 🚀 Build & Deployment

### Development Builds
```bash
# Development build
npm run build

# Preview build
npx expo export
```

### Production Builds
```bash
# Android APK
npm run build:android

# iOS IPA
npm run build:ios

# EAS Build (recommended)
eas build --platform all
```

### App Store Deployment
```bash
# Submit to stores
eas submit --platform all

# Or manual submission
# - Use generated .apk for Google Play Store
# - Use generated .ipa for Apple App Store
```

## 🔧 Configuration

### Expo Configuration (app.json)
```json
{
  "expo": {
    "name": "Grocery B2B",
    "slug": "grocery-b2b-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android", "web"],
    "ios": {
      "bundleIdentifier": "com.groceryb2b.mobile"
    },
    "android": {
      "package": "com.groceryb2b.mobile"
    }
  }
}
```

### Environment Configuration
Update `src/constants/api.ts` for different environments:
```typescript
const getBaseUrl = () => {
  if (__DEV__) {
    return 'http://localhost:3000/api';  // Development
  }
  return 'https://api.your-domain.com/api';  // Production
};
```

## 🐛 Debugging

### Common Issues

**Network Errors**
- Check API endpoint configuration
- Verify backend server is running
- Check network connectivity

**Authentication Issues**
- Clear app storage and re-login
- Check token expiration
- Verify backend authentication

**Build Issues**
- Clear Metro cache: `npx expo start --clear`
- Delete node_modules and reinstall
- Check Expo CLI version

### Debug Tools
```bash
# React Native Debugger
npx react-native-debugger

# Flipper
npx react-native start --reset-cache

# Expo DevTools
npx expo start --dev-client
```

## 📈 Analytics & Monitoring

### Performance Monitoring
- App startup time tracking
- Screen navigation performance
- API response time monitoring
- Crash reporting and error tracking

### User Analytics
- User engagement metrics
- Feature usage tracking
- Cart abandonment analysis
- Order completion rates

## 🔮 Future Enhancements

### Planned Features
- [ ] Biometric authentication
- [ ] Advanced image upload and management
- [ ] Augmented Reality product preview
- [ ] Voice search and commands
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced filtering and sorting

### Technical Improvements
- [ ] GraphQL integration
- [ ] Advanced caching strategies
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Advanced testing coverage

## 🤝 Contributing

### Development Guidelines
1. **TypeScript**: Use TypeScript for all new code
2. **Component Structure**: Follow established component patterns
3. **State Management**: Use Redux Toolkit for state management
4. **Testing**: Add tests for new features
5. **Code Style**: Follow ESLint configuration
6. **Documentation**: Update documentation for new features

### Pull Request Process
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Run tests and linting: `npm test && npm run lint`
5. Commit changes: `git commit -m 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Create Pull Request

## 📞 Support

### Getting Help
- Check the troubleshooting section
- Review Expo documentation
- Check React Native documentation
- Create an issue on GitHub

### Common Resources
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

---

Built with 💙 React Native and modern mobile development practices
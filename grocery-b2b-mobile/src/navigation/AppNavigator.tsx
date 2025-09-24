import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useAppSelector } from '../utils/hooks';
import { theme } from '../constants/theme';

// Customer screens
import HomeScreen from '../screens/customer/HomeScreen';
import ProductListScreen from '../screens/customer/ProductListScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import OrderDetailScreen from '../screens/customer/OrderDetailScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';

// Vendor screens
import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import VendorProductsScreen from '../screens/vendor/VendorProductsScreen';
import AddProductScreen from '../screens/vendor/AddProductScreen';
import EditProductScreen from '../screens/vendor/EditProductScreen';
import VendorOrdersScreen from '../screens/vendor/VendorOrdersScreen';

export type CustomerTabParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type VendorTabParamList = {
  Dashboard: undefined;
  MyProducts: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  ProductDetail: { productId: string };
  OrderDetail: { orderId: string };
  AddProduct: undefined;
  EditProduct: { productId: string };
};

const CustomerTab = createBottomTabNavigator<CustomerTabParamList>();
const VendorTab = createBottomTabNavigator<VendorTabParamList>();
const Stack = createStackNavigator<AppStackParamList>();

const CustomerTabNavigator: React.FC = () => {
  return (
    <CustomerTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <CustomerTab.Screen name="Home" component={HomeScreen} />
      <CustomerTab.Screen name="Products" component={ProductListScreen} />
      <CustomerTab.Screen name="Cart" component={CartScreen} />
      <CustomerTab.Screen name="Orders" component={OrdersScreen} />
      <CustomerTab.Screen name="Profile" component={ProfileScreen} />
    </CustomerTab.Navigator>
  );
};

const VendorTabNavigator: React.FC = () => {
  return (
    <VendorTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'MyProducts') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <VendorTab.Screen name="Dashboard" component={VendorDashboardScreen} />
      <VendorTab.Screen name="MyProducts" component={VendorProductsScreen} />
      <VendorTab.Screen name="Orders" component={VendorOrdersScreen} />
      <VendorTab.Screen name="Profile" component={ProfileScreen} />
    </VendorTab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isVendor = user?.userType === 'VENDOR';

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={isVendor ? VendorTabNavigator : CustomerTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
      {isVendor && (
        <>
          <Stack.Screen
            name="AddProduct"
            component={AddProductScreen}
            options={{ title: 'Add Product' }}
          />
          <Stack.Screen
            name="EditProduct"
            component={EditProductScreen}
            options={{ title: 'Edit Product' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
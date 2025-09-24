export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://10.0.2.2:3000/api' : 'https://your-production-api.com/api',
  TIMEOUT: 10000,
};

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  
  // User endpoints
  UPDATE_PROFILE: '/users/profile',
  VENDORS: '/users/vendors',
  VENDOR_DETAIL: (id: string) => `/users/vendors/${id}`,
  
  // Product endpoints
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  VENDOR_PRODUCTS: '/products/vendor/my-products',
  CREATE_PRODUCT: '/products',
  UPDATE_PRODUCT: (id: string) => `/products/${id}`,
  DELETE_PRODUCT: (id: string) => `/products/${id}`,
  
  // Order endpoints
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  CREATE_ORDER: '/orders',
  UPDATE_ORDER_STATUS: (id: string) => `/orders/${id}/status`,
  CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,
  
  // Category endpoints
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (id: string) => `/categories/${id}`,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
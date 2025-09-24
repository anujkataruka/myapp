export interface User {
  id: string;
  email: string;
  userType: 'CUSTOMER' | 'VENDOR';
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userType: 'CUSTOMER' | 'VENDOR';
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  stockQuantity: number;
  minOrderQty: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    companyName?: string;
    contactPerson?: string;
    phone?: string;
    address?: string;
  };
  category?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  vendorId: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    unit: string;
    images: string[];
  };
}

export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    companyName?: string;
    contactPerson?: string;
    email: string;
    phone?: string;
  };
  vendor?: {
    id: string;
    companyName?: string;
    contactPerson?: string;
    email: string;
    phone?: string;
  };
  orderItems: OrderItem[];
}

export interface CreateOrderRequest {
  vendorId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  deliveryAddress: string;
  notes?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  unit: string;
  stockQuantity: number;
  minOrderQty?: number;
  images?: string[];
  isFeatured?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  timestamp: string;
}

export interface Vendor {
  id: string;
  companyName?: string;
  contactPerson?: string;
  address?: string;
  createdAt: string;
  _count?: {
    products: number;
  };
}
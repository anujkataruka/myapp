import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { Product, CreateProductRequest, PaginatedResponse, ApiResponse } from '../../types';

interface ProductState {
  products: Product[];
  myProducts: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    total: number;
  };
  filters: {
    search: string;
    category: string;
    vendor: string;
    featured: boolean;
  };
}

const initialState: ProductState = {
  products: [],
  myProducts: [],
  currentProduct: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    hasNext: false,
    total: 0,
  },
  filters: {
    search: '',
    category: '',
    vendor: '',
    featured: false,
  },
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: {
    page?: number;
    search?: string;
    category?: string;
    vendor?: string;
    featured?: boolean;
    refresh?: boolean;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.vendor) queryParams.append('vendorId', params.vendor);
      if (params.featured) queryParams.append('featured', 'true');

      const response: PaginatedResponse<Product> = await apiService.get(
        `${API_ENDPOINTS.PRODUCTS}?${queryParams.toString()}`
      );

      if (response.success) {
        return {
          products: response.data.products,
          pagination: response.data.pagination,
          refresh: params.refresh || false,
          filters: {
            search: params.search || '',
            category: params.category || '',
            vendor: params.vendor || '',
            featured: params.featured || false,
          },
        };
      }

      throw new Error('Failed to fetch products');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch products';
      return rejectWithValue(message);
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response: ApiResponse<{ product: Product }> = await apiService.get(
        API_ENDPOINTS.PRODUCT_DETAIL(productId)
      );

      if (response.success && response.data) {
        return response.data.product;
      }

      throw new Error(response.message || 'Failed to fetch product');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch product';
      return rejectWithValue(message);
    }
  }
);

export const fetchMyProducts = createAsyncThunk(
  'products/fetchMyProducts',
  async (params: {
    page?: number;
    search?: string;
    category?: string;
    active?: boolean;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.active !== undefined) queryParams.append('active', params.active.toString());

      const response: PaginatedResponse<Product> = await apiService.get(
        `${API_ENDPOINTS.VENDOR_PRODUCTS}?${queryParams.toString()}`
      );

      if (response.success) {
        return response.data.products;
      }

      throw new Error('Failed to fetch your products');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch your products';
      return rejectWithValue(message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: CreateProductRequest, { rejectWithValue }) => {
    try {
      const response: ApiResponse<{ product: Product }> = await apiService.post(
        API_ENDPOINTS.CREATE_PRODUCT,
        productData
      );

      if (response.success && response.data) {
        return response.data.product;
      }

      throw new Error(response.message || 'Failed to create product');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create product';
      return rejectWithValue(message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }: { 
    productId: string; 
    productData: Partial<CreateProductRequest> 
  }, { rejectWithValue }) => {
    try {
      const response: ApiResponse<{ product: Product }> = await apiService.put(
        API_ENDPOINTS.UPDATE_PRODUCT(productId),
        productData
      );

      if (response.success && response.data) {
        return response.data.product;
      }

      throw new Error(response.message || 'Failed to update product');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update product';
      return rejectWithValue(message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response: ApiResponse<void> = await apiService.delete(
        API_ENDPOINTS.DELETE_PRODUCT(productId)
      );

      if (response.success) {
        return productId;
      }

      throw new Error(response.message || 'Failed to delete product');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete product';
      return rejectWithValue(message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    resetProducts: (state) => {
      state.products = [];
      state.pagination = {
        page: 1,
        totalPages: 1,
        hasNext: false,
        total: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state, action) => {
        if (action.meta.arg.refresh || action.meta.arg.page === 1) {
          state.isLoading = true;
        } else {
          state.isLoadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        
        if (action.payload.refresh || action.payload.pagination.page === 1) {
          state.products = action.payload.products;
        } else {
          state.products = [...state.products, ...action.payload.products];
        }
        
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload as string;
      })
      // Fetch single product
      .addCase(fetchProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch my products
      .addCase(fetchMyProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProducts = action.payload;
      })
      .addCase(fetchMyProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProducts.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.myProducts.findIndex(p => p.id === action.payload.id);
        if (index >= 0) {
          state.myProducts[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProducts = state.myProducts.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentProduct, resetProducts } = productSlice.actions;
export default productSlice.reducer;
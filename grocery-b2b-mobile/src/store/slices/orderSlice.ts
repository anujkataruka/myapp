import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { Order, CreateOrderRequest, PaginatedResponse, ApiResponse } from '../../types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    total: number;
  };
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    hasNext: false,
    total: 0,
  },
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: {
    page?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response: PaginatedResponse<Order> = await apiService.get(
        `${API_ENDPOINTS.ORDERS}?${queryParams.toString()}`
      );

      if (response.success) {
        return {
          orders: response.data.orders,
          pagination: response.data.pagination,
        };
      }

      throw new Error('Failed to fetch orders');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch orders';
      return rejectWithValue(message);
    }
  }
);

export const fetchOrder = createAsyncThunk(
  'orders/fetchOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response: ApiResponse<{ order: Order }> = await apiService.get(
        API_ENDPOINTS.ORDER_DETAIL(orderId)
      );

      if (response.success && response.data) {
        return response.data.order;
      }

      throw new Error(response.message || 'Failed to fetch order');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch order';
      return rejectWithValue(message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: CreateOrderRequest, { rejectWithValue }) => {
    try {
      const response: ApiResponse<{ order: Order }> = await apiService.post(
        API_ENDPOINTS.CREATE_ORDER,
        orderData
      );

      if (response.success && response.data) {
        return response.data.order;
      }

      throw new Error(response.message || 'Failed to create order');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create order';
      return rejectWithValue(message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }: { orderId: string; status: string }, { rejectWithValue }) => {
    try {
      const response: ApiResponse<{ order: Order }> = await apiService.put(
        API_ENDPOINTS.UPDATE_ORDER_STATUS(orderId),
        { status }
      );

      if (response.success && response.data) {
        return response.data.order;
      }

      throw new Error(response.message || 'Failed to update order status');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update order status';
      return rejectWithValue(message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response: ApiResponse<{ order: Order }> = await apiService.post(
        API_ENDPOINTS.CANCEL_ORDER(orderId)
      );

      if (response.success && response.data) {
        return response.data.order;
      }

      throw new Error(response.message || 'Failed to cancel order');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to cancel order';
      return rejectWithValue(message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    resetOrders: (state) => {
      state.orders = [];
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
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single order
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index >= 0) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index >= 0) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentOrder, resetOrders } = orderSlice.actions;
export default orderSlice.reducer;
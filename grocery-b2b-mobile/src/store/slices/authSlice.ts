import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

import { apiService } from '../../services/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../constants/api';
import { User, LoginRequest, RegisterRequest, ApiResponse, AuthTokens } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response: ApiResponse<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }> = await apiService.post(API_ENDPOINTS.LOGIN, credentials);

      if (response.success && response.data) {
        // Store tokens securely
        await apiService.setAuthTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });

        // Store user data
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.data.user)
        );

        Toast.show({
          type: 'success',
          text1: 'Welcome back!',
          text2: `Logged in as ${response.data.user.companyName || response.data.user.email}`,
        });

        return response.data.user;
      }

      throw new Error(response.message || 'Login failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response: ApiResponse<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }> = await apiService.post(API_ENDPOINTS.REGISTER, userData);

      if (response.success && response.data) {
        // Store tokens securely
        await apiService.setAuthTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });

        // Store user data
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.data.user)
        );

        Toast.show({
          type: 'success',
          text1: 'Registration Successful!',
          text2: 'Welcome to Grocery B2B',
        });

        return response.data.user;
      }

      throw new Error(response.message || 'Registration failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout endpoint
      await apiService.post(API_ENDPOINTS.LOGOUT);
      
      // Clear tokens and user data
      await apiService.clearAuthTokens();

      Toast.show({
        type: 'info',
        text1: 'Logged Out',
        text2: 'Come back soon!',
      });

      return null;
    } catch (error: any) {
      // Even if the API call fails, we should still clear local data
      await apiService.clearAuthTokens();
      return null;
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadUserFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

      if (userData && accessToken) {
        return JSON.parse(userData) as User;
      }

      return null;
    } catch (error) {
      return null;
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response: ApiResponse<{ user: User }> = await apiService.get(API_ENDPOINTS.PROFILE);
      
      if (response.success && response.data) {
        // Update stored user data
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.data.user)
        );
        
        return response.data.user;
      }

      throw new Error(response.message || 'Failed to fetch profile');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch profile';
      return rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updateData: Partial<User>, { rejectWithValue }) => {
    try {
      const response: ApiResponse<{ user: User }> = await apiService.put(
        API_ENDPOINTS.UPDATE_PROFILE,
        updateData
      );
      
      if (response.success && response.data) {
        // Update stored user data
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.data.user)
        );

        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Your profile has been updated successfully',
        });
        
        return response.data.user;
      }

      throw new Error(response.message || 'Failed to update profile');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      // Load user from storage
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
        }
      })
      // Get profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
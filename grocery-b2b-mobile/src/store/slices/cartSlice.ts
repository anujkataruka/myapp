import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '../../types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  return { totalItems, totalAmount };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.productId === product.id);

      if (existingItemIndex >= 0) {
        // Update existing item
        const newQuantity = state.items[existingItemIndex].quantity + quantity;
        state.items[existingItemIndex].quantity = Math.min(newQuantity, product.stockQuantity);
      } else {
        // Add new item
        state.items.push({
          productId: product.id,
          product,
          quantity: Math.min(quantity, product.stockQuantity),
          vendorId: product.vendorId,
        });
      }

      const { totalItems, totalAmount } = calculateTotals(state.items);
      state.totalItems = totalItems;
      state.totalAmount = totalAmount;
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.productId !== productId);

      const { totalItems, totalAmount } = calculateTotals(state.items);
      state.totalItems = totalItems;
      state.totalAmount = totalAmount;
    },

    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.productId === productId);

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items.splice(itemIndex, 1);
        } else {
          // Update quantity (respecting stock limits)
          const maxQuantity = state.items[itemIndex].product.stockQuantity;
          state.items[itemIndex].quantity = Math.min(quantity, maxQuantity);
        }

        const { totalItems, totalAmount } = calculateTotals(state.items);
        state.totalItems = totalItems;
        state.totalAmount = totalAmount;
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },

    clearVendorCart: (state, action: PayloadAction<string>) => {
      const vendorId = action.payload;
      state.items = state.items.filter(item => item.vendorId !== vendorId);

      const { totalItems, totalAmount } = calculateTotals(state.items);
      state.totalItems = totalItems;
      state.totalAmount = totalAmount;
    },

    syncCartWithProducts: (state, action: PayloadAction<Product[]>) => {
      const products = action.payload;
      
      // Update cart items with latest product data and remove unavailable products
      state.items = state.items
        .map(item => {
          const updatedProduct = products.find(p => p.id === item.productId);
          if (updatedProduct && updatedProduct.isActive) {
            return {
              ...item,
              product: updatedProduct,
              quantity: Math.min(item.quantity, updatedProduct.stockQuantity),
            };
          }
          return null;
        })
        .filter((item): item is CartItem => item !== null);

      const { totalItems, totalAmount } = calculateTotals(state.items);
      state.totalItems = totalItems;
      state.totalAmount = totalAmount;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  clearVendorCart,
  syncCartWithProducts,
} = cartSlice.actions;

export default cartSlice.reducer;
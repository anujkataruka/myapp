import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  Title,
  Paragraph,
  Divider,
  TextInput,
  Dialog,
  Portal,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { updateQuantity, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';
import { CartItem } from '../../types';
import { theme } from '../../constants/theme';

const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { items, totalItems, totalAmount } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading } = useAppSelector((state) => state.orders);

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');
  const [checkoutDialogVisible, setCheckoutDialogVisible] = useState(false);

  // Group cart items by vendor
  const itemsByVendor = items.reduce((acc, item) => {
    if (!acc[item.vendorId]) {
      acc[item.vendorId] = [];
    }
    acc[item.vendorId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    dispatch(updateQuantity({ productId, quantity: newQuantity }));
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove ${productName} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeFromCart(productId)),
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => dispatch(clearCart()),
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Delivery Address Required',
        text2: 'Please enter your delivery address',
      });
      return;
    }

    // Create orders for each vendor
    const vendors = Object.keys(itemsByVendor);
    
    try {
      for (const vendorId of vendors) {
        const vendorItems = itemsByVendor[vendorId];
        const orderData = {
          vendorId,
          items: vendorItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          deliveryAddress: deliveryAddress.trim(),
          notes: notes.trim() || undefined,
        };

        await dispatch(createOrder(orderData)).unwrap();
      }

      dispatch(clearCart());
      setCheckoutDialogVisible(false);
      
      Toast.show({
        type: 'success',
        text1: 'Orders Placed Successfully',
        text2: `${vendors.length} order(s) created`,
      });

      navigation.navigate('Orders' as any);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: error.message || 'Please try again',
      });
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <Card style={styles.itemCard}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.product.name}</Text>
            <Text style={styles.itemPrice}>
              ${item.product.price.toFixed(2)} per {item.product.unit}
            </Text>
            <Text style={styles.itemVendor}>
              by {item.product.vendor?.companyName}
            </Text>
          </View>
          
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleRemoveItem(item.productId, item.product.name)}
          />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.quantityContainer}>
          <View style={styles.quantityControls}>
            <IconButton
              icon="minus"
              size={20}
              disabled={item.quantity <= item.product.minOrderQty}
              onPress={() => handleQuantityChange(item.productId, item.quantity - 1)}
            />
            
            <TextInput
              value={item.quantity.toString()}
              onChangeText={(text) => {
                const quantity = parseInt(text) || item.product.minOrderQty;
                const maxQuantity = Math.min(quantity, item.product.stockQuantity);
                const minQuantity = Math.max(maxQuantity, item.product.minOrderQty);
                handleQuantityChange(item.productId, minQuantity);
              }}
              keyboardType="numeric"
              style={styles.quantityInput}
              dense
            />
            
            <IconButton
              icon="plus"
              size={20}
              disabled={item.quantity >= item.product.stockQuantity}
              onPress={() => handleQuantityChange(item.productId, item.quantity + 1)}
            />
          </View>

          <Text style={styles.itemTotal}>
            ${(item.product.price * item.quantity).toFixed(2)}
          </Text>
        </View>

        <Text style={styles.stockInfo}>
          Available: {item.product.stockQuantity} {item.product.unit}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderVendorSection = (vendorId: string, vendorItems: CartItem[]) => {
    const vendorName = vendorItems[0].product.vendor?.companyName || 'Unknown Vendor';
    const vendorTotal = vendorItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity), 
      0
    );

    return (
      <View key={vendorId} style={styles.vendorSection}>
        <Card style={styles.vendorCard}>
          <Card.Content>
            <Title style={styles.vendorName}>{vendorName}</Title>
            <Text style={styles.vendorTotal}>
              Subtotal: ${vendorTotal.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>
        
        <FlatList
          data={vendorItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.productId}
          scrollEnabled={false}
        />
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Products' as any)}
          style={styles.shopButton}
        >
          Start Shopping
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.entries(itemsByVendor)}
        renderItem={({ item: [vendorId, vendorItems] }) => 
          renderVendorSection(vendorId, vendorItems)
        }
        keyExtractor={([vendorId]) => vendorId}
        contentContainerStyle={styles.cartList}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Title style={styles.headerTitle}>Shopping Cart</Title>
            <Text style={styles.headerSubtitle}>
              {totalItems} items from {Object.keys(itemsByVendor).length} vendor(s)
            </Text>
            {items.length > 0 && (
              <Button
                mode="text"
                onPress={handleClearCart}
                icon="delete-sweep"
                labelStyle={styles.clearButtonLabel}
              >
                Clear Cart
              </Button>
            )}
          </View>
        )}
      />

      {/* Cart Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>{totalItems}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
          </View>

          <Button
            mode="contained"
            onPress={() => setCheckoutDialogVisible(true)}
            style={styles.checkoutButton}
            contentStyle={styles.checkoutButtonContent}
          >
            Proceed to Checkout
          </Button>
        </Card.Content>
      </Card>

      {/* Checkout Dialog */}
      <Portal>
        <Dialog
          visible={checkoutDialogVisible}
          onDismiss={() => setCheckoutDialogVisible(false)}
        >
          <Dialog.Title>Checkout</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Delivery Address *"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={3}
              style={styles.addressInput}
            />
            
            <TextInput
              label="Special Instructions (Optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
              style={styles.notesInput}
            />

            <View style={styles.orderSummary}>
              <Text style={styles.orderSummaryTitle}>Order Summary:</Text>
              {Object.entries(itemsByVendor).map(([vendorId, vendorItems]) => {
                const vendorName = vendorItems[0].product.vendor?.companyName || 'Unknown Vendor';
                const vendorTotal = vendorItems.reduce(
                  (sum, item) => sum + (item.product.price * item.quantity), 
                  0
                );
                return (
                  <Text key={vendorId} style={styles.orderSummaryLine}>
                    {vendorName}: ${vendorTotal.toFixed(2)}
                  </Text>
                );
              })}
              <Text style={styles.orderSummaryTotal}>
                Total: ${totalAmount.toFixed(2)}
              </Text>
            </View>
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={() => setCheckoutDialogVisible(false)}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCheckout}
              loading={isLoading}
              disabled={isLoading || !deliveryAddress.trim()}
            >
              Place Order
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.md,
  },
  clearButtonLabel: {
    color: theme.colors.error,
  },
  cartList: {
    paddingBottom: theme.spacing.lg,
  },
  vendorSection: {
    marginBottom: theme.spacing.lg,
  },
  vendorCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
  },
  vendorName: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  vendorTotal: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  itemCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.small,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  itemPrice: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  itemVendor: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    width: 60,
    textAlign: 'center',
    marginHorizontal: theme.spacing.sm,
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  stockInfo: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: theme.spacing.sm,
  },
  summaryCard: {
    margin: theme.spacing.lg,
    ...theme.shadow.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  checkoutButton: {
    marginTop: theme.spacing.md,
  },
  checkoutButtonContent: {
    paddingVertical: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.lg,
  },
  shopButton: {
    marginTop: theme.spacing.md,
  },
  addressInput: {
    marginBottom: theme.spacing.md,
  },
  notesInput: {
    marginBottom: theme.spacing.md,
  },
  orderSummary: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  orderSummaryLine: {
    fontSize: 14,
    marginBottom: theme.spacing.xs,
  },
  orderSummaryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.placeholder,
    paddingTop: theme.spacing.sm,
  },
});

export default CartScreen;
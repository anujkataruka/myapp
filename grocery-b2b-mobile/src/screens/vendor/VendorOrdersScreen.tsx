import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  Title,
  Menu,
  Divider,
  FAB,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { fetchOrders, updateOrderStatus } from '../../store/slices/orderSlice';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { Order } from '../../types';
import { theme } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';

type VendorOrdersScreenNavigationProp = StackNavigationProp<AppStackParamList>;

const VendorOrdersScreen: React.FC = () => {
  const navigation = useNavigation<VendorOrdersScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { orders, isLoading, pagination } = useAppSelector((state) => state.orders);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  useEffect(() => {
    loadOrders(true);
  }, [statusFilter]);

  const loadOrders = async (refresh = false) => {
    const params: any = {
      page: refresh ? 1 : pagination.page + 1,
    };
    
    if (statusFilter) {
      params.status = statusFilter;
    }

    dispatch(fetchOrders(params));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders(true);
    setRefreshing(false);
  };

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetail', { orderId });
  };

  const handleStatusUpdate = (order: Order, newStatus: string) => {
    const statusMessages = {
      CONFIRMED: 'confirm',
      PROCESSING: 'mark as processing',
      SHIPPED: 'mark as shipped',
      DELIVERED: 'mark as delivered',
      CANCELLED: 'cancel',
    };

    Alert.alert(
      'Update Order Status',
      `Are you sure you want to ${statusMessages[newStatus as keyof typeof statusMessages]} order #${order.orderNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await dispatch(updateOrderStatus({ orderId: order.id, status: newStatus })).unwrap();
              Toast.show({
                type: 'success',
                text1: 'Status Updated',
                text2: `Order #${order.orderNumber} has been updated`,
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: error.message || 'Please try again',
              });
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return theme.colors.warning;
      case 'CONFIRMED':
        return '#2196F3';
      case 'PROCESSING':
        return '#FF9800';
      case 'SHIPPED':
        return '#9C27B0';
      case 'DELIVERED':
        return theme.colors.success;
      case 'CANCELLED':
      case 'REFUNDED':
        return theme.colors.error;
      default:
        return theme.colors.placeholder;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PROCESSING',
      PROCESSING: 'SHIPPED',
      SHIPPED: 'DELIVERED',
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  const canUpdateStatus = (status: string) => {
    return ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(status);
  };

  const canCancelOrder = (status: string) => {
    return ['PENDING', 'CONFIRMED'].includes(status);
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const nextStatus = getNextStatus(item.status);

    return (
      <TouchableOpacity onPress={() => handleOrderPress(item.id)}>
        <Card style={styles.orderCard}>
          <Card.Content>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
                <Text style={styles.orderDate}>
                  {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                </Text>
                <Text style={styles.orderTime}>
                  {format(new Date(item.createdAt), 'hh:mm a')}
                </Text>
              </View>
              
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.statusText}
              >
                {getStatusLabel(item.status)}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.orderDetails}>
              <Text style={styles.customerName}>
                Customer: {item.customer?.companyName || item.customer?.email}
              </Text>
              
              <Text style={styles.itemCount}>
                {item.orderItems.length} item(s)
              </Text>
              
              <Text style={styles.orderTotal}>
                Total: ${item.totalAmount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.orderItems}>
              {item.orderItems.slice(0, 2).map((orderItem) => (
                <Text key={orderItem.id} style={styles.itemName} numberOfLines={1}>
                  • {orderItem.product?.name} ({orderItem.quantity} {orderItem.product?.unit})
                </Text>
              ))}
              {item.orderItems.length > 2 && (
                <Text style={styles.moreItems}>
                  +{item.orderItems.length - 2} more item(s)
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.orderActions}>
              {canUpdateStatus(item.status) && nextStatus && (
                <Button
                  mode="contained"
                  onPress={() => handleStatusUpdate(item, nextStatus)}
                  style={styles.actionButton}
                  compact
                >
                  {nextStatus === 'CONFIRMED' && 'Confirm'}
                  {nextStatus === 'PROCESSING' && 'Start Processing'}
                  {nextStatus === 'SHIPPED' && 'Mark Shipped'}
                  {nextStatus === 'DELIVERED' && 'Mark Delivered'}
                </Button>
              )}
              
              {canCancelOrder(item.status) && (
                <Button
                  mode="outlined"
                  onPress={() => handleStatusUpdate(item, 'CANCELLED')}
                  style={[styles.actionButton, styles.cancelActionButton]}
                  labelStyle={styles.cancelActionButtonLabel}
                  compact
                >
                  Cancel
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {statusFilter ? `No ${statusFilter.toLowerCase()} orders found` : 'No orders yet'}
      </Text>
      <Text style={styles.emptySubtext}>
        Orders from customers will appear here
      </Text>
    </View>
  );

  if (isLoading && orders.length === 0) {
    return <LoadingScreen message="Loading orders..." />;
  }

  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Title style={styles.headerTitle}>Orders</Title>
          {pendingOrdersCount > 0 && (
            <Text style={styles.pendingCount}>
              {pendingOrdersCount} pending order(s)
            </Text>
          )}
        </View>
        
        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setStatusMenuVisible(true)}
              icon="filter"
            >
              {statusFilter ? getStatusLabel(statusFilter) : 'All Orders'}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setStatusFilter('');
              setStatusMenuVisible(false);
            }}
            title="All Orders"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setStatusFilter('PENDING');
              setStatusMenuVisible(false);
            }}
            title="Pending"
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter('CONFIRMED');
              setStatusMenuVisible(false);
            }}
            title="Confirmed"
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter('PROCESSING');
              setStatusMenuVisible(false);
            }}
            title="Processing"
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter('SHIPPED');
              setStatusMenuVisible(false);
            }}
            title="Shipped"
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter('DELIVERED');
              setStatusMenuVisible(false);
            }}
            title="Delivered"
          />
        </Menu>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (pagination.hasNext && !isLoading) {
            loadOrders(false);
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
      />

      {/* Refresh FAB */}
      <FAB
        icon="refresh"
        onPress={onRefresh}
        style={styles.fab}
        loading={refreshing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.small,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pendingCount: {
    fontSize: 14,
    color: theme.colors.warning,
    fontWeight: '500',
    marginTop: theme.spacing.xs,
  },
  ordersList: {
    padding: theme.spacing.lg,
  },
  orderCard: {
    marginBottom: theme.spacing.md,
    ...theme.shadow.small,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  orderDate: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  orderTime: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  statusChip: {
    marginLeft: theme.spacing.md,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  divider: {
    marginBottom: theme.spacing.md,
  },
  orderDetails: {
    marginBottom: theme.spacing.md,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  itemCount: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.xs,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  orderItems: {
    marginBottom: theme.spacing.md,
  },
  itemName: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  moreItems: {
    fontSize: 14,
    color: theme.colors.placeholder,
    fontStyle: 'italic',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  actionButton: {
    minWidth: 100,
  },
  cancelActionButton: {
    borderColor: theme.colors.error,
  },
  cancelActionButtonLabel: {
    color: theme.colors.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default VendorOrdersScreen;
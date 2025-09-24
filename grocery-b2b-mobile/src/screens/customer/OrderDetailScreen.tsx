import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Chip,
  Button,
  Divider,
  List,
} from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { fetchOrder, cancelOrder } from '../../store/slices/orderSlice';
import { theme } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';

const OrderDetailScreen: React.FC = () => {
  const route = useRoute();
  const dispatch = useAppDispatch();
  
  const { orderId } = route.params as { orderId: string };
  const { currentOrder: order, isLoading } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrder(orderId));
  }, [orderId]);

  const handleCancelOrder = async () => {
    try {
      await dispatch(cancelOrder(orderId)).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Order Cancelled',
        text2: 'Your order has been cancelled successfully',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Cancellation Failed',
        text2: error.message || 'Please try again',
      });
    }
  };

  const onRefresh = () => {
    dispatch(fetchOrder(orderId));
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

  const canCancelOrder = (status: string) => {
    return ['PENDING', 'CONFIRMED'].includes(status);
  };

  if (isLoading || !order) {
    return <LoadingScreen message="Loading order details..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      {/* Order Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Title style={styles.orderNumber}>#{order.orderNumber}</Title>
              <Text style={styles.orderDate}>
                Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}
              </Text>
              <Text style={styles.orderTime}>
                at {format(new Date(order.createdAt), 'hh:mm a')}
              </Text>
            </View>
            
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
              textStyle={styles.statusText}
            >
              {getStatusLabel(order.status)}
            </Chip>
          </View>

          {canCancelOrder(order.status) && (
            <Button
              mode="outlined"
              onPress={handleCancelOrder}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
              icon="cancel"
            >
              Cancel Order
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Vendor Information */}
      <Card style={styles.vendorCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Vendor Information</Title>
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>
              {order.vendor?.companyName || 'Unknown Vendor'}
            </Text>
            {order.vendor?.contactPerson && (
              <Text style={styles.vendorContact}>
                Contact: {order.vendor.contactPerson}
              </Text>
            )}
            {order.vendor?.email && (
              <Text style={styles.vendorEmail}>
                Email: {order.vendor.email}
              </Text>
            )}
            {order.vendor?.phone && (
              <Text style={styles.vendorPhone}>
                Phone: {order.vendor.phone}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Order Items */}
      <Card style={styles.itemsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Order Items</Title>
          {order.orderItems.map((item) => (
            <List.Item
              key={item.id}
              title={item.product?.name || 'Unknown Product'}
              description={`${item.quantity} ${item.product?.unit} × $${item.unitPrice.toFixed(2)}`}
              right={() => (
                <Text style={styles.itemTotal}>
                  ${item.totalPrice.toFixed(2)}
                </Text>
              )}
              style={styles.orderItem}
            />
          ))}
          
          <Divider style={styles.divider} />
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>
              ${order.totalAmount.toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Delivery Information */}
      <Card style={styles.deliveryCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Delivery Information</Title>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>Address:</Text>
            <Text style={styles.deliveryAddress}>{order.deliveryAddress}</Text>
          </View>
          
          {order.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Special Instructions:</Text>
              <Text style={styles.notes}>{order.notes}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Order Timeline */}
      <Card style={styles.timelineCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Order Status</Title>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineMarker, styles.completedMarker]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Order Placed</Text>
                <Text style={styles.timelineDate}>
                  {format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a')}
                </Text>
              </View>
            </View>

            {order.status !== 'PENDING' && order.status !== 'CANCELLED' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineMarker, styles.completedMarker]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Order Confirmed</Text>
                  <Text style={styles.timelineDate}>
                    {format(new Date(order.updatedAt), 'MMM dd, yyyy hh:mm a')}
                  </Text>
                </View>
              </View>
            )}

            {['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineMarker, styles.completedMarker]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Processing</Text>
                </View>
              </View>
            )}

            {['SHIPPED', 'DELIVERED'].includes(order.status) && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineMarker, styles.completedMarker]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Shipped</Text>
                </View>
              </View>
            )}

            {order.status === 'DELIVERED' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineMarker, styles.completedMarker]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Delivered</Text>
                </View>
              </View>
            )}

            {order.status === 'CANCELLED' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineMarker, styles.cancelledMarker]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Order Cancelled</Text>
                  <Text style={styles.timelineDate}>
                    {format(new Date(order.updatedAt), 'MMM dd, yyyy hh:mm a')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerCard: {
    margin: theme.spacing.lg,
    ...theme.shadow.medium,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  orderDate: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  orderTime: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  statusChip: {
    marginLeft: theme.spacing.md,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: theme.spacing.md,
    borderColor: theme.colors.error,
  },
  cancelButtonLabel: {
    color: theme.colors.error,
  },
  vendorCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  vendorInfo: {
    gap: theme.spacing.sm,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  vendorContact: {
    fontSize: 14,
    color: theme.colors.text,
  },
  vendorEmail: {
    fontSize: 14,
    color: theme.colors.text,
  },
  vendorPhone: {
    fontSize: 14,
    color: theme.colors.text,
  },
  itemsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  orderItem: {
    paddingHorizontal: 0,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  deliveryCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  deliveryInfo: {
    marginBottom: theme.spacing.md,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  deliveryAddress: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  notesContainer: {
    marginTop: theme.spacing.md,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  notes: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  timelineCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  timeline: {
    paddingLeft: theme.spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  timelineMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
    marginTop: 4,
  },
  completedMarker: {
    backgroundColor: theme.colors.success,
  },
  cancelledMarker: {
    backgroundColor: theme.colors.error,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  timelineDate: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
});

export default OrderDetailScreen;
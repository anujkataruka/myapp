import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Chip,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { fetchMyProducts } from '../../store/slices/productSlice';
import { fetchOrders } from '../../store/slices/orderSlice';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';

type VendorDashboardScreenNavigationProp = StackNavigationProp<AppStackParamList>;

const VendorDashboardScreen: React.FC = () => {
  const navigation = useNavigation<VendorDashboardScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { myProducts, isLoading: productsLoading } = useAppSelector((state) => state.products);
  const { orders, isLoading: ordersLoading } = useAppSelector((state) => state.orders);

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchMyProducts({})),
        dispatch(fetchOrders({})),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const navigateToProducts = () => {
    navigation.navigate('MyProducts' as any);
  };

  const navigateToOrders = () => {
    navigation.navigate('Orders' as any);
  };

  const navigateToAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetail', { orderId });
  };

  // Calculate dashboard metrics
  const activeProducts = myProducts.filter(p => p.isActive).length;
  const totalProducts = myProducts.length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status))
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const recentProducts = myProducts.slice(0, 3);
  const recentOrders = orders.slice(0, 3);

  if ((productsLoading || ordersLoading) && myProducts.length === 0 && orders.length === 0) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.companyName}>
              {user?.companyName || user?.contactPerson || 'Vendor'}
            </Text>
          </View>
          <Avatar.Icon size={50} icon="storefront" style={styles.avatar} />
        </View>
      </View>

      {/* Metrics Cards */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <Card.Content style={styles.metricContent}>
              <Text style={styles.metricValue}>{activeProducts}</Text>
              <Text style={styles.metricLabel}>Active Products</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.metricCard}>
            <Card.Content style={styles.metricContent}>
              <Text style={styles.metricValue}>{pendingOrders}</Text>
              <Text style={styles.metricLabel}>Pending Orders</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <Card.Content style={styles.metricContent}>
              <Text style={styles.metricValue}>{totalOrders}</Text>
              <Text style={styles.metricLabel}>Total Orders</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.metricCard}>
            <Card.Content style={styles.metricContent}>
              <Text style={styles.metricValue}>${totalRevenue.toFixed(0)}</Text>
              <Text style={styles.metricLabel}>Revenue</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Quick Actions</Title>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={navigateToAddProduct}
          >
            <Card style={styles.quickActionContent}>
              <Card.Content style={styles.quickActionInfo}>
                <Avatar.Icon size={50} icon="plus" />
                <Text style={styles.quickActionTitle}>Add Product</Text>
                <Text style={styles.quickActionSubtitle}>
                  List a new product
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={navigateToProducts}
          >
            <Card style={styles.quickActionContent}>
              <Card.Content style={styles.quickActionInfo}>
                <Avatar.Icon size={50} icon="package-variant" />
                <Text style={styles.quickActionTitle}>My Products</Text>
                <Text style={styles.quickActionSubtitle}>
                  Manage inventory
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={navigateToOrders}
          >
            <Card style={styles.quickActionContent}>
              <Card.Content style={styles.quickActionInfo}>
                <Avatar.Icon size={50} icon="clipboard-list" />
                <Text style={styles.quickActionTitle}>Orders</Text>
                <Text style={styles.quickActionSubtitle}>
                  Process orders
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Profile' as any)}
          >
            <Card style={styles.quickActionContent}>
              <Card.Content style={styles.quickActionInfo}>
                <Avatar.Icon size={50} icon="account-cog" />
                <Text style={styles.quickActionTitle}>Settings</Text>
                <Text style={styles.quickActionSubtitle}>
                  Update profile
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Products */}
      {recentProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Recent Products</Title>
            <Button
              mode="text"
              onPress={navigateToProducts}
              labelStyle={styles.viewAllLabel}
            >
              View All
            </Button>
          </View>
          
          {recentProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => handleProductPress(product.id)}
            >
              <Card style={styles.itemCard}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{product.name}</Text>
                      <Text style={styles.itemPrice}>
                        ${product.price.toFixed(2)} / {product.unit}
                      </Text>
                      <Text style={styles.itemStock}>
                        Stock: {product.stockQuantity} {product.unit}
                      </Text>
                    </View>
                    
                    <View style={styles.itemStatus}>
                      <Chip
                        style={[
                          styles.statusChip,
                          { backgroundColor: product.isActive ? theme.colors.success : theme.colors.error }
                        ]}
                        textStyle={styles.statusText}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Chip>
                      {product.isFeatured && (
                        <Chip
                          icon="star"
                          style={styles.featuredChip}
                          compact
                        >
                          Featured
                        </Chip>
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Recent Orders</Title>
            <Button
              mode="text"
              onPress={navigateToOrders}
              labelStyle={styles.viewAllLabel}
            >
              View All
            </Button>
          </View>
          
          {recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => handleOrderPress(order.id)}
            >
              <Card style={styles.itemCard}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>#{order.orderNumber}</Text>
                      <Text style={styles.itemCustomer}>
                        {order.customer?.companyName || order.customer?.email}
                      </Text>
                      <Text style={styles.itemTotal}>
                        ${order.totalAmount.toFixed(2)}
                      </Text>
                    </View>
                    
                    <View style={styles.itemStatus}>
                      <Chip
                        style={[
                          styles.statusChip,
                          { backgroundColor: getOrderStatusColor(order.status) }
                        ]}
                        textStyle={styles.statusText}
                      >
                        {order.status}
                      </Chip>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty State for New Vendors */}
      {myProducts.length === 0 && (
        <View style={styles.emptyContainer}>
          <Avatar.Icon size={80} icon="storefront" style={styles.emptyIcon} />
          <Title style={styles.emptyTitle}>Welcome to Your Store!</Title>
          <Paragraph style={styles.emptyText}>
            Start by adding your first product to begin selling to customers.
          </Paragraph>
          <Button
            mode="contained"
            onPress={navigateToAddProduct}
            style={styles.emptyButton}
            icon="plus"
          >
            Add Your First Product
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

const getOrderStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '#FF9800';
    case 'CONFIRMED':
      return '#2196F3';
    case 'PROCESSING':
      return '#9C27B0';
    case 'SHIPPED':
      return '#607D8B';
    case 'DELIVERED':
      return '#4CAF50';
    case 'CANCELLED':
    case 'REFUNDED':
      return '#F44336';
    default:
      return '#757575';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: theme.spacing.xs,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  metricsContainer: {
    padding: theme.spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  metricCard: {
    width: '48%',
    ...theme.shadow.small,
  },
  metricContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  metricLabel: {
    fontSize: 14,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  viewAllLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  quickActionCard: {
    width: '48%',
  },
  quickActionContent: {
    ...theme.shadow.small,
  },
  quickActionInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  itemCard: {
    marginBottom: theme.spacing.md,
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
  itemStock: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  itemCustomer: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  itemStatus: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  statusChip: {
    marginBottom: theme.spacing.xs,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  featuredChip: {
    backgroundColor: theme.colors.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyIcon: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    marginTop: theme.spacing.md,
  },
});

export default VendorDashboardScreen;
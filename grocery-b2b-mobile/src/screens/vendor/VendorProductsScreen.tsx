import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Title,
  Chip,
  Menu,
  Divider,
  FAB,
  Searchbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { fetchMyProducts, deleteProduct } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { Product } from '../../types';
import { theme } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';

type VendorProductsScreenNavigationProp = StackNavigationProp<AppStackParamList>;

const VendorProductsScreen: React.FC = () => {
  const navigation = useNavigation<VendorProductsScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { myProducts, isLoading } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [searchQuery, statusFilter, categoryFilter]);

  const loadProducts = async () => {
    const params: any = {};
    
    if (searchQuery) params.search = searchQuery;
    if (statusFilter) params.active = statusFilter === 'active';
    if (categoryFilter) params.category = categoryFilter;

    dispatch(fetchMyProducts(params));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleEditProduct = (productId: string) => {
    navigation.navigate('EditProduct', { productId });
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteProduct(product.id)),
        },
      ]
    );
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCategoryFilter('');
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity onPress={() => handleProductPress(item.id)}>
      <Card style={styles.productCard}>
        <Card.Cover
          source={{
            uri: item.images[0] || 'https://via.placeholder.com/200x150',
          }}
          style={styles.productImage}
        />
        <Card.Content style={styles.productContent}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.productStatus}>
              <Chip
                style={[
                  styles.statusChip,
                  { backgroundColor: item.isActive ? theme.colors.success : theme.colors.error }
                ]}
                textStyle={styles.statusText}
                compact
              >
                {item.isActive ? 'Active' : 'Inactive'}
              </Chip>
              {item.isFeatured && (
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

          <Text style={styles.productPrice}>
            ${item.price.toFixed(2)} / {item.unit}
          </Text>
          
          <Text style={styles.productCategory}>
            {item.category?.name}
          </Text>
          
          <Text style={styles.productStock}>
            Stock: {item.stockQuantity} {item.unit}
          </Text>

          <View style={styles.productActions}>
            <Button
              mode="outlined"
              onPress={() => handleEditProduct(item.id)}
              style={styles.actionButton}
              icon="pencil"
              compact
            >
              Edit
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => handleDeleteProduct(item)}
              style={[styles.actionButton, styles.deleteButton]}
              labelStyle={styles.deleteButtonLabel}
              icon="delete"
              compact
            >
              Delete
            </Button>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery || statusFilter || categoryFilter 
          ? 'No products match your filters' 
          : 'No products yet'
        }
      </Text>
      {(searchQuery || statusFilter || categoryFilter) ? (
        <Button mode="outlined" onPress={clearFilters} style={styles.clearButton}>
          Clear Filters
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={handleAddProduct}
          style={styles.addButton}
          icon="plus"
        >
          Add Your First Product
        </Button>
      )}
    </View>
  );

  if (isLoading && myProducts.length === 0) {
    return <LoadingScreen message="Loading your products..." />;
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>My Products</Title>
        <Text style={styles.headerSubtitle}>
          {myProducts.length} product(s)
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <View style={styles.filtersRow}>
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setStatusMenuVisible(true)}
                icon="filter"
                style={styles.filterButton}
              >
                {statusFilter ? (statusFilter === 'active' ? 'Active' : 'Inactive') : 'All Status'}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setStatusFilter('');
                setStatusMenuVisible(false);
              }}
              title="All Status"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setStatusFilter('active');
                setStatusMenuVisible(false);
              }}
              title="Active"
            />
            <Menu.Item
              onPress={() => {
                setStatusFilter('inactive');
                setStatusMenuVisible(false);
              }}
              title="Inactive"
            />
          </Menu>

          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setCategoryMenuVisible(true)}
                icon="tag"
                style={styles.filterButton}
              >
                {categoryFilter ? getCategoryName(categoryFilter) : 'All Categories'}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setCategoryFilter('');
                setCategoryMenuVisible(false);
              }}
              title="All Categories"
            />
            <Divider />
            {categories.map((category) => (
              <Menu.Item
                key={category.id}
                onPress={() => {
                  setCategoryFilter(category.id);
                  setCategoryMenuVisible(false);
                }}
                title={category.name}
              />
            ))}
          </Menu>
        </View>

        {/* Active Filters */}
        {(searchQuery || statusFilter || categoryFilter) && (
          <View style={styles.activeFilters}>
            {searchQuery && (
              <Chip
                icon="magnify"
                onClose={() => setSearchQuery('')}
                style={styles.activeFilterChip}
              >
                Search: {searchQuery}
              </Chip>
            )}
            {statusFilter && (
              <Chip
                icon="filter"
                onClose={() => setStatusFilter('')}
                style={styles.activeFilterChip}
              >
                {statusFilter === 'active' ? 'Active' : 'Inactive'}
              </Chip>
            )}
            {categoryFilter && (
              <Chip
                icon="tag"
                onClose={() => setCategoryFilter('')}
                style={styles.activeFilterChip}
              >
                {getCategoryName(categoryFilter)}
              </Chip>
            )}
            <Button
              mode="text"
              onPress={clearFilters}
              labelStyle={styles.clearAllLabel}
              compact
            >
              Clear All
            </Button>
          </View>
        )}
      </View>

      {/* Products List */}
      <FlatList
        data={myProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
      />

      {/* Add Product FAB */}
      <FAB
        icon="plus"
        onPress={handleAddProduct}
        style={styles.fab}
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.small,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
    marginTop: theme.spacing.xs,
  },
  filtersContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchBar: {
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.md,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  activeFilterChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  clearAllLabel: {
    color: theme.colors.error,
  },
  productsList: {
    padding: theme.spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: theme.spacing.md,
    ...theme.shadow.small,
  },
  productImage: {
    height: 120,
  },
  productContent: {
    paddingVertical: theme.spacing.sm,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: theme.spacing.sm,
  },
  productStatus: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  statusChip: {
    minHeight: 24,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  featuredChip: {
    backgroundColor: theme.colors.secondary,
    minHeight: 24,
  },
  productPrice: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  productCategory: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.xs,
  },
  productStock: {
    fontSize: 12,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  deleteButton: {
    borderColor: theme.colors.error,
  },
  deleteButtonLabel: {
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
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  clearButton: {
    marginTop: theme.spacing.md,
  },
  addButton: {
    marginTop: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default VendorProductsScreen;
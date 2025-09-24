import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  Chip,
  Button,
  Menu,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { fetchProducts, resetProducts } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { Product } from '../../types';
import { theme } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';

type ProductListScreenNavigationProp = StackNavigationProp<AppStackParamList>;

const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<ProductListScreenNavigationProp>();
  const route = useRoute();
  const dispatch = useAppDispatch();
  
  const { products, isLoading, isLoadingMore, pagination, filters } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load categories if not already loaded
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }

    // Load products with initial filters
    loadProducts(true);
  }, []);

  useEffect(() => {
    // Handle navigation params
    const params = route.params as any;
    if (params?.search) {
      setSearchQuery(params.search);
      loadProducts(true, { search: params.search });
    }
    if (params?.category) {
      setSelectedCategory(params.category);
      loadProducts(true, { category: params.category });
    }
  }, [route.params]);

  const loadProducts = async (refresh = false, customFilters = {}) => {
    const searchFilters = {
      search: searchQuery,
      category: selectedCategory,
      ...customFilters,
    };

    dispatch(fetchProducts({
      page: refresh ? 1 : pagination.page + 1,
      refresh,
      ...searchFilters,
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts(true);
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadProducts(true, { search: searchQuery });
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    loadProducts(true, { category: categoryId });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    dispatch(resetProducts());
    loadProducts(true, { search: '', category: '' });
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const loadMore = () => {
    if (pagination.hasNext && !isLoadingMore) {
      loadProducts(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item.id)}
    >
      <Card style={styles.productCardContent}>
        <Card.Cover
          source={{
            uri: item.images[0] || 'https://via.placeholder.com/200x150',
          }}
          style={styles.productImage}
        />
        <Card.Content style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>
            ${item.price.toFixed(2)} / {item.unit}
          </Text>
          <Text style={styles.productVendor} numberOfLines={1}>
            by {item.vendor?.companyName}
          </Text>
          <Text style={styles.productStock}>
            Stock: {item.stockQuantity} {item.unit}
          </Text>
          {item.isFeatured && (
            <Chip icon="star" style={styles.featuredChip} compact>
              Featured
            </Chip>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No products found</Text>
      <Button mode="outlined" onPress={clearFilters} style={styles.clearButton}>
        Clear Filters
      </Button>
    </View>
  );

  if (isLoading && products.length === 0) {
    return <LoadingScreen message="Loading products..." />;
  }

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: '', name: 'All Categories' }, ...categories]}
            keyExtractor={(item) => item.id || 'all'}
            renderItem={({ item }) => (
              <Chip
                selected={selectedCategory === item.id}
                onPress={() => handleCategoryFilter(item.id)}
                style={styles.categoryChip}
              >
                {item.name}
              </Chip>
            )}
            contentContainerStyle={styles.categoryFilters}
          />
          
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setSortMenuVisible(true)}
                icon="sort"
                compact
              >
                Sort
              </Button>
            }
          >
            <Menu.Item onPress={() => setSortBy('createdAt')} title="Newest" />
            <Menu.Item onPress={() => setSortBy('price')} title="Price: Low to High" />
            <Menu.Item onPress={() => setSortBy('name')} title="Name A-Z" />
            <Divider />
            <Menu.Item onPress={clearFilters} title="Clear Filters" />
          </Menu>
        </View>

        {/* Active Filters */}
        {(searchQuery || selectedCategory) && (
          <View style={styles.activeFilters}>
            {searchQuery && (
              <Chip
                icon="magnify"
                onClose={() => {
                  setSearchQuery('');
                  loadProducts(true, { search: '' });
                }}
                style={styles.activeFilterChip}
              >
                Search: {searchQuery}
              </Chip>
            )}
            {selectedCategory && (
              <Chip
                icon="tag"
                onClose={() => {
                  setSelectedCategory('');
                  loadProducts(true, { category: '' });
                }}
                style={styles.activeFilterChip}
              >
                {selectedCategoryName}
              </Chip>
            )}
          </View>
        )}
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
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
  searchBar: {
    backgroundColor: theme.colors.background,
  },
  filtersContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  categoryFilters: {
    paddingRight: theme.spacing.md,
  },
  categoryChip: {
    marginRight: theme.spacing.sm,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  activeFilterChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
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
  },
  productCardContent: {
    ...theme.shadow.small,
  },
  productImage: {
    height: 120,
  },
  productInfo: {
    paddingVertical: theme.spacing.sm,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  productPrice: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  productVendor: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.xs,
  },
  productStock: {
    fontSize: 12,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  featuredChip: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.secondary,
  },
  loadingFooter: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
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
  },
  clearButton: {
    marginTop: theme.spacing.md,
  },
});

export default ProductListScreen;
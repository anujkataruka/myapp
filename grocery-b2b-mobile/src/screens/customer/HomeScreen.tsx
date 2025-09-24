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
  Chip,
  Avatar,
  Searchbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { products, isLoading } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);
  const { totalItems } = useAppSelector((state) => state.cart);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchProducts({ featured: true, refresh: true })),
        dispatch(fetchCategories()),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to products screen with search query
      navigation.navigate('Products' as any, { search: searchQuery.trim() });
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('Products' as any, { category: categoryId });
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const featuredProducts = products.slice(0, 6);

  if (isLoading && products.length === 0) {
    return <LoadingScreen message="Loading home page..." />;
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
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.companyName}>
              {user?.companyName || user?.email}
            </Text>
          </View>
          <View style={styles.cartBadge}>
            {totalItems > 0 && (
              <Chip icon="cart" onPress={() => navigation.navigate('Cart' as any)}>
                {totalItems} items
              </Chip>
            )}
          </View>
        </View>
        
        {/* Search Bar */}
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Categories</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category.id)}
              >
                <Card style={styles.categoryCard}>
                  <Card.Content style={styles.categoryContent}>
                    <Avatar.Icon
                      size={40}
                      icon="folder"
                      style={styles.categoryIcon}
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryCount}>
                      {category._count?.products || 0} products
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Featured Products</Title>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Products' as any)}
            labelStyle={styles.viewAllLabel}
          >
            View All
          </Button>
        </View>
        
        <View style={styles.productsGrid}>
          {featuredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => handleProductPress(product.id)}
            >
              <Card style={styles.productCardContent}>
                <Card.Cover
                  source={{
                    uri: product.images[0] || 'https://via.placeholder.com/200x150',
                  }}
                  style={styles.productImage}
                />
                <Card.Content style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    ${product.price.toFixed(2)} / {product.unit}
                  </Text>
                  <Text style={styles.productVendor} numberOfLines={1}>
                    by {product.vendor?.companyName}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Quick Actions</Title>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Products' as any)}
          >
            <Card style={styles.quickActionContent}>
              <Card.Content style={styles.quickActionInfo}>
                <Avatar.Icon size={50} icon="storefront" />
                <Text style={styles.quickActionTitle}>Browse Products</Text>
                <Text style={styles.quickActionSubtitle}>
                  Explore our marketplace
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Orders' as any)}
          >
            <Card style={styles.quickActionContent}>
              <Card.Content style={styles.quickActionInfo}>
                <Avatar.Icon size={50} icon="clipboard-list" />
                <Text style={styles.quickActionTitle}>My Orders</Text>
                <Text style={styles.quickActionSubtitle}>
                  Track your orders
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cartBadge: {
    alignItems: 'flex-end',
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
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
  categoriesContainer: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
  },
  categoryCard: {
    width: 100,
    marginRight: theme.spacing.md,
    ...theme.shadow.small,
  },
  categoryContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  categoryIcon: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  categoryCount: {
    fontSize: 10,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});

export default HomeScreen;
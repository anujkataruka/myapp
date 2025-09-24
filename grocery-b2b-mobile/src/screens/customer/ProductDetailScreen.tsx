import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  Divider,
  TextInput,
  FAB,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { fetchProduct } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';

const { width } = Dimensions.get('window');

type ProductDetailScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { productId } = route.params as { productId: string };
  const { currentProduct: product, isLoading } = useAppSelector((state) => state.products);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchProduct(productId));
  }, [productId]);

  useEffect(() => {
    if (product && product.minOrderQty) {
      setQuantity(product.minOrderQty);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    if (quantity < product.minOrderQty) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Quantity',
        text2: `Minimum order quantity is ${product.minOrderQty} ${product.unit}`,
      });
      return;
    }

    if (quantity > product.stockQuantity) {
      Toast.show({
        type: 'error',
        text1: 'Insufficient Stock',
        text2: `Only ${product.stockQuantity} ${product.unit} available`,
      });
      return;
    }

    dispatch(addToCart({ product, quantity }));
    
    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${quantity} ${product.unit} of ${product.name}`,
    });
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (product && quantity > product.minOrderQty) {
      setQuantity(quantity - 1);
    }
  };

  const getCartQuantity = () => {
    const cartItem = cartItems.find(item => item.productId === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const navigateToCart = () => {
    navigation.navigate('Cart' as any);
  };

  if (isLoading || !product) {
    return <LoadingScreen message="Loading product details..." />;
  }

  const totalPrice = product.price * quantity;
  const cartQuantity = getCartQuantity();
  const availableStock = product.stockQuantity - cartQuantity;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Product Images */}
        <View style={styles.imageContainer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {product.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image || 'https://via.placeholder.com/400x300' }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {product.isFeatured && (
            <Chip icon="star" style={styles.featuredBadge}>
              Featured
            </Chip>
          )}
        </View>

        {/* Product Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.productName}>{product.name}</Title>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              <Text style={styles.unit}>per {product.unit}</Text>
            </View>

            {product.description && (
              <>
                <Divider style={styles.divider} />
                <Paragraph style={styles.description}>
                  {product.description}
                </Paragraph>
              </>
            )}

            <Divider style={styles.divider} />

            {/* Product Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{product.category?.name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Stock Available:</Text>
                <Text style={[
                  styles.detailValue,
                  availableStock < 10 && styles.lowStock
                ]}>
                  {availableStock} {product.unit}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Min Order:</Text>
                <Text style={styles.detailValue}>
                  {product.minOrderQty} {product.unit}
                </Text>
              </View>

              {cartQuantity > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>In Cart:</Text>
                  <Text style={styles.detailValue}>
                    {cartQuantity} {product.unit}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Vendor Info */}
        <Card style={styles.vendorCard}>
          <Card.Content>
            <Title style={styles.vendorTitle}>Vendor Information</Title>
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>
                {product.vendor?.companyName || 'Unknown Vendor'}
              </Text>
              {product.vendor?.contactPerson && (
                <Text style={styles.vendorContact}>
                  Contact: {product.vendor.contactPerson}
                </Text>
              )}
              {product.vendor?.address && (
                <Text style={styles.vendorAddress}>
                  {product.vendor.address}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Quantity Selector */}
        <Card style={styles.quantityCard}>
          <Card.Content>
            <Title style={styles.quantityTitle}>Select Quantity</Title>
            
            <View style={styles.quantityContainer}>
              <Button
                mode="outlined"
                onPress={decreaseQuantity}
                disabled={quantity <= product.minOrderQty}
                style={styles.quantityButton}
              >
                -
              </Button>
              
              <TextInput
                value={quantity.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || product.minOrderQty;
                  setQuantity(Math.max(product.minOrderQty, Math.min(num, availableStock)));
                }}
                keyboardType="numeric"
                style={styles.quantityInput}
                dense
              />
              
              <Button
                mode="outlined"
                onPress={increaseQuantity}
                disabled={quantity >= availableStock}
                style={styles.quantityButton}
              >
                +
              </Button>
            </View>

            <Text style={styles.totalPrice}>
              Total: ${totalPrice.toFixed(2)}
            </Text>

            <Button
              mode="contained"
              onPress={handleAddToCart}
              disabled={availableStock < product.minOrderQty}
              style={styles.addToCartButton}
              contentStyle={styles.addToCartContent}
            >
              {availableStock < product.minOrderQty 
                ? 'Out of Stock' 
                : `Add ${quantity} ${product.unit} to Cart`
              }
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Cart Button */}
      {cartQuantity > 0 && (
        <FAB
          icon="cart"
          label={`${cartQuantity} in cart`}
          onPress={navigateToCart}
          style={styles.cartFab}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width,
    height: 300,
  },
  featuredBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
  },
  infoCard: {
    margin: theme.spacing.lg,
    ...theme.shadow.medium,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.md,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  unit: {
    fontSize: 16,
    color: theme.colors.placeholder,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  detailsContainer: {
    marginTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: 16,
    color: theme.colors.placeholder,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  lowStock: {
    color: theme.colors.error,
  },
  vendorCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  vendorTitle: {
    fontSize: 18,
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
  vendorAddress: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  quantityCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  quantityTitle: {
    fontSize: 18,
    marginBottom: theme.spacing.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  quantityButton: {
    minWidth: 50,
  },
  quantityInput: {
    width: 80,
    marginHorizontal: theme.spacing.md,
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  addToCartButton: {
    marginTop: theme.spacing.sm,
  },
  addToCartContent: {
    paddingVertical: theme.spacing.sm,
  },
  bottomSpacing: {
    height: 80, // Space for FAB
  },
  cartFab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
});

export default ProductDetailScreen;
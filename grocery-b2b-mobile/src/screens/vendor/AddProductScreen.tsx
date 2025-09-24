import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  HelperText,
  Switch,
  Chip,
} from 'react-native-paper';
// Note: Install @react-native-picker/picker for production use
// For now, we'll use a simple text input for category selection
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { createProduct } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { CreateProductRequest } from '../../types';
import { theme } from '../../constants/theme';

const AddProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { categories, isLoading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { isLoading } = useAppSelector((state) => state.products);

  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    categoryId: '',
    price: 0,
    unit: '',
    stockQuantity: 0,
    minOrderQty: 1,
    images: [],
    isFeatured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required (e.g., kg, lbs, pieces)';
    }

    if (!formData.stockQuantity || formData.stockQuantity < 0) {
      newErrors.stockQuantity = 'Stock quantity must be 0 or greater';
    }

    if (!formData.minOrderQty || formData.minOrderQty <= 0) {
      newErrors.minOrderQty = 'Minimum order quantity must be greater than 0';
    }

    if (formData.minOrderQty > formData.stockQuantity && formData.stockQuantity > 0) {
      newErrors.minOrderQty = 'Minimum order quantity cannot exceed stock quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the errors and try again',
      });
      return;
    }

    try {
      await dispatch(createProduct({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        unit: formData.unit.trim(),
      })).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Product Created',
        text2: 'Your product has been added successfully',
      });

      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Creation Failed',
        text2: error.message || 'Please try again',
      });
    }
  };

  const updateFormData = (field: keyof CreateProductRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.description || formData.price > 0) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const commonUnits = ['kg', 'lbs', 'pieces', 'units', 'boxes', 'grams', 'liters', 'dozen'];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.formCard}>
          <Card.Content>
            <Title style={styles.formTitle}>Add New Product</Title>

            {/* Basic Information */}
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              label="Product Name *"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              error={!!errors.name}
              style={styles.input}
              left={<TextInput.Icon icon="package-variant" />}
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={3}
              style={styles.input}
              left={<TextInput.Icon icon="text" />}
            />

            {/* Category Selection */}
            <Text style={styles.inputLabel}>Category *</Text>
            {categories.length > 0 && (
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    selected={formData.categoryId === category.id}
                    onPress={() => updateFormData('categoryId', category.id)}
                    style={styles.categoryChip}
                  >
                    {category.name}
                  </Chip>
                ))}
              </View>
            )}
            <HelperText type="error" visible={!!errors.categoryId}>
              {errors.categoryId}
            </HelperText>

            {/* Pricing and Inventory */}
            <Text style={styles.sectionTitle}>Pricing & Inventory</Text>

            <TextInput
              label="Price *"
              value={formData.price.toString()}
              onChangeText={(value) => {
                const price = parseFloat(value) || 0;
                updateFormData('price', price);
              }}
              keyboardType="decimal-pad"
              error={!!errors.price}
              style={styles.input}
              left={<TextInput.Icon icon="currency-usd" />}
            />
            <HelperText type="error" visible={!!errors.price}>
              {errors.price}
            </HelperText>

            <TextInput
              label="Unit (e.g., kg, lbs, pieces) *"
              value={formData.unit}
              onChangeText={(value) => updateFormData('unit', value)}
              error={!!errors.unit}
              style={styles.input}
              left={<TextInput.Icon icon="scale" />}
            />
            <HelperText type="error" visible={!!errors.unit}>
              {errors.unit}
            </HelperText>

            {/* Common Units */}
            <Text style={styles.unitsLabel}>Common units:</Text>
            <View style={styles.unitsContainer}>
              {commonUnits.map((unit) => (
                <Chip
                  key={unit}
                  selected={formData.unit === unit}
                  onPress={() => updateFormData('unit', unit)}
                  style={styles.unitChip}
                >
                  {unit}
                </Chip>
              ))}
            </View>

            <TextInput
              label="Stock Quantity *"
              value={formData.stockQuantity.toString()}
              onChangeText={(value) => {
                const quantity = parseInt(value) || 0;
                updateFormData('stockQuantity', quantity);
              }}
              keyboardType="numeric"
              error={!!errors.stockQuantity}
              style={styles.input}
              left={<TextInput.Icon icon="package" />}
            />
            <HelperText type="error" visible={!!errors.stockQuantity}>
              {errors.stockQuantity}
            </HelperText>

            <TextInput
              label="Minimum Order Quantity *"
              value={formData.minOrderQty.toString()}
              onChangeText={(value) => {
                const quantity = parseInt(value) || 1;
                updateFormData('minOrderQty', quantity);
              }}
              keyboardType="numeric"
              error={!!errors.minOrderQty}
              style={styles.input}
              left={<TextInput.Icon icon="numeric" />}
            />
            <HelperText type="error" visible={!!errors.minOrderQty}>
              {errors.minOrderQty}
            </HelperText>

            {/* Product Options */}
            <Text style={styles.sectionTitle}>Product Options</Text>

            <View style={styles.switchContainer}>
              <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>Featured Product</Text>
                <Text style={styles.switchDescription}>
                  Featured products appear prominently on the home page
                </Text>
              </View>
              <Switch
                value={formData.isFeatured}
                onValueChange={(value) => updateFormData('isFeatured', value)}
              />
            </View>

            {/* Image Upload Placeholder */}
            <Text style={styles.sectionTitle}>Product Images</Text>
            <Card style={styles.imageUploadCard}>
              <Card.Content style={styles.imageUploadContent}>
                <Text style={styles.imageUploadText}>
                  Image upload functionality will be available in the next version
                </Text>
                <Text style={styles.imageUploadSubtext}>
                  For now, placeholder images will be used
                </Text>
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading || categoriesLoading}
            style={styles.submitButton}
          >
            Add Product
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: theme.spacing.lg,
  },
  formCard: {
    ...theme.shadow.medium,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
  inputLabel: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  categoryChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  unitsLabel: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.sm,
  },
  unitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  unitChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.placeholder,
  },
  switchContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  switchDescription: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  imageUploadCard: {
    backgroundColor: theme.colors.background,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: theme.colors.placeholder,
  },
  imageUploadContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  imageUploadText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  imageUploadSubtext: {
    fontSize: 14,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  submitButton: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
});

export default AddProductScreen;
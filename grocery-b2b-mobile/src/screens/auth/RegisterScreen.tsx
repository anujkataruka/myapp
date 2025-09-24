import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  HelperText,
  RadioButton,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { register, clearError } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { theme } from '../../constants/theme';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'CUSTOMER' as 'CUSTOMER' | 'VENDOR',
    companyName: '',
    contactPerson: '',
    phone: '',
    address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/;
    return password.length >= 8 && passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.userType === 'VENDOR' && !formData.companyName) {
      newErrors.companyName = 'Company name is required for vendors';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validateForm()) {
      dispatch(clearError());
      const registerData = {
        email: formData.email.toLowerCase(),
        password: formData.password,
        userType: formData.userType,
        companyName: formData.companyName || undefined,
        contactPerson: formData.contactPerson || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      };
      dispatch(register(registerData));
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Title style={styles.title}>Create Account</Title>
            <Paragraph style={styles.subtitle}>
              Join Grocery B2B platform
            </Paragraph>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              {/* User Type Selection */}
              <Text style={styles.sectionTitle}>Account Type</Text>
              <RadioButton.Group
                onValueChange={(value) => updateFormData('userType', value)}
                value={formData.userType}
              >
                <View style={styles.radioContainer}>
                  <RadioButton.Item
                    label="Customer (Buy products)"
                    value="CUSTOMER"
                    labelStyle={styles.radioLabel}
                  />
                  <RadioButton.Item
                    label="Vendor (Sell products)"
                    value="VENDOR"
                    labelStyle={styles.radioLabel}
                  />
                </View>
              </RadioButton.Group>

              <Divider style={styles.divider} />

              {/* Basic Information */}
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={!!errors.email}
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>

              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                error={!!errors.password}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>

              <TextInput
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                error={!!errors.confirmPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword}
              </HelperText>

              <Divider style={styles.divider} />

              {/* Company Information */}
              <Text style={styles.sectionTitle}>Company Information</Text>
              
              <TextInput
                label={formData.userType === 'VENDOR' ? 'Company Name *' : 'Company Name (Optional)'}
                value={formData.companyName}
                onChangeText={(value) => updateFormData('companyName', value)}
                error={!!errors.companyName}
                style={styles.input}
                left={<TextInput.Icon icon="office-building" />}
              />
              <HelperText type="error" visible={!!errors.companyName}>
                {errors.companyName}
              </HelperText>

              <TextInput
                label="Contact Person (Optional)"
                value={formData.contactPerson}
                onChangeText={(value) => updateFormData('contactPerson', value)}
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />

              <TextInput
                label="Phone (Optional)"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
              />

              <TextInput
                label="Address (Optional)"
                value={formData.address}
                onChangeText={(value) => updateFormData('address', value)}
                multiline
                numberOfLines={2}
                style={styles.input}
                left={<TextInput.Icon icon="map-marker" />}
              />

              {error && (
                <HelperText type="error" visible={!!error} style={styles.errorText}>
                  {error}
                </HelperText>
              )}

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
              >
                Create Account
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Button
              mode="text"
              onPress={navigateToLogin}
              disabled={isLoading}
              labelStyle={styles.loginButtonLabel}
            >
              Sign In
            </Button>
          </View>
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
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: theme.spacing.lg,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  card: {
    elevation: 4,
    ...theme.shadow.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  radioContainer: {
    marginBottom: theme.spacing.md,
  },
  radioLabel: {
    fontSize: 16,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
  registerButton: {
    marginTop: theme.spacing.md,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  errorText: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  loginButtonLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
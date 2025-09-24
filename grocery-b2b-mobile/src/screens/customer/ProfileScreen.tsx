import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Title,
  List,
  Switch,
  Dialog,
  Portal,
  TextInput,
  HelperText,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { logout, updateProfile } from '../../store/slices/authSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { theme } from '../../constants/theme';

const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [formData, setFormData] = useState({
    companyName: user?.companyName || '',
    contactPerson: user?.contactPerson || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            dispatch(clearCart());
          },
        },
      ]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (user?.userType === 'VENDOR' && !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required for vendors';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(updateProfile({
        companyName: formData.companyName.trim() || undefined,
        contactPerson: formData.contactPerson.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      })).unwrap();

      setEditDialogVisible(false);
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: user?.companyName || '',
      contactPerson: user?.contactPerson || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setErrors({});
  };

  const handleEditPress = () => {
    resetForm();
    setEditDialogVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Title style={styles.profileName}>
                {user?.companyName || user?.email}
              </Title>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.userType}>
                {user?.userType === 'VENDOR' ? 'Vendor Account' : 'Customer Account'}
              </Text>
              {user?.isVerified && (
                <Text style={styles.verifiedBadge}>✓ Verified</Text>
              )}
            </View>
            
            <Button
              mode="outlined"
              onPress={handleEditPress}
              icon="pencil"
              style={styles.editButton}
            >
              Edit
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Profile Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Profile Details</Title>
          
          {user?.companyName && (
            <List.Item
              title="Company Name"
              description={user.companyName}
              left={props => <List.Icon {...props} icon="office-building" />}
            />
          )}
          
          {user?.contactPerson && (
            <List.Item
              title="Contact Person"
              description={user.contactPerson}
              left={props => <List.Icon {...props} icon="account" />}
            />
          )}
          
          {user?.phone && (
            <List.Item
              title="Phone"
              description={user.phone}
              left={props => <List.Icon {...props} icon="phone" />}
            />
          )}
          
          {user?.address && (
            <List.Item
              title="Address"
              description={user.address}
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
          )}
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Settings</Title>
          
          <List.Item
            title="Push Notifications"
            description="Receive order updates and promotions"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          
          <List.Item
            title="Privacy Policy"
            description="Learn about how we protect your data"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Privacy Policy',
                text2: 'Feature coming soon',
              });
            }}
          />
          
          <List.Item
            title="Terms of Service"
            description="Review our terms and conditions"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Terms of Service',
                text2: 'Feature coming soon',
              });
            }}
          />
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleLogout}
            icon="logout"
            style={styles.logoutButton}
            buttonColor={theme.colors.error}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      {/* Edit Profile Dialog */}
      <Portal>
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogContent}>
              <TextInput
                label={user?.userType === 'VENDOR' ? 'Company Name *' : 'Company Name'}
                value={formData.companyName}
                onChangeText={(value) => updateFormData('companyName', value)}
                error={!!errors.companyName}
                style={styles.input}
              />
              <HelperText type="error" visible={!!errors.companyName}>
                {errors.companyName}
              </HelperText>

              <TextInput
                label="Contact Person"
                value={formData.contactPerson}
                onChangeText={(value) => updateFormData('contactPerson', value)}
                style={styles.input}
              />

              <TextInput
                label="Phone"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
                style={styles.input}
              />

              <TextInput
                label="Address"
                value={formData.address}
                onChangeText={(value) => updateFormData('address', value)}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </ScrollView>
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button
              onPress={() => setEditDialogVisible(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateProfile}
              loading={isLoading}
              disabled={isLoading}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileCard: {
    margin: theme.spacing.lg,
    ...theme.shadow.medium,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: 16,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.xs,
  },
  userType: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  verifiedBadge: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  editButton: {
    marginLeft: theme.spacing.md,
  },
  detailsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  settingsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  actionsCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  logoutButton: {
    marginTop: theme.spacing.sm,
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    maxHeight: 400,
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
});

export default ProfileScreen;
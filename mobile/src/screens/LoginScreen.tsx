import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { api } from '../lib/api';
import { decodeJwt } from '../lib/jwt';
import { useAuthStore } from '../store/auth';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('vendor@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const onLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.token as string;
      const payload = decodeJwt(token);
      const role = (payload?.role as 'USER' | 'VENDOR' | 'ADMIN') || (email.includes('vendor') ? 'VENDOR' : 'USER');
      setAuth(token, role);
      if (role === 'VENDOR') navigation.replace('VendorDashboard');
      else navigation.replace('Products');
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.message || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput style={styles.input} autoCapitalize="none" placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} secureTextEntry placeholder="Password" value={password} onChangeText={setPassword} />
      <Button title={loading ? 'Loading...' : 'Login'} onPress={onLogin} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
});


import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function VendorDashboardScreen() {
  const qc = useQueryClient();
  const { data, refetch } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: async () => (await api.get('/vendor/products')).data.items as any[],
  });

  const [title, setTitle] = useState('Bananas');
  const [description, setDescription] = useState('Fresh and ripe');
  const [priceCents, setPriceCents] = useState('199');
  const [currency, setCurrency] = useState('USD');
  const [inventoryQuantity, setInventoryQuantity] = useState('100');

  const onCreate = async () => {
    try {
      await api.post('/vendor/products', {
        title,
        description,
        priceCents: Number(priceCents),
        currency,
        inventoryQuantity: Number(inventoryQuantity),
      });
      await refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to create product');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Vendor Dashboard</Text>
      <View style={styles.formRow}>
        <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
        <TextInput style={styles.input} placeholder="Price cents" keyboardType="numeric" value={priceCents} onChangeText={setPriceCents} />
        <TextInput style={styles.input} placeholder="Currency" value={currency} onChangeText={setCurrency} />
        <TextInput style={styles.input} placeholder="Inventory" keyboardType="numeric" value={inventoryQuantity} onChangeText={setInventoryQuantity} />
        <Button title="Create Product" onPress={onCreate} />
      </View>
      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.inventoryQuantity} in stock</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  h1: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  formRow: { gap: 8, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  title: { fontSize: 16, fontWeight: '600' },
});


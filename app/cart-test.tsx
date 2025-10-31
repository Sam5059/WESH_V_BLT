import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ShoppingBag } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CartTestScreen() {
  const { user } = useAuth();
  const { cartItems, cartTotal, loading } = useCart();

  console.log('[CART TEST] User:', user?.id);
  console.log('[CART TEST] Cart items:', cartItems);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Test Panier</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Info:</Text>
          <Text>User ID: {user?.id || 'Not logged in'}</Text>
          <Text>Loading: {loading ? 'Yes' : 'No'}</Text>
          <Text>Cart Items: {cartItems.length}</Text>
          <Text>Cart Total: {cartTotal} DA</Text>
        </View>

        {cartItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items:</Text>
            {cartItems.map((item, index) => (
              <View key={item.id} style={styles.item}>
                <Text style={styles.itemText}>
                  {index + 1}. {item.listing?.title || 'No title'}
                </Text>
                <Text style={styles.itemText}>
                  Quantity: {item.quantity}
                </Text>
                <Text style={styles.itemText}>
                  Price: {item.listing?.price || 0} DA
                </Text>
              </View>
            ))}
          </View>
        )}

        {cartItems.length === 0 && !loading && (
          <View style={styles.empty}>
            <ShoppingBag size={64} color="#999" />
            <Text style={styles.emptyText}>Cart is empty</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
});

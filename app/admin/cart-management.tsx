import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Trash2, ShoppingBag, User } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';

interface CartItem {
  id: string;
  user_id: string;
  listing_id: string;
  quantity: number;
  added_at: string;
  user: {
    full_name: string;
    email: string;
  };
  listing: {
    id: string;
    title: string;
    price: number;
    images: string[];
  };
}

export default function CartManagementScreen() {
  const { profile } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      router.replace('/');
      return;
    }
    loadCartItems();
  }, [profile]);

  const loadCartItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
          listing_id,
          quantity,
          added_at,
          user:profiles!cart_items_user_id_fkey(
            full_name,
            email
          ),
          listing:listings(
            id,
            title,
            price,
            images
          )
        `)
        .order('added_at', { ascending: false });

      if (error) throw error;
      console.log('[ADMIN CART] Loaded', data?.length || 0, 'cart items');
      setCartItems(data || []);
    } catch (error) {
      console.error('[ADMIN CART] Error loading cart items:', error);
      if (Platform.OS === 'web') {
        alert('Erreur lors du chargement des paniers');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cartItemId: string) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Supprimer cet article du panier ?')
      : true;

    if (!confirmed) return;

    setDeleting(prev => new Set(prev).add(cartItemId));
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      await loadCartItems();
    } catch (error) {
      console.error('[ADMIN CART] Error deleting cart item:', error);
      if (Platform.OS === 'web') {
        alert('Erreur lors de la suppression');
      }
    } finally {
      setDeleting(prev => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  };

  const handleClearUserCart = async (userId: string, userName: string) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`Vider tout le panier de ${userName} ?`)
      : true;

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      await loadCartItems();
      if (Platform.OS === 'web') {
        alert('Panier vidé avec succès');
      }
    } catch (error) {
      console.error('[ADMIN CART] Error clearing cart:', error);
      if (Platform.OS === 'web') {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const groupedByUser = cartItems.reduce((acc, item) => {
    if (!acc[item.user_id]) {
      acc[item.user_id] = {
        user: item.user,
        items: [],
        total: 0,
      };
    }
    acc[item.user_id].items.push(item);
    acc[item.user_id].total += item.listing.price * item.quantity;
    return acc;
  }, {} as Record<string, { user: any; items: CartItem[]; total: number }>);

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Gestion des Paniers</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <ShoppingBag size={24} color="#2563EB" />
            <Text style={styles.statValue}>{cartItems.length}</Text>
            <Text style={styles.statLabel}>Articles Total</Text>
          </View>
          <View style={styles.statCard}>
            <User size={24} color="#10B981" />
            <Text style={styles.statValue}>{Object.keys(groupedByUser).length}</Text>
            <Text style={styles.statLabel}>Utilisateurs</Text>
          </View>
        </View>

        {Object.entries(groupedByUser).map(([userId, userData]) => (
          <View key={userId} style={styles.userSection}>
            <View style={styles.userHeader}>
              <View>
                <Text style={styles.userName}>{userData.user.full_name}</Text>
                <Text style={styles.userEmail}>{userData.user.email}</Text>
              </View>
              <View style={styles.userActions}>
                <Text style={styles.userTotal}>
                  {userData.total.toLocaleString()} DA
                </Text>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => handleClearUserCart(userId, userData.user.full_name)}
                >
                  <Text style={styles.clearButtonText}>Vider</Text>
                </TouchableOpacity>
              </View>
            </View>

            {userData.items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image
                  source={{ uri: item.listing.images[0] || 'https://via.placeholder.com/80' }}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.listing.title}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {item.listing.price.toLocaleString()} DA x {item.quantity}
                  </Text>
                  <Text style={styles.itemTotal}>
                    Total: {(item.listing.price * item.quantity).toLocaleString()} DA
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                  disabled={deleting.has(item.id)}
                >
                  {deleting.has(item.id) ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Trash2 size={20} color="#EF4444" />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        {cartItems.length === 0 && (
          <View style={styles.emptyState}>
            <ShoppingBag size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>Aucun article dans les paniers</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  userSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  userActions: {
    alignItems: 'flex-end',
  },
  userTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
});

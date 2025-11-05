import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Package, MessageCircle, Eye, Check, XCircle, Clock, TruckIcon as Truck } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  deposit_amount: number;
  remaining_amount: number;
  conversation_id: string;
  created_at: string;
  seller_name: string;
  buyer_name: string;
  items: Array<{
    id: string;
    listing_title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export default function OrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'buyer' | 'seller'>('buyer');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, viewMode]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const query = viewMode === 'buyer'
        ? supabase.from('orders').select(`
            id,
            order_number,
            status,
            payment_method,
            payment_status,
            total_amount,
            deposit_amount,
            remaining_amount,
            conversation_id,
            created_at,
            seller:profiles!orders_seller_id_fkey(full_name),
            order_items(
              id,
              quantity,
              unit_price,
              total_price,
              listing:listings(title)
            )
          `).eq('buyer_id', user.id)
        : supabase.from('orders').select(`
            id,
            order_number,
            status,
            payment_method,
            payment_status,
            total_amount,
            deposit_amount,
            remaining_amount,
            conversation_id,
            created_at,
            buyer:profiles!orders_buyer_id_fkey(full_name),
            order_items(
              id,
              quantity,
              unit_price,
              total_price,
              listing:listings(title)
            )
          `).eq('seller_id', user.id);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders = (data || []).map(order => ({
        ...order,
        seller_name: viewMode === 'buyer' ? order.seller?.full_name || 'Vendeur' : '',
        buyer_name: viewMode === 'seller' ? order.buyer?.full_name || 'Acheteur' : '',
        items: (order.order_items || []).map(item => ({
          id: item.id,
          listing_title: item.listing?.title || 'Article',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed_seller':
      case 'deposit_paid':
        return '#3B82F6';
      case 'paid':
      case 'preparing':
        return '#8B5CF6';
      case 'shipped':
        return '#06B6D4';
      case 'delivered':
      case 'completed':
        return '#10B981';
      case 'cancelled':
      case 'refunded':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed_seller':
        return 'Confirmée';
      case 'deposit_paid':
        return 'Acompte payé';
      case 'paid':
        return 'Payé';
      case 'preparing':
        return 'En préparation';
      case 'shipped':
        return 'Expédié';
      case 'delivered':
        return 'Livré';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      case 'refunded':
        return 'Remboursé';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    const color = getStatusColor(status);
    switch (status) {
      case 'pending':
        return <Clock size={16} color={color} />;
      case 'confirmed_seller':
      case 'deposit_paid':
      case 'paid':
        return <Check size={16} color={color} />;
      case 'preparing':
        return <Package size={16} color={color} />;
      case 'shipped':
        return <Truck size={16} color={color} />;
      case 'delivered':
      case 'completed':
        return <Check size={16} color={color} />;
      case 'cancelled':
      case 'refunded':
        return <XCircle size={16} color={color} />;
      default:
        return <Clock size={16} color={color} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'buyer' && styles.toggleButtonActive]}
          onPress={() => setViewMode('buyer')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'buyer' && styles.toggleButtonTextActive]}>
            Mes achats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'seller' && styles.toggleButtonActive]}
          onPress={() => setViewMode('seller')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'seller' && styles.toggleButtonTextActive]}>
            Mes ventes
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>
              {viewMode === 'buyer' ? 'Aucun achat' : 'Aucune vente'}
            </Text>
            <Text style={styles.emptyText}>
              {viewMode === 'buyer'
                ? 'Vos achats apparaîtront ici'
                : 'Vos ventes apparaîtront ici'}
            </Text>
          </View>
        ) : (
          orders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <Text style={styles.orderNumber}>{order.order_number}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  {getStatusIcon(order.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.partnerLabel}>
                  {viewMode === 'buyer' ? 'Vendeur:' : 'Acheteur:'}
                </Text>
                <Text style={styles.partnerName}>
                  {viewMode === 'buyer' ? order.seller_name : order.buyer_name}
                </Text>
              </View>

              <View style={styles.itemsList}>
                {order.items.map((item, index) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      • {item.listing_title}
                    </Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <View style={styles.amountContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>
                    {order.total_amount.toLocaleString()} DA
                  </Text>
                </View>
                {order.payment_method === 'reservation' && order.remaining_amount > 0 && (
                  <View style={styles.depositContainer}>
                    <Text style={styles.depositLabel}>Acompte payé:</Text>
                    <Text style={styles.depositValue}>
                      {order.deposit_amount.toLocaleString()} DA
                    </Text>
                    <Text style={styles.remainingLabel}>Reste:</Text>
                    <Text style={styles.remainingValue}>
                      {order.remaining_amount.toLocaleString()} DA
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.orderActions}>
                {order.conversation_id && (
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => router.push(`/conversation/${order.conversation_id}`)}
                  >
                    <MessageCircle size={18} color="#2563EB" />
                    <Text style={styles.messageButtonText}>Messages</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => {
                    // TODO: Créer une page de détails de commande
                    console.log('View order details:', order.id);
                  }}
                >
                  <Eye size={18} color="#64748B" />
                  <Text style={styles.detailsButtonText}>Détails</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  orderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  partnerLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemsList: {
    marginBottom: 12,
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  orderFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  depositContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  depositLabel: {
    fontSize: 13,
    color: '#059669',
  },
  depositValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  remainingLabel: {
    fontSize: 13,
    color: '#DC2626',
    marginLeft: 'auto' as any,
  },
  remainingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});

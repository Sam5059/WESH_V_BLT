import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import CustomModal from '@/components/CustomModal';
import { useCustomModal } from '@/hooks/useCustomModal';

export default function CartScreen() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { cartItems, cartTotal, loading, removeFromCart, updateQuantity } = useCart();
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  const [itemToRemove, setItemToRemove] = useState<{id: string; title: string} | null>(null);
  const modal = useCustomModal();

  console.log('[CART SCREEN] ===== CART PAGE LOADED - v2.0 =====');
  console.log('[CART SCREEN] User:', user?.id);
  console.log('[CART SCREEN] Loading:', loading);
  console.log('[CART SCREEN] Cart items:', cartItems.length);
  console.log('[CART SCREEN] Cart total:', cartTotal);
  console.log('[CART SCREEN] Cart items data:', JSON.stringify(cartItems, null, 2));

  const handleRemove = async (cartItemId: string, itemTitle: string) => {
    setItemToRemove({ id: cartItemId, title: itemTitle });
    modal.showConfirm(
      'Retirer du panier',
      `Voulez-vous vraiment retirer "${itemTitle}" de votre panier ?`,
      () => performRemove(cartItemId),
      'Supprimer',
      'Annuler'
    );
  };

  const performRemove = async (cartItemId: string) => {
    try {
      setProcessingItems(prev => new Set(prev).add(cartItemId));
      await removeFromCart(cartItemId);
    } finally {
      setProcessingItems(prev => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  };


  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      setProcessingItems(prev => new Set(prev).add(cartItemId));
      await updateQuantity(cartItemId, newQuantity);
    } finally {
      setProcessingItems(prev => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  };

  if (!user) {
    console.log('[CART SCREEN] No user - showing login prompt');
    return (
      <View style={styles.container}>
        <TopBar />
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.title}>Mon Panier</Text>
          </View>
          <View style={styles.emptyContainer}>
            <AlertCircle size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Connexion requise</Text>
            <Text style={styles.emptyText}>Connectez-vous pour voir votre panier</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Footer />
      </View>
    );
  }

  console.log('[CART SCREEN] User authenticated, showing cart');

  if (loading) {
    console.log('[CART SCREEN] Showing loading state');
  } else if (cartItems.length === 0) {
    console.log('[CART SCREEN] Showing empty cart');
  } else {
    console.log('[CART SCREEN] Showing cart with', cartItems.length, 'items');
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('cart.title')} ({cartItems.length})</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
            <Text style={styles.emptyText}>{t('cart.emptyMessage')}</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.shopButtonText}>{t('cart.startShopping')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cartItems}>
              {cartItems.map((item) => {
                console.log('[CART ITEM]', item.id, 'listing:', item.listing?.title);
                if (!item.listing) {
                  console.error('[CART ERROR] Item has no listing data:', item);
                  return null;
                }
                return (
                <View key={item.id} style={styles.cartItem}>
                  <TouchableOpacity
                    style={styles.itemImage}
                    onPress={() => router.push(`/listing/${item.listing.id}`)}
                  >
                    {item.listing.images?.[0] ? (
                      <Image
                        source={{ uri: item.listing.images[0] }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <ShoppingBag size={32} color="#94A3B8" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.itemDetails}>
                    <TouchableOpacity onPress={() => router.push(`/listing/${item.listing.id}`)}>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.listing.title}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.itemPrice}>
                      {item.listing.price.toLocaleString()} {t('common.currency')}
                    </Text>

                    <View style={styles.itemActions}>
                      {/* Quantité fixe à 1 - Article unique */}
                      <View style={styles.quantityInfo}>
                        <Text style={styles.quantityLabel}>Quantité: </Text>
                        <Text style={styles.quantityValue}>1</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemove(item.id, item.listing.title)}
                        disabled={processingItems.has(item.id)}
                      >
                        {processingItems.has(item.id) ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Trash2 size={20} color="#EF4444" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                );
              })}
            </View>

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
                <Text style={styles.summaryValue}>
                  {cartTotal.toLocaleString()} {t('common.currency')}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('cart.total')}</Text>
                <Text style={styles.totalValue}>
                  {cartTotal.toLocaleString()} {t('common.currency')}
                </Text>
              </View>

              {/* Message d'information validation vendeur */}
              <View style={styles.infoBox}>
                <AlertCircle size={18} color="#2563EB" />
                <Text style={styles.infoText}>
                  Votre commande nécessite une validation du vendeur avant le paiement. Vous recevrez une notification une fois validée.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => router.push('/checkout')}
              >
                <ShoppingBag size={20} color="#FFFFFF" />
                <Text style={styles.checkoutButtonText}>Payer</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <Footer />
      </ScrollView>

      <CustomModal
        visible={modal.isVisible}
        type={modal.modalConfig.type}
        title={modal.modalConfig.title}
        message={modal.modalConfig.message}
        onClose={modal.hideModal}
        onConfirm={modal.modalConfig.onConfirm}
        confirmText={modal.modalConfig.confirmText}
        cancelText={modal.modalConfig.cancelText}
        showCancel={modal.modalConfig.showCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
    minHeight: 400,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
    minHeight: 500,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 17,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 400,
  },
  shopButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cartItems: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
    marginBottom: 24,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemImage: {
    width: 130,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 24,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  quantityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  removeButton: {
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  summary: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    padding: 28,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: -0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#1E40AF',
  },
  checkoutButton: {
    backgroundColor: '#10B981',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

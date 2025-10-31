import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, CreditCard, Building2, Clock, MapPin, User as UserIcon, Phone, Mail } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import CustomModal from '@/components/CustomModal';
import { useCustomModal } from '@/hooks/useCustomModal';

type PaymentMethod = 'card' | 'bank_transfer' | 'reservation';

export default function CheckoutScreen() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const modal = useCustomModal();

  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone_number || '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      modal.showError(t('common.error'), t('cart.loginRequired'));
      return;
    }

    if (!deliveryInfo.fullName || !deliveryInfo.phone || !deliveryInfo.address || !deliveryInfo.city) {
      modal.showError(t('common.error'), t('checkout.fillAllFields'));
      return;
    }

    if (cartItems.length === 0) {
      modal.showError(t('common.error'), t('cart.empty'));
      return;
    }

    try {
      setProcessing(true);

      const ordersBySeller: { [sellerId: string]: typeof cartItems } = {};
      cartItems.forEach(item => {
        const sellerId = item.listing.user_id;
        if (!ordersBySeller[sellerId]) {
          ordersBySeller[sellerId] = [];
        }
        ordersBySeller[sellerId].push(item);
      });

      const createdOrders = [];

      for (const [sellerId, items] of Object.entries(ordersBySeller)) {
        const orderTotal = items.reduce((sum, item) => sum + (item.listing.price * item.quantity), 0);

        const orderNumberResponse = await supabase.rpc('generate_order_number');
        const orderNumber = orderNumberResponse.data || `CMD-${Date.now()}`;

        const { data: order, error: orderError} = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            buyer_id: user.id,
            seller_id: sellerId,
            status: 'pending',
            payment_method: selectedPaymentMethod,
            payment_status: 'pending',
            total_amount: orderTotal,
            delivery_address: {
              fullName: deliveryInfo.fullName,
              phone: deliveryInfo.phone,
              email: deliveryInfo.email,
              address: deliveryInfo.address,
              city: deliveryInfo.city,
              postalCode: deliveryInfo.postalCode,
            },
            notes: deliveryInfo.notes,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const orderItemsData = items.map(item => ({
          order_id: order.id,
          listing_id: item.listing_id,
          quantity: item.quantity,
          unit_price: item.listing.price,
          total_price: item.listing.price * item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsData);

        if (itemsError) throw itemsError;

        // Calculer le montant selon le type de paiement
        const depositAmount = selectedPaymentMethod === 'reservation'
          ? Math.round(orderTotal * 0.30)
          : orderTotal;

        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            order_id: order.id,
            amount: depositAmount,
            method: selectedPaymentMethod,
            status: 'pending',
          });

        if (paymentError) throw paymentError;

        // Envoyer un message automatique dans la conversation
        const itemsList = items.map(item =>
          `- ${item.listing.title} x${item.quantity} : ${(item.listing.price * item.quantity).toLocaleString()} DA`
        ).join('\n');

        const messageContent = selectedPaymentMethod === 'reservation'
          ? `🛒 Nouvelle commande ${orderNumber}\n\n${itemsList}\n\n💰 Total: ${orderTotal.toLocaleString()} DA\n💵 Acompte (30%): ${depositAmount.toLocaleString()} DA\n\n📞 Contactez le vendeur pour finaliser la réservation.`
          : `🛒 Nouvelle commande ${orderNumber}\n\n${itemsList}\n\n💰 Total: ${orderTotal.toLocaleString()} DA\n\n📞 Contactez le vendeur pour organiser la livraison.`;

        await supabase.rpc('send_order_notification', {
          p_order_id: order.id,
          p_message: messageContent,
          p_sender_id: user.id
        });

        createdOrders.push(order);
      }

      await clearCart();

      const successMessage = selectedPaymentMethod === 'reservation'
        ? 'Commande créée avec succès ! Un acompte de 30% est requis. Le vendeur vous contactera bientôt.'
        : 'Commande créée avec succès ! Le vendeur vous contactera pour organiser la livraison et le paiement.';

      modal.showSuccess(
        'Commande confirmée !',
        successMessage,
        () => router.push('/(tabs)/messages')
      );
    } catch (error) {
      console.error('Error placing order:', error);
      modal.showError(t('common.error'), 'Erreur lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setProcessing(false);
    }
  };


  if (!user) {
    return (
      <View style={styles.container}>
        <TopBar />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>{t('cart.loginRequired')}</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.loginButtonText}>{t('topBar.signIn')}</Text>
            </TouchableOpacity>
          </View>
          <Footer />
        </ScrollView>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <TopBar />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.shopButtonText}>{t('cart.startShopping')}</Text>
            </TouchableOpacity>
          </View>
          <Footer />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('checkout.title')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('checkout.deliveryInfo')}</Text>

          <View style={styles.inputGroup}>
            <UserIcon size={20} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder={t('checkout.fullName')}
              value={deliveryInfo.fullName}
              onChangeText={(text) => setDeliveryInfo({ ...deliveryInfo, fullName: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Phone size={20} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder={t('checkout.phone')}
              value={deliveryInfo.phone}
              onChangeText={(text) => setDeliveryInfo({ ...deliveryInfo, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Mail size={20} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder={t('checkout.email')}
              value={deliveryInfo.email}
              onChangeText={(text) => setDeliveryInfo({ ...deliveryInfo, email: text })}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <MapPin size={20} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder={t('checkout.address')}
              value={deliveryInfo.address}
              onChangeText={(text) => setDeliveryInfo({ ...deliveryInfo, address: text })}
              multiline
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <TextInput
                style={styles.input}
                placeholder={t('checkout.city')}
                value={deliveryInfo.city}
                onChangeText={(text) => setDeliveryInfo({ ...deliveryInfo, city: text })}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <TextInput
                style={styles.input}
                placeholder={t('checkout.postalCode')}
                value={deliveryInfo.postalCode}
                onChangeText={(text) => setDeliveryInfo({ ...deliveryInfo, postalCode: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder={t('checkout.notes')}
            value={deliveryInfo.notes}
            onChangeText={(text) => setDeliveryInfo({ ...deliveryInfo, notes: text })}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('checkout.paymentMethod')}</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'card' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPaymentMethod('card')}
          >
            <View style={styles.paymentOptionLeft}>
              <CreditCard size={24} color={selectedPaymentMethod === 'card' ? '#2563EB' : '#64748B'} />
              <View>
                <Text style={styles.paymentOptionTitle}>{t('checkout.cardPayment')}</Text>
                <Text style={styles.paymentOptionDescription}>{t('checkout.cardDescription')}</Text>
              </View>
            </View>
            <View style={[
              styles.radio,
              selectedPaymentMethod === 'card' && styles.radioSelected,
            ]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'bank_transfer' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPaymentMethod('bank_transfer')}
          >
            <View style={styles.paymentOptionLeft}>
              <Building2 size={24} color={selectedPaymentMethod === 'bank_transfer' ? '#2563EB' : '#64748B'} />
              <View>
                <Text style={styles.paymentOptionTitle}>{t('checkout.bankTransfer')}</Text>
                <Text style={styles.paymentOptionDescription}>{t('checkout.bankDescription')}</Text>
              </View>
            </View>
            <View style={[
              styles.radio,
              selectedPaymentMethod === 'bank_transfer' && styles.radioSelected,
            ]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'reservation' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPaymentMethod('reservation')}
          >
            <View style={styles.paymentOptionLeft}>
              <Clock size={24} color={selectedPaymentMethod === 'reservation' ? '#10B981' : '#64748B'} />
              <View style={styles.flex1}>
                <Text style={styles.paymentOptionTitle}>Réservation avec acompte</Text>
                <Text style={styles.paymentOptionDescription}>
                  Réservez avec 30% d'acompte. Le vendeur vous contactera pour finaliser.
                </Text>
                <View style={styles.depositInfo}>
                  <Text style={styles.depositLabel}>Acompte à payer:</Text>
                  <Text style={styles.depositAmount}>
                    {Math.round(cartTotal * 0.30).toLocaleString()} DA
                  </Text>
                </View>
              </View>
            </View>
            <View style={[
              styles.radio,
              selectedPaymentMethod === 'reservation' && styles.radioSelected,
            ]} />
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>{t('checkout.orderSummary')}</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.items', { count: cartItems.length })}</Text>
            <Text style={styles.summaryValue}>{cartItems.length}</Text>
          </View>

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

          <TouchableOpacity
            style={[styles.placeOrderButton, processing && styles.placeOrderButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.placeOrderButtonText}>{t('checkout.placeOrder')}</Text>
            )}
          </TouchableOpacity>

          {selectedPaymentMethod === 'reservation' && (
            <View style={styles.infoBox}>
              <Clock size={16} color="#10B981" />
              <Text style={styles.infoText}>{t('checkout.reservationInfo')}</Text>
            </View>
          )}
        </View>
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
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  notesInput: {
    marginTop: 4,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  radioSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 24,
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: -0.5,
  },
  placeOrderButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#059669',
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
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  loginButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
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
  shopButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
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
  flex1: {
    flex: 1,
  },
  depositInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  depositLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  depositAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
});

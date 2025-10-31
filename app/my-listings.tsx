import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/database';
import { Package, Plus, Edit, Trash2, MoreVertical, Eye, EyeOff } from 'lucide-react-native';
import TopBar from '@/components/TopBar';
import ListingsQuotaCard from '@/components/ListingsQuotaCard';
import Footer from '@/components/Footer';

export default function MyListingsScreen() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [listingsQuota, setListingsQuota] = useState<any>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);

  useEffect(() => {
    loadListings();
    loadListingsQuota();
  }, []);

  const loadListings = async () => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setListings(data);
    setLoading(false);
  };

  const loadListingsQuota = async () => {
    if (!user) return;

    try {
      setQuotaLoading(true);
      const { data, error } = await supabase.rpc('get_user_listings_quota', {
        p_user_id: user.id
      });

      if (error) {
        console.error('[QUOTA] Error loading quota:', error);
        return;
      }

      setListingsQuota(data);
    } catch (error) {
      console.error('[QUOTA] Exception:', error);
    } finally {
      setQuotaLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price);
    return formatted.replace('DZD', 'DA');
  };

  const confirmDelete = (listing: Listing) => {
    setListingToDelete(listing);
    setShowDeleteModal(true);
    setSelectedListing(null);
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;

    console.log('[DELETE] Starting deletion for listing:', listingToDelete.id);
    console.log('[DELETE] User ID:', user?.id);
    setDeletingId(listingToDelete.id);

    try {
      const { error, data } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingToDelete.id)
        .eq('user_id', user!.id)
        .select();

      if (error) {
        console.error('[DELETE] Supabase error:', error);
        throw error;
      }

      console.log('[DELETE] Delete successful, data:', data);

      setListings(listings.filter(l => l.id !== listingToDelete.id));
      setShowDeleteModal(false);
      setListingToDelete(null);

      // Recharger le quota après suppression
      loadListingsQuota();

      Alert.alert(
        t('common.success'),
        t('myListings.deleteSuccess'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('[DELETE] Error deleting listing:', error);
      Alert.alert(
        t('common.error'),
        `${t('myListings.deleteError')}\n${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: t('common.ok') }]
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (listing: Listing) => {
    const newStatus = listing.status === 'active' ? 'inactive' : 'active';

    try {
      const { error } = await supabase
        .from('listings')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', listing.id)
        .eq('user_id', user!.id);

      if (error) throw error;

      // Recharger le quota après changement de statut
      loadListingsQuota();

      setListings(listings.map(l =>
        l.id === listing.id ? { ...l, status: newStatus } : l
      ));
      setSelectedListing(null);

      Alert.alert(
        t('common.success'),
        newStatus === 'active'
          ? t('myListings.activateSuccess')
          : t('myListings.deactivateSuccess'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(
        t('common.error'),
        t('myListings.statusError'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleMarkAsSold = async (listing: Listing) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          status: 'sold',
          updated_at: new Date().toISOString()
        })
        .eq('id', listing.id)
        .eq('user_id', user!.id);

      if (error) throw error;

      setListings(listings.map(l =>
        l.id === listing.id ? { ...l, status: 'sold' } : l
      ));
      setSelectedListing(null);

      Alert.alert(
        t('common.success'),
        t('myListings.soldSuccess'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Error marking as sold:', error);
      Alert.alert(
        t('common.error'),
        t('myListings.statusError'),
        [{ text: t('common.ok') }]
      );
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
      <TopBar />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, isRTL && styles.textRTL]}>{t('myListings.title')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/publish')}
          >
            <Plus size={20} color="#2563EB" />
            <Text style={[styles.addButtonText, isRTL && styles.textRTL]}>{t('myListings.add')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
        {listingsQuota && !quotaLoading && (
          <View style={styles.quotaContainer}>
            <ListingsQuotaCard quota={listingsQuota} showUpgradeButton={true} />
          </View>
        )}

        {listings.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={64} color="#CBD5E1" />
            <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>{t('myListings.emptyTitle')}</Text>
            <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
              {t('myListings.emptyText')}
            </Text>
            <TouchableOpacity
              style={styles.publishButton}
              onPress={() => router.push('/(tabs)/publish')}
            >
              <Text style={[styles.publishButtonText, isRTL && styles.textRTL]}>{t('myListings.publishListing')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listingsGrid}>
            {listings.map((listing) => (
              <View key={listing.id} style={[styles.listingCard, isMobile && styles.listingCardMobile]}>
                <TouchableOpacity
                  onPress={() => router.push(`/listing/${listing.id}`)}
                  style={styles.listingCardInner}
                >
                  <Image
                    source={{
                      uri:
                        listing.images[0] ||
                        'https://images.pexels.com/photos/1667849/pexels-photo-1667849.jpeg?auto=compress&cs=tinysrgb&w=400',
                    }}
                    style={styles.listingImage}
                  />
                  <View style={styles.listingContent}>
                    <Text style={styles.listingTitle} numberOfLines={2}>
                      {listing.title}
                    </Text>
                    <Text style={styles.listingPrice}>
                      {formatPrice(parseFloat(listing.price))}
                    </Text>
                    <View style={styles.statsRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          listing.status === 'active' && styles.statusActive,
                          listing.status === 'inactive' && styles.statusInactive,
                          listing.status === 'sold' && styles.statusSold,
                        ]}
                      >
                        <Text style={[styles.statusText, isRTL && styles.textRTL]}>
                          {listing.status === 'active' ? t('myListings.active') :
                           listing.status === 'inactive' ? t('myListings.inactive') :
                           t('myListings.sold')}
                        </Text>
                      </View>
                      <Text style={styles.viewsText}>
                        <Eye size={12} color="#64748B" /> {listing.views_count || 0}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setSelectedListing(selectedListing === listing.id ? null : listing.id)}
                >
                  <MoreVertical size={20} color="#64748B" />
                </TouchableOpacity>
                {selectedListing === listing.id && (
                  <View style={styles.contextMenu}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        router.push(`/(tabs)/publish?editId=${listing.id}`);
                        setSelectedListing(null);
                      }}
                    >
                      <Edit size={16} color="#2563EB" />
                      <Text style={styles.menuItemText}>{t('myListings.edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleToggleStatus(listing)}
                    >
                      {listing.status === 'active' ? (
                        <EyeOff size={16} color="#F59E0B" />
                      ) : (
                        <Eye size={16} color="#10B981" />
                      )}
                      <Text style={styles.menuItemText}>
                        {listing.status === 'active' ? t('myListings.deactivate') : t('myListings.activate')}
                      </Text>
                    </TouchableOpacity>
                    {listing.status !== 'sold' && (
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          handleMarkAsSold(listing);
                          setSelectedListing(null);
                        }}
                      >
                        <Package size={16} color="#8B5CF6" />
                        <Text style={styles.menuItemText}>{t('myListings.markAsSold')}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        console.log('[DELETE] Delete button clicked for listing:', listing.id);
                        confirmDelete(listing);
                      }}
                    >
                      <Trash2 size={16} color="#EF4444" />
                      <Text style={[styles.menuItemText, styles.menuItemDanger]}>{t('myListings.delete')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDeleteModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Trash2 size={32} color="#EF4444" />
              <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                {t('myListings.confirmDelete')}
              </Text>
            </View>

            {listingToDelete && (
              <View style={styles.listingPreview}>
                <Image
                  source={{
                    uri: listingToDelete.images[0] ||
                      'https://images.pexels.com/photos/1667849/pexels-photo-1667849.jpeg?auto=compress&cs=tinysrgb&w=200',
                  }}
                  style={styles.previewImage}
                />
                <View style={styles.previewContent}>
                  <Text style={[styles.previewTitle, isRTL && styles.textRTL]} numberOfLines={2}>
                    {listingToDelete.title}
                  </Text>
                  <Text style={styles.previewPrice}>
                    {formatPrice(parseFloat(listingToDelete.price))}
                  </Text>
                </View>
              </View>
            )}

            <Text style={[styles.modalMessage, isRTL && styles.textRTL]}>
              {t('myListings.deleteWarning')}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setListingToDelete(null);
                }}
                disabled={deletingId !== null}
              >
                <Text style={[styles.cancelButtonText, isRTL && styles.textRTL]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={deletingId !== null}
              >
                {deletingId ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.deleteButtonText, isRTL && styles.textRTL]}>
                    {t('myListings.delete')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  pageHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F0FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  addButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  quotaContainer: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  publishButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  listingCard: {
    width: '50%',
    padding: 6,
    position: 'relative',
  },
  listingCardMobile: {
    width: '100%',
  },
  listingCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  listingImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  listingContent: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
    lineHeight: 18,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEF3C7',
  },
  statusSold: {
    backgroundColor: '#FEE2E2',
  },
  viewsText: {
    fontSize: 12,
    color: '#64748B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  contextMenu: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    }),
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  menuItemDanger: {
    color: '#EF4444',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
    textAlign: 'center',
  },
  listingPreview: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  modalMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

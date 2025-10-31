import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Listing, Wilaya, Category } from '@/types/database';
import { User, Settings, Heart, Package, LogOut, CreditCard as Edit3, MapPin, Phone, Trash2, Edit, Crown, Zap, Shield } from 'lucide-react-native';
import TopBar from '@/components/TopBar';
import ListingCard from '@/components/ListingCard';
import CommuneAutocomplete from '@/components/CommuneAutocomplete';

export default function ProfileScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { setCurrentLocation } = useLocation();
  const { t, isRTL } = useLanguage();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'settings'>(
    (tab as 'listings' | 'favorites' | 'settings') || 'listings'
  );

  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [wilaya, setWilaya] = useState(profile?.wilaya || '');
  const [commune, setCommune] = useState(profile?.commune || '');
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [saving, setSaving] = useState(false);
  const [favoritesSortBy, setFavoritesSortBy] = useState<'date_desc' | 'date_asc' | 'price_asc' | 'price_desc'>('date_desc');

  useEffect(() => {
    if (user) {
      loadMyListings();
      loadFavorites();
      loadWilayas();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [favoritesSortBy]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhoneNumber(profile.phone_number || '');
      setWilaya(profile.wilaya || '');
      setCommune(profile.commune || '');
    }
  }, [profile]);

  const loadMyListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select(`
        *,
        category:categories!listings_category_id_fkey(id, name, name_en, name_ar, slug),
        subcategory:categories!listings_subcategory_id_fkey(id, name, name_en, name_ar, slug)
      `)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) setMyListings(data);
  };

  const loadFavorites = async () => {
    console.log('[FAVORITES] Loading with sort:', favoritesSortBy);

    let query = supabase
      .from('favorites')
      .select(`
        *,
        listings(
          *,
          category:categories!listings_category_id_fkey(id, name, name_en, name_ar, slug),
          subcategory:categories!listings_subcategory_id_fkey(id, name, name_en, name_ar, slug)
        )
      `)
      .eq('user_id', user!.id);

    // Apply sorting based on favoritesSortBy
    if (favoritesSortBy === 'date_desc') {
      query = query.order('created_at', { ascending: false });
    } else if (favoritesSortBy === 'date_asc') {
      query = query.order('created_at', { ascending: true });
    }

    const { data } = await query;

    if (data) {
      let listingsData = data.map((f) => f.listings).filter(Boolean) as Listing[];

      // Apply price sorting client-side since we're sorting through a join
      if (favoritesSortBy === 'price_asc') {
        listingsData.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (favoritesSortBy === 'price_desc') {
        listingsData.sort((a, b) => (b.price || 0) - (a.price || 0));
      }

      console.log('[FAVORITES] Loaded', listingsData.length, 'favorites with sort:', favoritesSortBy);
      setFavorites(listingsData);
    }
  };

  const loadWilayas = async () => {
    const { data } = await supabase.from('wilayas').select('*').order('id');

    if (data) setWilayas(data);
  };

  const handleSaveProfile = async () => {
    if (!fullName) {
      Alert.alert('Erreur', 'Le nom complet est requis');
      return;
    }

    setSaving(true);

    const { error } = await updateProfile({
      full_name: fullName,
      phone_number: phoneNumber,
      wilaya,
      commune,
    });

    if (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour du profil');
    } else {
      if (wilaya) {
        setCurrentLocation(wilaya);
      }
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      setEditMode(false);
    }

    setSaving(false);
  };

  const handleSignOut = async () => {
    console.log('[LOGOUT] Button clicked');
    try {
      if (Platform.OS === 'web') {
        console.log('[LOGOUT] Web platform detected');
        const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
        console.log('[LOGOUT] User confirmed:', confirmed);
        if (confirmed) {
          console.log('[LOGOUT] Calling signOut...');
          await signOut();
          console.log('[LOGOUT] SignOut complete, redirecting...');
          router.replace('/(auth)/login');
        }
      } else {
        Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: async () => {
              await signOut();
              router.replace('/(auth)/login');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('[LOGOUT] Error during sign out:', error);
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

  const handleDeleteListing = async (listingId: string) => {
    Alert.alert(
      '🗑️ Supprimer l\'annonce',
      '⚠️ Attention ! Cette action est définitive et irréversible.\n\nÊtes-vous absolument sûr de vouloir supprimer cette annonce ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Oui, supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listingId);

              if (error) throw error;

              await loadMyListings();

              Alert.alert(
                '✅ Annonce supprimée',
                'Votre annonce a été supprimée avec succès.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error deleting listing:', error);
              Alert.alert(
                '❌ Erreur',
                'Impossible de supprimer l\'annonce. Veuillez réessayer.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleToggleStatus = async (listing: Listing) => {
    const newStatus = listing.status === 'active' ? 'sold' : 'active';
    const statusText = newStatus === 'sold' ? 'vendue' : 'active';

    Alert.alert(
      'Changer le statut',
      `Voulez-vous marquer cette annonce comme ${statusText} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('listings')
                .update({ status: newStatus })
                .eq('id', listing.id);

              if (error) throw error;

              await loadMyListings();
              Alert.alert(
                '✅ Statut mis à jour',
                `Votre annonce est maintenant marquée comme ${statusText}.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error updating status:', error);
              Alert.alert(
                '❌ Erreur',
                'Impossible de mettre à jour le statut.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getCategoryName = (category: Category) => {
    const { language } = useLanguage();
    if (language === 'ar') return category.name_ar || category.name;
    if (language === 'en') return category.name_en || category.name;
    return category.name;
  };

  const renderListingCard = (listing: Listing, index: number) => {
    const screenWidth = Dimensions.get('window').width;
    const isWeb = Platform.OS === 'web';
    const cardWidth = isWeb && screenWidth > 768 ? (screenWidth - 64) / 4 - 16 : 280;

    return (
      <View key={listing.id} style={[styles.listingCardWrapper, { width: cardWidth }]}>
        <ListingCard
          listing={listing}
          onPress={() => router.push(`/listing/${listing.id}`)}
          isWeb={false}
          width={cardWidth}
        />
        <View style={styles.listingActionsOverlay}>
          <View style={styles.listingStatusRow}>
            <TouchableOpacity
              style={[
                styles.statusBadge,
                listing.status === 'active' && styles.statusActive,
                listing.status === 'sold' && styles.statusSold,
              ]}
              onPress={() => handleToggleStatus(listing)}
              activeOpacity={0.7}
            >
              <Text style={styles.statusText}>
                {listing.status === 'active' ? '✅ Active' : '🔴 Vendu'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listingActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editActionButton]}
              onPress={() => router.push(`/(tabs)/publish?editId=${listing.id}`)}
              activeOpacity={0.7}
            >
              <Edit size={16} color="#2563EB" />
              <Text style={styles.actionButtonText}>Modifier</Text>
            </TouchableOpacity>
            {listing.status === 'active' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.promoteActionButton]}
                onPress={() => {
                  Alert.alert(
                    '⚡ Booster votre annonce',
                    'Voulez-vous augmenter la visibilité de cette annonce ?',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Voir les options',
                        onPress: () => router.push(`/pro/promote-listing?id=${listing.id}`)
                      }
                    ],
                    { cancelable: true }
                  );
                }}
                activeOpacity={0.7}
              >
                <Zap size={16} color="#F59E0B" />
                <Text style={[styles.actionButtonText, { color: '#92400E' }]}>Booster</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteActionButton]}
              onPress={() => handleDeleteListing(listing.id)}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="#DC2626" />
              <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderProfileInfo = () => (
    <View style={styles.profileSection}>
      {editMode ? (
        <View style={styles.editForm}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('profile.fullName')}</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Ahmed Benali"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('profile.phoneNumber')}</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="0555 12 34 56"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('profile.wilaya')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={wilaya}
                onValueChange={(value) => setWilaya(value)}
                style={styles.picker}
              >
                <Picker.Item label={t('publish.selectWilaya')} value="" />
                {wilayas.map((w) => (
                  <Picker.Item key={w.id} label={`${w.code} - ${w.name}`} value={w.name} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <CommuneAutocomplete
              label={t('profile.commune')}
              placeholder="Bab Ezzouar"
              value={commune}
              wilayaId={wilayas.find(w => w.name === wilaya)?.id.toString() || null}
              wilayaName={wilaya || null}
              onSelect={setCommune}
              isRTL={isRTL}
            />
          </View>

          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditMode(false);
                setFullName(profile?.full_name || '');
                setPhoneNumber(profile?.phone_number || '');
                setWilaya(profile?.wilaya || '');
                setCommune(profile?.commune || '');
              }}
            >
              <Text style={[styles.cancelButtonText, isRTL && styles.textRTL]}>{t('profile.cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.saveButtonText, isRTL && styles.textRTL]}>{t('profile.save')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <User size={20} color="#64748B" />
            <Text style={[styles.infoText, isRTL && styles.textRTL]}>{profile?.full_name}</Text>
          </View>

          {profile?.phone_number && (
            <View style={styles.infoRow}>
              <Phone size={20} color="#64748B" />
              <Text style={[styles.infoText, isRTL && styles.textRTL]}>{profile.phone_number}</Text>
            </View>
          )}

          {profile?.wilaya && (
            <View style={styles.infoRow}>
              <MapPin size={20} color="#64748B" />
              <Text style={styles.infoText}>
                {profile.commune && `${profile.commune}, `}
                {profile.wilaya}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
            <Edit3 size={16} color="#2563EB" />
            <Text style={[styles.editButtonText, isRTL && styles.textRTL]}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TopBar />
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri:
                profile?.avatar_url ||
                'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=200',
            }}
            style={styles.avatar}
          />
          <View style={styles.nameRow}>
            <Text style={[styles.name, isRTL && styles.textRTL]}>{profile?.full_name || t('profile.user')}</Text>
            {profile?.user_type === 'professional' && (
              <View style={styles.proBadge}>
                <Crown size={14} color="#FFD700" />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={[styles.email, isRTL && styles.textRTL]}>{user?.email}</Text>

          {profile?.user_type !== 'professional' && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/pro/packages')}
            >
              <Crown size={16} color="#1A202C" />
              <Text style={[styles.upgradeButtonText, isRTL && styles.textRTL]}>
                {t('pro.becomePro')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'listings' && styles.tabActive]}
          onPress={() => setActiveTab('listings')}
        >
          <Package size={20} color={activeTab === 'listings' ? '#2563EB' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive, isRTL && styles.textRTL]}>
            {t('profile.myListings')} ({myListings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
          onPress={() => setActiveTab('favorites')}
        >
          <Heart size={20} color={activeTab === 'favorites' ? '#2563EB' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive, isRTL && styles.textRTL]}>
            {t('profile.favorites')} ({favorites.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Settings size={20} color={activeTab === 'settings' ? '#2563EB' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive, isRTL && styles.textRTL]}>
            {t('profile.parameters')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'listings' && (
        <View style={styles.content}>
          {myListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={48} color="#CBD5E1" />
              <Text style={[styles.emptyText, isRTL && styles.textRTL]}>{t('profile.emptyListings')}</Text>
              <TouchableOpacity
                style={styles.publishButton}
                onPress={() => router.push('/(tabs)/publish')}
              >
                <Text style={[styles.publishButtonText, isRTL && styles.textRTL]}>{t('myListings.publishListing')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listingsGrid}>
              {myListings.map((listing, index) => renderListingCard(listing, index))}
            </View>
          )}
        </View>
      )}

      {activeTab === 'favorites' && (
        <View style={styles.content}>
          {favorites.length === 0 ? (
            <View style={styles.emptyState}>
              <Heart size={48} color="#CBD5E1" />
              <Text style={[styles.emptyText, isRTL && styles.textRTL]}>{t('profile.emptyFavorites')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.sortContainer}>
                <Text style={[styles.sortLabel, isRTL && styles.textRTL]}>{t('search.sortBy')}:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortOptions}>
                  <TouchableOpacity
                    style={[styles.sortChip, favoritesSortBy === 'date_desc' && styles.sortChipActive]}
                    onPress={() => setFavoritesSortBy('date_desc')}
                  >
                    <Text style={[styles.sortChipText, favoritesSortBy === 'date_desc' && styles.sortChipTextActive, isRTL && styles.textRTL]}>
                      Plus récent
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortChip, favoritesSortBy === 'date_asc' && styles.sortChipActive]}
                    onPress={() => setFavoritesSortBy('date_asc')}
                  >
                    <Text style={[styles.sortChipText, favoritesSortBy === 'date_asc' && styles.sortChipTextActive, isRTL && styles.textRTL]}>
                      Plus ancien
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortChip, favoritesSortBy === 'price_asc' && styles.sortChipActive]}
                    onPress={() => setFavoritesSortBy('price_asc')}
                  >
                    <Text style={[styles.sortChipText, favoritesSortBy === 'price_asc' && styles.sortChipTextActive, isRTL && styles.textRTL]}>
                      Prix croissant
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortChip, favoritesSortBy === 'price_desc' && styles.sortChipActive]}
                    onPress={() => setFavoritesSortBy('price_desc')}
                  >
                    <Text style={[styles.sortChipText, favoritesSortBy === 'price_desc' && styles.sortChipTextActive, isRTL && styles.textRTL]}>
                      Prix décroissant
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
              <View style={styles.listingsGrid}>
                {favorites.map((listing, index) => renderListingCard(listing, index))}
              </View>
            </>
          )}
        </View>
      )}

      {activeTab === 'settings' && (
        <View style={styles.content}>
          {renderProfileInfo()}

          {profile?.user_type !== 'professional' && (
            <TouchableOpacity
              style={styles.proUpgradeButton}
              onPress={() => router.push('/pro/packages')}
            >
              <Crown size={20} color="#FFFFFF" />
              <Text style={[styles.proUpgradeButtonText, isRTL && styles.textRTL]}>
                Passer au compte PRO
              </Text>
            </TouchableOpacity>
          )}

          {(profile?.role === 'admin' || profile?.role === 'moderator') && (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/admin/dashboard')}
            >
              <Shield size={20} color="#FFFFFF" />
              <Text style={[styles.adminButtonText, isRTL && styles.textRTL]}>Dashboard Admin</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#DC2626" />
            <Text style={[styles.logoutText, isRTL && styles.textRTL]}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E5E7EB',
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFD700',
  },
  email: {
    fontSize: 14,
    color: '#E6F0FF',
    marginBottom: 12,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFC107',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A202C',
    textTransform: 'uppercase',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  listingsCarousel: {
    paddingHorizontal: 16,
    gap: 16,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 16,
  },
  listingCardWrapper: {
    marginBottom: 16,
  },
  listingActionsOverlay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  listingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusSold: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  listingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    minHeight: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  promoteActionButton: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  editActionButton: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  deleteActionButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
  },
  publishButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#1A202C',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E6F0FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 50,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  proUpgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  proUpgradeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  sortChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  sortChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

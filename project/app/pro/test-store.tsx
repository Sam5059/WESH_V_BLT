import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { Listing } from '@/types/database';
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Package,
  Crown,
  MessageCircle,
  ExternalLink,
  Clock,
  Globe,
  Facebook,
  Instagram,
  Search,
  ArrowLeft,
} from 'lucide-react-native';
import HomeButton from '@/components/HomeButton';

const { width } = Dimensions.get('window');

export default function TestStoreProfessional() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'about'>('listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
  });

  const slug = 'test-store-premium';

  useEffect(() => {
    loadProfessionalProfile();
  }, []);

  useEffect(() => {
    let filtered = [...listings];

    if (searchQuery) {
      filtered = filtered.filter((listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'price-asc') {
        return parseFloat(a.price) - parseFloat(b.price);
      } else {
        return parseFloat(b.price) - parseFloat(a.price);
      }
    });

    setFilteredListings(filtered);
  }, [listings, searchQuery, sortBy]);

  const loadProfessionalProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('professional_slug', slug)
        .eq('user_type', 'professional')
        .maybeSingle();

      if (profileError || !profileData) {
        console.error('Error loading profile:', profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!listingsError && listingsData) {
        setListings(listingsData);
        setStats({
          totalListings: listingsData.length,
          activeListings: listingsData.filter((l) => l.status === 'active').length,
          totalViews: listingsData.reduce((sum, l) => sum + (l.views || 0), 0),
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (profile?.phone_number) {
      Linking.openURL(`tel:${profile.phone_number}`);
    }
  };

  const handleWhatsApp = () => {
    if (profile?.whatsapp_number) {
      const message = encodeURIComponent(`Bonjour, je vous contacte depuis votre boutique ${profile.company_name || profile.full_name}`);
      Linking.openURL(`https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, '')}?text=${message}`);
    }
  };

  const handleMessage = () => {
    alert('Fonctionnalité de messagerie à venir');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Boutique professionnelle non trouvée</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const primaryColor = profile.store_primary_color || '#10B981';

  return (
    <ScrollView style={styles.container}>
      {/* Home Button */}
      <View style={styles.homeButtonContainer}>
        <HomeButton />
      </View>

      <View style={[styles.banner, { backgroundColor: primaryColor }]}>
        {profile.store_banner_url ? (
          <Image source={{ uri: profile.store_banner_url }} style={styles.bannerImage} />
        ) : null}
        <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        {profile.store_logo_url && (
          <Image source={{ uri: profile.store_logo_url }} style={styles.logo} />
        )}
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.storeName}>{profile.company_name || profile.full_name}</Text>
            <View style={[styles.proBadge, { backgroundColor: primaryColor }]}>
              <Crown size={14} color="#fff" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
          {profile.business_category && (
            <Text style={styles.category}>{profile.business_category}</Text>
          )}
          {profile.store_address && (
            <View style={styles.locationRow}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.locationText}>{profile.store_address}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.activeListings}</Text>
          <Text style={styles.statLabel}>Annonces</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalViews}</Text>
          <Text style={styles.statLabel}>Vues</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.years_in_business || 0}+</Text>
          <Text style={styles.statLabel}>Ans</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {profile.phone_number && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={handleCall}>
            <Phone size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Appeler</Text>
          </TouchableOpacity>
        )}
        {profile.whatsapp_number && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={handleWhatsApp}>
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.actionButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={handleMessage}>
          <Mail size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'listings' && { borderBottomColor: primaryColor }]}
          onPress={() => setActiveTab('listings')}>
          <Text style={[styles.tabText, activeTab === 'listings' && { color: primaryColor }]}>
            Annonces ({stats.activeListings})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'about' && { borderBottomColor: primaryColor }]}
          onPress={() => setActiveTab('about')}>
          <Text style={[styles.tabText, activeTab === 'about' && { color: primaryColor }]}>
            À propos
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'listings' ? (
        <View style={styles.tabContent}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher dans les annonces..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.sortRow}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'recent' && { backgroundColor: primaryColor }]}
              onPress={() => setSortBy('recent')}>
              <Text style={[styles.sortButtonText, sortBy === 'recent' && { color: '#fff' }]}>
                Plus récent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'price-asc' && { backgroundColor: primaryColor }]}
              onPress={() => setSortBy('price-asc')}>
              <Text style={[styles.sortButtonText, sortBy === 'price-asc' && { color: '#fff' }]}>
                Prix ↑
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'price-desc' && { backgroundColor: primaryColor }]}
              onPress={() => setSortBy('price-desc')}>
              <Text style={[styles.sortButtonText, sortBy === 'price-desc' && { color: '#fff' }]}>
                Prix ↓
              </Text>
            </TouchableOpacity>
          </View>

          {filteredListings.map((listing) => (
            <TouchableOpacity
              key={listing.id}
              style={styles.listingCard}
              onPress={() => router.push(`/listing/${listing.id}`)}>
              {listing.images && listing.images.length > 0 && (
                <Image source={{ uri: listing.images[0] }} style={styles.listingImage} />
              )}
              <View style={styles.listingInfo}>
                <Text style={styles.listingTitle} numberOfLines={2}>
                  {listing.title}
                </Text>
                <Text style={styles.listingPrice}>{parseFloat(listing.price).toLocaleString()} DA</Text>
                <Text style={styles.listingLocation}>{listing.commune}, {listing.wilaya}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {filteredListings.length === 0 && (
            <View style={styles.emptyState}>
              <Package size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>Aucune annonce trouvée</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.tabContent}>
          {profile.store_description && (
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Description</Text>
              <Text style={styles.aboutText}>{profile.store_description}</Text>
            </View>
          )}

          {profile.store_opening_hours && (
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Horaires d'ouverture</Text>
              {Object.entries(profile.store_opening_hours).map(([day, hours]) => (
                <View key={day} style={styles.hoursRow}>
                  <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                  <Text style={styles.hoursText}>{hours as string}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>Réseaux sociaux</Text>
            <View style={styles.socialLinks}>
              {profile.facebook_url && (
                <TouchableOpacity
                  style={[styles.socialButton, { borderColor: primaryColor }]}
                  onPress={() => Linking.openURL(profile.facebook_url)}>
                  <Facebook size={24} color={primaryColor} />
                </TouchableOpacity>
              )}
              {profile.instagram_url && (
                <TouchableOpacity
                  style={[styles.socialButton, { borderColor: primaryColor }]}
                  onPress={() => Linking.openURL(profile.instagram_url)}>
                  <Instagram size={24} color={primaryColor} />
                </TouchableOpacity>
              )}
              {profile.website_url && (
                <TouchableOpacity
                  style={[styles.socialButton, { borderColor: primaryColor }]}
                  onPress={() => Linking.openURL(profile.website_url)}>
                  <Globe size={24} color={primaryColor} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  homeButtonContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  banner: {
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButtonAbsolute: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: -40,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabContent: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listingImage: {
    width: 120,
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  listingInfo: {
    flex: 1,
    padding: 12,
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  aboutSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 15,
    color: '#6B7280',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

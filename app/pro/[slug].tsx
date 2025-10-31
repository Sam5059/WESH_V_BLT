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
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Listing } from '@/types/database';
import Footer from '@/components/Footer';
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
  Award,
  Search,
  Filter,
  ChevronDown,
  Building,
  User,
  ArrowLeft,
  ShoppingCart,
  Languages,
  X,
  Check,
  LogIn,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfessionalProfileScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'about'>('listings');
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'contact'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
  });
  const [isOwnStore, setIsOwnStore] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProfessionalProfile();
    }
  }, [slug]);

  useEffect(() => {
    filterAndSortListings();
  }, [listings, searchQuery, sortBy, subcategoryFilter, priceFilter]);

  const loadProfessionalProfile = async () => {
    try {
      console.log('🔍 Loading store with slug:', slug);

      // Chercher le store dans pro_stores
      const { data: storeData, error: storeError } = await supabase
        .from('pro_stores')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (storeError) {
        console.error('❌ Error loading store:', storeError);
        setLoading(false);
        return;
      }

      if (!storeData) {
        console.error('❌ Store not found for slug:', slug);
        setLoading(false);
        return;
      }

      console.log('✅ Store found:', storeData);

      // Charger le profil du propriétaire du store
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', storeData.user_id)
        .maybeSingle();

      if (profileError || !profileData) {
        console.error('❌ Error loading profile:', profileError);
        setLoading(false);
        return;
      }

      // Extraire le nom de la catégorie depuis l'objet category
      const categoryName = storeData.category
        ? (typeof storeData.category === 'string'
            ? storeData.category
            : storeData.category.name || storeData.category.name_en || '')
        : '';

      // Combiner les données du store et du profil
      setProfile({
        ...profileData,
        store: storeData,
        business_name: storeData.business_name,
        business_description: storeData.description,
        business_location: storeData.address,
        business_phone: storeData.phone,
        business_email: storeData.email,
        business_website: storeData.website,
        business_whatsapp: storeData.whatsapp,
        business_category: categoryName,
        store_logo_url: storeData.logo_url,
        store_banner_url: storeData.cover_url,
        store_description: storeData.description,
        store_address: storeData.address,
        phone_number: storeData.phone,
        whatsapp_number: storeData.whatsapp,
        wilaya: storeData.wilaya,
        commune: storeData.commune,
        category_id: storeData.category_id,
      });

      // Charger les sous-catégories de la catégorie du store
      if (storeData.category_id) {
        const { data: subcategoriesData } = await supabase
          .from('categories')
          .select('id, name, name_en, name_ar, slug')
          .eq('parent_id', storeData.category_id)
          .order('display_order', { ascending: true });

        if (subcategoriesData) {
          setSubcategories(subcategoriesData);
        }
      }

      // Check if viewing own store
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === storeData.user_id) {
        setIsOwnStore(true);
      }

      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', storeData.user_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (listingsData) {
        setListings(listingsData);
        setFilteredListings(listingsData);

        const totalViews = listingsData.reduce(
          (sum, listing) => sum + (listing.views_count || 0),
          0
        );

        setStats({
          totalListings: listingsData.length,
          activeListings: listingsData.filter((l) => l.status === 'active').length,
          totalViews,
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortListings = () => {
    let filtered = [...listings];

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query)
      );
    }

    // Filtre par sous-catégorie
    if (subcategoryFilter !== 'all') {
      filtered = filtered.filter((listing) => listing.category_id === subcategoryFilter);
    }

    // Filtre par prix
    if (priceFilter.min) {
      const minPrice = parseFloat(priceFilter.min);
      filtered = filtered.filter((listing) => listing.price >= minPrice);
    }
    if (priceFilter.max) {
      const maxPrice = parseFloat(priceFilter.max);
      filtered = filtered.filter((listing) => listing.price <= maxPrice);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredListings(filtered);
  };

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price);
    return formatted.replace('DZD', 'DA');
  };

  const openWhatsApp = () => {
    if (profile?.whatsapp_number) {
      const url = `https://wa.me/${profile.whatsapp_number.replace(/\D/g, '')}`;
      Linking.openURL(url);
    }
  };

  const openPhone = () => {
    if (profile?.phone_number) {
      Linking.openURL(`tel:${profile.phone_number}`);
    }
  };

  const openSocialMedia = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleSubmitContactForm = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Building size={64} color="#94A3B8" style={{ marginBottom: 20 }} />
          <Text style={[styles.errorTitle, isRTL && styles.textRTL]}>
            Store introuvable
          </Text>
          <Text style={[styles.errorText, isRTL && styles.textRTL]}>
            Le Store PRO "{slug}" n'existe pas ou n'est pas actif.
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => router.push('/pro')}
          >
            <Text style={styles.errorButtonText}>
              Voir tous les Stores PRO
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.errorButtonSecondary}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonSecondaryText}>
              Retour
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const primaryColor = profile.store_primary_color || '#2563EB';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Top Header - White Background */}
        <View style={styles.topHeader}>
          {/* Left Side: Back + Logo */}
          <View style={styles.leftHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#1F2937" />
            </TouchableOpacity>
            <Image
              source={{
                uri:
                  profile.store_logo_url ||
                  profile.avatar_url ||
                  'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=400',
              }}
              style={styles.topHeaderLogo}
            />
          </View>

          {/* Right Side: Language + Cart + Login */}
          <View style={styles.rightHeader}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text style={styles.languageText}>
                {language === 'ar' ? 'AR' : language === 'en' ? 'EN' : 'FR'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowCart(true)}
            >
              <ShoppingCart size={20} color="#1F2937" />
              {cart.length > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: primaryColor }]}>
                  <Text style={styles.cartBadgeText}>{cart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (user) {
                  router.push('/(tabs)/profile');
                } else {
                  router.push('/(auth)/login');
                }
              }}
            >
              {user ? (
                <User size={20} color="#1F2937" />
              ) : (
                <LogIn size={20} color="#1F2937" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Title Section - Gray Background */}
        <View style={styles.storeTitleSection}>
          <Text style={[styles.storeName, isRTL && styles.textRTL]}>
            {profile.store_name || profile.business_name || profile.full_name}
          </Text>
          {profile.business_category && (
            <Text style={[styles.storeCategory, isRTL && styles.textRTL]}>
              {profile.business_category}
            </Text>
          )}
        </View>

        {/* Navigation Tabs */}
        <View style={styles.navTabs}>
          <TouchableOpacity
            style={[styles.navTab, activeNavTab === 'home' && styles.navTabActive]}
            onPress={() => setActiveNavTab('home')}
          >
            <Text
              style={[
                styles.navTabText,
                activeNavTab === 'home' && styles.navTabTextActive,
              ]}
            >
              ACCUEIL
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navTab, activeNavTab === 'contact' && styles.navTabActive]}
            onPress={() => setActiveNavTab('contact')}
          >
            <Text
              style={[
                styles.navTabText,
                activeNavTab === 'contact' && styles.navTabTextActive,
              ]}
            >
              NOUS CONTACTER
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conditional Content Based on Active Nav Tab */}
        {activeNavTab === 'home' ? (
          <>
            {/* Main Content with Sidebar Layout */}
            <View style={styles.mainContentWrapper}>
              {/* Left Sidebar - Filters */}
              <View style={styles.filtersSidebar}>
                <Text style={styles.filtersTitle}>Filtres</Text>

                {/* Search Box */}
                <View style={styles.filterSection}>
                  <View style={styles.searchBoxSidebar}>
                    <Search size={16} color="#64748B" />
                    <TextInput
                      style={styles.searchInputSidebar}
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Price Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Prix (DA)</Text>
                  <View style={styles.priceInputRow}>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Min"
                      value={priceFilter.min}
                      onChangeText={(text) => setPriceFilter({ ...priceFilter, min: text })}
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text style={styles.priceSeparator}>-</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Max"
                      value={priceFilter.max}
                      onChangeText={(text) => setPriceFilter({ ...priceFilter, max: text })}
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Subcategory Filter */}
                {subcategories.length > 0 && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>
                      {profile.business_category ? `${profile.business_category}` : 'Sous-catégories'}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        subcategoryFilter === 'all' && [styles.categoryOptionActive, { backgroundColor: primaryColor + '15' }],
                      ]}
                      onPress={() => setSubcategoryFilter('all')}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        subcategoryFilter === 'all' && [styles.categoryOptionTextActive, { color: primaryColor }],
                      ]}>
                        Toutes les sous-catégories
                      </Text>
                    </TouchableOpacity>
                    {subcategories.map((subcategory) => (
                      <TouchableOpacity
                        key={subcategory.id}
                        style={[
                          styles.categoryOption,
                          subcategoryFilter === subcategory.id && [styles.categoryOptionActive, { backgroundColor: primaryColor + '15' }],
                        ]}
                        onPress={() => setSubcategoryFilter(subcategory.id)}
                      >
                        <Text style={[
                          styles.categoryOptionText,
                          subcategoryFilter === subcategory.id && [styles.categoryOptionTextActive, { color: primaryColor }],
                        ]}>
                          {language === 'ar' ? subcategory.name_ar : (language === 'en' ? subcategory.name_en : subcategory.name)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Filter Actions */}
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setPriceFilter({ min: '', max: '' });
                    setSubcategoryFilter('all');
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.clearFiltersText}>Réinitialiser les filtres</Text>
                </TouchableOpacity>
              </View>

              {/* Right Content Area */}
              <View style={styles.contentArea}>

            {/* Professional Header with stats - More compact */}
            <View style={styles.header}>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Package size={18} color={primaryColor} />
              <Text style={[styles.statValue, isRTL && styles.textRTL]}>
                {stats.activeListings}
              </Text>
              <Text style={[styles.statLabel, isRTL && styles.textRTL]}>Annonces</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Star size={18} color="#FBBF24" />
              <Text style={[styles.statValue, isRTL && styles.textRTL]}>
                {stats.totalViews}
              </Text>
              <Text style={[styles.statLabel, isRTL && styles.textRTL]}>Vues</Text>
            </View>
            {profile.years_in_business > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Award size={18} color={primaryColor} />
                  <Text style={[styles.statValue, isRTL && styles.textRTL]}>
                    {profile.years_in_business}+
                  </Text>
                  <Text style={[styles.statLabel, isRTL && styles.textRTL]}>Ans</Text>
                </View>
              </>
            )}
          </View>

          {/* Pro Package Badge - Only shown to store owner */}
          {isOwnStore && profile.has_active_pro_package && (
            <View style={styles.packageBadgeContainer}>
              <View style={[styles.packageBadge, { borderColor: primaryColor }]}>
                <View style={styles.packageBadgeContent}>
                  <Crown size={20} color={primaryColor} />
                  <View style={styles.packageBadgeText}>
                    <Text style={[styles.packageBadgeTitle, { color: primaryColor }]}>
                      Forfait PRO Actif
                    </Text>
                    <Text style={styles.packageBadgeExpiry}>
                      Expire le {profile.pro_package_expires_at ? new Date(profile.pro_package_expires_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.upgradePackageButton, { backgroundColor: primaryColor }]}
                  onPress={() => router.push('/pro/packages')}
                >
                  <Text style={styles.upgradePackageButtonText}>Upgrade</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Contact Buttons */}
          <View style={styles.contactButtons}>
            {profile.phone_number && (
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: primaryColor }]}
                onPress={openPhone}
              >
                <Phone size={16} color="#FFFFFF" />
                <Text style={[styles.contactButtonText, isRTL && styles.textRTL]}>
                  Appeler
                </Text>
              </TouchableOpacity>
            )}
            {profile.whatsapp_number && (
              <TouchableOpacity
                style={[styles.whatsappButton]}
                onPress={openWhatsApp}
              >
                <MessageCircle size={16} color="#25D366" />
                <Text style={[styles.whatsappButtonText, isRTL && styles.textRTL]}>
                  WhatsApp
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.messageButton, { borderColor: primaryColor }]}
            >
              <MessageCircle size={16} color={primaryColor} />
              <Text style={[styles.messageButtonText, { color: primaryColor }, isRTL && styles.textRTL]}>
                Message
              </Text>
            </TouchableOpacity>
          </View>

          {/* Social Media Links */}
          {(profile.website_url || profile.facebook_url || profile.instagram_url) && (
            <View style={styles.socialLinks}>
              {profile.website_url && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => openSocialMedia(profile.website_url)}
                >
                  <Globe size={20} color="#64748B" />
                </TouchableOpacity>
              )}
              {profile.facebook_url && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => openSocialMedia(profile.facebook_url)}
                >
                  <Facebook size={20} color="#1877F2" />
                </TouchableOpacity>
              )}
              {profile.instagram_url && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => openSocialMedia(profile.instagram_url)}
                >
                  <Instagram size={20} color="#E4405F" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'listings' && [styles.tabActive, { borderBottomColor: primaryColor }],
            ]}
            onPress={() => setActiveTab('listings')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'listings' && [styles.tabTextActive, { color: primaryColor }],
              ]}
            >
              Annonces ({filteredListings.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'about' && [styles.tabActive, { borderBottomColor: primaryColor }],
            ]}
            onPress={() => setActiveTab('about')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'about' && [styles.tabTextActive, { color: primaryColor }],
              ]}
            >
              À propos
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Tab */}
        {activeTab === 'about' && (
          <View style={styles.aboutSection}>
            {profile.store_description && (
              <View style={styles.aboutCard}>
                <Text style={[styles.aboutTitle, isRTL && styles.textRTL]}>
                  À propos
                </Text>
                <Text style={[styles.aboutText, isRTL && styles.textRTL]}>
                  {profile.store_description}
                </Text>
              </View>
            )}

            {profile.store_opening_hours && Object.keys(profile.store_opening_hours).length > 0 && (
              <View style={styles.aboutCard}>
                <View style={styles.cardHeader}>
                  <Clock size={20} color={primaryColor} />
                  <Text style={[styles.aboutTitle, isRTL && styles.textRTL]}>
                    Horaires d'ouverture
                  </Text>
                </View>
                {Object.entries(profile.store_opening_hours).map(([day, hours]) => (
                  <View key={day} style={styles.hoursRow}>
                    <Text style={[styles.dayText, isRTL && styles.textRTL]}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Text>
                    <Text style={[styles.hoursText, isRTL && styles.textRTL]}>
                      {hours as string}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {profile.store_address && (
              <View style={styles.aboutCard}>
                <View style={styles.cardHeader}>
                  <MapPin size={20} color={primaryColor} />
                  <Text style={[styles.aboutTitle, isRTL && styles.textRTL]}>
                    Localisation
                  </Text>
                </View>
                <Text style={[styles.addressText, isRTL && styles.textRTL]}>
                  {profile.store_address}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <View style={styles.listingsSection}>
            {/* Search and Filters */}
            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <Search size={18} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher une annonce..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity style={styles.sortButton}>
                <Filter size={18} color={primaryColor} />
                <Text style={[styles.sortText, { color: primaryColor }]}>Filtrer</Text>
              </TouchableOpacity>
            </View>

            {/* Sort Options */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sortOptions}
            >
              <TouchableOpacity
                style={[
                  styles.sortChip,
                  sortBy === 'recent' && [styles.sortChipActive, { backgroundColor: primaryColor }],
                ]}
                onPress={() => setSortBy('recent')}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    sortBy === 'recent' && styles.sortChipTextActive,
                  ]}
                >
                  Plus récent
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortChip,
                  sortBy === 'price-asc' && [styles.sortChipActive, { backgroundColor: primaryColor }],
                ]}
                onPress={() => setSortBy('price-asc')}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    sortBy === 'price-asc' && styles.sortChipTextActive,
                  ]}
                >
                  Prix croissant
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortChip,
                  sortBy === 'price-desc' && [styles.sortChipActive, { backgroundColor: primaryColor }],
                ]}
                onPress={() => setSortBy('price-desc')}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    sortBy === 'price-desc' && styles.sortChipTextActive,
                  ]}
                >
                  Prix décroissant
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {filteredListings.length === 0 ? (
              <View style={styles.emptyState}>
                <Package size={48} color="#CBD5E1" />
                <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
                  {searchQuery ? 'Aucun résultat trouvé' : 'Aucune annonce'}
                </Text>
              </View>
            ) : (
              <View style={styles.listingsGrid}>
                {filteredListings.map((listing) => (
                  <TouchableOpacity
                    key={listing.id}
                    style={styles.listingCard}
                    onPress={() => router.push(`/listing/${listing.id}`)}
                  >
                    <Image
                      source={{
                        uri:
                          listing.images?.[0] ||
                          'https://images.pexels.com/photos/1667849/pexels-photo-1667849.jpeg?auto=compress&cs=tinysrgb&w=400',
                      }}
                      style={styles.listingImage}
                    />
                    {listing.is_featured && (
                      <View style={[styles.featuredBadge, { backgroundColor: primaryColor }]}>
                        <Text style={styles.featuredText}>À LA UNE</Text>
                      </View>
                    )}
                    <View style={styles.listingInfo}>
                      <Text style={[styles.listingTitle, isRTL && styles.textRTL]} numberOfLines={2}>
                        {listing.title}
                      </Text>
                      <Text style={[styles.listingPrice, { color: primaryColor }, isRTL && styles.textRTL]}>
                        {formatPrice(listing.price)}
                      </Text>
                      <View style={styles.listingMeta}>
                        <MapPin size={12} color="#64748B" />
                        <Text style={[styles.listingLocation, isRTL && styles.textRTL]}>
                          {listing.wilaya}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
              </View>
            </View>
        </>
        ) : (
          /* Contact Form Section */
          <View style={styles.contactFormSection}>
            <View style={styles.contactFormCard}>
              <Text style={styles.contactFormTitle}>
                Contactez-nous
              </Text>
              <Text style={styles.contactFormSubtitle}>
                Envoyez-nous un message et nous vous répondrons rapidement
              </Text>

              {formSubmitted ? (
                <View style={styles.successMessage}>
                  <View style={[styles.successIcon, { backgroundColor: primaryColor }]}>
                    <Text style={styles.successIconText}>✓</Text>
                  </View>
                  <Text style={styles.successText}>Message envoyé avec succès!</Text>
                  <Text style={styles.successSubtext}>Nous vous répondrons bientôt.</Text>
                </View>
              ) : (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Nom complet *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Entrez votre nom"
                      value={contactForm.name}
                      onChangeText={(text) => setContactForm({ ...contactForm, name: text })}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Email *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="votre@email.com"
                      value={contactForm.email}
                      onChangeText={(text) => setContactForm({ ...contactForm, email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Téléphone</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="+213 XXX XXX XXX"
                      value={contactForm.phone}
                      onChangeText={(text) => setContactForm({ ...contactForm, phone: text })}
                      keyboardType="phone-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Message *</Text>
                    <TextInput
                      style={[styles.formInput, styles.formTextArea]}
                      placeholder="Votre message..."
                      value={contactForm.message}
                      onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: primaryColor }]}
                    onPress={handleSubmitContactForm}
                  >
                    <Text style={styles.submitButtonText}>Envoyer le message</Text>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.contactInfoGrid}>
                {profile.phone_number && (
                  <View style={styles.contactInfoBox}>
                    <View style={[styles.contactInfoIcon, { backgroundColor: primaryColor + '15' }]}>
                      <Phone size={20} color={primaryColor} />
                    </View>
                    <Text style={styles.contactInfoBoxLabel}>Téléphone</Text>
                    <Text style={styles.contactInfoBoxValue}>{profile.phone_number}</Text>
                  </View>
                )}

                {profile.business_email && (
                  <View style={styles.contactInfoBox}>
                    <View style={[styles.contactInfoIcon, { backgroundColor: primaryColor + '15' }]}>
                      <Mail size={20} color={primaryColor} />
                    </View>
                    <Text style={styles.contactInfoBoxLabel}>Email</Text>
                    <Text style={styles.contactInfoBoxValue}>{profile.business_email}</Text>
                  </View>
                )}

                {profile.store_address && (
                  <View style={styles.contactInfoBox}>
                    <View style={[styles.contactInfoIcon, { backgroundColor: primaryColor + '15' }]}>
                      <MapPin size={20} color={primaryColor} />
                    </View>
                    <Text style={styles.contactInfoBoxLabel}>Adresse</Text>
                    <Text style={styles.contactInfoBoxValue}>{profile.store_address}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <Footer />
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.languageModal}>
            <View style={styles.languageModalHeader}>
              <Text style={styles.languageModalTitle}>Choisir une langue</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'fr' && styles.languageOptionActive,
              ]}
              onPress={() => {
                // Change language to French
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.languageOptionText}>Français</Text>
              {language === 'fr' && <Check size={20} color="#2563EB" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'en' && styles.languageOptionActive,
              ]}
              onPress={() => {
                // Change language to English
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.languageOptionText}>English</Text>
              {language === 'en' && <Check size={20} color="#2563EB" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'ar' && styles.languageOptionActive,
              ]}
              onPress={() => {
                // Change language to Arabic
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.languageOptionText}>العربية</Text>
              {language === 'ar' && <Check size={20} color="#2563EB" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Cart Modal */}
      <Modal
        visible={showCart}
        animationType="slide"
        onRequestClose={() => setShowCart(false)}
      >
        <View style={styles.cartModal}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Panier</Text>
            <TouchableOpacity onPress={() => setShowCart(false)}>
              <X size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <ShoppingCart size={64} color="#CBD5E1" />
              <Text style={styles.emptyCartText}>Votre panier est vide</Text>
              <Text style={styles.emptyCartSubtext}>
                Parcourez les produits et ajoutez-les à votre panier
              </Text>
              <TouchableOpacity
                style={[styles.continueShoppingButton, { backgroundColor: primaryColor }]}
                onPress={() => setShowCart(false)}
              >
                <Text style={styles.continueShoppingText}>Continuer les achats</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.cartItems}>
              {cart.map((item, index) => (
                <View key={index} style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemTitle}>{item.title}</Text>
                    <Text style={styles.cartItemPrice}>{formatPrice(item.price)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setCart(cart.filter((_, i) => i !== index));
                    }}
                  >
                    <X size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {cart.length > 0 && (
            <View style={styles.cartFooter}>
              <View style={styles.cartTotal}>
                <Text style={styles.cartTotalLabel}>Total</Text>
                <Text style={styles.cartTotalValue}>
                  {formatPrice(cart.reduce((sum, item) => sum + item.price, 0))}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.checkoutButton, { backgroundColor: primaryColor }]}
                onPress={() => {
                  if (user) {
                    // Proceed to checkout
                    setShowCart(false);
                  } else {
                    setShowCart(false);
                    router.push('/(auth)/login');
                  }
                }}
              >
                <Text style={styles.checkoutButtonText}>
                  {user ? 'Commander' : 'Se connecter pour commander'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
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
  // Top Header - White Background
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  topHeaderLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  // Store Title Section - Modern Background
  storeTitleSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  storeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  storeCategory: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
    textAlign: 'center',
  },
  // Navigation Tabs - Modern Background
  navTabs: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  navTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  navTabActive: {
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  navTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  navTabTextActive: {
    color: '#1F2937',
  },
  // Main Content Layout with Sidebar
  mainContentWrapper: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filtersSidebar: {
    width: 280,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  searchBoxSidebar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInputSidebar: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  priceSeparator: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  categoryOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  categoryOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    fontWeight: '600',
  },
  clearFiltersButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Search and Filter
  searchFilterBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
  },
  // Compact Stats Bar
  compactStatsBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    gap: 12,
  },
  compactStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactStatLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
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
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorButtonSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  errorButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  backButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  banner: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  bannerPlaceholder: {
    width: '100%',
    height: 200,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: -40,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  storeTitleSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  storeLogo: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignSelf: 'center',
  },
  storeTitleInfo: {
    alignItems: 'center',
  },
  storeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginRight: 8,
  },
  storeCategoryText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  storeDescriptionShort: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  businessName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.3,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ownerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F8F1',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  whatsappButtonText: {
    color: '#25D366',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 6,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  socialButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#F8FAFC',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  aboutSection: {
    padding: 16,
    gap: 16,
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dayText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 14,
    color: '#64748B',
  },
  addressText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  listingsSection: {
    padding: 16,
  },
  searchSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortOptions: {
    marginBottom: 16,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    marginRight: 8,
  },
  sortChipActive: {
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 8,
  },
  listingCard: {
    width: width > 768 ? (width - 72 - 24) / 3 : (width - 56 - 12) / 2,
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
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
    minHeight: 36,
  },
  listingPrice: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  listingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listingLocation: {
    fontSize: 11,
    color: '#64748B',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  packageBadgeContainer: {
    marginBottom: 16,
  },
  packageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  packageBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  packageBadgeText: {
    flex: 1,
  },
  packageBadgeTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  packageBadgeExpiry: {
    fontSize: 12,
    color: '#64748B',
  },
  upgradePackageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradePackageButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // Contact Form Section Styles
  contactFormSection: {
    padding: 16,
  },
  contactFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  contactFormTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  contactFormSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 28,
    lineHeight: 22,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  formTextArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successMessage: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 32,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  successText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 15,
    color: '#64748B',
  },
  contactInfoGrid: {
    gap: 16,
  },
  contactInfoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  contactInfoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactInfoBoxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  contactInfoBoxValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  // Cart Badge
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  // Language Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  languageModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  languageOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  // Cart Modal
  cartModal: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  continueShoppingButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  continueShoppingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cartItems: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  cartFooter: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  cartTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  checkoutButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

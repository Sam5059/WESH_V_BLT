import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
  useWindowDimensions,
  Image,
} from 'react-native';
import { router, useSegments } from 'expo-router';
import { Search, Bell, MessageCircle, User, X, MapPin, ChevronDown, Check, LogOut, Settings, Store, ArrowLeft, Clock, Menu, Package, Heart, Hop as Home, ShoppingBag, Gem, CirclePlus as PlusCircle, HelpCircle } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useHelp } from '@/contexts/HelpContext';
import { useSearch } from '@/contexts/SearchContext';
import { supabase } from '@/lib/supabase';
import Logo from './Logo';
import { Category } from '@/types/database';
import SearchHistoryModal from './SearchHistoryModal';
import HelpTooltip from './HelpTooltip';
import Tooltip from './Tooltip';

const wilayas = [
  '01-Adrar', '02-Chlef', '03-Laghouat', '04-Oum El Bouaghi', '05-Batna',
  '06-Béjaïa', '07-Biskra', '08-Béchar', '09-Blida', '10-Bouira',
  '11-Tamanrasset', '12-Tébessa', '13-Tlemcen', '14-Tiaret', '15-Tizi Ouzou',
  '16-Alger', '17-Djelfa', '18-Jijel', '19-Sétif', '20-Saïda',
  '21-Skikda', '22-Sidi Bel Abbès', '23-Annaba', '24-Guelma', '25-Constantine',
  '26-Médéa', '27-Mostaganem', '28-M\'Sila', '29-Mascara', '30-Ouargla',
  '31-Oran', '32-El Bayadh', '33-Illizi', '34-Bordj Bou Arreridj', '35-Boumerdès',
  '36-El Tarf', '37-Tindouf', '38-Tissemsilt', '39-El Oued', '40-Khenchela',
  '41-Souk Ahras', '42-Tipaza', '43-Mila', '44-Aïn Defla', '45-Naâma',
  '46-Aïn Témouchent', '47-Ghardaïa', '48-Relizane', '49-Timimoun',
  '50-Bordj Badji Mokhtar', '51-Ouled Djellal', '52-Béni Abbès',
  '53-In Salah', '54-In Guezzam', '55-Touggourt', '56-Djanet',
  '57-El M\'Ghair', '58-El Meniaa',
];

interface TopBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearch?: () => void;
}

export default function TopBar({ searchQuery: externalSearchQuery, onSearchChange, onSearch }: TopBarProps = {}) {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const { currentLocation, setCurrentLocation } = useLocation();
  const { setShowGlobalHelp } = useHelp();
  const { globalSearchQuery, setGlobalSearchQuery } = useSearch();
  const { width } = useWindowDimensions();
  const segments = useSegments();
  const isMobile = width < 768;

  // Détermine si on est sur la page d'accueil
  const isHomePage =
    segments.length === 0 ||
    (segments.length === 1 && segments[0] === '(tabs)') ||
    (segments.length === 2 && segments[0] === '(tabs)' && segments[1] === 'index');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedListingType, setSelectedListingType] = useState<'all' | 'sale' | 'purchase' | 'rent'>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Record<string, Category[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showProMenu, setShowProMenu] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [user]);

  // Déclencher la recherche automatiquement quand le texte change (debounce)
  useEffect(() => {
    // Si on a un callback onSearch personnalisé, ne pas auto-naviguer
    if (onSearch) return;

    // Sinon, naviguer automatiquement vers la page de recherche après un délai
    const timer = setTimeout(() => {
      if (globalSearchQuery && globalSearchQuery.trim()) {
        router.push(`/(tabs)/search?q=${encodeURIComponent(globalSearchQuery)}`);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [globalSearchQuery, onSearch]);


  const loadCategories = async () => {
    const { data: mainCategories } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .neq('slug', 'stores-pro') // Exclure Store PRO du menu catégories
      .order('display_order', { ascending: true, nullsFirst: false });

    if (mainCategories) {
      const uniqueCategories = mainCategories.filter((cat, index, self) =>
        index === self.findIndex((c) => c.id === cat.id)
      );
      setCategories(uniqueCategories);

      const { data: allSubcategories } = await supabase
        .from('categories')
        .select('*')
        .not('parent_id', 'is', null)
        .order('display_order', { ascending: true, nullsFirst: false });

      if (allSubcategories) {
        const uniqueSubcategories = allSubcategories.filter((cat, index, self) =>
          index === self.findIndex((c) => c.id === cat.id)
        );
        const grouped: Record<string, Category[]> = {};
        uniqueSubcategories.forEach(sub => {
          if (sub.parent_id) {
            if (!grouped[sub.parent_id]) {
              grouped[sub.parent_id] = [];
            }
            grouped[sub.parent_id].push(sub);
          }
        });
        setSubcategories(grouped);

        // Compter les annonces pour chaque catégorie parente
        const counts: Record<string, number> = {};
        await Promise.all(
          uniqueCategories.map(async (category) => {
            const subs = grouped[category.id] || [];
            const subcategoryIds = subs.map(s => s.id);

            if (subcategoryIds.length > 0) {
              const { count } = await supabase
                .from('listings')
                .select('*', { count: 'exact', head: true })
                .in('category_id', subcategoryIds)
                .eq('status', 'active');

              counts[category.id] = count || 0;
            } else {
              counts[category.id] = 0;
            }
          })
        );
        setCategoryCounts(counts);
      }
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getCategoryName = (category: Category) => {
    if (language === 'ar' && category.name_ar) return category.name_ar;
    if (language === 'en' && category.name) return category.name;
    if (language === 'fr' && category.name) return category.name;
    return category.name || category.name_ar;
  };

  // Utiliser externalSearchQuery si fourni, sinon globalSearchQuery
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : globalSearchQuery;

  const handleSearchQueryChange = (query: string) => {
    // Mettre à jour le contexte global
    setGlobalSearchQuery(query);

    // Appeler le callback si fourni
    if (onSearchChange) {
      onSearchChange(query);
    }

    // Si le texte devient vide et qu'on est sur la page search, nettoyer l'URL
    if (query.trim() === '' && segments.includes('search')) {
      router.push('/(tabs)/search');
    }
  };

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
  ];

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    } else if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (selectedListingType !== 'all') {
        params.set('type', selectedListingType);
      }
      router.push(`/(tabs)/search?${params.toString()}`);
    } else {
      // Si la recherche est vide, rediriger vers /search sans paramètres
      router.push('/(tabs)/search');
    }
  };

  const handleListingTypeChange = (type: 'all' | 'sale' | 'purchase' | 'rent') => {
    setSelectedListingType(type);
    const params = new URLSearchParams();
    if (type !== 'all') {
      params.set('type', type);
    }
    const queryString = params.toString();
    router.replace(`/(tabs)${queryString ? '?' + queryString : ''}`);
  };

  return (
    <>
      {/* MOBILE: Barre de navigation eBay Style */}
      {isMobile ? (
        <>
          <View style={styles.mobileTopBar}>
            <View style={styles.logoContainerMobile}>
              <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.mobileColoredLogo}>
                <Logo language={language as 'ar' | 'fr' | 'en'} size="medium" />
              </TouchableOpacity>
            </View>

            <View style={styles.mobileTopRight}>
              <TouchableOpacity
                style={styles.mobileLanguageButton}
                onPress={() => setShowLanguageMenu(true)}
              >
                <Text style={styles.mobileLanguageText}>
                  {language === 'fr' ? 'FR' : language === 'ar' ? 'ع' : 'EN'}
                </Text>
              </TouchableOpacity>
              {user ? (
                <TouchableOpacity
                  style={styles.mobileUserButtonTop}
                  onPress={() => setShowAccountMenu(true)}
                >
                  <View style={styles.mobileUserAvatarTop}>
                    <User size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.mobileSignInButton}
                  onPress={() => router.push('/(auth)/login')}
                >
                  <User size={18} color="#2563EB" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Barre de recherche mobile élégante */}
          <View style={styles.mobileSearchBar}>
            {user && (
              <TouchableOpacity
                style={styles.searchHistoryButton}
                onPress={() => setShowSearchHistory(true)}
              >
                <Clock size={20} color="#2563EB" />
              </TouchableOpacity>
            )}
            <View style={styles.mobileSearchInputContainer}>
              <Search size={20} color="#64748B" strokeWidth={2.5} />
              <TextInput
                style={styles.mobileSearchInput}
                placeholder={language === 'ar' ? 'ماذا تبحث؟' : language === 'en' ? 'What are you looking for?' : 'Que cherchez-vous ?'}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={handleSearchQueryChange}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity
              style={styles.mobileLocationButton}
              onPress={() => setShowLocationMenu(true)}
            >
              <MapPin size={15} color="#2563EB" strokeWidth={2.5} />
              <Text style={styles.mobileLocationText} numberOfLines={1}>
                {currentLocation ? currentLocation.split('-')[1]?.trim() || currentLocation : 'Alger'}
              </Text>
              <ChevronDown size={13} color="#2563EB" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Navigation horizontale scrollable */}
          <View style={styles.mobileNavBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mobileNavContent}
            >
              <TouchableOpacity
                style={styles.mobileNavButton}
                onPress={() => router.push('/(tabs)')}
              >
                <View style={styles.mobileNavIcon}>
                  <Text style={styles.mobileNavEmoji}>🏠</Text>
                </View>
                <Text style={styles.mobileNavText}>Accueil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mobileNavButton, styles.mobileNavButtonHighlight]}
                onPress={() => router.push('/pro/packages')}
              >
                <View style={styles.mobileNavIcon}>
                  <Text style={styles.mobileNavEmoji}>💎</Text>
                </View>
                <Text style={[styles.mobileNavText, styles.mobileNavTextHighlight]}>
                  {t('topBar.buyPro')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mobileNavButton, styles.mobileNavButtonHighlight]}
                onPress={() => router.push('/(tabs)/publish')}
              >
                <View style={styles.mobileNavIcon}>
                  <Text style={styles.mobileNavEmoji}>📝</Text>
                </View>
                <Text style={[styles.mobileNavText, styles.mobileNavTextHighlight]}>
                  {t('topBar.publishFree')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </>
      ) : (
        /* DESKTOP: Barre supérieure complète */
        <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          {/* Logo coloré dans la barre supérieure */}
          <View style={styles.logoContainerDesktop}>
            {!isHomePage && (
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <ArrowLeft size={20} color="#2563EB" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.coloredLogo}>
              <Logo language={language as 'ar' | 'fr' | 'en'} size="large" />
            </TouchableOpacity>
          </View>

          <View style={styles.dividerVertical} />

          {/* Barre de recherche avec sélecteur de catégorie */}
          <View style={styles.searchContainerTop}>
            <View style={styles.searchBarWithCategory}>
              <Search size={20} color="#64748B" style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInputWithCategory, isRTL && styles.searchInputRTL]}
                placeholder={t('home.searchPlaceholder')}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={handleSearchQueryChange}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => handleSearchQueryChange('')}
                  style={styles.clearSearchButton}
                >
                  <X size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
              <View style={styles.categoryDivider} />
              <TouchableOpacity
                style={styles.categoryDropdownButton}
                onPress={() => setShowCategoryDropdown(true)}
              >
                <Text style={styles.categoryDropdownText} numberOfLines={1}>
                  {selectedCategoryId
                    ? getCategoryName(categories.find(c => c.id === selectedCategoryId)!)
                    : (language === 'ar' ? 'جميع الفئات' : language === 'en' ? 'All Categories' : 'Toutes Catégories')}
                </Text>
                <ChevronDown size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dividerVertical} />

          {/* Sélecteur de localisation */}
          <Tooltip text="Changer la localisation">
            <TouchableOpacity
              style={styles.locationSelector}
              onPress={() => setShowLocationMenu(true)}
            >
              <MapPin size={16} color="#2563EB" />
              <Text style={styles.locationValue}>{currentLocation}</Text>
              <ChevronDown size={14} color="#2563EB" />
            </TouchableOpacity>
          </Tooltip>
        </View>

        <View style={styles.topBarRight}>
          {/* Icônes rapides */}
          {!isMobile && (
            <View style={styles.quickIconsContainer}>
              <Tooltip text="Centre d'aide">
                <TouchableOpacity
                  style={styles.quickIconButton}
                  onPress={() => setShowGlobalHelp(true)}
                >
                  <HelpCircle size={20} color="#2563EB" />
                </TouchableOpacity>
              </Tooltip>
              {user && (
                <Tooltip text="Historique de recherche">
                  <TouchableOpacity
                    style={styles.quickIconButton}
                    onPress={() => setShowSearchHistory(true)}
                  >
                    <Clock size={18} color="#64748B" />
                  </TouchableOpacity>
                </Tooltip>
              )}
              <Tooltip text="Mes annonces">
                <TouchableOpacity
                  style={styles.quickIconButton}
                  onPress={() => router.push('/my-listings')}
                >
                  <Package size={20} color="#64748B" />
                </TouchableOpacity>
              </Tooltip>
              <Tooltip text="Mes favoris">
                <TouchableOpacity
                  style={styles.quickIconButton}
                  onPress={() => router.push('/(tabs)/profile?tab=favorites')}
                >
                  <Heart size={20} color="#64748B" />
                </TouchableOpacity>
              </Tooltip>
              <Tooltip text="Panier">
                <TouchableOpacity
                  style={styles.quickIconButton}
                  onPress={() => router.push('/cart')}
                >
                  <ShoppingBag size={20} color="#64748B" />
                </TouchableOpacity>
              </Tooltip>
            </View>
          )}

          <Tooltip text="Changer la langue">
            <TouchableOpacity
              style={styles.languageButtonCompact}
              onPress={() => setShowLanguageMenu(true)}
            >
              <Text style={styles.languageButtonCompactText}>
                {languages.find(l => l.code === language)?.name}
              </Text>
            </TouchableOpacity>
          </Tooltip>
          {user ? (
            <TouchableOpacity
              style={styles.accountButton}
              onPress={() => setShowAccountMenu(true)}
            >
              <View style={styles.userAvatarCircle}>
                <User size={isMobile ? 16 : 18} color="#FFFFFF" />
              </View>
              {!isMobile && (
                <>
                  <Text style={styles.accountText}>
                    {profile?.full_name || t('profile.user')}
                  </Text>
                  <ChevronDown size={16} color="#1E293B" />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <User size={18} color="#1E293B" />
              {!isMobile && <Text style={styles.signInText}>{t('topBar.signIn')}</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
      )}


      {/* Navigation horizontale scrollable - Desktop */}
      {!isMobile && (
      <View style={styles.desktopNavBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.desktopNavContent}
        >
          {profile?.user_type === 'professional' ? (
            <Tooltip text="Accéder à votre espace professionnel">
              <TouchableOpacity
                style={[styles.desktopNavButton, styles.desktopNavButtonOrange]}
                onPress={() => setShowProMenu(!showProMenu)}
              >
                <Store size={18} color="#FFFFFF" />
                <Text style={[styles.desktopNavText, styles.desktopNavTextOrange, isRTL && styles.textRTL]}>
                  {t('topBar.proSpace')}
                </Text>
                <ChevronDown size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </Tooltip>
          ) : (
            <Tooltip text="Devenez professionnel et publiez sans limite">
              <TouchableOpacity
                style={[styles.desktopNavButton, styles.desktopNavButtonOrange]}
                onPress={() => router.push('/pro/packages')}
              >
                <Gem size={18} color="#FFFFFF" />
                <Text style={[styles.desktopNavText, styles.desktopNavTextOrange, isRTL && styles.textRTL]}>
                  {t('topBar.buyPro')}
                </Text>
              </TouchableOpacity>
            </Tooltip>
          )}

          <Tooltip text="Publier une annonce gratuitement">
            <TouchableOpacity
              style={[styles.desktopNavButton, styles.desktopNavButtonGreen]}
              onPress={() => router.push('/(tabs)/publish')}
            >
              <PlusCircle size={18} color="#FFFFFF" />
              <Text style={[styles.desktopNavText, styles.desktopNavTextGreen, isRTL && styles.textRTL]}>
                {t('topBar.publishFree')}
              </Text>
            </TouchableOpacity>
          </Tooltip>

          <Tooltip text="Voir toutes les offres de vente">
            <TouchableOpacity
              style={styles.desktopNavButton}
              onPress={() => {
                router.push('/(tabs)/search?listing_type=sale');
              }}
            >
              <View style={styles.desktopNavIconContainer}>
                <ShoppingBag size={16} color="#2563EB" />
              </View>
              <Text style={[styles.desktopNavText, isRTL && styles.textRTL]}>
                Offres
              </Text>
            </TouchableOpacity>
          </Tooltip>

          <Tooltip text="Voir toutes les demandes d'achat">
            <TouchableOpacity
              style={styles.desktopNavButton}
              onPress={() => {
                router.push('/(tabs)/search?listing_type=purchase');
              }}
            >
              <View style={styles.desktopNavIconContainer}>
                <Search size={16} color="#2563EB" />
              </View>
              <Text style={[styles.desktopNavText, isRTL && styles.textRTL]}>
                Demandes
              </Text>
            </TouchableOpacity>
          </Tooltip>
        </ScrollView>
      </View>
      )}

      {/* Modal de langue */}
      <Modal
        visible={showLanguageMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageMenu(false)}
      >
        <Pressable
          style={styles.modalOverlayCenter}
          onPress={() => setShowLanguageMenu(false)}
        >
          <Pressable style={styles.languageMenu} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>{t('language.title')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageMenu(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.optionItem,
                    language === lang.code && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setLanguage(lang.code as 'fr' | 'en' | 'ar');
                    setShowLanguageMenu(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    language === lang.code && styles.optionTextSelected
                  ]}>
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <Check size={18} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de localisation */}
      <Modal
        visible={showLocationMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationMenu(false)}
      >
        <Pressable
          style={styles.modalOverlayCenter}
          onPress={() => setShowLocationMenu(false)}
        >
          <Pressable style={styles.locationMenu} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une localisation</Text>
              <TouchableOpacity onPress={() => setShowLocationMenu(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.citiesList} contentContainerStyle={styles.citiesListContent}>
              {wilayas.map((wilaya) => (
                <TouchableOpacity
                  key={wilaya}
                  style={[
                    styles.cityItem,
                    currentLocation === wilaya && styles.cityItemSelected
                  ]}
                  onPress={() => {
                    setCurrentLocation(wilaya);
                    setShowLocationMenu(false);
                  }}
                >
                  <Text style={[
                    styles.cityText,
                    currentLocation === wilaya && styles.cityTextSelected
                  ]}>
                    {wilaya}
                  </Text>
                  {currentLocation === wilaya && (
                    <Check size={18} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de compte */}
      <Modal
        visible={showAccountMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccountMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAccountMenu(false)}
        >
          <Pressable style={styles.accountMenu} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAccountMenu(false)}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>

            {user ? (
              <>
                <View style={styles.userInfo}>
                  <User size={48} color="#2563EB" />
                  <Text style={[styles.userName, isRTL && styles.textRTL]}>
                    {profile?.full_name || t('profile.user')}
                  </Text>
                  <Text style={[styles.userEmail, isRTL && styles.textRTL]}>
                    {user.email}
                  </Text>
                </View>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowAccountMenu(false);
                    router.push('/my-listings');
                  }}
                >
                  <Package size={20} color="#64748B" />
                  <Text style={[styles.menuItemText, isRTL && styles.textRTL]}>{t('topBar.myListings')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowAccountMenu(false);
                    router.push('/(tabs)/profile');
                  }}
                >
                  <User size={20} color="#64748B" />
                  <Text style={[styles.menuItemText, isRTL && styles.textRTL]}>{t('profile.title')}</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.logoutItem}
                  onPress={async () => {
                    setShowAccountMenu(false);
                    await signOut();
                    router.replace('/(auth)/login');
                  }}
                >
                  <LogOut size={20} color="#DC2626" />
                  <Text style={[styles.logoutText, isRTL && styles.textRTL]}>{t('profile.logout')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => {
                    setShowAccountMenu(false);
                    router.push('/(auth)/login');
                  }}
                >
                  <Text style={styles.connectButtonText}>{t('topBar.signIn')}</Text>
                </TouchableOpacity>

                <Text style={[styles.notMemberText, isRTL && styles.textRTL]}>{t('topBar.notMember')}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAccountMenu(false);
                    router.push('/(auth)/register');
                  }}
                >
                  <Text style={[styles.becomeMemberLink, isRTL && styles.textRTL]}>{t('topBar.becomeMember')}</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal des catégories */}
      <Modal
        visible={showCategoriesMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoriesMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoriesMenu(false)}
        >
          <Pressable style={styles.categoriesMenu} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCategoriesMenu(false)}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
              {t('topBar.categories')}
            </Text>

            <ScrollView style={styles.categoriesList}>
              {/* Option Toutes Catégories */}
              <View style={styles.categoryMenuItem}>
                <TouchableOpacity
                  style={styles.categoryMenuLeft}
                  onPress={() => {
                    setShowCategoriesMenu(false);
                    setSelectedCategoryId(null);
                    router.push('/(tabs)/search');
                  }}
                >
                  <Text style={[styles.categoryMenuText, isRTL && styles.textRTL]}>
                    {language === 'ar' ? 'جميع الفئات' : language === 'en' ? 'All Categories' : 'Toutes Catégories'}
                  </Text>
                </TouchableOpacity>
              </View>

              {categories.map((category) => {
                const subs = subcategories[category.id] || [];
                const isExpanded = expandedCategories.has(category.id);

                return (
                  <View key={category.id}>
                    <View style={styles.categoryMenuItem}>
                      <TouchableOpacity
                        style={styles.categoryMenuLeft}
                        onPress={() => {
                          setShowCategoriesMenu(false);
                          router.push({
                            pathname: '/(tabs)/search',
                            params: { category_id: category.id }
                          });
                        }}
                      >
                        <Text style={[styles.categoryMenuText, isRTL && styles.textRTL]}>
                          {getCategoryName(category)}
                        </Text>
                        <Text style={styles.categoryCountBadge}>
                          {categoryCounts[category.id] || 0}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.categoryChevron}
                        onPress={() => toggleCategory(category.id)}
                      >
                        <ChevronDown
                          size={18}
                          color="#94A3B8"
                          style={isExpanded
                            ? { transform: [{ rotate: '180deg' }] }
                            : (isRTL ? { transform: [{ rotate: '90deg' }] } : { transform: [{ rotate: '-90deg' }] })
                          }
                        />
                      </TouchableOpacity>
                    </View>

                    {isExpanded && subs.length > 0 && (
                      <View style={styles.subcategoriesContainer}>
                        {subs.map((sub) => (
                          <TouchableOpacity
                            key={sub.id}
                            style={styles.subcategoryItem}
                            onPress={() => {
                              setShowCategoriesMenu(false);
                              router.push({
                                pathname: '/(tabs)/search',
                                params: { categoryId: sub.id }
                              });
                            }}
                          >
                            <Text style={[styles.subcategoryText, isRTL && styles.textRTL]}>
                              {getCategoryName(sub)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de sélection de catégorie dans la recherche */}
      <Modal
        visible={showCategoryDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlayCenter}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <Pressable style={styles.categoryDropdownMenu} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'اختر فئة' : language === 'en' ? 'Select Category' : 'Sélectionner une catégorie'}
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryDropdown(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryDropdownList}>
              <TouchableOpacity
                style={[
                  styles.categoryDropdownItem,
                  !selectedCategoryId && styles.categoryDropdownItemSelected
                ]}
                onPress={() => {
                  setSelectedCategoryId(null);
                  setShowCategoryDropdown(false);
                  // Naviguer vers la page de recherche avec toutes les annonces
                  if (searchQuery.trim()) {
                    router.push(`/(tabs)/search?q=${encodeURIComponent(searchQuery)}`);
                  } else {
                    router.push('/(tabs)/search');
                  }
                }}
              >
                <Text style={[
                  styles.categoryDropdownItemText,
                  !selectedCategoryId && styles.categoryDropdownItemTextSelected,
                  isRTL && styles.textRTL
                ]}>
                  {language === 'ar' ? 'جميع الفئات' : language === 'en' ? 'All Categories' : 'Toutes Catégories'}
                </Text>
                {!selectedCategoryId && <Check size={18} color="#2563EB" />}
              </TouchableOpacity>

              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryDropdownItem,
                    selectedCategoryId === category.id && styles.categoryDropdownItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCategoryId(category.id);
                    setShowCategoryDropdown(false);
                    const params = new URLSearchParams();
                    if (searchQuery.trim()) {
                      params.set('q', searchQuery);
                    }
                    params.set('category_id', category.id);
                    router.push(`/(tabs)/search?${params.toString()}`);
                  }}
                >
                  <Text style={[
                    styles.categoryDropdownItemText,
                    selectedCategoryId === category.id && styles.categoryDropdownItemTextSelected,
                    isRTL && styles.textRTL
                  ]}>
                    {getCategoryName(category)}
                  </Text>
                  {selectedCategoryId === category.id && <Check size={18} color="#2563EB" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Menu Dropdown Pro */}
      <Modal
        visible={showProMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProMenu(false)}
      >
        <Pressable
          style={styles.proMenuOverlay}
          onPress={() => setShowProMenu(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.proMenuContainer}>
            <TouchableOpacity
              style={styles.proDropdownItem}
              onPress={() => {
                setShowProMenu(false);
                supabase
                  .from('pro_stores')
                  .select('slug')
                  .eq('user_id', profile?.id)
                  .maybeSingle()
                  .then(({ data: storeData }) => {
                    if (storeData?.slug) {
                      router.push(`/pro/${storeData.slug}`);
                    } else {
                      router.push('/pro/create-store');
                    }
                  });
              }}
            >
              <Store size={18} color="#F59E0B" />
              <Text style={styles.proDropdownItemText}>{t('topBar.proSpace')}</Text>
            </TouchableOpacity>

            <View style={styles.proDropdownDivider} />

            <TouchableOpacity
              style={styles.proDropdownItem}
              onPress={() => {
                setShowProMenu(false);
                router.push('/pro/packages');
              }}
            >
              <Gem size={18} color="#F59E0B" />
              <Text style={styles.proDropdownItemText}>{t('topBar.buyPro')}</Text>
            </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Menu Mobile Hamburger */}
      <Modal
        visible={showMobileMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMobileMenu(false)}
      >
        <Pressable
          style={styles.mobileMenuOverlay}
          onPress={() => setShowMobileMenu(false)}
        >
          <Pressable style={styles.mobileMenuPanel} onPress={(e) => e.stopPropagation()}>
            {/* Header du menu */}
            <View style={styles.mobileMenuHeader}>
              <Text style={styles.mobileMenuTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setShowMobileMenu(false)}
                style={styles.mobileMenuClose}
              >
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.mobileMenuContent}>
              {/* Publier une annonce */}
              <TouchableOpacity
                style={styles.mobileMenuPublish}
                onPress={() => {
                  setShowMobileMenu(false);
                  router.push('/(tabs)/publish');
                }}
              >
                <Package size={20} color="#FFFFFF" />
                <Text style={styles.mobileMenuPublishText}>{t('topBar.publishFree')}</Text>
              </TouchableOpacity>

              {/* Navigation principale */}
              <View style={styles.mobileMenuSection}>
                <Text style={styles.mobileMenuSectionTitle}>{t('topBar.navigation')}</Text>

                <TouchableOpacity
                  style={styles.mobileMenuItem}
                  onPress={() => {
                    setShowMobileMenu(false);
                    router.push('/(tabs)');
                  }}
                >
                  <Home size={20} color="#64748B" />
                  <Text style={styles.mobileMenuItemText}>{t('tabs.home')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mobileMenuItem}
                  onPress={() => {
                    setShowMobileMenu(false);
                    setShowCategoriesMenu(true);
                  }}
                >
                  <Menu size={20} color="#64748B" />
                  <Text style={styles.mobileMenuItemText}>{t('topBar.categories')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mobileMenuItem}
                  onPress={() => {
                    setShowMobileMenu(false);
                    router.push('/my-listings');
                  }}
                >
                  <Package size={20} color="#64748B" />
                  <Text style={styles.mobileMenuItemText}>{t('topBar.myListings')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mobileMenuItem}
                  onPress={() => {
                    setShowMobileMenu(false);
                    router.push('/(tabs)/profile?tab=favorites');
                  }}
                >
                  <Heart size={20} color="#64748B" />
                  <Text style={styles.mobileMenuItemText}>{t('favorites.title')}</Text>
                </TouchableOpacity>
              </View>

              {/* Espace Pro */}
              <View style={styles.mobileMenuSection}>
                <Text style={styles.mobileMenuSectionTitle}>{t('topBar.professional')}</Text>

                {profile?.user_type === 'professional' ? (
                  <TouchableOpacity
                    style={styles.mobileMenuItem}
                    onPress={async () => {
                      setShowMobileMenu(false);

                      // Vérifier si le store existe
                      const { data: storeData } = await supabase
                        .from('pro_stores')
                        .select('slug')
                        .eq('user_id', profile.id)
                        .maybeSingle();

                      if (storeData?.slug) {
                        router.push(`/pro/${storeData.slug}`);
                      } else {
                        // Pas de store créé, rediriger vers la création
                        router.push('/pro/create-store');
                      }
                    }}
                  >
                    <Store size={20} color="#2563EB" />
                    <Text style={[styles.mobileMenuItemText, { color: '#2563EB', fontWeight: '600' }]}>
                      {t('topBar.proSpace')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.mobileMenuItem}
                    onPress={() => {
                      setShowMobileMenu(false);
                      router.push('/pro/packages');
                    }}
                  >
                    <Store size={20} color="#2563EB" />
                    <Text style={[styles.mobileMenuItemText, { color: '#2563EB', fontWeight: '600' }]}>
                      {t('topBar.buyPro')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Paramètres */}
              <View style={styles.mobileMenuSection}>
                <Text style={styles.mobileMenuSectionTitle}>{t('topBar.settings')}</Text>

                <TouchableOpacity
                  style={styles.mobileMenuItem}
                  onPress={() => {
                    setShowMobileMenu(false);
                    setShowLanguageMenu(true);
                  }}
                >
                  <Text style={styles.mobileMenuItemIcon}>🌐</Text>
                  <Text style={styles.mobileMenuItemText}>
                    {languages.find(l => l.code === language)?.name}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mobileMenuItem}
                  onPress={() => {
                    setShowMobileMenu(false);
                    setShowLocationMenu(true);
                  }}
                >
                  <MapPin size={20} color="#64748B" />
                  <Text style={styles.mobileMenuItemText}>{currentLocation}</Text>
                </TouchableOpacity>

                {user && (
                  <TouchableOpacity
                    style={styles.mobileMenuItem}
                    onPress={() => {
                      setShowMobileMenu(false);
                      router.push('/(tabs)/profile');
                    }}
                  >
                    <Settings size={20} color="#64748B" />
                    <Text style={styles.mobileMenuItemText}>{t('profile.title')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Déconnexion */}
              {user && (
                <View style={styles.mobileMenuSection}>
                  <TouchableOpacity
                    style={styles.mobileMenuLogout}
                    onPress={async () => {
                      setShowMobileMenu(false);
                      await signOut();
                      router.replace('/(auth)/login');
                    }}
                  >
                    <LogOut size={20} color="#DC2626" />
                    <Text style={styles.mobileMenuLogoutText}>{t('profile.logout')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!user && (
                <View style={styles.mobileMenuSection}>
                  <TouchableOpacity
                    style={styles.mobileMenuLogin}
                    onPress={() => {
                      setShowMobileMenu(false);
                      router.push('/(auth)/login');
                    }}
                  >
                    <Text style={styles.mobileMenuLoginText}>{t('topBar.signIn')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Search History Modal */}
      <SearchHistoryModal
        visible={showSearchHistory}
        onClose={() => setShowSearchHistory(false)}
        onSelectSearch={(query, categoryId) => {
          handleSearchQueryChange(query);
          if (categoryId) {
            setSelectedCategoryId(categoryId);
          }
          handleSearch();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // MOBILE: Barre supérieure compacte
  mobileTopBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 50 : 14,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  // MOBILE: Navigation horizontale scrollable eBay-style
  mobileNavBar: {
    backgroundColor: '#FAFBFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  mobileNavContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  mobileNavButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minWidth: 105,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mobileNavButtonHighlight: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderWidth: 2,
  },
  mobileNavIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  mobileNavEmoji: {
    fontSize: 18,
  },
  mobileNavText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  mobileNavTextHighlight: {
    color: '#2563EB',
    fontWeight: '800',
  },
  hamburgerButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  logoContainerMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMobile: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  mobileColoredLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileLogoLetterRed: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF0000',
    letterSpacing: -1,
  },
  mobileLogoLetterBlue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0066FF',
    letterSpacing: -1,
  },
  mobileLogoLetterYellow: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: -1,
  },
  mobileLogoLetterGreen: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00AA00',
    letterSpacing: -1,
  },
  mobileLogoLetterPurple: {
    fontSize: 24,
    fontWeight: '900',
    color: '#9933FF',
    letterSpacing: -1,
  },
  mobileLogoLetterOrange: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF6600',
    letterSpacing: -1,
  },
  backButton: {
    padding: 4,
  },
  mobileTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileSearchBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mobileSearchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mobileSearchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    padding: 0,
    height: 20,
    outlineStyle: 'none',
  },
  mobileLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mobileLocationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    maxWidth: 55,
    letterSpacing: 0.2,
  },
  mobileLanguageButton: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    minWidth: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileLanguageText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  mobileUserButtonTop: {
    padding: 2,
  },
  mobileUserAvatarTop: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  mobileSignInButton: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },

  // DESKTOP: Barre supérieure complète
  topBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 50 : 14,
    paddingBottom: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  logoContainerDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoTop: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1.2,
  },
  coloredLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arabicLogoContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  logoLetterRed: {
    fontSize: 28,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: -0.5,
  },
  logoLetterBlue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#3B82F6',
    letterSpacing: -0.5,
  },
  logoLetterYellow: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: -0.5,
  },
  logoLetterGreen: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  logoLetterPurple: {
    fontSize: 28,
    fontWeight: '900',
    color: '#8B5CF6',
    letterSpacing: -0.5,
  },
  logoLetterOrange: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F97316',
    letterSpacing: -0.5,
  },
  dividerVertical: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  horizontalButtonsScroll: {
    flexGrow: 0,
  },
  horizontalButtonsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proButtonCompact: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  proButtonCompactText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  publishButtonCompact: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  publishButtonCompactText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  demoStoreButtonCompact: {
    backgroundColor: '#7C3AED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  demoStoreButtonCompactText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  languageButtonCompact: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  languageButtonCompactText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    position: 'relative',
    zIndex: 10000,
  },
  myListingsButton: {
    padding: 8,
    position: 'relative',
  },
  favoritesButton: {
    padding: 8,
    position: 'relative',
  },
  favoritesBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  favoritesBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  languageText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  proButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  proButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  userAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  accountText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  signInText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  quickIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
    position: 'relative',
    zIndex: 10000,
  },
  quickIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Barre principale moderne
  mainHeader: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'nowrap',
    position: 'relative',
    zIndex: 1,
  },

  // Bouton Publier moderne avec gradient
  depositButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  depositButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Barre de recherche responsive
  searchContainer: {
    flex: 1,
    minWidth: 200,
    maxWidth: 600,
    zIndex: 100,
  },
  searchContainerTop: {
    flex: 1,
    minWidth: 350,
    maxWidth: 900,
    zIndex: 100,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRightWidth: 0,
  },
  searchButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },


  // Sélecteur de localisation
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 140,
    height: 48,
  },
  mobileUserButton: {
    padding: 4,
  },
  mobileUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSignInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerSignInText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  locationValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },

  // DESKTOP: Navigation horizontale scrollable
  desktopNavBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  desktopNavContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 10,
  },
  desktopNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 48,
  },
  desktopNavButtonHighlight: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  desktopNavButtonOrange: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  desktopNavButtonPro: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  desktopNavIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopNavIconHighlight: {
    backgroundColor: '#FFFFFF',
  },
  desktopNavIconOrange: {
    backgroundColor: '#FFFFFF',
  },
  desktopNavIconPro: {
    backgroundColor: '#FFFFFF',
  },
  desktopNavButtonGreen: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  desktopNavIconGreen: {
    backgroundColor: '#FFFFFF',
  },
  desktopNavEmoji: {
    fontSize: 16,
  },
  desktopNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  desktopNavTextHighlight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  desktopNavTextOrange: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  desktopNavTextPro: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  desktopNavTextGreen: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Menu dropdown Pro (Modal)
  proMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 140,
  },
  proMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 240,
    overflow: 'hidden',
  },
  proDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  proDropdownItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  proDropdownDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },

  // Barre de filtres type d'annonce
  filterBar: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  filterBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
  },
  filterBarContentMobile: {
    gap: 8,
    paddingHorizontal: 8,
  },
  filterButton: {
    paddingVertical: 11,
    paddingHorizontal: 26,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    transition: 'all 0.2s',
  },
  filterButtonMobile: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  filterButtonTextMobile: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Modals
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 110,
    paddingRight: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  languageMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  optionsList: {
    padding: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: '#EBF5FF',
  },
  optionText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  locationMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  citiesList: {
    padding: 12,
    flexGrow: 0,
  },
  citiesListContent: {
    paddingBottom: 12,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  cityItemSelected: {
    backgroundColor: '#EBF5FF',
  },
  cityText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  cityTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  accountMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 1,
  },
  userInfo: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuItemText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  logoutText: {
    fontSize: 15,
    color: '#DC2626',
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notMemberText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  becomeMemberLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  categoriesMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    marginTop: 8,
  },
  categoriesList: {
    maxHeight: 500,
  },
  categoryMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryMenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryChevron: {
    padding: 8,
  },
  categoryMenuText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
  },
  categoryCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    overflow: 'hidden',
  },
  subcategoriesContainer: {
    backgroundColor: '#F8FAFC',
    paddingLeft: 24,
    paddingVertical: 8,
  },
  subcategoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  subcategoryText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '400',
  },

  // Menu Mobile Hamburger
  mobileMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  mobileMenuPanel: {
    backgroundColor: '#FFFFFF',
    width: '85%',
    maxWidth: 320,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 60 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mobileMenuTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  mobileMenuClose: {
    padding: 4,
  },
  mobileMenuContent: {
    flex: 1,
  },
  mobileMenuPublish: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  mobileMenuPublishText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  mobileMenuSection: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobileMenuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 4,
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  mobileMenuItemIcon: {
    fontSize: 20,
    width: 20,
  },
  mobileMenuItemText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  mobileMenuLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    marginTop: 8,
  },
  mobileMenuLogoutText: {
    fontSize: 15,
    color: '#DC2626',
    fontWeight: '600',
  },
  mobileMenuLogin: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  mobileMenuLoginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  simpleSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    minHeight: 44,
    flex: 1,
  },
  searchBarWithCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingLeft: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    minHeight: 48,
    height: 48,
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
    outlineStyle: 'none',
  },
  searchInputWithCategory: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
    paddingRight: 8,
    outlineStyle: 'none',
  },
  categoryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  categoryDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 0,
    backgroundColor: '#F8FAFC',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    minWidth: 150,
    maxWidth: 200,
    height: '100%',
  },
  categoryDropdownText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  categoryDropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  categoryDropdownList: {
    padding: 8,
    maxHeight: 400,
  },
  categoryDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryDropdownItemSelected: {
    backgroundColor: '#EBF5FF',
  },
  categoryDropdownItemText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  categoryDropdownItemTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  searchInputRTL: {
    textAlign: 'right',
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 4,
  },
  searchHistoryButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    marginRight: 8,
  },
});

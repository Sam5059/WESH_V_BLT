import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { SlidersHorizontal, RotateCcw, Car, Hop as Home, Smartphone, Briefcase, ChevronDown, ChevronRight, Pin, PinOff, X, ListFilter as Filter } from 'lucide-react-native';
import { saveSearchHistory } from '@/lib/searchHistoryUtils';

interface CategoriesAndFiltersProps {
  onFiltersApply: (listings: any[]) => void;
  onCategorySelect?: (categoryId: string) => void;
  initialCategory?: string;
  initialListingType?: string;
  searchQuery?: string;
}

interface FilterState {
  category_id?: string;
  subcategory_id?: string;
  brand_id?: string;
  model_id?: string;
  yearMin?: string;
  yearMax?: string;
  priceMin?: string;
  priceMax?: string;
  fuel?: string;
  transmission?: string;
  propertyType?: string;
  wilaya?: string;
  commune?: string;
  surface?: string;
  rooms?: string;
  deviceType?: string;
  condition?: string;
  tariff?: string;
  contractType?: string;
  salary?: string;
  experience?: string;
  sector?: string;
  listing_type?: string;
}

const isWeb = Platform.OS === 'web';

export default function CategoriesAndFilters({
  onFiltersApply,
  onCategorySelect,
  initialCategory,
  initialListingType,
  searchQuery = '',
}: CategoriesAndFiltersProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(initialCategory || null);
  const [filters, setFilters] = useState<FilterState>({
    listing_type: initialListingType,
  });
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPinned, setIsPinned] = useState(true);
  const [wilayas, setWilayas] = useState<Array<{code: string, name: string}>>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
  const [showCommuneDropdown, setShowCommuneDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showContractTypeDropdown, setShowContractTypeDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);

  // Effet de montage initial - se déclenche une seule fois
  useEffect(() => {
    loadCategories();
    loadWilayas();

    // Si une catégorie initiale existe, l'expand et déclenche le filtre
    if (initialCategory) {
      console.log('[CategoriesAndFilters] Initial category detected:', initialCategory);
      setExpandedCategory(initialCategory);
      // Les filtres seront appliqués par le useEffect qui surveille selectedCategory
    } else {
      // Charger toutes les annonces si pas de catégorie initiale
      loadAllListings();
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      console.log('[CategoriesAndFilters] Setting initial category from prop:', initialCategory);
      setSelectedCategory(initialCategory);
      setExpandedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Détecter si searchQuery correspond à une catégorie et la sélectionner automatiquement
  useEffect(() => {
    if (searchQuery && categories.length > 0 && !initialCategory && !selectedCategory) {
      const normalizedQuery = searchQuery.toLowerCase().trim();

      // Chercher une correspondance dans les noms de catégories
      const matchedCategory = categories.find(cat => {
        const nameFr = cat.name?.toLowerCase();
        const nameEn = cat.name_en?.toLowerCase();
        const nameAr = cat.name_ar?.toLowerCase();

        // Correspondance exacte d'abord
        if (nameFr === normalizedQuery || nameEn === normalizedQuery || nameAr === normalizedQuery) {
          return true;
        }

        // Correspondance au début du mot (startsWith) - plus précis qu'includes
        if (nameFr?.startsWith(normalizedQuery) ||
            nameEn?.startsWith(normalizedQuery) ||
            nameAr?.startsWith(normalizedQuery)) {
          return true;
        }

        return false;
      });

      if (matchedCategory) {
        console.log('[CategoriesAndFilters] Auto-selecting category from searchQuery:', matchedCategory.name);
        setSelectedCategory(matchedCategory.id);
        setExpandedCategory(matchedCategory.id);
        if (onCategorySelect) {
          onCategorySelect(matchedCategory.id);
        }
      }
    }
  }, [searchQuery, categories, initialCategory, selectedCategory]);

  useEffect(() => {
    if (filters.wilaya) {
      loadCommunesForWilaya(filters.wilaya);
    } else {
      setCommunes([]);
    }
  }, [filters.wilaya]);

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategoriesForCategory(selectedCategory);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  async function loadAllListings() {
    setLoading(true);
    try {
      console.log('Loading all listings...');
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading all listings:', error);
        onFiltersApply([]);
      } else if (data) {
        console.log('Loaded listings count:', data.length);
        onFiltersApply(data);
      }
    } catch (error) {
      console.error('Exception loading all listings:', error);
      onFiltersApply([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedCategory) {
      loadBrandsForCategory();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (filters.brand_id) {
      loadModels(filters.brand_id);
    }
  }, [filters.brand_id]);

  useEffect(() => {
    // Ne déclencher applyFilters que si une catégorie est sélectionnée
    // ou si des filtres sont actifs (pas au montage initial vide)
    if (selectedCategory || Object.keys(filters).length > 0 || searchQuery) {
      // Debounce pour éviter trop de requêtes lors de la saisie
      const timeoutId = setTimeout(() => {
        applyFilters();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [filters, selectedCategory, searchQuery]);

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('display_order', { ascending: true });
    if (data) {
      setCategories(data);
    }
  }

  async function loadWilayas() {
    const { data } = await supabase
      .from('wilayas')
      .select('code, name')
      .order('code', { ascending: true });
    if (data) {
      setWilayas(data);
    }
  }

  async function loadCommunesForWilaya(wilayaCode: string) {
    if (!wilayaCode) {
      setCommunes([]);
      return;
    }

    const { data } = await supabase
      .from('communes')
      .select('id, name, wilaya_code')
      .eq('wilaya_code', parseInt(wilayaCode))
      .order('name', { ascending: true });

    if (data) {
      setCommunes(data);
    }
  }

  async function loadSubcategoriesForCategory(categoryId: string) {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', categoryId)
      .order('name', { ascending: true });

    if (data) {
      setSubcategories(data);
    }
  }

  async function loadBrandsForCategory() {
    if (!selectedCategory) {
      setBrands([]);
      return;
    }

    console.log('[loadBrandsForCategory] Loading brands for category:', selectedCategory);

    // Déterminer le type de catégorie pour la table brands
    const brandCategoryType = getCategoryTypeForBrands(selectedCategory);

    if (!brandCategoryType) {
      console.log('[loadBrandsForCategory] No brands for this category type');
      setBrands([]);
      return;
    }

    console.log('[loadBrandsForCategory] Brand category type:', brandCategoryType);

    // Charger les marques filtrées par type de catégorie
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('category_type', brandCategoryType)
      .order('name');

    if (error) {
      console.error('[loadBrandsForCategory] Error loading brands:', error);
      setBrands([]);
    } else if (data) {
      console.log('[loadBrandsForCategory] Loaded', data.length, 'brands for', brandCategoryType);
      setBrands(data);
    }
  }

  async function loadModels(brandId: string) {
    const { data } = await supabase
      .from('models')
      .select('*')
      .eq('brand_id', brandId)
      .order('name');
    if (data) setModels(data);
  }

  async function applyFilters() {
    setLoading(true);
    console.log('[applyFilters] ========================================');
    console.log('[applyFilters] Applying filters:', { selectedCategory, filters, searchQuery });
    console.log('[applyFilters] Active filters count:', Object.keys(filters).length);

    try {
      const searchParams = {
        search_term: searchQuery || '',
        category_filter: selectedCategory || null,
        subcategory_filter: filters.subcategory_id || null,
        wilaya_filter: filters.wilaya || null,
        commune_filter: filters.commune || null,
        min_price_filter: filters.priceMin ? parseFloat(filters.priceMin) : null,
        max_price_filter: filters.priceMax ? parseFloat(filters.priceMax) : null,
        listing_type_filter: filters.listing_type || null
      };

      console.log('[applyFilters] RPC params:', JSON.stringify(searchParams, null, 2));

      // Utiliser la fonction de recherche qui cherche dans catégories, marques, modèles, etc
      const { data, error } = await supabase.rpc('search_listings', searchParams);

      console.log('[applyFilters] Search result:', {
        count: data?.length,
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        } : null,
        hasData: !!data,
        firstItems: data?.slice(0, 3).map(d => d.title)
      });

      if (error) {
        console.error('[applyFilters] ❌ Search error:', error);
        console.error('[applyFilters] Error message:', error.message);
        console.error('[applyFilters] Error details:', error.details);
        console.error('[applyFilters] Error hint:', error.hint);
        onFiltersApply([]);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('[applyFilters] ⚠️ No data returned from search_listings');
        console.warn('[applyFilters] This might mean:');
        console.warn('  1. The migration has not been applied');
        console.warn('  2. No listings exist in the subcategories');
        console.warn('  3. The category_filter UUID is invalid');
      }

      // Appliquer les filtres additionnels côté client (pour les champs JSON complexes)
      let filteredData = data || [];

      // Filtres Véhicules
      if (filters.brand_id) {
        const selectedBrand = brands.find(b => b.id === filters.brand_id);
        if (selectedBrand) {
          console.log('[applyFilters] Filtering by brand_name:', selectedBrand.name);
          filteredData = filteredData.filter(item =>
            item.attributes?.brand_name?.toLowerCase() === selectedBrand.name.toLowerCase()
          );
        }
      }

      if (filters.model_id) {
        const selectedModel = models.find(m => m.id === filters.model_id);
        if (selectedModel) {
          console.log('[applyFilters] Filtering by model_name:', selectedModel.name);
          filteredData = filteredData.filter(item =>
            item.attributes?.model_name?.toLowerCase() === selectedModel.name.toLowerCase()
          );
        }
      }

      if (filters.yearMin) {
        const yearMin = parseInt(filters.yearMin);
        console.log('[applyFilters] Filtering by yearMin:', yearMin);
        filteredData = filteredData.filter(item => {
          const year = parseInt(item.attributes?.year || '0');
          return year >= yearMin;
        });
      }

      if (filters.yearMax) {
        const yearMax = parseInt(filters.yearMax);
        console.log('[applyFilters] Filtering by yearMax:', yearMax);
        filteredData = filteredData.filter(item => {
          const year = parseInt(item.attributes?.year || '9999');
          return year <= yearMax;
        });
      }

      if (filters.fuel) {
        console.log('[applyFilters] Filtering by fuel:', filters.fuel);
        filteredData = filteredData.filter(item =>
          item.attributes?.fuel?.toLowerCase() === filters.fuel.toLowerCase()
        );
      }

      if (filters.transmission) {
        console.log('[applyFilters] Filtering by transmission:', filters.transmission);
        filteredData = filteredData.filter(item =>
          item.attributes?.transmission?.toLowerCase() === filters.transmission.toLowerCase()
        );
      }

      // Filtres Immobilier
      if (filters.propertyType) {
        console.log('[applyFilters] Filtering by propertyType:', filters.propertyType);
        filteredData = filteredData.filter(item =>
          item.attributes?.property_type === filters.propertyType
        );
      }

      if (filters.surface) {
        const surface = parseFloat(filters.surface);
        console.log('[applyFilters] Filtering by surface:', surface);
        filteredData = filteredData.filter(item => {
          const itemSurface = parseFloat(item.attributes?.surface || '0');
          return itemSurface >= surface;
        });
      }

      if (filters.rooms) {
        console.log('[applyFilters] Filtering by rooms:', filters.rooms);
        filteredData = filteredData.filter(item =>
          item.attributes?.rooms === filters.rooms
        );
      }

      // Filtres Électronique
      if (filters.deviceType) {
        console.log('[applyFilters] Filtering by deviceType:', filters.deviceType);
        filteredData = filteredData.filter(item =>
          item.attributes?.device_type === filters.deviceType
        );
      }

      if (filters.condition) {
        console.log('[applyFilters] Filtering by condition:', filters.condition);
        filteredData = filteredData.filter(item =>
          item.condition === filters.condition
        );
      }

      // Filtres Emploi
      if (filters.contractType) {
        console.log('[applyFilters] Filtering by contractType:', filters.contractType);
        filteredData = filteredData.filter(item =>
          item.attributes?.contract_type === filters.contractType
        );
      }

      if (filters.experience) {
        console.log('[applyFilters] Filtering by experience:', filters.experience);
        filteredData = filteredData.filter(item =>
          item.attributes?.experience === filters.experience
        );
      }

      if (filters.sector) {
        console.log('[applyFilters] Filtering by sector:', filters.sector);
        filteredData = filteredData.filter(item =>
          item.attributes?.sector?.toLowerCase().includes(filters.sector.toLowerCase())
        );
      }

      console.log('[applyFilters] Final filtered count:', filteredData.length);
      console.log('[applyFilters] ========================================');

      onFiltersApply(filteredData);

      // Enregistrer dans l'historique de recherche si l'utilisateur est connecté et qu'il y a une recherche
      if (user && searchQuery.trim()) {
        saveSearchHistory({
          userId: user.id,
          searchQuery: searchQuery.trim(),
          categoryId: selectedCategory,
          filters,
          resultsCount: filteredData.length,
        });
      }
    } catch (error) {
      console.error('Filter exception:', error);
      onFiltersApply([]);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    console.log('[resetFilters] Resetting all filters');
    setFilters({});
    setModels([]);
    setBrands([]);
    setSelectedCategory(undefined);
    setExpandedCategory(null);
    setShowBrandDropdown(false);
    setShowModelDropdown(false);
    setShowWilayaDropdown(false);
    loadAllListings();
  }

  function updateFilter(key: keyof FilterState, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));

    // Fermer la sidebar sur mobile après modification d'un filtre
    if (!isWeb && !isPinned) {
      setTimeout(() => {
        setIsSidebarOpen(false);
      }, 300);
    }
  }

  function handleCategoryToggle(categoryId: string) {
    // Vérifier si c'est la catégorie "Stores PRO"
    const category = categories.find(c => c.id === categoryId);
    if (category && category.slug === 'stores-pro') {
      // Rediriger vers la page des boutiques PRO
      router.push('/(tabs)/stores');
      return;
    }

    // Fermer les dropdowns
    setShowBrandDropdown(false);
    setShowModelDropdown(false);

    if (expandedCategory === categoryId) {
      // Si déjà ouverte, on la ferme
      setExpandedCategory(null);
      setSelectedCategory(undefined);
      setFilters({});
      setModels([]);
      setBrands([]);
      loadAllListings();
      // Notifier le parent que la catégorie a été désélectionnée
      if (onCategorySelect) {
        onCategorySelect('');
      }
    } else {
      // Ouvrir cette catégorie et fermer les autres
      setExpandedCategory(categoryId);
      setSelectedCategory(categoryId);
      // Réinitialiser complètement les filtres pour cette nouvelle catégorie
      setFilters({});
      setModels([]);
      if (onCategorySelect) {
        onCategorySelect(categoryId);
      }
      // Le useEffect se chargera de charger les annonces
    }
  }

  const getCategoryName = (cat: any) => {
    if (language === 'ar') return cat.name_ar || cat.name;
    if (language === 'en') return cat.name_en || cat.name;
    return cat.name;
  };

  const getWilayaName = (code: string) => {
    const wilaya = wilayas.find(w => w.code === code);
    return wilaya?.name || code;
  };

  const getCategoryIcon = (slug: string) => {
    if (slug?.includes('vehicule') || slug?.includes('auto')) {
      return <Car size={20} color={expandedCategory === slug ? '#2563EB' : '#64748B'} />;
    }
    if (slug?.includes('immobilier') || slug?.includes('location')) {
      return <Home size={20} color={expandedCategory === slug ? '#2563EB' : '#64748B'} />;
    }
    if (slug?.includes('electronique') || slug?.includes('telephone')) {
      return <Smartphone size={20} color={expandedCategory === slug ? '#2563EB' : '#64748B'} />;
    }
    return <Briefcase size={20} color={expandedCategory === slug ? '#2563EB' : '#64748B'} />;
  };

  const getCategoryType = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    let slug = cat?.slug?.toLowerCase() || '';

    // Si c'est une sous-catégorie, combiner avec le parent
    if (cat?.parent_id) {
      const parent = categories.find(c => c.id === cat.parent_id);
      const parentSlug = parent?.slug?.toLowerCase() || '';
      slug = `${parentSlug} ${slug}`;
    }

    // Véhicules et locations de véhicules
    if (slug.includes('vehicule') || slug.includes('auto') || slug.includes('moto') || slug.includes('voiture')) return 'vehicle';

    // Immobilier et locations immobilières/vacances
    if (slug.includes('immobilier') || slug.includes('appartement') || slug.includes('maison') || slug.includes('terrain') || slug.includes('bureau') || slug.includes('location-vacances')) return 'realestate';

    // Électronique
    if (slug.includes('electronique') || slug.includes('telephone') || slug.includes('ordinateur') || slug.includes('tablette')) return 'electronics';

    // Animaux
    if (slug.includes('animaux') || slug.includes('chien') || slug.includes('chat')) return 'animals';

    // Mode & Beauté
    if (slug.includes('mode') || slug.includes('beaute') || slug.includes('vetement') || slug.includes('chaussure')) return 'fashion';

    // Maison & Jardin
    if (slug.includes('maison-jardin') || slug.includes('meuble') || slug.includes('decoration')) return 'home';

    // Emploi
    if (slug.includes('emploi') || slug.includes('demandes-emploi') || slug.includes('offres-emploi')) return 'employment';

    // Services
    if (slug.includes('service') || slug.includes('plomberie') || slug.includes('electricite') || slug.includes('nettoyage')) return 'service';

    // Location d'équipements
    if (slug.includes('location-equipement')) return 'equipment_rental';

    // Par défaut: filtres génériques
    return 'generic';
  };

  const getCategoryTypeForBrands = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    let slug = cat?.slug?.toLowerCase() || '';

    // Si c'est une sous-catégorie, chercher aussi le slug du parent
    if (cat?.parent_id) {
      const parent = categories.find(c => c.id === cat.parent_id);
      const parentSlug = parent?.slug?.toLowerCase() || '';
      slug = `${parentSlug} ${slug}`; // Combiner parent + enfant pour la recherche
    }

    // Retourne le type exact pour la table brands.category_type
    if (slug.includes('vehicule') || slug.includes('auto') || slug.includes('moto') || slug.includes('voiture')) return 'vehicles';
    if (slug.includes('electronique') || slug.includes('telephone') || slug.includes('informatique') || slug.includes('ordinateur')) return 'electronics';
    if (slug.includes('mode') || slug.includes('fashion') || slug.includes('vetement') || slug.includes('beaute')) return 'fashion';
    if (slug.includes('maison') || slug.includes('jardin') || slug.includes('decoration')) return 'home_garden';
    if (slug.includes('sport') || slug.includes('loisir')) return 'sports_leisure';
    if (slug.includes('emploi') || slug.includes('service')) return 'services';

    return null; // Pas de marques pour cette catégorie
  };

  const renderSubcategoryFilter = () => {
    if (subcategories.length === 0) return null;

    return (
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الفئة الفرعية' : language === 'en' ? 'Subcategory' : 'Sous-catégorie'}
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
        >
          <Text style={[styles.dropdownText, !filters.subcategory_id && styles.dropdownPlaceholder]}>
            {filters.subcategory_id ? getCategoryName(subcategories.find(s => s.id === filters.subcategory_id) || {}) : (language === 'ar' ? 'اختر الفئة الفرعية' : language === 'en' ? 'Select subcategory' : 'Toutes')}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        {showSubcategoryDropdown && (
          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                updateFilter('subcategory_id', '');
                setShowSubcategoryDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Toutes'}
              </Text>
            </TouchableOpacity>
            {subcategories.map((subcat) => (
              <TouchableOpacity
                key={subcat.id}
                style={[styles.dropdownItem, filters.subcategory_id === subcat.id && styles.dropdownItemActive]}
                onPress={() => {
                  updateFilter('subcategory_id', subcat.id);
                  setShowSubcategoryDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.subcategory_id === subcat.id && styles.dropdownItemTextActive]}>
                  {getCategoryName(subcat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderLocationFilters = () => (
    <>
      {/* Wilaya */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الولاية' : language === 'en' ? 'Wilaya' : 'Wilaya'}
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowWilayaDropdown(!showWilayaDropdown)}
        >
          <Text style={[styles.dropdownText, !filters.wilaya && styles.dropdownPlaceholder]}>
            {filters.wilaya ? getWilayaName(filters.wilaya) : (language === 'ar' ? 'اختر الولاية' : language === 'en' ? 'Select wilaya' : 'Sélectionner une wilaya')}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        {showWilayaDropdown && (
          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                updateFilter('wilaya', '');
                updateFilter('commune', '');
                setShowWilayaDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Toutes'}
              </Text>
            </TouchableOpacity>
            {wilayas.map((wilaya) => (
              <TouchableOpacity
                key={wilaya.code}
                style={[styles.dropdownItem, filters.wilaya === wilaya.code && styles.dropdownItemActive]}
                onPress={() => {
                  updateFilter('wilaya', wilaya.code);
                  updateFilter('commune', '');
                  setShowWilayaDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.wilaya === wilaya.code && styles.dropdownItemTextActive]}>
                  {wilaya.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Commune */}
      {filters.wilaya && communes.length > 0 && (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>
            {language === 'ar' ? 'البلدية' : language === 'en' ? 'Commune' : 'Commune'}
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCommuneDropdown(!showCommuneDropdown)}
          >
            <Text style={[styles.dropdownText, !filters.commune && styles.dropdownPlaceholder]}>
              {filters.commune ? communes.find(c => c.name === filters.commune)?.name : (language === 'ar' ? 'اختر البلدية' : language === 'en' ? 'Select commune' : 'Toutes les communes')}
            </Text>
            <ChevronDown size={20} color="#64748B" />
          </TouchableOpacity>

          {showCommuneDropdown && (
            <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  updateFilter('commune', '');
                  setShowCommuneDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Toutes'}
                </Text>
              </TouchableOpacity>
              {communes.map((commune) => (
                <TouchableOpacity
                  key={commune.id}
                  style={[styles.dropdownItem, filters.commune === commune.name && styles.dropdownItemActive]}
                  onPress={() => {
                    updateFilter('commune', commune.name);
                    setShowCommuneDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, filters.commune === commune.name && styles.dropdownItemTextActive]}>
                    {commune.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </>
  );

  const renderVehicleFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Marque */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'العلامة التجارية' : language === 'en' ? 'Brand' : 'Marque'}
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowBrandDropdown(!showBrandDropdown)}
        >
          <Text style={[styles.dropdownText, !filters.brand_id && styles.dropdownPlaceholder]}>
            {brands.find(b => b.id === filters.brand_id)?.name ||
             (language === 'ar' ? 'اختر العلامة' : language === 'en' ? 'Select brand' : 'Sélectionner une marque')}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        {showBrandDropdown && brands.length > 0 && (
          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                updateFilter('brand_id', '');
                updateFilter('model_id', '');
                setModels([]);
                setShowBrandDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Toutes'}
              </Text>
            </TouchableOpacity>
            {brands.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={[styles.dropdownItem, filters.brand_id === brand.id && styles.dropdownItemActive]}
                onPress={() => {
                  updateFilter('brand_id', brand.id);
                  updateFilter('model_id', '');
                  setShowBrandDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.brand_id === brand.id && styles.dropdownItemTextActive]}>
                  {brand.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Modèle */}
      {filters.brand_id && models.length > 0 && (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>
            {language === 'ar' ? 'الطراز' : language === 'en' ? 'Model' : 'Modèle'}
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowModelDropdown(!showModelDropdown)}
          >
            <Text style={[styles.dropdownText, !filters.model_id && styles.dropdownPlaceholder]}>
              {models.find(m => m.id === filters.model_id)?.name ||
               (language === 'ar' ? 'اختر الطراز' : language === 'en' ? 'Select model' : 'Sélectionner un modèle')}
            </Text>
            <ChevronDown size={20} color="#64748B" />
          </TouchableOpacity>

          {showModelDropdown && (
            <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  updateFilter('model_id', '');
                  setShowModelDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous'}
                </Text>
              </TouchableOpacity>
              {models.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[styles.dropdownItem, filters.model_id === model.id && styles.dropdownItemActive]}
                  onPress={() => {
                    updateFilter('model_id', model.id);
                    setShowModelDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, filters.model_id === model.id && styles.dropdownItemTextActive]}>
                    {model.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Prix */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
        </Text>
        <View style={styles.rangeInputs}>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'من' : language === 'en' ? 'Min' : 'Min'}
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'إلى' : language === 'en' ? 'Max' : 'Max'}
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Année */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السنة' : language === 'en' ? 'Year' : 'Année'}
        </Text>
        <View style={styles.rangeInputs}>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder="2010"
            value={filters.yearMin || ''}
            onChangeText={(val) => updateFilter('yearMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder="2024"
            value={filters.yearMax || ''}
            onChangeText={(val) => updateFilter('yearMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Carburant */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الوقود' : language === 'en' ? 'Fuel' : 'Carburant'}
        </Text>
        <View style={styles.chipContainer}>
          {['Essence', 'Diesel', 'Électrique', 'Hybride'].map((fuel) => (
            <TouchableOpacity
              key={fuel}
              style={[styles.chip, filters.fuel === fuel && styles.chipActive]}
              onPress={() => updateFilter('fuel', filters.fuel === fuel ? '' : fuel)}
            >
              <Text style={[styles.chipText, filters.fuel === fuel && styles.chipTextActive]}>
                {fuel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transmission */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'ناقل الحركة' : language === 'en' ? 'Transmission' : 'Transmission'}
        </Text>
        <View style={styles.chipContainer}>
          {['Manuelle', 'Automatique'].map((trans) => (
            <TouchableOpacity
              key={trans}
              style={[styles.chip, filters.transmission === trans && styles.chipActive]}
              onPress={() => updateFilter('transmission', filters.transmission === trans ? '' : trans)}
            >
              <Text style={[styles.chipText, filters.transmission === trans && styles.chipTextActive]}>
                {trans}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderRealEstateFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Type de bien */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'نوع العقار' : language === 'en' ? 'Property Type' : 'Type de bien'}
        </Text>
        <View style={styles.chipContainer}>
          {['Appartement', 'Maison', 'Studio', 'Villa', 'Terrain'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, filters.propertyType === type && styles.chipActive]}
              onPress={() => updateFilter('propertyType', filters.propertyType === type ? '' : type)}
            >
              <Text style={[styles.chipText, filters.propertyType === type && styles.chipTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Prix */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
        </Text>
        <View style={styles.rangeInputs}>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'من' : language === 'en' ? 'Min' : 'Min'}
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'إلى' : language === 'en' ? 'Max' : 'Max'}
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Surface */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'المساحة (م²)' : language === 'en' ? 'Surface (m²)' : 'Surface (m²)'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === 'ar' ? 'الحد الأدنى' : language === 'en' ? 'Min' : 'Min'}
          value={filters.surface || ''}
          onChangeText={(val) => updateFilter('surface', val)}
          keyboardType="numeric"
        />
      </View>

      {/* Pièces */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'عدد الغرف' : language === 'en' ? 'Rooms' : 'Nombre de pièces'}
        </Text>
        <View style={styles.chipContainer}>
          {['1', '2', '3', '4', '5+'].map((room) => (
            <TouchableOpacity
              key={room}
              style={[styles.chip, filters.rooms === room && styles.chipActive]}
              onPress={() => updateFilter('rooms', filters.rooms === room ? '' : room)}
            >
              <Text style={[styles.chipText, filters.rooms === room && styles.chipTextActive]}>
                {room}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderElectronicsFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Marque */}
      {brands.length > 0 && (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>
            {language === 'ar' ? 'العلامة التجارية' : language === 'en' ? 'Brand' : 'Marque'}
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowBrandDropdown(!showBrandDropdown)}
          >
            <Text style={[styles.dropdownText, !filters.brand_id && styles.dropdownPlaceholder]}>
              {brands.find(b => b.id === filters.brand_id)?.name ||
               (language === 'ar' ? 'اختر العلامة' : language === 'en' ? 'Select brand' : 'Sélectionner une marque')}
            </Text>
            <ChevronDown size={20} color="#64748B" />
          </TouchableOpacity>

          {showBrandDropdown && (
            <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  updateFilter('brand_id', '');
                  setShowBrandDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Toutes'}
                </Text>
              </TouchableOpacity>
              {brands.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={[styles.dropdownItem, filters.brand_id === brand.id && styles.dropdownItemActive]}
                  onPress={() => {
                    updateFilter('brand_id', brand.id);
                    setShowBrandDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, filters.brand_id === brand.id && styles.dropdownItemTextActive]}>
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Type d'appareil */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'نوع الجهاز' : language === 'en' ? 'Device Type' : 'Type d\'appareil'}
        </Text>
        <View style={styles.chipContainer}>
          {['Téléphone', 'Tablette', 'Ordinateur', 'TV', 'Console'].map((device) => (
            <TouchableOpacity
              key={device}
              style={[styles.chip, filters.deviceType === device && styles.chipActive]}
              onPress={() => updateFilter('deviceType', filters.deviceType === device ? '' : device)}
            >
              <Text style={[styles.chipText, filters.deviceType === device && styles.chipTextActive]}>
                {device}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* État */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الحالة' : language === 'en' ? 'Condition' : 'État'}
        </Text>
        <View style={styles.chipContainer}>
          {['Neuf', 'Comme neuf', 'Bon état', 'Satisfaisant'].map((cond) => (
            <TouchableOpacity
              key={cond}
              style={[styles.chip, filters.condition === cond && styles.chipActive]}
              onPress={() => updateFilter('condition', filters.condition === cond ? '' : cond)}
            >
              <Text style={[styles.chipText, filters.condition === cond && styles.chipTextActive]}>
                {cond}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Prix */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
        </Text>
        <View style={styles.rangeInputs}>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'من' : language === 'en' ? 'Min' : 'Min'}
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'إلى' : language === 'en' ? 'Max' : 'Max'}
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderServiceFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Tarif */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'التعريفة' : language === 'en' ? 'Rate' : 'Tarif horaire'}
        </Text>
        <View style={styles.rangeInputs}>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'من' : language === 'en' ? 'Min' : 'Min'}
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'إلى' : language === 'en' ? 'Max' : 'Max'}
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderEmploymentFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Type de contrat */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'نوع العقد' : language === 'en' ? 'Contract Type' : 'Type de contrat'}
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowContractTypeDropdown(!showContractTypeDropdown)}
        >
          <Text style={[styles.dropdownText, !filters.contractType && styles.dropdownPlaceholder]}>
            {filters.contractType || (language === 'ar' ? 'اختر النوع' : language === 'en' ? 'Select type' : 'Sélectionner')}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        {showContractTypeDropdown && (
          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                updateFilter('contractType', '');
                setShowContractTypeDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous'}
              </Text>
            </TouchableOpacity>
            {['CDI', 'CDD', 'Stage', 'Freelance', 'Temps partiel', 'Temps plein'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.dropdownItem, filters.contractType === type && styles.dropdownItemActive]}
                onPress={() => {
                  updateFilter('contractType', type);
                  setShowContractTypeDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.contractType === type && styles.dropdownItemTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Salaire */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الراتب' : language === 'en' ? 'Salary' : 'Salaire (DA/mois)'}
        </Text>
        <View style={styles.rangeInputs}>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'من' : language === 'en' ? 'Min' : 'Min'}
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'إلى' : language === 'en' ? 'Max' : 'Max'}
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Expérience requise */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الخبرة المطلوبة' : language === 'en' ? 'Experience Required' : 'Expérience requise'}
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowExperienceDropdown(!showExperienceDropdown)}
        >
          <Text style={[styles.dropdownText, !filters.experience && styles.dropdownPlaceholder]}>
            {filters.experience || (language === 'ar' ? 'اختر المستوى' : language === 'en' ? 'Select level' : 'Sélectionner')}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        {showExperienceDropdown && (
          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                updateFilter('experience', '');
                setShowExperienceDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous'}
              </Text>
            </TouchableOpacity>
            {['Débutant', '1-2 ans', '3-5 ans', '5-10 ans', '+10 ans'].map((exp) => (
              <TouchableOpacity
                key={exp}
                style={[styles.dropdownItem, filters.experience === exp && styles.dropdownItemActive]}
                onPress={() => {
                  updateFilter('experience', exp);
                  setShowExperienceDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.experience === exp && styles.dropdownItemTextActive]}>
                  {exp}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Secteur d'activité */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'قطاع النشاط' : language === 'en' ? 'Sector' : "Secteur d'activité"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === 'ar' ? 'مثال: معلوماتية، تجارة، صحة...' : language === 'en' ? 'Ex: IT, Commerce, Health...' : 'Ex: Informatique, Commerce, Santé...'}
          value={filters.sector || ''}
          onChangeText={(val) => updateFilter('sector', val)}
        />
      </View>

      {/* Localisation (Wilaya + Commune) */}
      {renderLocationFilters()}
    </View>
  );

  const renderGenericFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Sous-catégorie */}
      {renderSubcategoryFilter()}

      {/* Prix */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'السعر' : language === 'en' ? 'Price' : 'Prix'}
        </Text>
        <View style={styles.rangeInputs}>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'من' : language === 'en' ? 'Min' : 'Min'}
            value={filters.priceMin || ''}
            onChangeText={(val) => updateFilter('priceMin', val)}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.input, styles.rangeInput]}
            placeholder={language === 'ar' ? 'إلى' : language === 'en' ? 'Max' : 'Max'}
            value={filters.priceMax || ''}
            onChangeText={(val) => updateFilter('priceMax', val)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* État */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الحالة' : language === 'en' ? 'Condition' : 'État'}
        </Text>
        <View style={styles.chipContainer}>
          {['Neuf', 'Très bon état', 'Bon état', 'Acceptable'].map((cond) => (
            <TouchableOpacity
              key={cond}
              style={[styles.chip, filters.condition === cond && styles.chipActive]}
              onPress={() => updateFilter('condition', filters.condition === cond ? '' : cond)}
            >
              <Text style={[styles.chipText, filters.condition === cond && styles.chipTextActive]}>
                {cond}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Wilaya */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>
          {language === 'ar' ? 'الولاية' : language === 'en' ? 'Wilaya' : 'Wilaya'}
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowWilayaDropdown(!showWilayaDropdown)}
        >
          <Text style={[styles.dropdownText, !filters.wilaya && styles.dropdownPlaceholder]}>
            {filters.wilaya ? getWilayaName(filters.wilaya) : (language === 'ar' ? 'اختر الولاية' : language === 'en' ? 'Select wilaya' : 'Sélectionner une wilaya')}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFiltersForCategory = (categoryId: string) => {
    const categoryType = getCategoryType(categoryId);

    switch (categoryType) {
      case 'vehicle':
        return renderVehicleFilters();
      case 'realestate':
        return renderRealEstateFilters();
      case 'electronics':
        return renderElectronicsFilters();
      case 'employment':
        return renderEmploymentFilters();
      case 'service':
        return renderServiceFilters();
      case 'animals':
      case 'fashion':
      case 'home':
      case 'equipment_rental':
      case 'generic':
        return renderGenericFilters();
      default:
        return renderGenericFilters();
    }
  };

  return (
    <>
      {/* Backdrop (Mobile) */}
      {!isWeb && isSidebarOpen && !isPinned && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <Animated.View
        style={[
          styles.sidebar,
          !isSidebarOpen && styles.sidebarClosed,
          isPinned && styles.sidebarPinned,
        ]}
      >
        {/* Header Sticky - Avec bouton toggle intégré */}
        <View style={styles.stickyHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerTitle}>
              <SlidersHorizontal size={22} color="#2563EB" />
              <Text style={styles.headerText}>
                {language === 'ar' ? '🔍 الفلاتر' : language === 'en' ? '🔍 Filters' : '🔍 Filtres'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              {/* Pin/Unpin Button */}
              {isSidebarOpen && isWeb && (
                <TouchableOpacity
                  onPress={() => setIsPinned(!isPinned)}
                  style={styles.iconButton}
                >
                  {isPinned ? (
                    <Pin size={18} color="#2563EB" />
                  ) : (
                    <PinOff size={18} color="#64748B" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Zone de contenu scrollable avec animation */}
        {isSidebarOpen && (
          <>
            {/* Reset Filters Button */}
            {(selectedCategory || Object.keys(filters).length > 0) && (
              <View style={styles.resetContainer}>
                <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
                  <RotateCcw size={16} color="#64748B" />
                  <Text style={styles.resetText}>
                    {language === 'ar' ? 'إعادة تعيين' : language === 'en' ? 'Reset' : 'Réinitialiser'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Categories List - Scrollable */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
        <View style={styles.categoriesContainer}>
          {categories.map((category) => {
            const isExpanded = expandedCategory === category.id;

            return (
              <View key={category.id} style={styles.categoryWrapper}>
                {/* Category Header */}
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    isExpanded && styles.categoryItemActive,
                  ]}
                  onPress={() => handleCategoryToggle(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryLeft}>
                    {getCategoryIcon(category.slug)}
                    <Text
                      style={[
                        styles.categoryText,
                        isExpanded && styles.categoryTextActive,
                      ]}
                    >
                      {getCategoryName(category)}
                    </Text>
                  </View>
                  {isExpanded ? (
                    <ChevronDown size={20} color="#2563EB" />
                  ) : (
                    <ChevronRight size={20} color="#94A3B8" />
                  )}
                </TouchableOpacity>

                {/* Filters Section (Collapsible) */}
                {isExpanded && (
                  <View style={styles.filtersSection}>
                    {/* Filtres */}
                    {renderFiltersForCategory(category.id)}
                  </View>
                )}
              </View>
            );
          })}
            </View>
            </ScrollView>

            {/* Bouton CTA Afficher les annonces - En bas du sidebar */}
            {selectedCategory && (
              <View style={styles.ctaContainer}>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={() => {
                    applyFilters();
                    if (!isWeb && !isPinned) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  activeOpacity={0.9}
                  disabled={loading}
                >
                  <Text style={styles.ctaButtonText}>
                    {loading
                      ? (language === 'ar' ? '⏳ جاري التحميل...' : language === 'en' ? '⏳ Loading...' : '⏳ Chargement...')
                      : (language === 'ar' ? '🔍 عرض النتائج' : language === 'en' ? '🔍 Show Results' : '🔍 Afficher les annonces')
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Loading Indicator */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>
                  {language === 'ar' ? 'جاري التحميل...' : language === 'en' ? 'Loading...' : 'Chargement...'}
                </Text>
              </View>
            )}
          </>
        )}
      </Animated.View>

      {/* CTA Flottant - TOUJOURS visible sur mobile, conditionnel sur desktop */}
      {!isWeb || (!isPinned || !isSidebarOpen) ? (
        <TouchableOpacity
          style={[
            styles.floatingButton,
            isSidebarOpen ? styles.floatingButtonOpen : styles.floatingButtonClosed,
          ]}
          onPress={() => setIsSidebarOpen(!isSidebarOpen)}
          activeOpacity={0.85}
        >
          {isSidebarOpen ? (
            <>
              <X size={20} color="#FFFFFF" />
              <Text style={styles.floatingButtonText}>
                {language === 'ar' ? 'إخفاء ✕' : language === 'en' ? 'Hide ✕' : 'Masquer ✕'}
              </Text>
            </>
          ) : (
            <>
              <Filter size={24} color="#FFFFFF" />
              <Text style={styles.floatingButtonText}>
                {language === 'ar' ? 'الفلاتر' : language === 'en' ? 'Filters' : 'Filtres'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 39,
  },
  sidebar: {
    width: isWeb ? 380 : '90%',
    maxWidth: 450,
    backgroundColor: '#FFFFFF',
    borderRightWidth: isWeb ? 1 : 0,
    borderRightColor: '#E2E8F0',
    height: '100%',
    maxHeight: isWeb ? '100vh' : '100%',
    position: isWeb ? 'relative' : 'absolute',
    left: 0,
    top: 0,
    zIndex: 40,
    ...(isWeb ? {
      boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
    } as any : {
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    }),
  },
  sidebarClosed: {
    transform: [{ translateX: -400 }],
  },
  sidebarPinned: {
    position: isWeb ? 'relative' : 'absolute',
  },
  stickyHeader: {
    position: isWeb ? ('sticky' as any) : 'relative',
    top: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    ...(isWeb ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    } as any : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#B91C1C',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    ...(isWeb ? {
      boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
    } as any : {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    }),
  },
  toggleButtonClosed: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
    ...(isWeb ? {
      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
    } as any : {
      shadowColor: '#16A34A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    }),
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  resetContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  scrollView: {
    flex: 1,
    maxHeight: isWeb ? 'calc(100vh - 180px)' as any : '80%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  categoriesContainer: {
    padding: 12,
  },
  categoryWrapper: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  categoryItemActive: {
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  categoryTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  filtersSection: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    backgroundColor: '#F8FAFC',
  },
  subcategoriesContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
  },
  subcategoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subcategoryItemActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  subcategoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  subcategoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filtersContainer: {
    gap: 16,
    paddingTop: 12,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeInput: {
    flex: 1,
  },
  rangeSeparator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
  },
  dropdownText: {
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#94A3B8',
  },
  dropdownMenu: {
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginTop: 4,
    ...(isWeb ? {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    } as any : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    }),
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#475569',
  },
  dropdownItemTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  ctaContainer: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  ctaButton: {
    backgroundColor: '#0062FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(isWeb ? {
      boxShadow: '0 4px 16px rgba(0, 98, 255, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.2s',
    } as any : {
      shadowColor: '#0062FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ctaButtonSubtext: {
    fontSize: 12,
    color: '#BFDBFE',
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderTopWidth: 1,
    borderTopColor: '#BFDBFE',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  floatingButton: {
    position: 'absolute',
    bottom: isWeb ? 32 : 90,
    left: isWeb ? 24 : 20,
    right: isWeb ? undefined : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 100,
    backgroundColor: '#0062FF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 999999,
    minWidth: isWeb ? 160 : undefined,
    alignSelf: isWeb ? 'flex-start' : 'stretch',
    ...(isWeb ? {
      boxShadow: '0 8px 30px rgba(0, 98, 255, 0.5), 0 0 20px rgba(0, 98, 255, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease-in-out',
    } as any : {
      shadowColor: '#0062FF',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.6,
      shadowRadius: 30,
      elevation: 35,
    }),
  },
  floatingButtonClosed: {
    opacity: 1,
    ...(isWeb ? {
      transform: 'scale(1.05)',
    } as any : {}),
  },
  floatingButtonOpen: {
    opacity: 0.95,
    backgroundColor: '#1E40AF',
    ...(isWeb ? {
      transform: 'scale(0.98)',
    } as any : {}),
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

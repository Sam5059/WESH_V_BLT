import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import TopBar from '@/components/TopBar';
import CategoriesAndFilters from '@/components/CategoriesAndFilters';
import ListingCard from '@/components/ListingCard';
import { supabase } from '@/lib/supabase';
import { Tag, TrendingUp } from 'lucide-react-native';

const isWeb = Platform.OS === 'web';

export default function SearchPage() {
  const { category_id, q, type, listing_type } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { language } = useLanguage();

  const [listings, setListings] = useState<any[]>([]);
  const [searchText, setSearchText] = useState(typeof q === 'string' ? q : '');
  const initialCategoryId = typeof category_id === 'string' ? category_id : null;
  const initialListingType = typeof type === 'string' ? type : typeof listing_type === 'string' ? listing_type : null;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategoryId);
  const [categoryData, setCategoryData] = useState<any>(null);

  console.log('[SearchPage] Mounted with params:', {
    category_id,
    initialCategoryId,
    q,
    initialListingType
  });

  // Mettre à jour searchText quand le paramètre q change
  React.useEffect(() => {
    const queryParam = typeof q === 'string' ? q : '';
    console.log('[SearchPage] Query param changed:', queryParam);
    setSearchText(queryParam);
  }, [q]);

  // Mettre à jour selectedCategory quand category_id change
  React.useEffect(() => {
    const categoryParam = typeof category_id === 'string' ? category_id : null;
    console.log('[SearchPage] Category param changed:', categoryParam);
    setSelectedCategory(categoryParam);
  }, [category_id]);

  // Charger les données de la catégorie sélectionnée
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!selectedCategory) {
        setCategoryData(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', selectedCategory)
          .single();

        if (error) throw error;
        setCategoryData(data);
      } catch (error) {
        console.error('[SearchPage] Error fetching category:', error);
        setCategoryData(null);
      }
    };

    fetchCategoryData();
  }, [selectedCategory]);

  const handleSearch = () => {
    // La recherche sera gérée par le composant CategoriesAndFilters
  };

  const handleFiltersApply = (filteredListings: any[]) => {
    console.log('[SearchPage] Received filtered listings:', filteredListings?.length || 0);
    setListings(filteredListings);
  };

  // Calculer le prix moyen pour la comparaison
  const averagePrice = React.useMemo(() => {
    const validPrices = listings
      .filter(l => l.price && l.price > 0 && !l.price_type && l.offer_type !== 'free' && l.offer_type !== 'exchange')
      .map(l => l.price);

    if (validPrices.length === 0) return null;

    const sum = validPrices.reduce((acc, price) => acc + price, 0);
    return sum / validPrices.length;
  }, [listings]);

  const handleCategorySelect = (categoryId: string) => {
    // Si categoryId est une chaîne vide, c'est une désélection
    setSelectedCategory(categoryId === '' ? null : categoryId);
  };

  return (
    <View style={styles.container}>
      <TopBar
        searchQuery={searchText}
        onSearchChange={setSearchText}
        onSearch={handleSearch}
      />

      <View style={styles.mainContainer}>
        {/* Sidebar Desktop & Mobile */}
        <CategoriesAndFilters
          key={`${searchText}-${initialCategoryId}-${initialListingType}`}
          onFiltersApply={handleFiltersApply}
          onCategorySelect={handleCategorySelect}
          initialCategory={selectedCategory || undefined}
          initialListingType={initialListingType || undefined}
          searchQuery={searchText}
        />

        {/* Contenu principal */}
        <View style={styles.content}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header des résultats */}
            <View style={styles.resultsHeader}>
              {categoryData ? (
                <View style={styles.categoryHeaderContainer}>
                  <View style={styles.categoryIconWrapper}>
                    <Tag size={24} color="#2563EB" />
                  </View>
                  <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryLabel}>
                      {language === 'ar'
                        ? 'تصفح فئة'
                        : language === 'en'
                        ? 'Browsing category'
                        : 'Vous parcourez la catégorie'}
                    </Text>
                    <Text style={styles.categoryTitle}>
                      {language === 'ar' && categoryData.name_ar
                        ? categoryData.name_ar
                        : language === 'en' && categoryData.name_en
                        ? categoryData.name_en
                        : categoryData.name}
                    </Text>
                    <View style={styles.resultsCountWrapper}>
                      <TrendingUp size={14} color="#10B981" />
                      <Text style={styles.resultsCount}>
                        {listings.length}{' '}
                        {language === 'ar'
                          ? listings.length === 1 ? 'إعلان' : 'إعلانات'
                          : language === 'en'
                          ? listings.length === 1 ? 'listing' : 'listings'
                          : listings.length === 1 ? 'annonce' : 'annonces'}
                        {' '}
                        {language === 'ar'
                          ? 'متاحة'
                          : language === 'en'
                          ? 'available'
                          : 'disponible(s)'}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.resultsTitle}>
                    {searchText
                      ? language === 'ar'
                        ? `نتائج البحث عن "${searchText}"`
                        : language === 'en'
                        ? `Search results for "${searchText}"`
                        : `Résultats pour "${searchText}"`
                      : language === 'ar'
                      ? 'كل الإعلانات'
                      : language === 'en'
                      ? 'All listings'
                      : 'Toutes les annonces'}
                  </Text>
                  <Text style={styles.resultsCount}>
                    {listings.length}{' '}
                    {language === 'ar' ? 'إعلان' : language === 'en' ? 'listing(s)' : 'annonce(s)'}
                  </Text>
                </View>
              )}
            </View>

            {/* Grille des annonces */}
            {(() => {
              console.log('[SearchPage] RENDERING GRID - listings.length:', listings.length);
              if (listings.length === 0) {
                console.log('[SearchPage] Showing empty state');
                return (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      {language === 'ar'
                        ? 'لا توجد نتائج. حدد فئة وقم بتطبيق الفلاتر.'
                        : language === 'en'
                        ? 'No results. Select a category and apply filters.'
                        : 'Aucun résultat. Sélectionnez une catégorie et appliquez des filtres.'}
                    </Text>
                  </View>
                );
              }
              console.log('[SearchPage] Rendering', listings.length, 'listing cards');
              console.log('[SearchPage] isWeb:', isWeb);
              console.log('[SearchPage] First listing full object:', JSON.stringify(listings[0], null, 2));
              return (
                <View style={[styles.listingsGrid, isWeb && styles.listingsGridWeb]}>
                  {listings.map((listing, index) => {
                    if (index < 3) {
                      console.log(`[SearchPage] Rendering card ${index + 1}:`, listing.title, 'id:', listing.id);
                    }
                    return (
                      <View
                        key={listing.id}
                        style={styles.listingCardWrapper}
                      >
                        <ListingCard
                          listing={listing}
                          onPress={() => {
                            console.log('[SearchPage] Card clicked:', listing.id);
                            router.push(`/listing/${listing.id}`);
                          }}
                          isWeb={isWeb}
                          averagePrice={averagePrice}
                        />
                      </View>
                    );
                  })}
                </View>
              );
            })()}
          </ScrollView>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative' as any,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden' as any,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    minWidth: 0,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  categoryHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    flex: 1,
    ...Platform.select({
      web: {
        gap: 16,
      },
      default: {
        gap: 12,
      },
    }),
  },
  categoryIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    ...Platform.select({
      web: {
        width: 56,
        height: 56,
      },
      default: {
        width: 48,
        height: 48,
      },
    }),
  },
  categoryTextContainer: {
    flex: 1,
    gap: 4,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...Platform.select({
      web: {
        fontSize: 13,
      },
      default: {
        fontSize: 11,
      },
    }),
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 34,
    ...Platform.select({
      web: {
        fontSize: 28,
        lineHeight: 34,
      },
      default: {
        fontSize: 22,
        lineHeight: 28,
      },
    }),
  },
  resultsCountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  listingsGrid: {
    padding: 20,
    gap: 16,
    flexDirection: 'row' as any,
    flexWrap: 'wrap' as any,
  },
  listingsGridWeb: {
    display: 'grid' as any,
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
    padding: 20,
  },
  listingCardWrapper: {
    width: '100%',
    minHeight: 320,
    marginBottom: 16,
  },
});

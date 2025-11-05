import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { X } from 'lucide-react-native';
import TopBar from '@/components/TopBar';
import CategoriesAndFilters from '@/components/CategoriesAndFilters';
import ListingCard from '@/components/ListingCard';

const isWeb = Platform.OS === 'web';

export default function SearchPage() {
  const { category_id, q } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { language } = useLanguage();

  const [listings, setListings] = useState<any[]>([]);
  const [searchText, setSearchText] = useState(typeof q === 'string' ? q : '');
  const initialCategoryId = typeof category_id === 'string' ? category_id : null;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategoryId);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSearch = () => {
    // La recherche sera gérée par le composant CategoriesAndFilters
  };

  const handleFiltersApply = (filteredListings: any[]) => {
    setListings(filteredListings);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.stickyHeader}>
        <TopBar
          searchQuery={searchText}
          onSearchChange={setSearchText}
          onSearch={handleSearch}
        />
      </View>

      <View style={styles.mainContainer}>
        {/* Sidebar Desktop */}
        {isWeb && !isMobile && (
          <CategoriesAndFilters
            onFiltersApply={handleFiltersApply}
            onCategorySelect={handleCategorySelect}
            initialCategory={initialCategoryId || undefined}
            searchQuery={searchText}
          />
        )}

        {/* Contenu principal */}
        <View style={styles.content}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header des résultats */}
            <View style={styles.resultsHeader}>
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

              {/* Bouton Filtres Mobile */}
              {isMobile && (
                <TouchableOpacity
                  style={styles.mobileFiltersButton}
                  onPress={() => setShowMobileFilters(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.mobileFiltersButtonText}>
                    {language === 'ar' ? 'الفلاتر' : language === 'en' ? 'Filters' : 'Filtres'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Grille des annonces */}
            {listings.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {language === 'ar'
                    ? 'لا توجد نتائج. حدد فئة وقم بتطبيق الفلاتر.'
                    : language === 'en'
                    ? 'No results. Select a category and apply filters.'
                    : 'Aucun résultat. Sélectionnez une catégorie et appliquez des filtres.'}
                </Text>
              </View>
            ) : (
              <View style={[styles.listingsGrid, isWeb && styles.listingsGridWeb]}>
                {listings.map((listing) => (
                  <View key={listing.id} style={styles.listingCardWrapper}>
                    <ListingCard
                      listing={listing}
                      onPress={() => router.push(`/listing/${listing.id}`)}
                      isWeb={isWeb}
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Modal Filtres Mobile */}
      {isMobile && (
        <Modal
          visible={showMobileFilters}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowMobileFilters(false)}
        >
          <View style={styles.mobileFiltersModal}>
            <View style={styles.mobileFiltersHeader}>
              <Text style={styles.mobileFiltersTitle}>
                {language === 'ar' ? 'الفلاتر' : language === 'en' ? 'Filters' : 'Filtres'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowMobileFilters(false)}
                style={styles.mobileFiltersClose}
              >
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <CategoriesAndFilters
              onFiltersApply={(filteredListings) => {
                handleFiltersApply(filteredListings);
                setShowMobileFilters(false);
              }}
              onCategorySelect={handleCategorySelect}
              initialCategory={initialCategoryId || undefined}
              searchQuery={searchText}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stickyHeader: {
    position: isWeb ? ('sticky' as any) : 'relative',
    top: 0,
    zIndex: 50,
    backgroundColor: '#FFFFFF',
    ...(isWeb ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    } as any : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  mobileFiltersButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  mobileFiltersButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
  },
  listingsGridWeb: {
    display: 'grid' as any,
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
  },
  listingCardWrapper: {
    width: '100%',
  },
  mobileFiltersModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mobileFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  mobileFiltersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  mobileFiltersClose: {
    padding: 8,
  },
});

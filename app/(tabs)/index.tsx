import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import TopBar from '@/components/TopBar';
import ListingCard from '@/components/ListingCard';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [categoriesWithListings, setCategoriesWithListings] = useState([]);
  const { language } = useLanguage();

  useEffect(() => {
    fetchCategories();
    fetchCategoriesWithListings();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('display_order', { ascending: true });
    setCategories(data || []);
  }

  async function fetchCategoriesWithListings() {
    // Récupérer toutes les catégories parentes principales
    // Exclure la catégorie "Stores PRO" car les annonces de l'accueil sont pour les particuliers
    const { data: parentCategories } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .neq('slug', 'stores-pro')
      .order('display_order', { ascending: true });

    if (!parentCategories) return;

    // Pour chaque catégorie, récupérer ses annonces via ses sous-catégories
    const categoriesData = await Promise.all(
      parentCategories.map(async (category) => {
        // Récupérer les sous-catégories
        const { data: subcats } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', category.id);

        const subcategoryIds = subcats ? subcats.map(s => s.id) : [];

        // Si la catégorie n'a pas de sous-catégories, ne pas récupérer d'annonces
        if (subcategoryIds.length === 0) {
          return {
            category,
            listings: [],
          };
        }

        // Récupérer les annonces de ces sous-catégories
        const { data: listings } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .in('category_id', subcategoryIds)
          .order('created_at', { ascending: false })
          .limit(20);

        // Filtrer les véhicules mal catégorisés dans Location Immobilière
        let filteredListings = listings || [];
        if (category.slug === 'location-immobiliere' || category.slug === 'immobilier-location') {
          filteredListings = filteredListings.filter(listing => {
            const title = listing.title?.toLowerCase() || '';
            // Exclure si le titre contient des mots-clés de véhicules
            const isVehicle =
              title.includes('bmw') ||
              title.includes('mercedes') ||
              title.includes('benz') ||
              title.includes('dacia') ||
              title.includes('serie') ||
              title.includes('voiture') ||
              title.includes('auto') ||
              title.includes('moto') ||
              title.includes('vehicule') ||
              title.includes('véhicule');
            return !isVehicle;
          });
        }

        return {
          category,
          listings: filteredListings,
        };
      })
    );

    // Filtrer seulement les catégories qui ont des annonces
    setCategoriesWithListings(categoriesData.filter(c => c.listings.length > 0));
  }

  const handleCategoryPress = (category) => {
    // Si c'est la catégorie Stores PRO, rediriger vers l'onglet Boutiques
    if (category.slug === 'stores-pro') {
      router.push('/(tabs)/stores');
    } else {
      console.log('[HomePage] Category clicked:', {
        id: category.id,
        name: category.name,
        slug: category.slug
      });
      router.push(`/(tabs)/search?category_id=${category.id}`);
    }
  };

  const getCategoryName = (cat) => {
    if (language === 'ar') return cat.name_ar || cat.name;
    if (language === 'en') return cat.name_en || cat.name;
    return cat.name;
  };

  const getCategoryIcon = (slug) => {
    const icons = {
      'vehicules': '🚗',
      'immobilier': '🏠',
      'electronique': '💻',
      'location-immobilier': '🏢',
      'location-vacances': '🏖️',
      'location-vehicules': '🚙',
      'location-equipements': '📦',
      'mode-beaute': '👗',
      'maison-jardin': '🏡',
      'emploi': '💼',
      'services': '🔧',
      'emploi-services': '💼',
      'loisirs-hobbies': '🎮',
      'loisirs-divertissement': '🎪',
      'materiel-professionnel': '🏭',
      'entreprises-vendre': '🏢',
      'bebe-enfants': '👶',
      'animaux': '🐾',
    };
    return icons[slug] || '📦';
  };

  const getCategoryColor = (index) => {
    const colors = [
      { bg: '#E0F2FE', icon: '#0284C7' },
      { bg: '#D1FAE5', icon: '#059669' },
      { bg: '#FEF3C7', icon: '#D97706' },
      { bg: '#FCE7F3', icon: '#DB2777' },
      { bg: '#DDD6FE', icon: '#7C3AED' },
      { bg: '#FED7AA', icon: '#EA580C' },
      { bg: '#DBEAFE', icon: '#2563EB' },
      { bg: '#D1FAE5', icon: '#10B981' },
      { bg: '#FEF9C3', icon: '#CA8A04' },
      { bg: '#FFE4E6', icon: '#E11D48' },
      { bg: '#E0E7FF', icon: '#4F46E5' },
      { bg: '#FED7AA', icon: '#F97316' },
    ];
    return colors[index % colors.length];
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price).replace('DZD', 'DA');
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push(`/(tabs)/search?q=${encodeURIComponent(searchText)}`);
    } else {
      router.push('/(tabs)/search');
    }
  };

  return (
    <View style={styles.container}>
      <TopBar
        searchQuery={searchText}
        onSearchChange={setSearchText}
        onSearch={handleSearch}
      />

      <ScrollView style={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat, index) => {
            const colors = getCategoryColor(index);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, { backgroundColor: colors.bg }]}
                onPress={() => handleCategoryPress(cat)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: '#FFFFFF' }]}>
                  <Text style={styles.categoryEmoji}>{getCategoryIcon(cat.slug)}</Text>
                </View>
                <Text style={styles.categoryText} numberOfLines={2}>
                  {getCategoryName(cat)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {categoriesWithListings.map(({ category, listings }) => (
          <View key={category.id}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionIconBadge}>
                  <Text style={styles.sectionIconText}>{getCategoryIcon(category.slug)}</Text>
                </View>
                <Text style={styles.sectionTitle}>
                  {getCategoryName(category).toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => handleCategoryPress(category)}
              >
                <Text style={styles.viewAllText}>
                  {language === 'ar' ? 'عرض الكل' : language === 'en' ? 'VIEW ALL' : 'VOIR TOUT'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listingsHorizontalScroll}
            >
              {listings.map((listing) => (
                <View key={listing.id} style={styles.listingCardWrapper}>
                  <ListingCard
                    listing={listing}
                    onPress={() => router.push(`/listing/${listing.id}`)}
                    isWeb={false}
                    width={280}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    marginTop: 24,
    paddingHorizontal: 16,
    color: '#1E293B',
  },
  categoriesScroll: {
    marginBottom: 20,
    marginTop: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 90,
    height: 95,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  viewAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    gap: 8,
  },
  saleBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  categoryBadgeIcon: {
    fontSize: 14,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  listingsHorizontalScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listingCardWrapper: {
    width: 280,
    marginRight: 12,
  },
  listingCardHorizontal: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginRight: 12,
  },
  listingImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  listingInfo: {
    padding: 12,
    gap: 6,
    minHeight: 110,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  listingPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2563EB',
    marginTop: 2,
  },
  listingLocation: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
});

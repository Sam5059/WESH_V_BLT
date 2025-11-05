import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Search, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/database';
import TopBar from '@/components/TopBar';
import { useLanguage } from '@/contexts/LanguageContext';
import Footer from '@/components/Footer';

export default function ComparatorScreen() {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);

    // Utiliser la fonction de recherche améliorée
    const { data, error } = await supabase.rpc('search_listings', {
      search_term: searchQuery.trim(),
      category_filter: null,
      subcategory_filter: null,
      wilaya_filter: null,
      commune_filter: null,
      min_price_filter: null,
      max_price_filter: null,
      listing_type_filter: null
    });

    if (error) {
      console.error('[COMPARATOR] Search error:', error);
      setListings([]);
    } else {
      // Trier par prix (croissant) après la recherche
      const sortedData = (data || []).sort((a, b) => a.price - b.price);
      setListings(sortedData);
    }

    setLoading(false);
  };

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price);
    return formatted.replace('DZD', 'DA');
  };

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView style={styles.content}>
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Comparer les prix</Text>
          <Text style={styles.sectionDescription}>
            Recherchez un produit pour comparer les prix entre différentes annonces
          </Text>

          <View style={styles.searchBar}>
            <Search size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {loading ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <TouchableOpacity onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Rechercher</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {hasSearched && listings.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {listings.length} résultat{listings.length > 1 ? 's' : ''} trouvé{listings.length > 1 ? 's' : ''}
              </Text>
              <View style={styles.priceStats}>
                <View style={styles.statItem}>
                  <TrendingDown size={16} color="#10B981" />
                  <Text style={styles.statLabel}>Min:</Text>
                  <Text style={styles.statValue}>{formatPrice(Math.min(...listings.map(l => l.price)))}</Text>
                </View>
                <View style={styles.statItem}>
                  <TrendingUp size={16} color="#EF4444" />
                  <Text style={styles.statLabel}>Max:</Text>
                  <Text style={styles.statValue}>{formatPrice(Math.max(...listings.map(l => l.price)))}</Text>
                </View>
              </View>
            </View>

            <View style={styles.listingsGrid}>
              {listings.map((listing) => (
                <TouchableOpacity key={listing.id} style={styles.listingCard}>
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
                    <Text style={styles.listingPrice}>{formatPrice(listing.price)}</Text>
                    <Text style={styles.listingLocation}>
                      {listing.commune}, {listing.wilaya}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {hasSearched && listings.length === 0 && (
          <View style={styles.emptyState}>
            <Search size={64} color="#CBD5E1" />
            <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>
              {t('search.noResults')}
            </Text>
            <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
              {t('search.emptySubtext')}
            </Text>
          </View>
        )}

        {!hasSearched && (
          <View style={styles.emptyState}>
            <RefreshCw size={64} color="#CBD5E1" />
            <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>
              {t('comparator.noComparison')}
            </Text>
            <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
              {t('comparator.searchToCompare')}
            </Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Comment ça marche?</Text>
          <View style={styles.infoCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Recherchez un produit</Text>
              <Text style={styles.stepDescription}>
                Entrez le nom du produit que vous souhaitez comparer
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Consultez les résultats</Text>
              <Text style={styles.stepDescription}>
                Visualisez toutes les annonces correspondant à votre recherche
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Comparez et choisissez</Text>
              <Text style={styles.stepDescription}>
                Comparez les prix, les caractéristiques et choisissez la meilleure offre
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Footer />
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
  searchSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  resultsSection: {
    padding: 20,
  },
  resultsHeader: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  priceStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  listingCard: {
    width: '50%',
    padding: 6,
  },
  listingImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  listingContent: {
    marginTop: 8,
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
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoSection: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});

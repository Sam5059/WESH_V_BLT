import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Check, Zap, TrendingUp, Target, Star } from 'lucide-react-native';
import HomeButton from '@/components/HomeButton';

interface PromotionPackage {
  id: string;
  name: string;
  promotion_type: string;
  duration_days: number;
  price: number;
  description: string;
  features: string[];
}

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export default function PromoteListingScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [packages, setPackages] = useState<PromotionPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const [listingRes, packagesRes] = await Promise.all([
      supabase
        .from('listings')
        .select('id, title, price, images')
        .eq('id', id)
        .single(),
      supabase
        .from('promotion_packages')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true }),
    ]);

    if (listingRes.data) setListing(listingRes.data);
    if (packagesRes.data) setPackages(packagesRes.data);

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

  const getIcon = (type: string) => {
    switch (type) {
      case 'featured':
        return <Star size={24} color="#FFD700" />;
      case 'urgent':
        return <Zap size={24} color="#DC2626" />;
      case 'top_listing':
        return <TrendingUp size={24} color="#2563EB" />;
      case 'highlighted':
        return <Target size={24} color="#F59E0B" />;
      default:
        return <Star size={24} color="#2563EB" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'featured':
        return 'Mise en avant';
      case 'urgent':
        return 'Urgent';
      case 'top_listing':
        return 'Top annonce';
      case 'highlighted':
        return 'Surligné';
      default:
        return type;
    }
  };

  const handlePromote = (pkg: PromotionPackage) => {
    if (!user) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour promouvoir');
      return;
    }

    Alert.alert(
      'Promouvoir l\'annonce',
      `Souhaitez-vous activer "${pkg.name}" pour ${formatPrice(pkg.price)} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => processPromotion(pkg),
        },
      ]
    );
  };

  const processPromotion = async (pkg: PromotionPackage) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + pkg.duration_days);

      const { error } = await supabase.from('listing_promotions').insert({
        listing_id: id,
        promotion_type: pkg.promotion_type,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        price_paid: pkg.price,
        payment_method: 'demo',
      });

      if (error) throw error;

      if (pkg.promotion_type === 'featured') {
        await supabase
          .from('listings')
          .update({
            is_featured: true,
            featured_until: expiresAt.toISOString(),
          })
          .eq('id', id);
      }

      Alert.alert(
        'Promotion activée!',
        `Votre annonce est maintenant promue pendant ${pkg.duration_days} jours.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error promoting listing:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la promotion');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Annonce non trouvée</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Home Button */}
      <View style={styles.homeButtonContainer}>
        <HomeButton />
      </View>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.title}>Promouvoir l'annonce</Text>
      </View>

      <View style={styles.listingPreview}>
        {listing.images && listing.images.length > 0 && (
          <Image source={{ uri: listing.images[0] }} style={styles.listingImage} />
        )}
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle} numberOfLines={2}>
            {listing.title}
          </Text>
          <Text style={styles.listingPrice}>{formatPrice(listing.price)}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Pourquoi promouvoir ?</Text>
        <View style={styles.infoBenefits}>
          <View style={styles.infoBenefit}>
            <Zap size={20} color="#2563EB" />
            <Text style={styles.infoBenefitText}>
              Jusqu'à 10x plus de visibilité
            </Text>
          </View>
          <View style={styles.infoBenefit}>
            <TrendingUp size={20} color="#2563EB" />
            <Text style={styles.infoBenefitText}>Vendez 3x plus vite</Text>
          </View>
          <View style={styles.infoBenefit}>
            <Target size={20} color="#2563EB" />
            <Text style={styles.infoBenefitText}>Démarquez-vous</Text>
          </View>
        </View>
      </View>

      <View style={styles.packagesSection}>
        <Text style={styles.sectionTitle}>Choisissez votre promotion</Text>
        {packages.map((pkg) => (
          <View key={pkg.id} style={styles.packageCard}>
            <View style={styles.packageHeader}>
              <View style={styles.packageIcon}>{getIcon(pkg.promotion_type)}</View>
              <View style={styles.packageInfo}>
                <View style={styles.packageTitleRow}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <View style={styles.packageBadge}>
                    <Text style={styles.packageBadgeText}>
                      {getTypeLabel(pkg.promotion_type)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.packageDescription}>{pkg.description}</Text>
                <View style={styles.packagePriceRow}>
                  <Text style={styles.packagePrice}>{formatPrice(pkg.price)}</Text>
                  <Text style={styles.packageDuration}>
                    Valable {pkg.duration_days} jours
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.promoteButton}
              onPress={() => handlePromote(pkg)}
            >
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.promoteButtonText}>Activer maintenant</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteTitle}>Note importante</Text>
        <Text style={styles.noteText}>
          Les promotions sont cumulables. Vous pouvez activer plusieurs types de
          promotions sur une même annonce pour maximiser votre visibilité.
        </Text>
        <Text style={styles.noteText}>
          Le paiement se fait via CCP, BaridiMob ou virement bancaire. Contactez-nous
          pour finaliser votre commande.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    backgroundColor: '#F5F7FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  errorText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A202C',
    flex: 1,
  },
  listingPreview: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listingImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#E5E7EB',
  },
  listingInfo: {
    padding: 16,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },
  infoSection: {
    backgroundColor: '#EBF5FF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
  },
  infoBenefits: {
    gap: 10,
  },
  infoBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoBenefitText: {
    fontSize: 14,
    color: '#475569',
  },
  packagesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 16,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  packageHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  packageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  packageInfo: {
    flex: 1,
  },
  packageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A202C',
    flex: 1,
  },
  packageBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  packageBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  packageDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  packagePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },
  packageDuration: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  promoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
  },
  promoteButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noteSection: {
    backgroundColor: '#FFF7ED',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20,
    marginBottom: 8,
  },
});

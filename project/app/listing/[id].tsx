import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  Share,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Listing } from '@/types/database';
import Footer from '@/components/Footer';
import ReservationModal from '@/components/ReservationModal';
import MapModal from '@/components/MapModal';
import CustomModal from '@/components/CustomModal';
import { useCustomModal } from '@/hooks/useCustomModal';
import { getListingPurchaseType, getPurchaseButtonText, getPurchaseButtonIcon } from '@/lib/purchaseUtils';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Eye,
  Share2,
  Heart,
  Phone,
  MessageCircle,
  ShoppingCart,
  Calendar,
} from 'lucide-react-native';
import TopBar from '@/components/TopBar';

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const { addToCart } = useCart();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const modal = useCustomModal();

  useEffect(() => {
    if (id) {
      loadListing();
      incrementViews();
      checkFavoriteStatus();
    }
  }, [id, user]);

  useEffect(() => {
    if (listing) {
      loadSimilarListings();
    }
  }, [listing]);

  const loadListing = async () => {
    try {
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (listingError || !listingData) {
        setListing(null);
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone_number, user_type')
        .eq('id', listingData.user_id)
        .maybeSingle();

      const { data: categoryData } = await supabase
        .from('categories')
        .select('name, name_ar, slug, parent_id')
        .eq('id', listingData.category_id)
        .maybeSingle();

      let parentCategorySlug = null;
      if (categoryData?.parent_id) {
        const { data: parentData } = await supabase
          .from('categories')
          .select('slug')
          .eq('id', categoryData.parent_id)
          .maybeSingle();
        parentCategorySlug = parentData?.slug;
      }

      const completeListingData = {
        ...listingData,
        profiles: profileData,
        categories: categoryData,
        parent_category_slug: parentCategorySlug,
      };

      setListing(completeListingData);
    } catch (err) {
      console.error('[LISTING DETAIL] Exception loading listing:', err);
      setListing(null);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment_listing_views', { listing_uuid: id });
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  const loadSimilarListings = async () => {
    if (!listing) return;

    try {
      // First, check if the listing's category is a subcategory or parent category
      const { data: categoryInfo } = await supabase
        .from('categories')
        .select('id, parent_id')
        .eq('id', listing.category_id)
        .maybeSingle();

      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .neq('id', listing.id);

      if (categoryInfo) {
        if (categoryInfo.parent_id) {
          // This is a subcategory - filter by exact subcategory
          query = query.eq('category_id', listing.category_id);
        } else {
          // This is a parent category - get all listings from subcategories
          const { data: subcategories } = await supabase
            .from('categories')
            .select('id')
            .eq('parent_id', listing.category_id);

          if (subcategories && subcategories.length > 0) {
            const subcatIds = subcategories.map(sc => sc.id);
            query = query.or(`category_id.eq.${listing.category_id},category_id.in.(${subcatIds.join(',')})`);
          } else {
            query = query.eq('category_id', listing.category_id);
          }
        }
      } else {
        // Fallback to simple category filter
        query = query.eq('category_id', listing.category_id);
      }

      // Also filter by same wilaya for more relevant results
      if (listing.wilaya) {
        query = query.eq('wilaya', listing.wilaya);
      }

      const { data } = await query.limit(6);

      if (data && data.length > 0) {
        setSimilarListings(data);
      } else {
        // If no results with wilaya filter, try without wilaya
        let fallbackQuery = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .neq('id', listing.id);

        if (categoryInfo?.parent_id) {
          fallbackQuery = fallbackQuery.eq('category_id', listing.category_id);
        } else if (categoryInfo) {
          const { data: subcategories } = await supabase
            .from('categories')
            .select('id')
            .eq('parent_id', listing.category_id);

          if (subcategories && subcategories.length > 0) {
            const subcatIds = subcategories.map(sc => sc.id);
            fallbackQuery = fallbackQuery.or(`category_id.eq.${listing.category_id},category_id.in.(${subcatIds.join(',')})`);
          } else {
            fallbackQuery = fallbackQuery.eq('category_id', listing.category_id);
          }
        } else {
          fallbackQuery = fallbackQuery.eq('category_id', listing.category_id);
        }

        const { data: fallbackData } = await fallbackQuery.limit(6);
        if (fallbackData) {
          setSimilarListings(fallbackData);
        }
      }
    } catch (err) {
      console.error('Error loading similar listings:', err);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (language === 'ar') {
      if (diffInHours < 1) return 'منذ دقائق';
      if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
      if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    } else if (language === 'en') {
      if (diffInHours < 1) return 'A few minutes ago';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;
    } else {
      if (diffInHours < 1) return 'Il y a quelques minutes';
      if (diffInHours < 24) return `Il y a ${diffInHours}h`;
      if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    }

    return date.toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const checkFavoriteStatus = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .maybeSingle();

      if (!error && data) {
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      modal.showInfo(
        t('pro.loginRequired'),
        t('pro.mustLogin')
      );
      setTimeout(() => router.push('/(auth)/login'), 1500);
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: id,
          });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = Platform.OS === 'web'
        ? `https://buygo.com/listing/${id}`
        : `buygo://listing/${id}`;

      await Share.share({
        message: `${listing?.title}\n${formatPrice(listing?.price || 0)}\n${shareUrl}`,
        url: shareUrl,
        title: listing?.title || 'Annonce',
      });
    } catch (err) {
      console.error('[SHARE] Error sharing:', err);
    }
  };

  const handleCallSeller = () => {
    if (!listing?.profiles?.phone_number) {
      modal.showError(t('common.error'), 'Numéro de téléphone non disponible');
      return;
    }

    const phone = listing.profiles.phone_number;

    if (Platform.OS === 'web') {
      setShowPhone(true);
      return;
    }

    Linking.openURL(`tel:${phone}`);
  };

  const handleSendMessage = async () => {
    if (!user) {
      modal.showInfo(t('pro.loginRequired'), t('pro.mustLogin'));
      setTimeout(() => router.push('/(auth)/login'), 1500);
      return;
    }

    if (listing?.user_id === user.id) {
      modal.showError('Impossible', 'Vous ne pouvez pas envoyer un message sur votre propre annonce');
      return;
    }

    try {
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('listing_id', listing?.id)
        .eq('buyer_id', user.id)
        .maybeSingle();

      if (existingConversation) {
        router.push(`/conversation/${existingConversation.id}`);
        return;
      }

      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing?.id,
          buyer_id: user.id,
          seller_id: listing?.user_id,
        })
        .select()
        .single();

      if (error) throw error;

      if (newConversation) {
        router.push(`/conversation/${newConversation.id}`);
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      modal.showError(t('common.error'), t('messages.errorCreating'));
    }
  };

  const isRentalListing = () => {
    return (
      listing?.listing_type === 'rent' ||
      listing?.categories?.slug === 'location-vehicules' ||
      listing?.categories?.slug === 'location-immobiliere'
    );
  };

  const getPurchaseType = () => {
    if (!listing?.categories?.slug) return 'contact';
    return getListingPurchaseType(
      listing.categories.slug,
      (listing as any).parent_category_slug
    );
  };

  const handleContactSeller = () => {
    if (!user) {
      modal.showInfo(t('pro.loginRequired'), t('pro.mustLogin'));
      setTimeout(() => router.push('/(auth)/login'), 1500);
      return;
    }
    handleSendMessage();
  };

  const handleAddToCart = async () => {
    if (!user) {
      modal.showInfo(t('cart.loginRequired'), t('cart.loginMessage'));
      setTimeout(() => router.push('/(auth)/login'), 1500);
      return;
    }

    const purchaseType = getPurchaseType();

    if (purchaseType === 'reservation') {
      setShowReservationModal(true);
      return;
    }

    if (purchaseType === 'contact') {
      handleContactSeller();
      return;
    }

    if (listing?.user_id === user.id) {
      modal.showError(t('common.error'), t('cart.cannotAddOwnListing'));
      return;
    }

    if (listing?.listing_type === 'purchase') {
      modal.showError(t('common.error'), t('cart.cannotAddPurchaseRequest'));
      return;
    }

    // Si c'est une location, ouvrir le modal de réservation
    if (isRentalListing()) {
      setShowReservationModal(true);
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(listing!.id, 1);

      modal.showSuccess(
        'Article ajouté !',
        'L\'article a été ajouté à votre panier avec succès.',
        () => router.push('/cart')
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      modal.showError(t('common.error'), t('cart.addError'));
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, isRTL && styles.textRTL]}>{t('listing.notFound')}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={[styles.backButtonText, isRTL && styles.textRTL]}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getAttributeLabel = (key: string): string | null => {
    const translations: Record<string, Record<string, string>> = {
      fr: {
        brand: 'Marque',
        model: 'Modèle',
        year: 'Année',
        mileage: 'Kilométrage',
        fuel: 'Carburant',
        transmission: 'Transmission',
        color: 'Couleur',
        condition: 'État',
        bedrooms: 'Chambres',
        bathrooms: 'Salles de bain',
        surface: 'Surface',
        furnished: 'Meublé',
        storage: 'Stockage',
        ram: 'RAM',
        processor: 'Processeur',
        screen_size: 'Taille écran',
        size: 'Taille',
        material: 'Matériau',
        usage: 'Usage',
        education_level: 'Niveau',
        duration: 'Durée',
        location: 'Localisation',
        capacity: 'Capacité',
        rooms: 'Chambres',
        floor: 'Étage',
      },
      en: {
        brand: 'Brand',
        model: 'Model',
        year: 'Year',
        mileage: 'Mileage',
        fuel: 'Fuel',
        transmission: 'Transmission',
        color: 'Color',
        condition: 'Condition',
        bedrooms: 'Bedrooms',
        bathrooms: 'Bathrooms',
        surface: 'Surface',
        furnished: 'Furnished',
        storage: 'Storage',
        ram: 'RAM',
        processor: 'Processor',
        screen_size: 'Screen size',
        size: 'Size',
        material: 'Material',
        usage: 'Usage',
        education_level: 'Level',
        duration: 'Duration',
        location: 'Location',
        capacity: 'Capacity',
        rooms: 'Rooms',
        floor: 'Floor',
      },
      ar: {
        brand: 'العلامة التجارية',
        model: 'الطراز',
        year: 'السنة',
        mileage: 'المسافة المقطوعة',
        fuel: 'الوقود',
        transmission: 'ناقل الحركة',
        color: 'اللون',
        condition: 'الحالة',
        bedrooms: 'غرف نوم',
        bathrooms: 'حمامات',
        surface: 'المساحة',
        furnished: 'مفروش',
        storage: 'التخزين',
        ram: 'الذاكرة',
        processor: 'المعالج',
        screen_size: 'حجم الشاشة',
        size: 'الحجم',
        material: 'المادة',
        usage: 'الاستخدام',
        education_level: 'المستوى',
        duration: 'المدة',
        location: 'الموقع',
        capacity: 'السعة',
        rooms: 'غرف',
        floor: 'الطابق',
      },
    };

    const currentLang = language || 'fr';
    const langMap = translations[currentLang] || translations.fr;
    return langMap[key] || null;
  };

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.pexels.com/photos/1667849/pexels-photo-1667849.jpeg?auto=compress&cs=tinysrgb&w=800'];

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#1A202C" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <Share2 size={20} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, isFavorite && styles.iconButtonFavorite]}
                onPress={handleToggleFavorite}
              >
                <Heart
                  size={20}
                  color={isFavorite ? "#EF4444" : "#64748B"}
                  fill={isFavorite ? "#EF4444" : "transparent"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={isDesktop ? styles.desktopLayout : styles.mobileLayout}>
            <View style={isDesktop ? styles.leftColumn : styles.fullWidth}>
              <View style={styles.card}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: images[selectedImageIndex] }}
                    style={styles.mainImage}
                    resizeMode="cover"
                  />

                  {/* Overlay informations sur l'image */}
                  <View style={styles.imageOverlay}>
                    <View style={styles.imageOverlayTop}>
                      <View style={styles.imageBadge}>
                        <Text style={styles.imageBadgeText}>
                          {listing.listing_type === 'sale' ? '🔖 VENTE' :
                           listing.listing_type === 'rent' ? '🔑 LOCATION' :
                           listing.listing_type === 'service' ? '⚙️ SERVICE' : '🛍️ RECHERCHE'}
                        </Text>
                      </View>
                      <View style={[styles.imageBadge, styles.conditionBadge]}>
                        <Text style={styles.imageBadgeText}>
                          {listing.condition === 'new' ? '✨ NEUF' :
                           listing.condition === 'like_new' ? '⭐ COMME NEUF' :
                           listing.condition === 'good' ? '👍 BON ÉTAT' :
                           listing.condition === 'fair' ? '✔️ CORRECT' : '🔧 À RÉNOVER'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.imageOverlayBottom}>
                      <View style={styles.imagePriceTag}>
                        <Text style={styles.imagePriceLabel}>
                          {listing.listing_type === 'rent' ? 'Prix/jour' : 'Prix'}
                        </Text>
                        <Text style={styles.imagePriceValue}>{formatPrice(listing.price)}</Text>
                      </View>
                    </View>
                  </View>

                  {images.length > 1 && (
                    <View style={styles.imageCounter}>
                      <Text style={styles.imageCounterText}>
                        {selectedImageIndex + 1} / {images.length}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.miniMapButton}
                    onPress={() => setShowMapModal(true)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.miniMapIcon}>
                      <MapPin size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.miniMapText}>Carte</Text>
                  </TouchableOpacity>
                  {images.length > 1 && (
                    <ScrollView
                      horizontal
                      style={styles.thumbnailContainer}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.thumbnailContentContainer}
                    >
                      {images.map((img, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setSelectedImageIndex(index)}
                          style={[
                            styles.thumbnail,
                            selectedImageIndex === index && styles.thumbnailSelected,
                          ]}
                        >
                          <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
                          {selectedImageIndex === index && (
                            <View style={styles.thumbnailOverlay}>
                              <View style={styles.thumbnailCheckmark}>
                                <Text style={styles.thumbnailCheckmarkText}>✓</Text>
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <View style={styles.detailsContainer}>
                  <View style={styles.priceSection}>
                    <View style={styles.metaInfo}>
                      <View style={styles.metaItem}>
                        <Eye size={16} color="#64748B" />
                        <Text style={styles.metaText}>
                          {(listing as any).views_count || 0} vues
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Clock size={16} color="#64748B" />
                        <Text style={styles.metaText}>{formatDate(listing.created_at)}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.title}>{listing.title}</Text>

                  <View style={styles.infoCards}>
                    <TouchableOpacity
                      style={styles.infoCard}
                      onPress={() => setShowMapModal(true)}
                      activeOpacity={0.7}
                    >
                      <MapPin size={20} color="#2563EB" />
                      <View style={styles.infoCardContent}>
                        <Text style={styles.infoCardLabel}>Localisation</Text>
                        <Text style={styles.infoCardValue}>
                          {listing.commune}, {listing.wilaya}
                        </Text>
                      </View>
                      <Text style={styles.mapLinkText}>🗺️ Voir carte</Text>
                    </TouchableOpacity>

                    {listing.categories && (
                      <View style={styles.infoCard}>
                        <View style={styles.categoryIcon}>
                          <Text style={styles.categoryIconText}>📂</Text>
                        </View>
                        <View style={styles.infoCardContent}>
                          <Text style={styles.infoCardLabel}>Catégorie</Text>
                          <Text style={styles.infoCardValue}>
                            {language === 'ar' ? listing.categories.name_ar : listing.categories.name}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.infoCard}>
                      <View style={styles.conditionIcon}>
                        <Text style={styles.conditionIconText}>
                          {listing.condition === 'new' ? '🆕' : listing.condition === 'like_new' ? '✨' : listing.condition === 'good' ? '👍' : listing.condition === 'fair' ? '👌' : '🔧'}
                        </Text>
                      </View>
                      <View style={styles.infoCardContent}>
                        <Text style={styles.infoCardLabel}>État</Text>
                        <Text style={styles.infoCardValue}>
                          {listing.condition === 'new' ? 'Neuf' :
                           listing.condition === 'like_new' ? 'Comme neuf' :
                           listing.condition === 'good' ? 'Bon état' :
                           listing.condition === 'fair' ? 'État correct' : 'À rénover'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoCard}>
                      <View style={styles.typeIcon}>
                        <Text style={styles.typeIconText}>
                          {listing.listing_type === 'sale' ? '💰' : listing.listing_type === 'rent' ? '🔑' : '🛒'}
                        </Text>
                      </View>
                      <View style={styles.infoCardContent}>
                        <Text style={styles.infoCardLabel}>Type</Text>
                        <Text style={styles.infoCardValue}>
                          {listing.listing_type === 'sale' ? 'Vente' :
                           listing.listing_type === 'rent' ? 'Location' :
                           listing.listing_type === 'service' ? 'Service' : 'Recherche'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('listing.description')}</Text>
                    <Text style={[styles.description, isRTL && styles.textRTL]}>{listing.description}</Text>
                  </View>

                  {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('listing.specifications')}</Text>
                        <View style={styles.attributesGrid}>
                          {Object.entries(listing.attributes)
                            .filter(([key]) => !['brand_id', 'model_id'].includes(key))
                            .map(([key, value]) => {
                              let label = getAttributeLabel(key);
                              let displayValue = String(value);

                              if (key === 'brand_name') {
                                label = getAttributeLabel('brand');
                              } else if (key === 'model_name') {
                                label = getAttributeLabel('model');
                              }

                              if (!label || !displayValue || displayValue === 'undefined' || displayValue === 'null') return null;

                              return (
                                <View key={key} style={styles.attributeItem}>
                                  <Text style={styles.attributeLabel}>{label}</Text>
                                  <Text style={styles.attributeValue}>{displayValue}</Text>
                                </View>
                              );
                            })
                            .filter(Boolean)}
                        </View>
                      </View>
                    </>
                  )}

                  <View style={styles.divider} />

                  <View style={styles.sellerSection}>
                    <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('listing.sellerInfo')}</Text>
                    <View style={styles.sellerInfo}>
                      <View style={styles.sellerAvatar}>
                        <Text style={styles.sellerInitial}>
                          {listing.profiles?.full_name?.[0] || 'U'}
                        </Text>
                      </View>
                      <View style={styles.sellerDetails}>
                        <View style={styles.sellerNameContainer}>
                          <Text style={styles.sellerName}>
                            {listing.profiles?.full_name || t('profile.user')}
                          </Text>
                          {listing.profiles?.user_type === 'professional' && (
                            <View style={styles.proBadge}>
                              <Text style={styles.proBadgeText}>PRO</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.sellerMember, isRTL && styles.textRTL]}>
                          {listing.profiles?.user_type === 'professional' ? t('listing.professional') : t('listing.individual')}
                        </Text>
                      </View>
                    </View>

                    {!showPhone && listing.profiles?.phone_number && (
                      <TouchableOpacity
                        style={styles.showPhoneButton}
                        onPress={() => setShowPhone(true)}
                      >
                        <Phone size={18} color="#2563EB" />
                        <Text style={styles.showPhoneButtonText}>
                          {t('listing.showPhone') || 'Voir le numéro'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {showPhone && listing.profiles?.phone_number && (
                      <View style={styles.phoneDisplay}>
                        <Phone size={18} color="#10B981" />
                        <Text style={styles.phoneNumber}>{listing.profiles.phone_number}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {isDesktop && similarListings.length > 0 && (
              <View style={styles.rightColumn}>
                <View style={styles.similarSection}>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('listing.similarAds')}</Text>
                  {similarListings.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.similarItem}
                      onPress={() => router.push(`/listing/${item.id}`)}
                    >
                      <Image
                        source={{
                          uri: item.images?.[0] || 'https://images.pexels.com/photos/1667849/pexels-photo-1667849.jpeg?auto=compress&cs=tinysrgb&w=200'
                        }}
                        style={styles.similarImage}
                      />
                      <View style={styles.similarContent}>
                        <Text style={styles.similarTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={styles.similarPrice}>
                          {formatPrice(item.price)}
                        </Text>
                        <View style={styles.similarLocation}>
                          <MapPin size={12} color="#64748B" />
                          <Text style={styles.similarLocationText} numberOfLines={1}>
                            {item.wilaya}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.seeMoreButton}
                    onPress={() => router.push(`/search?category=${listing?.category_id}`)}
                  >
                    <Text style={styles.seeMoreButtonText}>
                      {language === 'ar' ? 'عرض المزيد' : language === 'en' ? 'See more' : 'Voir plus'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {!isDesktop && similarListings.length > 0 && (
            <View style={styles.similarSectionMobile}>
              <View style={styles.similarHeaderMobile}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('listing.similarAds')}</Text>
                <TouchableOpacity
                  style={styles.seeMoreButtonMobile}
                  onPress={() => router.push(`/search?category=${listing?.category_id}`)}
                >
                  <Text style={styles.seeMoreButtonTextMobile}>
                    {language === 'ar' ? 'عرض المزيد' : language === 'en' ? 'See more' : 'Voir plus'}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarScrollContent}
              >
                {similarListings.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.similarItemMobile}
                    onPress={() => router.push(`/listing/${item.id}`)}
                  >
                    <Image
                      source={{
                        uri: item.images?.[0] || 'https://images.pexels.com/photos/1667849/pexels-photo-1667849.jpeg?auto=compress&cs=tinysrgb&w=200'
                      }}
                      style={styles.similarImageMobile}
                    />
                    <View style={styles.similarContentMobile}>
                      <Text style={styles.similarTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.similarPrice}>
                        {formatPrice(item.price)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>

      {/* Footer fixe avec boutons d'action */}
      <View style={styles.footer}>
        {(!user || (listing?.user_id !== user.id)) && listing?.listing_type !== 'purchase' && (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonIcon}>
                {getPurchaseButtonIcon(getPurchaseType())}
              </Text>
            )}
            <Text style={[styles.cartButtonText, isRTL && styles.textRTL]}>
              {getPurchaseButtonText(getPurchaseType(), language as any)}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleCallSeller}
          disabled={!listing?.profiles?.phone_number}
        >
          <Phone size={20} color="#FFFFFF" />
          <Text style={[styles.contactButtonText, isRTL && styles.textRTL]}>
            {t('listing.callSeller') || 'Appeler'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={handleSendMessage}
        >
          <MessageCircle size={20} color="#2563EB" />
          <Text style={[styles.messageButtonText, isRTL && styles.textRTL]}>
            {t('listing.sendMessage') || 'Message'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals en dehors du footer */}
      {listing && (
        <MapModal
          visible={showMapModal}
          onClose={() => setShowMapModal(false)}
          wilaya={listing.wilaya}
          commune={listing.commune}
          title={listing.title}
        />
      )}

      {listing && (
        <ReservationModal
          visible={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          listing={{
            id: listing.id,
            title: listing.title,
            price: listing.price,
            user_id: listing.user_id,
            category_slug: listing.categories?.slug,
            subcategory_slug: listing.subcategory_slug,
          }}
          onSuccess={() => {
            modal.showSuccess('Réservation confirmée !', 'Votre réservation a été enregistrée avec succès.');
          }}
        />
      )}

      <CustomModal
        visible={modal.isVisible}
        type={modal.modalConfig.type}
        title={modal.modalConfig.title}
        message={modal.modalConfig.message}
        onClose={modal.hideModal}
        onConfirm={modal.modalConfig.onConfirm}
        confirmText={modal.modalConfig.confirmText}
        cancelText={modal.modalConfig.cancelText}
        showCancel={modal.modalConfig.showCancel}
      />
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
  contentWrapper: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconButtonFavorite: {
    backgroundColor: '#FEE2E2',
  },
  desktopLayout: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  mobileLayout: {
    flexDirection: 'column',
  },
  leftColumn: {
    flex: 1,
    maxWidth: '70%',
  },
  rightColumn: {
    width: 360,
    position: 'sticky' as any,
    top: 20,
    alignSelf: 'flex-start',
  },
  fullWidth: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#F1F5F9',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
  },
  imageOverlayTop: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  imageOverlayBottom: {
    alignItems: 'flex-start',
  },
  imageBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  conditionBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  imagePriceTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  imagePriceLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  imagePriceValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  imageCounter: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  miniMapButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  miniMapIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniMapText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  thumbnailContainer: {
    paddingVertical: 16,
  },
  thumbnailContentContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  thumbnailSelected: {
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailCheckmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbnailCheckmarkText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  detailsContainer: {
    padding: 24,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: -1,
  },
  metaInfo: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-end',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  infoCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCardValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
  },
  mapLinkText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconText: {
    fontSize: 20,
  },
  conditionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionIconText: {
    fontSize: 20,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIconText: {
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 24,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  attributeItem: {
    flex: 1,
    minWidth: '45%',
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  attributeLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attributeValue: {
    fontSize: 17,
    color: '#1E293B',
    fontWeight: '700',
  },
  sellerSection: {
    marginTop: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sellerInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  proBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sellerMember: {
    fontSize: 13,
    color: '#64748B',
  },
  showPhoneButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  showPhoneButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  phoneDisplay: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  similarSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  similarItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  similarImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  similarContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  similarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  similarPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
  },
  similarLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  similarLocationText: {
    fontSize: 12,
    color: '#64748B',
  },
  seeMoreButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  similarSectionMobile: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  similarHeaderMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeMoreButtonMobile: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  seeMoreButtonTextMobile: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  similarScrollContent: {
    paddingRight: 20,
    flexDirection: 'row',
  },
  similarItemMobile: {
    width: 200,
    marginRight: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  similarImageMobile: {
    width: '100%',
    height: 150,
  },
  similarContentMobile: {
    padding: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonIconWrapper: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 18,
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    gap: 8,
  },
  messageButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '700',
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
    color: '#64748B',
    marginBottom: 20,
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
  textRTL: {
    textAlign: 'right',
  },
});

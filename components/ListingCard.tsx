import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface ListingCardProps {
  listing: any;
  onPress: () => void;
  isWeb?: boolean;
  width?: number;
  distance?: number | null;
  averagePrice?: number | null;
}

export default function ListingCard({ listing, onPress, isWeb = false, width, distance, averagePrice }: ListingCardProps) {
  const { language } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = width || (isWeb ? 280 : screenWidth - 32);

  console.log('[ListingCard] Rendering:', listing?.title, 'isWeb:', isWeb, 'cardWidth:', cardWidth);

  const formatPrice = (price: number) => {
    if (!price) return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(0).replace('DZD', 'DA');
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price).replace('DZD', 'DA');
  };

  const getPriceColor = (price: number) => {
    if (!averagePrice || averagePrice === 0) return '#1E293B';

    const percentDiff = ((price - averagePrice) / averagePrice) * 100;

    // Excellent prix (20%+ sous la moyenne)
    if (percentDiff <= -20) return '#059669'; // Vert foncé
    // Bon prix (10-20% sous la moyenne)
    if (percentDiff <= -10) return '#10B981'; // Vert
    // Prix légèrement en-dessous (0-10% sous la moyenne)
    if (percentDiff < 0) return '#22C55E'; // Vert clair
    // Prix dans la moyenne (±5%)
    if (Math.abs(percentDiff) <= 5) return '#1E293B'; // Gris foncé
    // Prix légèrement au-dessus (5-15% au-dessus)
    if (percentDiff <= 15) return '#F59E0B'; // Orange
    // Prix élevé (15%+ au-dessus)
    return '#DC2626'; // Rouge
  };

  const getPriceBadge = (price: number) => {
    if (!averagePrice || averagePrice === 0) return null;

    const percentDiff = ((price - averagePrice) / averagePrice) * 100;

    if (percentDiff <= -20) {
      return {
        text: language === 'ar' ? 'صفقة رائعة' : language === 'en' ? 'Great Deal' : 'Excellent prix',
        color: '#059669'
      };
    }
    if (percentDiff <= -10) {
      return {
        text: language === 'ar' ? 'سعر جيد' : language === 'en' ? 'Good Price' : 'Bon prix',
        color: '#10B981'
      };
    }
    return null;
  };

  const hasPromotion = listing.original_price && listing.original_price > listing.price;
  const priceBadge = getPriceBadge(listing.price);

  const formatDateRange = () => {
    if (!listing.available_from) return null;

    const startDate = new Date(listing.available_from);
    const endDate = listing.available_to ? new Date(listing.available_to) : null;

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      });
    };

    if (endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    return `Dès le ${formatDate(startDate)}`;
  };

  const images = listing.images && listing.images.length > 0 ? listing.images : [];

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / cardWidth);
    setCurrentImageIndex(index);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isWeb && styles.cardWeb,
        { width: cardWidth, borderWidth: 1, borderColor: '#0062FF' }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {images.length > 0 ? (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.carousel}
            >
              {images.map((image: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={[styles.image, { width: cardWidth }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {images.length > 1 && (
              <View style={styles.pagination}>
                {images.map((_: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={[styles.placeholderContainer, { width: cardWidth }]}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}

        <View style={[
          styles.badge,
          listing.offer_type === 'free' && styles.badgeFree,
          listing.offer_type === 'exchange' && styles.badgeExchange,
          listing.offer_type === 'rent' && styles.badgeRent,
          listing.listing_type === 'purchase' && styles.badgeWanted,
        ]}>
          <Text style={styles.badgeText}>
            {listing.offer_type === 'free'
              ? language === 'ar' ? 'مجاني' : language === 'en' ? 'FREE' : 'GRATUIT'
              : listing.offer_type === 'exchange'
              ? language === 'ar' ? 'للتبادل' : language === 'en' ? 'EXCHANGE' : 'ÉCHANGE'
              : listing.offer_type === 'rent'
              ? language === 'ar' ? 'للإيجار' : language === 'en' ? 'RENT' : 'LOCATION'
              : listing.listing_type === 'sale'
              ? language === 'ar' ? 'للبيع' : language === 'en' ? 'FOR SALE' : 'À VENDRE'
              : listing.listing_type === 'rent'
              ? language === 'ar' ? 'للإيجار' : language === 'en' ? 'FOR RENT' : 'À LOUER'
              : language === 'ar' ? 'مطلوب' : language === 'en' ? 'WANTED' : 'RECHERCHÉ'
            }
          </Text>
        </View>

        {(listing.commune || listing.wilaya || distance !== null) && (
          <View style={styles.imageOverlay}>
            {(listing.commune || listing.wilaya) && (
              <View style={styles.overlayLocation}>
                <Text style={styles.overlayLocationIcon}>📍</Text>
                <Text style={styles.overlayLocationText} numberOfLines={1}>
                  {listing.commune || listing.wilaya}
                </Text>
              </View>
            )}
            {distance !== null && distance !== undefined && (
              <View style={styles.overlayDistance}>
                <Text style={styles.overlayDistanceText}>
                  {distance < 1
                    ? '< 1 km'
                    : distance < 10
                      ? `${distance.toFixed(1)} km`
                      : `${Math.round(distance)} km`}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.mainContent}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {listing.title}
          </Text>
          {formatDateRange() && (
            <View style={styles.dateContainer}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{formatDateRange()}</Text>
              {listing.is_date_flexible && (
                <Text style={styles.flexibleBadge}>Flexible</Text>
              )}
            </View>
          )}

          {/* Gestion des prix spéciaux */}
          {listing.price_type === 'quote' ? (
            <View style={styles.specialPriceContainer}>
              <Text style={styles.quotePrice}>
                {language === 'ar' ? 'حسب الطلب' : language === 'en' ? 'ON QUOTE' : 'SUR DEVIS'}
              </Text>
            </View>
          ) : listing.offer_type === 'free' || listing.price_type === 'free' ? (
            <View style={styles.specialPriceContainer}>
              <Text style={styles.freePrice}>
                {language === 'ar' ? 'مجاني' : language === 'en' ? 'FREE' : 'GRATUIT'}
              </Text>
            </View>
          ) : listing.offer_type === 'exchange' ? (
            <View style={styles.specialPriceContainer}>
              <Text style={styles.exchangePrice}>
                {language === 'ar' ? 'للتبادل' : language === 'en' ? 'EXCHANGE' : 'ÉCHANGE'}
              </Text>
            </View>
          ) : (
            <View style={styles.priceSection}>
              {hasPromotion && (
                <View style={styles.promotionContainer}>
                  <Text style={styles.originalPrice}>{formatPrice(listing.original_price)}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      -{Math.round(((listing.original_price - listing.price) / listing.original_price) * 100)}%
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.currentPriceRow}>
                <Text style={[styles.price, { color: getPriceColor(listing.price) }]}>
                  {formatPrice(listing.price)}
                </Text>
                {priceBadge && (
                  <View style={[styles.priceBadge, { backgroundColor: `${priceBadge.color}15` }]}>
                    <Text style={[styles.priceBadgeText, { color: priceBadge.color }]}>
                      {priceBadge.text}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Lien "Détails" en bas à droite */}
        <View style={styles.detailsLinkContainer}>
          <Text style={styles.detailsLinkText}>
            {language === 'ar' ? 'التفاصيل ←' : language === 'en' ? 'Details →' : 'Détails →'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 360,
    maxHeight: 360,
  },
  cardWeb: {
    marginBottom: 20,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#F1F5F9',
  },
  carousel: {
    width: '100%',
    height: '100%',
  },
  image: {
    height: 220,
  },
  placeholderContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.3,
  },
  pagination: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeFree: {
    backgroundColor: '#8B5CF6',
  },
  badgeExchange: {
    backgroundColor: '#F59E0B',
  },
  badgeRent: {
    backgroundColor: '#3B82F6',
  },
  badgeWanted: {
    backgroundColor: '#F97316',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  overlayLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
    maxWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  overlayLocationIcon: {
    fontSize: 12,
  },
  overlayLocationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  overlayDistance: {
    backgroundColor: 'rgba(37, 99, 235, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  overlayDistanceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  infoContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 19,
    maxHeight: 38,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignSelf: 'flex-start',
  },
  dateIcon: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  flexibleBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  priceSection: {
    gap: 6,
  },
  specialPriceContainer: {
    paddingVertical: 6,
  },
  quotePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 0.3,
  },
  freePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.3,
  },
  exchangePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.3,
  },
  promotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  priceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  detailsLinkContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  detailsLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.3,
  },
});

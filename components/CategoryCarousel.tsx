import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Category } from '@/types/database';
import { useLanguage } from '@/contexts/LanguageContext';
import Tooltip from './Tooltip';
import {
  Car,
  Building2,
  Laptop,
  ShoppingBag,
  Home,
  Briefcase,
  Wrench,
  Gamepad2 as GamepadIcon,
  PawPrint,
  GraduationCap,
  CalendarDays,
  Package,
  Store,
} from 'lucide-react-native';

interface CategoryCarouselProps {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
  isSticky?: boolean;
}

export default function CategoryCarousel({ categories, onCategoryPress, isSticky = false }: CategoryCarouselProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const scrollViewRef = useRef<ScrollView>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const getCategoryColor = (index: number) => {
    const colors = [
      '#DBEAFE', // Bleu clair - Véhicules
      '#D1FAE5', // Vert clair - Immobilier
      '#FEF3C7', // Jaune clair - Électronique
      '#FCE7F3', // Rose clair - Mode & Beauté
      '#E0E7FF', // Indigo clair - Maison & Jardin
      '#FFE4E6', // Rouge rose clair - Emploi
      '#FECACA', // Rouge clair - Loisirs & Divertissements
      '#FED7AA', // Orange clair - Emploi & Services
      '#BAE6FD', // Bleu cyan - Animaux
      '#FDE68A', // Jaune doré - Services
      '#E9D5FF', // Violet clair - Événements
      '#D8F3DC', // Vert menthe - Éducation
    ];
    return colors[index % colors.length];
  };

  const getCategoryTextColor = (index: number) => {
    const colors = [
      '#1E3A8A', // Bleu foncé - Véhicules
      '#065F46', // Vert foncé - Immobilier
      '#92400E', // Jaune/brun foncé - Électronique
      '#9F1239', // Rose foncé - Mode & Beauté
      '#4338CA', // Indigo foncé - Maison & Jardin
      '#BE123C', // Rouge foncé - Emploi
      '#DC2626', // Rouge vif - Loisirs
      '#EA580C', // Orange foncé - Emploi & Services
      '#0C4A6E', // Bleu cyan foncé - Animaux
      '#78350F', // Brun foncé - Services
      '#7C3AED', // Violet foncé - Événements
      '#15803D', // Vert foncé - Éducation
    ];
    return colors[index % colors.length];
  };

  const getCategoryIcon = (category: Category, size: number = 20, index: number = 0) => {
    const color = getCategoryTextColor(index);
    const slug = category.slug?.toLowerCase() || '';
    const name = category.name?.toLowerCase() || '';

    if (slug === 'stores-pro') {
      return <Store key="store" size={size} color={color} />;
    }
    if (slug.includes('vehicule') || name.includes('véhicule')) {
      return <Car key="car" size={size} color={color} />;
    }
    if (slug.includes('immobilier') || name.includes('immobilier')) {
      return <Building2 key="building" size={size} color={color} />;
    }
    if (slug.includes('electronique') || name.includes('électronique')) {
      return <Laptop key="laptop" size={size} color={color} />;
    }
    if (slug.includes('mode') || slug.includes('beaute') || name.includes('mode') || name.includes('beauté')) {
      return <ShoppingBag key="shopping" size={size} color={color} />;
    }
    if (slug.includes('maison') || slug.includes('jardin') || name.includes('maison') || name.includes('jardin')) {
      return <Home key="home" size={size} color={color} />;
    }
    if (slug.includes('emploi') || name.includes('emploi')) {
      return <Briefcase key="briefcase" size={size} color={color} />;
    }
    if (slug.includes('service') || name.includes('service')) {
      return <Wrench key="wrench" size={size} color={color} />;
    }
    if (slug.includes('loisir') || slug.includes('hobby') || name.includes('loisir')) {
      return <GamepadIcon key="gamepad" size={size} color={color} />;
    }
    if (slug.includes('animaux') || name.includes('animaux')) {
      return <PawPrint key="paw" size={size} color={color} />;
    }
    if (slug.includes('education') || name.includes('éducation')) {
      return <GraduationCap key="education" size={size} color={color} />;
    }
    if (slug.includes('evenement') || name.includes('événement')) {
      return <CalendarDays key="calendar" size={size} color={color} />;
    }

    return <Package key="default" size={size} color={color} />;
  };

  const getCategoryName = (category: Category) => {
    if (language === 'ar') return category.name_ar || category.name;
    if (language === 'en') return category.name_en || category.name;
    return category.name;
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const scrollWidth = event.nativeEvent.contentSize.width;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width;

    setCanScrollLeft(scrollPosition > 10);
    setCanScrollRight(scrollPosition < scrollWidth - layoutWidth - 10);
  };

  const scrollLeft = () => {
    scrollViewRef.current?.scrollTo({ x: -200, y: 0, animated: true });
  };

  const scrollRight = () => {
    scrollViewRef.current?.scrollTo({ x: 200, y: 0, animated: true });
  };

  const handleCategoryPress = (category: Category) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    } else if (category.slug === 'stores-pro') {
      router.push('/stores');
    } else {
      router.push(`/(tabs)/search?category=${category.id}`);
    }
  };

  return (
    <View style={[styles.categoriesNav, isSticky && styles.categoriesNavSticky]}>
      {canScrollLeft && (
        <Tooltip text="Défiler vers la gauche">
          <TouchableOpacity
            style={styles.scrollArrowLeft}
            onPress={scrollLeft}
          >
            <ChevronLeft size={20} color="#1E293B" />
          </TouchableOpacity>
        </Tooltip>
      )}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScrollView}
        contentContainerStyle={styles.categoriesContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {categories.map((cat, index) => (
          <Tooltip key={cat.id} text={`Voir toutes les annonces: ${getCategoryName(cat)}`}>
            <TouchableOpacity
              style={[styles.categoryChip, { backgroundColor: getCategoryColor(index) }]}
              onPress={() => handleCategoryPress(cat)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryChipIcon}>
                {getCategoryIcon(cat, 22, index)}
              </View>
              <Text
                style={[styles.categoryChipText, { color: getCategoryTextColor(index) }, isRTL && styles.textRTL]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {getCategoryName(cat)}
              </Text>
            </TouchableOpacity>
          </Tooltip>
        ))}
      </ScrollView>

      {canScrollRight && (
        <Tooltip text="Défiler vers la droite">
          <TouchableOpacity
            style={styles.scrollArrowRight}
            onPress={scrollRight}
          >
            <ChevronRight size={20} color="#1E293B" />
          </TouchableOpacity>
        </Tooltip>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 0,
        zIndex: 100,
      },
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  categoriesNavSticky: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollArrowLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  scrollArrowRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  categoriesScrollView: {
    flex: 1,
  },
  categoriesContent: {
    paddingHorizontal: 8,
    gap: 6,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    width: 80,
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    gap: 4,
  },
  categoryChipIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryChipText: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 11,
    width: '100%',
  },
  textRTL: {
    textAlign: 'right',
  },
});

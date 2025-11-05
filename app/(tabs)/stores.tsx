import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Store, MapPin, Tag, Plus, ChevronLeft, ChevronRight, Car, Building2, Laptop, ShoppingBag, Home, Briefcase, Wrench, GamepadIcon as Gamepad, PawPrint, Package, Hammer, Users, CalendarDays } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Footer from '@/components/Footer';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = width < 768;
const cardWidth = isWeb && !isMobile ? Math.min((width - 80) / 4, 260) : (width - 48) / 2 - 8;

interface ProStore {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  location: string | null;
  category_id: string;
  category?: {
    name: string;
    name_ar: string;
    name_en: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
  slug: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  vehicules: '#3B82F6',
  immobilier: '#10B981',
  electronique: '#F59E0B',
  'mode-beaute': '#EC4899',
  'maison-jardin': '#8B5CF6',
  animaux: '#F97316',
  'emploi-services': '#06B6D4',
  'loisirs-hobbies': '#EF4444',
  'materiel-professionnel': '#6366F1',
  'bebe-enfants': '#14B8A6',
  'location-vacances': '#A855F7',
  'location-immobiliere': '#84CC16',
  'location-vehicules': '#0EA5E9',
  'location-equipements': '#78716C',
};

export default function StoresScreen() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const scrollViewRef = useRef<ScrollView>(null);
  const [stores, setStores] = useState<ProStore[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    loadCategories();
    loadStores();
    if (user) loadUserProfile();
  }, [user]);

  useEffect(() => {
    loadStores();
  }, [selectedCategory]);

  const loadUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .maybeSingle();
    if (data) setUserProfile(data);
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .neq('slug', 'stores-pro') // Exclude Store PRO from filters
      .order('display_order', { ascending: true, nullsFirst: false });
    if (data) setCategories(data);
  };

  const loadStores = async () => {
    setLoading(true);
    let query = supabase
      .from('pro_stores')
      .select(`
        *,
        category:categories(name, name_ar, name_en, slug)
      `)
      .eq('is_active', true);

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    const { data } = await query.order('created_at', { ascending: false });
    if (data) setStores(data as any);
    setLoading(false);
  };

  const getCategoryName = (category: Category) => {
    if (language === 'ar' && category.name_ar) return category.name_ar;
    if (language === 'en' && category.name_en) return category.name_en;
    return category.name;
  };

  const getCategoryColor = (slug: string) => {
    return CATEGORY_COLORS[slug] || '#64748B';
  };

  const getCategoryIcon = (slug: string, size: number = 24) => {
    const color = getCategoryColor(slug);

    if (slug === 'stores-pro') return <Store size={size} color={color} />;
    if (slug.includes('vehicule')) return <Car size={size} color={color} />;
    if (slug.includes('immobilier')) return <Building2 size={size} color={color} />;
    if (slug.includes('electronique')) return <Laptop size={size} color={color} />;
    if (slug.includes('mode') || slug.includes('beaute')) return <ShoppingBag size={size} color={color} />;
    if (slug.includes('maison') || slug.includes('jardin')) return <Home size={size} color={color} />;
    if (slug.includes('emploi')) return <Briefcase size={size} color={color} />;
    if (slug.includes('service')) return <Wrench size={size} color={color} />;
    if (slug.includes('loisir') || slug.includes('hobby')) return <Gamepad size={size} color={color} />;
    if (slug.includes('animaux')) return <PawPrint size={size} color={color} />;
    if (slug.includes('materiel')) return <Hammer size={size} color={color} />;
    if (slug.includes('bebe') || slug.includes('enfant')) return <Users size={size} color={color} />;
    if (slug.includes('location')) return <CalendarDays size={size} color={color} />;

    return <Package size={size} color={color} />;
  };

  const getCategoryBackgroundImage = (slug: string) => {
    if (slug.includes('vehicule')) {
      return 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (slug.includes('immobilier')) {
      return 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (slug.includes('electronique')) {
      return 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (slug.includes('mode') || slug.includes('beaute')) {
      return 'https://images.pexels.com/photos/1050244/pexels-photo-1050244.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (slug.includes('maison') || slug.includes('jardin')) {
      return 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (slug.includes('emploi')) {
      return 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (slug.includes('service')) {
      return 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (slug.includes('loisir') || slug.includes('hobby')) {
      return 'https://images.pexels.com/photos/235615/pexels-photo-235615.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (slug.includes('animaux')) {
      return 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (slug.includes('materiel')) {
      return 'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (slug.includes('bebe') || slug.includes('enfant')) {
      return 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (slug.includes('location')) {
      return 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    return null;
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

  const handleStorePress = (store: ProStore) => {
    router.push(`/pro/${store.slug}`);
  };

  const handleCreateStore = () => {
    router.push('/pro/create-store');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Découvrez nos Stores PRO</Text>
          <Text style={styles.subtitle}>Les meilleurs vendeurs professionnels par catégorie</Text>
        </View>

        {/* Create Store Button for PRO users */}
        {user && userProfile?.user_type === 'professional' && (
          <TouchableOpacity style={styles.createButton} onPress={handleCreateStore}>
            <Plus color="#FFF" size={20} />
            <Text style={styles.createButtonText}>Créer mon Store PRO</Text>
          </TouchableOpacity>
        )}

        {/* Category Filters */}
        <View style={styles.categoriesContainer}>
          {canScrollLeft && (
            <TouchableOpacity style={styles.scrollArrowLeft} onPress={scrollLeft}>
              <ChevronLeft size={24} color="#1E293B" />
            </TouchableOpacity>
          )}

          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <View style={styles.categoryChipIconContainer}>
                <Store size={28} color={!selectedCategory ? '#2563EB' : '#64748B'} />
              </View>
              <Text
                style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextActive,
                ]}
              >
                Toutes
              </Text>
            </TouchableOpacity>

            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              const color = getCategoryColor(category.slug);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    isActive && styles.categoryChipActive,
                    { backgroundColor: isActive ? color : '#F8FAFC' },
                  ]}
                  onPress={() =>
                    setSelectedCategory(isActive ? null : category.id)
                  }
                >
                  <View style={styles.categoryChipIconContainer}>
                    {getCategoryIcon(category.slug, 28)}
                  </View>
                  <Text
                    style={[
                      styles.categoryChipText,
                      isActive && styles.categoryChipTextActive,
                    ]}
                  >
                    {getCategoryName(category)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {canScrollRight && (
            <TouchableOpacity style={styles.scrollArrowRight} onPress={scrollRight}>
              <ChevronRight size={24} color="#1E293B" />
            </TouchableOpacity>
          )}
        </View>

        {/* Stores Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Chargement des stores...</Text>
          </View>
        ) : stores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Store color="#94A3B8" size={64} />
            <Text style={styles.emptyText}>Aucun store disponible</Text>
            <Text style={styles.emptySubtext}>
              {selectedCategory
                ? 'Essayez une autre catégorie'
                : 'Revenez plus tard pour découvrir nos stores professionnels'}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {stores.map((store) => {
              const categoryColor = store.category ? getCategoryColor(store.category.slug) : '#64748B';
              const backgroundImage = store.category ? getCategoryBackgroundImage(store.category.slug) : null;
              return (
                <TouchableOpacity
                  key={store.id}
                  style={[styles.storeCard, { width: cardWidth }]}
                  onPress={() => handleStorePress(store)}
                  activeOpacity={0.7}
                >
                  {/* Logo */}
                  <View style={styles.logoContainer}>
                    {store.logo_url ? (
                      <Image
                        source={{ uri: store.logo_url }}
                        style={styles.logo}
                        resizeMode="cover"
                      />
                    ) : backgroundImage ? (
                      <View style={styles.logoWithBackground}>
                        <Image
                          source={{ uri: backgroundImage }}
                          style={styles.backgroundImage}
                          resizeMode="cover"
                        />
                        <View style={styles.logoOverlay}>
                          <View style={[styles.logoPlaceholderCircle, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}>
                            {store.category ? (
                              getCategoryIcon(store.category.slug, 48)
                            ) : (
                              <Store color={categoryColor} size={48} />
                            )}
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.logoPlaceholder, { backgroundColor: `${categoryColor}15` }]}>
                        <View style={[styles.logoPlaceholderCircle, { backgroundColor: `${categoryColor}30` }]}>
                          {store.category ? (
                            getCategoryIcon(store.category.slug, 48)
                          ) : (
                            <Store color={categoryColor} size={48} />
                          )}
                        </View>
                      </View>
                    )}
                  </View>

                {/* Store Info */}
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName} numberOfLines={2}>
                    {store.name}
                  </Text>

                  {/* Category Badge */}
                  {store.category && (
                    <View
                      style={[
                        styles.categoryBadge,
                        {
                          backgroundColor: `${getCategoryColor(store.category.slug)}15`,
                        },
                      ]}
                    >
                      <Tag
                        color={getCategoryColor(store.category.slug)}
                        size={12}
                      />
                      <Text
                        style={[
                          styles.categoryBadgeText,
                          { color: getCategoryColor(store.category.slug) },
                        ]}
                        numberOfLines={1}
                      >
                        {getCategoryName(store.category)}
                      </Text>
                    </View>
                  )}

                  {/* Location */}
                  {store.location && (
                    <View style={styles.locationRow}>
                      <MapPin color="#64748B" size={14} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {store.location}
                      </Text>
                    </View>
                  )}

                  {/* View Store Button */}
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleStorePress(store)}
                  >
                    <Text style={styles.viewButtonText}>Voir le Store</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />

        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginTop: 20,
    position: 'relative',
    minHeight: 120,
  },
  scrollArrowLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollArrowRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    zIndex: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesScroll: {
    flex: 1,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    minWidth: 110,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 10,
  },
  categoryChipActive: {
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryChipIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#334155',
    marginTop: 24,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 24,
    justifyContent: 'flex-start',
  },
  storeCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoContainer: {
    width: '100%',
    aspectRatio: 1.5,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoWithBackground: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  logoOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  logoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  storeInfo: {
    padding: 16,
  },
  storeName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    lineHeight: 24,
    height: 48,
    letterSpacing: -0.3,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 8,
    gap: 4,
    maxWidth: '100%',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  viewButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  viewButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

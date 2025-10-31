import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Check, Crown, Zap, Star, Car, Home, Smartphone, ShoppingBag, Sofa, Briefcase, Wrench, Gamepad2, ChevronDown, X } from 'lucide-react-native';
import HomeButton from '@/components/HomeButton';
import Footer from '@/components/Footer';

interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  priority?: number;
}

interface ProPackage {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
  description: string;
  description_ar: string;
  description_en: string;
  price: number;
  duration_days: number;
  max_listings: number | null;
  featured_listings: number;
  priority_support: boolean;
  custom_branding: boolean;
  analytics: boolean;
  is_active: boolean;
  order_position: number;
  category_id: string;
  category?: Category;
}

export default function ProPackagesScreen() {
  const { user, profile } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [packages, setPackages] = useState<ProPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ProPackage | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    const { data } = await supabase
      .from('pro_packages')
      .select('*, category:categories(id, name, name_ar, slug, priority)')
      .eq('is_active', true)
      .order('order_position', { ascending: true });

    if (data) {
      // Trier par priorité de catégorie
      const sorted = data.sort((a, b) => {
        const priorityA = a.category?.priority || 999;
        const priorityB = b.category?.priority || 999;
        return priorityA - priorityB;
      });
      setPackages(sorted);
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

  const getPackageName = (pkg: ProPackage) => {
    if (language === 'ar') return pkg.name_ar || pkg.name;
    if (language === 'en') return pkg.name_en || pkg.name;
    return pkg.name;
  };

  const getPackageDescription = (pkg: ProPackage) => {
    if (language === 'ar') return pkg.description_ar || pkg.description;
    if (language === 'en') return pkg.description_en || pkg.description;
    return pkg.description;
  };

  const getCategoryName = (category: Category) => {
    if (language === 'ar') return category.name_ar || category.name;
    return category.name;
  };

  const handleSubscribe = (pkg: ProPackage) => {
    console.log('handleSubscribe called with package:', pkg.id, pkg.name);
    console.log('Current user:', user?.id);

    if (!user) {
      console.log('User not logged in, redirecting to login');
      if (Platform.OS === 'web') {
        alert(t('pro.loginRequired') + '\n' + t('pro.mustLogin'));
      } else {
        Alert.alert(t('pro.loginRequired'), t('pro.mustLogin'));
      }
      router.push('/login');
      return;
    }

    setSelectedPackage(pkg);
    setConfirmModalOpen(true);
  };

  const processSubscription = async () => {
    if (!selectedPackage) return;

    setConfirmModalOpen(false);
    console.log('processSubscription started for package:', selectedPackage.id);

    try {
      console.log('Calling activate_pro_subscription RPC with params:', {
        p_user_id: user!.id,
        p_package_id: selectedPackage.id,
        p_payment_method: 'pending',
        p_payment_reference: `REF-${Date.now()}`
      });

      const { data, error } = await supabase.rpc('activate_pro_subscription', {
        p_user_id: user!.id,
        p_package_id: selectedPackage.id,
        p_payment_method: 'pending',
        p_payment_reference: `REF-${Date.now()}`
      });

      console.log('RPC response - data:', data);
      console.log('RPC response - error:', error);

      if (error) {
        console.error('Error activating subscription:', error);
        alert(`${t('common.error')}\n\nErreur: ${error.message || t('pro.subscriptionError')}`);
        return;
      }

      if (data && data.success) {
        console.log('Subscription activated successfully');
        setSuccessModalOpen(true);
      } else {
        console.error('Subscription failed:', data);
        alert(`${t('common.error')}\n\n${data?.error || t('pro.subscriptionError')}`);
      }
    } catch (error) {
      console.error('Exception in processSubscription:', error);
      alert(`${t('common.error')}\n\nException: ${error}`);
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'vehicules': return Car;
      case 'immobilier': return Home;
      case 'electronique': return Smartphone;
      case 'mode-beaute': return ShoppingBag;
      case 'maison-jardin': return Sofa;
      case 'emploi': return Briefcase;
      case 'services': return Wrench;
      case 'loisirs': return Gamepad2;
      default: return Star;
    }
  };

  const groupedPackages = packages.reduce((acc, pkg) => {
    const categoryName = pkg.category ? getCategoryName(pkg.category) : t('common.other');
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(pkg);
    return acc;
  }, {} as Record<string, ProPackage[]>);

  const categories = Object.keys(groupedPackages);

  const filteredPackages = selectedCategory
    ? groupedPackages[selectedCategory] || []
    : packages;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Home Button */}
      <View style={styles.homeButtonContainer}>
        <HomeButton />
      </View>

      <ScrollView
        horizontal={false}
        stickyHeaderIndices={[1]}
        onScroll={() => categoryModalOpen && setCategoryModalOpen(false)}
        scrollEventThrottle={16}
      >
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Retour"
          accessibilityRole="button"
        >
          <View style={styles.backButtonCircle}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.crownContainer}>
            <Crown size={36} color="#FFD700" strokeWidth={2.5} />
          </View>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('pro.titleUpgrade')}</Text>
          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
            {t('pro.boostVisibility')}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.benefitsSection}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('pro.benefits')}</Text>
        <View style={styles.benefitsList}>
          <View style={[styles.benefitItem, isRTL && styles.benefitItemRTL]}>
            <Zap size={16} color="#3B82F6" />
            <Text style={[styles.benefitText, isRTL && styles.textRTL]}>{t('pro.unlimitedListings')}</Text>
          </View>
          <View style={[styles.benefitItem, isRTL && styles.benefitItemRTL]}>
            <Star size={16} color="#F59E0B" fill="#FEF3C7" />
            <Text style={[styles.benefitText, isRTL && styles.textRTL]}>{t('pro.proBadgeVisible')}</Text>
          </View>
          <View style={[styles.benefitItem, isRTL && styles.benefitItemRTL]}>
            <Zap size={16} color="#8B5CF6" fill="#EDE9FE" />
            <Text style={[styles.benefitText, isRTL && styles.textRTL]}>{t('pro.topResults')}</Text>
          </View>
          <View style={[styles.benefitItem, isRTL && styles.benefitItemRTL]}>
            <Star size={16} color="#EC4899" fill="#FCE7F3" />
            <Text style={[styles.benefitText, isRTL && styles.textRTL]}>{t('pro.detailedStats')}</Text>
          </View>
          <View style={[styles.benefitItem, isRTL && styles.benefitItemRTL]}>
            <Crown size={16} color="#EF4444" fill="#FEE2E2" />
            <Text style={[styles.benefitText, isRTL && styles.textRTL]}>{t('pro.prioritySupport')}</Text>
          </View>
          <View style={[styles.benefitItem, isRTL && styles.benefitItemRTL]}>
            <Star size={16} color="#10B981" fill="#D1FAE5" />
            <Text style={[styles.benefitText, isRTL && styles.textRTL]}>{t('pro.morePhotos')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.categorySelector}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('pro.selectCategory')}</Text>

        <TouchableOpacity
          style={styles.categoryDropdownButton}
          onPress={() => setCategoryModalOpen(!categoryModalOpen)}
          activeOpacity={0.7}
        >
          <View style={styles.categoryDropdownContent}>
            {selectedCategory ? (
              <>
                <View style={styles.selectedCategoryIcon}>
                  {(() => {
                    const pkg = groupedPackages[selectedCategory]?.[0];
                    const IconComponent = pkg ? getCategoryIcon(pkg.category?.slug || '') : Star;
                    return <IconComponent size={20} color="#2563EB" />;
                  })()}
                </View>
                <Text style={[styles.categoryDropdownText, isRTL && styles.textRTL]}>
                  {selectedCategory}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.selectedCategoryIcon}>
                  <Star size={20} color="#2563EB" />
                </View>
                <Text style={[styles.categoryDropdownText, isRTL && styles.textRTL]}>
                  {t('pro.allCategories')}
                </Text>
              </>
            )}
          </View>
          <ChevronDown
            size={20}
            color="#64748B"
            style={{ transform: [{ rotate: categoryModalOpen ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>

        {categoryModalOpen && (
          <ScrollView
            style={styles.categoryDropdown}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={[
                styles.categoryDropdownItem,
                !selectedCategory && styles.categoryDropdownItemActive,
              ]}
              onPress={() => {
                setSelectedCategory(null);
                setCategoryModalOpen(false);
              }}
            >
              <View style={styles.categoryItemIcon}>
                <Star size={18} color={!selectedCategory ? '#2563EB' : '#64748B'} />
              </View>
              <Text style={[
                styles.categoryDropdownItemText,
                !selectedCategory && styles.categoryDropdownItemTextActive,
                isRTL && styles.textRTL,
              ]}>
                {t('pro.allCategories')}
              </Text>
              {!selectedCategory && (
                <Check size={18} color="#2563EB" strokeWidth={3} />
              )}
            </TouchableOpacity>

            {categories.map((categoryName) => {
              const pkg = groupedPackages[categoryName][0];
              const IconComponent = getCategoryIcon(pkg.category?.slug || '');
              const isActive = selectedCategory === categoryName;

              return (
                <TouchableOpacity
                  key={categoryName}
                  style={[
                    styles.categoryDropdownItem,
                    isActive && styles.categoryDropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(categoryName);
                    setCategoryModalOpen(false);
                  }}
                >
                  <View style={styles.categoryItemIcon}>
                    <IconComponent size={18} color={isActive ? '#2563EB' : '#64748B'} />
                  </View>
                  <Text style={[
                    styles.categoryDropdownItemText,
                    isActive && styles.categoryDropdownItemTextActive,
                    isRTL && styles.textRTL,
                  ]}>
                    {categoryName}
                  </Text>
                  {isActive && (
                    <Check size={18} color="#2563EB" strokeWidth={3} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {(selectedCategory ? [selectedCategory] : Object.keys(groupedPackages)).map((categoryName) => {
        const categoryPackages = groupedPackages[categoryName];
        const pkg = categoryPackages[0];
        const IconComponent = getCategoryIcon(pkg.category?.slug || '');

        return (
          <View key={categoryName} style={styles.categorySection}>
            <View style={styles.categoryHeaderRow}>
              <View style={styles.categoryIconWrapper}>
                <IconComponent size={24} color="#2563EB" />
              </View>
              <Text style={[styles.categoryTitle, isRTL && styles.textRTL]}>{categoryName}</Text>
            </View>

            <View style={styles.cardsContainer}>
              {categoryPackages.map((pkg, idx) => {
                const isRecommended = idx === 1;
                const isBasic = idx === 0;
                const isPremium = idx === 2;

                return (
                  <View
                    key={pkg.id}
                    style={[
                      styles.pricingCard,
                      isBasic && styles.pricingCardBasic,
                      isRecommended && styles.pricingCardRecommended,
                      isPremium && styles.pricingCardPremium,
                    ]}
                  >
                    {isRecommended && (
                      <View style={styles.recommendedBadge}>
                        <Star size={14} color="#FFFFFF" />
                        <Text style={styles.recommendedText}>Recommandé Pro</Text>
                      </View>
                    )}

                    <View style={[styles.cardIcon, isBasic && styles.cardIconBasic, isRecommended && styles.cardIconRecommended, isPremium && styles.cardIconPremium]}>
                      {isBasic && <Star size={32} color="#10B981" />}
                      {isRecommended && <Zap size={32} color="#8B5CF6" />}
                      {isPremium && <Crown size={32} color="#EF4444" />}
                    </View>

                    <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
                      {isBasic ? 'Pro Basic' : isRecommended ? 'Pro Avancé' : 'Expert Pro'}
                    </Text>

                    <View style={styles.priceBox}>
                      {isBasic && (
                        <View style={styles.freeTrialBadge}>
                          <Text style={styles.freeTrialText}>1er mois GRATUIT</Text>
                        </View>
                      )}
                      <Text style={styles.cardPrice}>{formatPrice(pkg.price)}</Text>
                      <Text style={[styles.cardPeriod, isRTL && styles.textRTL]}>Mensuel</Text>
                    </View>

                    <Text style={[styles.cardSubtitle, isRTL && styles.textRTL]}>
                      {pkg.description || getPackageDescription(pkg)}
                    </Text>

                    <View style={styles.featuresList}>
                      <View style={styles.featureRow}>
                        <Check size={16} color={isBasic ? '#10B981' : isRecommended ? '#8B5CF6' : '#EF4444'} />
                        <Text style={[styles.featureTextCard, isRTL && styles.textRTL]}>
                          {pkg.max_listings ? `Jusqu'à ${pkg.max_listings} annonces actives` : 'Annonces illimitées'}
                        </Text>
                      </View>

                      <View style={styles.featureRow}>
                        <Check size={16} color={isBasic ? '#10B981' : isRecommended ? '#8B5CF6' : '#EF4444'} />
                        <Text style={[styles.featureTextCard, isRTL && styles.textRTL]}>
                          Profil professionnel vérifié
                        </Text>
                      </View>

                      <View style={styles.featureRow}>
                        <Check size={16} color={isBasic ? '#10B981' : isRecommended ? '#8B5CF6' : '#EF4444'} />
                        <Text style={[styles.featureTextCard, isRTL && styles.textRTL]}>
                          Gestion centralisée des annonces
                        </Text>
                      </View>

                      <View style={styles.featureRow}>
                        <Check size={16} color={isBasic ? '#10B981' : isRecommended ? '#8B5CF6' : '#EF4444'} />
                        <Text style={[styles.featureTextCard, isRTL && styles.textRTL]}>
                          Statistiques de performance
                        </Text>
                      </View>

                      <View style={styles.featureRow}>
                        <Check size={16} color={isBasic ? '#10B981' : isRecommended ? '#8B5CF6' : '#EF4444'} />
                        <Text style={[styles.featureTextCard, isRTL && styles.textRTL]}>
                          Support professionnel
                        </Text>
                      </View>

                      {pkg.featured_listings > 0 && (
                        <View style={styles.featureRow}>
                          <Check size={16} color={isBasic ? '#10B981' : isRecommended ? '#8B5CF6' : '#EF4444'} />
                          <Text style={[styles.featureTextCard, isRTL && styles.textRTL]}>
                            {pkg.featured_listings} annonces en vedette
                          </Text>
                        </View>
                      )}

                      {pkg.analytics && (
                        <View style={styles.featureRow}>
                          <Check size={16} color={isBasic ? '#10B981' : isRecommended ? '#8B5CF6' : '#EF4444'} />
                          <Text style={[styles.featureTextCard, isRTL && styles.textRTL]}>
                            Analytique avancée
                          </Text>
                        </View>
                      )}

                      {pkg.priority_support && (
                        <View style={styles.featureRow}>
                          <Check size={16} color={isBasic ? '#10B981' : isRecommended ? '#8B5CF6' : '#EF4444'} />
                          <Text style={[styles.featureTextCard, isRTL && styles.textRTL]}>
                            Assistance 24h/24 et 7j/7
                          </Text>
                        </View>
                      )}

                      {isPremium && (
                        <>
                          <View style={styles.featureRow}>
                            <Check size={16} color="#EF4444" />
                            <Text style={[styles.featureTextCard, isRTL && styles.textRTL]}>
                              Site web dédié inclus
                            </Text>
                          </View>
                          <View style={styles.featureRow}>
                            <Check size={16} color="#EF4444" />
                            <Text style={[styles.featureTextCard, isRTL && styles.textRTL]}>
                              Gestionnaire de comptes dédié
                            </Text>
                          </View>
                        </>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.cardButton,
                        isBasic && styles.cardButtonBasic,
                        isRecommended && styles.cardButtonRecommended,
                        isPremium && styles.cardButtonPremium,
                      ]}
                      onPress={() => {
                        console.log('Button clicked!');
                        handleSubscribe(pkg);
                      }}
                      activeOpacity={0.8}
                      disabled={false}
                    >
                      <Text style={[styles.cardButtonText, isRTL && styles.textRTL]}>
                        {isBasic ? 'Choisir Pro Basic' : isRecommended ? 'Choisir Pro Avancé' : 'Choisir Pro Expert'}
                      </Text>
                      <View accessible={false} importantForAccessibility="no">
                        <ArrowLeft size={18} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      <View style={styles.faqSection}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('pro.faq')}</Text>

        <View style={styles.faqItem}>
          <Text style={[styles.faqQuestion, isRTL && styles.textRTL]}>
            {t('pro.faqChangeCategory')}
          </Text>
          <Text style={[styles.faqAnswer, isRTL && styles.textRTL]}>
            {t('pro.faqChangeCategoryAnswer')}
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={[styles.faqQuestion, isRTL && styles.textRTL]}>
            {t('pro.faqExpiration')}
          </Text>
          <Text style={[styles.faqAnswer, isRTL && styles.textRTL]}>
            {t('pro.faqExpirationAnswer')}
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={[styles.faqQuestion, isRTL && styles.textRTL]}>{t('pro.faqPayment')}
          </Text>
          <Text style={[styles.faqAnswer, isRTL && styles.textRTL]}>
            {t('pro.faqPaymentAnswer')}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <Footer />
      </ScrollView>

      {/* Modal de confirmation */}
      <Modal
        visible={confirmModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Crown size={32} color="#10B981" />
              <Text style={styles.modalTitle}>{t('pro.titleUpgrade')}</Text>
            </View>

            {selectedPackage && (
              <>
                <Text style={styles.modalDescription}>
                  {t('pro.confirmSubscription')} <Text style={styles.modalPackageName}>{getPackageName(selectedPackage)}</Text> {t('common.for')} <Text style={styles.modalPrice}>{formatPrice(selectedPackage.price)}</Text> ?
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setConfirmModalOpen(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>{t('common.cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={processSubscription}
                  >
                    <Text style={styles.modalButtonTextConfirm}>{t('common.confirm')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de succès */}
      <Modal
        visible={successModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Star size={32} color="#F59E0B" />
              <Text style={styles.modalTitle}>{t('pro.congratulations')}</Text>
            </View>

            <Text style={styles.modalDescription}>
              Votre abonnement PRO est activé ! Vous pouvez maintenant créer votre Store PRO pour profiter de tous les avantages.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setSuccessModalOpen(false);
                  router.push('/profile');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Plus tard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={() => {
                  setSuccessModalOpen(false);
                  router.push('/pro/create-store');
                }}
              >
                <Text style={styles.modalButtonTextConfirm}>Créer mon Store</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  homeButtonContainer: {
    padding: 16,
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
  header: {
    paddingTop: Platform.OS === 'web' ? 20 : 10,
    paddingBottom: 24,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  backButton: {
    marginBottom: 24,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 5,
  },
  crownContainer: {
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  benefitsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: '48%',
    maxWidth: '48%',
  },
  benefitText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    fontWeight: '600',
    lineHeight: 16,
  },
  categorySection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  categoryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A202C',
    flex: 1,
  },
  cardsContainer: {
    gap: 16,
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 3,
    position: 'relative',
  },
  pricingCardBasic: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  pricingCardRecommended: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FAF5FF',
  },
  pricingCardPremium: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -14,
    left: '50%',
    transform: [{ translateX: -65 }],
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  cardIconBasic: {
    backgroundColor: '#D1FAE5',
  },
  cardIconRecommended: {
    backgroundColor: '#EDE9FE',
  },
  cardIconPremium: {
    backgroundColor: '#FEE2E2',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  priceBox: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cardPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 4,
  },
  cardPeriod: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  categorySelector: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  categoryDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginTop: 12,
  },
  categoryDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectedCategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryDropdownText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  categoryDropdown: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 280,
  },
  categoryDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryDropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  categoryItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryDropdownItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  categoryDropdownItemTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  freeTrialBadge: {
    position: 'absolute',
    top: -28,
    left: '50%',
    transform: [{ translateX: -70 }],
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 5,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  freeTrialText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureTextCard: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardButtonBasic: {
    backgroundColor: '#10B981',
  },
  cardButtonRecommended: {
    backgroundColor: '#8B5CF6',
  },
  cardButtonPremium: {
    backgroundColor: '#EF4444',
  },
  cardButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  faqSection: {
    padding: 16,
    paddingBottom: 32,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  textRTL: {
    textAlign: 'right',
  },
  benefitItemRTL: {
    flexDirection: 'row-reverse',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalPackageName: {
    fontWeight: '700',
    color: '#10B981',
  },
  modalPrice: {
    fontWeight: '700',
    color: '#2563EB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F1F5F9',
  },
  modalButtonConfirm: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  modalButtonTextConfirm: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

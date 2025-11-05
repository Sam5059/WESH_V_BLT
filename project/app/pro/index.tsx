import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import {
  Crown,
  Zap,
  Star,
  TrendingUp,
  Shield,
  Camera,
  BarChart3,
  Headphones,
  Car,
  Home,
  Smartphone,
  Shirt,
  Wrench,
  Leaf,
  Gamepad2,
  Briefcase,
  Heart,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react-native';
import HomeButton from '@/components/HomeButton';
import ProHeader from '@/components/ProHeader';
import ProFeatureCard from '@/components/ProFeatureCard';

interface Category {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
  slug: string;
  icon: string;
}

const categoryIcons: Record<string, any> = {
  'vehicules': Car,
  'immobilier': Home,
  'electronique': Smartphone,
  'mode-beaute': Shirt,
  'services': Wrench,
  'maison-jardin': Leaf,
  'loisirs': Gamepad2,
  'emploi': Briefcase,
  'animaux': Heart,
};

export default function ProHomePage() {
  const { user, profile } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    loadCategories();
    return () => subscription?.remove();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, name_ar, name_en, slug')
      .is('parent_id', null)
      .order('order_position');

    if (data) {
      setCategories(data);
    }
  };

  const getCategoryName = (category: Category) => {
    if (language === 'ar') return category.name_ar || category.name;
    if (language === 'en') return category.name_en || category.name;
    return category.name;
  };

  const advantages = [
    {
      icon: Zap,
      title: 'Annonces illimitées',
      description: 'Publiez autant que vous voulez',
      gradient: ['#FEF3C7', '#FDE68A'] as [string, string],
      iconColor: '#F59E0B'
    },
    {
      icon: Star,
      title: 'Badge PRO visible',
      description: 'Démarquez-vous des particuliers',
      gradient: ['#DBEAFE', '#BFDBFE'] as [string, string],
      iconColor: '#3B82F6'
    },
    {
      icon: TrendingUp,
      title: 'Apparaître en haut',
      description: 'Priorité dans les résultats',
      gradient: ['#D1FAE5', '#A7F3D0'] as [string, string],
      iconColor: '#10B981'
    },
    {
      icon: Shield,
      title: 'Statistiques détaillées',
      description: 'Suivez vos performances',
      gradient: ['#E0E7FF', '#C7D2FE'] as [string, string],
      iconColor: '#6366F1'
    },
    {
      icon: Headphones,
      title: 'Support prioritaire',
      description: 'Assistance 24/7 dédiée',
      gradient: ['#FCE7F3', '#FBCFE8'] as [string, string],
      iconColor: '#EC4899'
    },
    {
      icon: Camera,
      title: "Jusqu'à 10 photos",
      description: 'Plus de visuels par annonce',
      gradient: ['#FED7AA', '#FDBA74'] as [string, string],
      iconColor: '#F97316'
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* New Modern Header */}
      <ProHeader
        title="Espace PRO"
        subtitle="Boostez votre visibilité et vendez plus vite"
        showBackButton={false}
        showHomeButton={true}
      />

      {/* CTA Buttons */}
      <View style={styles.ctaContainer}>
        {profile?.user_type === 'professional' && profile.pro_expires_at ? (
          <TouchableOpacity
            style={styles.ctaPrimaryModern}
            onPress={() => router.push('/pro/dashboard')}
          >
            <BarChart3 size={22} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.ctaPrimaryModernText}>Mon tableau de bord</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.ctaPrimaryModern}
            onPress={() => router.push('/pro/packages')}
          >
            <Text style={styles.ctaPrimaryModernText}>Découvrir les offres</Text>
            <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.ctaSecondaryModern}
          onPress={() => router.push('/pro/test-store')}
        >
          <Text style={styles.ctaSecondaryModernText}>Voir un exemple de boutique</Text>
        </TouchableOpacity>
      </View>

      {/* Advantages Section with Modern Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avantages PRO</Text>
        <Text style={styles.sectionSubtitle}>
          Des outils puissants pour développer votre activité
        </Text>
        <View style={styles.advantagesGrid}>
          {advantages.map((advantage, index) => (
            <ProFeatureCard
              key={index}
              icon={advantage.icon}
              title={advantage.title}
              description={advantage.description}
              gradient={advantage.gradient}
              iconColor={advantage.iconColor}
            />
          ))}
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choisissez votre catégorie</Text>
        <Text style={styles.sectionSubtitle}>
          Sélectionnez une catégorie pour voir les packs professionnels adaptés
        </Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => {
            const IconComponent = categoryIcons[category.slug] || Briefcase;
            return (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => router.push(`/pro/packages?category=${category.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryIconContainer}>
                  <IconComponent size={28} color="#2563EB" strokeWidth={2} />
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {getCategoryName(category)}
                </Text>
                <View style={styles.categoryArrow}>
                  <ArrowRight size={16} color="#64748B" />
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[styles.categoryCard, styles.categoryCardAll]}
            onPress={() => router.push('/pro/packages')}
            activeOpacity={0.7}
          >
            <View style={styles.categoryIconContainer}>
              <Star size={28} color="#FFD700" strokeWidth={2} />
            </View>
            <Text style={styles.categoryName}>Toutes les catégories</Text>
            <View style={styles.categoryArrow}>
              <ArrowRight size={16} color="#64748B" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pricing Teaser */}
      <View style={styles.pricingSection}>
        <View style={styles.pricingContent}>
          <View style={styles.pricingIcon}>
            <BarChart3 size={32} color="#10B981" strokeWidth={2} />
          </View>
          <Text style={styles.pricingTitle}>Des packs pour tous les budgets</Text>
          <Text style={styles.pricingDescription}>
            À partir de 3 000 DA pour 30 jours de visibilité maximale
          </Text>
          <TouchableOpacity
            style={styles.ctaSecondary}
            onPress={() => router.push('/pro/packages')}
          >
            <Text style={styles.ctaSecondaryText}>Voir tous les packs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        <View style={styles.faqContainer}>
          <View style={styles.faqItem}>
            <View style={styles.faqIconContainer}>
              <CheckCircle2 size={20} color="#10B981" />
            </View>
            <View style={styles.faqContent}>
              <Text style={styles.faqQuestion}>Puis-je changer de catégorie ?</Text>
              <Text style={styles.faqAnswer}>
                Oui, vous pouvez souscrire à plusieurs catégories simultanément.
              </Text>
            </View>
          </View>

          <View style={styles.faqItem}>
            <View style={styles.faqIconContainer}>
              <CheckCircle2 size={20} color="#10B981" />
            </View>
            <View style={styles.faqContent}>
              <Text style={styles.faqQuestion}>Que se passe-t-il après expiration ?</Text>
              <Text style={styles.faqAnswer}>
                Vos annonces restent actives mais perdent les avantages PRO. Vous pouvez renouveler à tout moment.
              </Text>
            </View>
          </View>

          <View style={styles.faqItem}>
            <View style={styles.faqIconContainer}>
              <CheckCircle2 size={20} color="#10B981" />
            </View>
            <View style={styles.faqContent}>
              <Text style={styles.faqQuestion}>Comment payer ?</Text>
              <Text style={styles.faqAnswer}>
                Paiement par CCP, BaridiMob ou virement bancaire. Contactez-nous pour activer votre compte.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer CTA */}
      <View style={styles.footerCta}>
        <View style={styles.footerCtaContent}>
          <Crown size={40} color="#FFD700" strokeWidth={2} />
          <Text style={styles.footerCtaTitle}>Prêt à devenir PRO ?</Text>
          <Text style={styles.footerCtaDescription}>
            Rejoignez des milliers de professionnels qui font confiance à Buy&Go
          </Text>
          <TouchableOpacity
            style={styles.ctaPrimary}
            onPress={() => router.push('/pro/packages')}
          >
            <Text style={styles.ctaPrimaryText}>Choisir mon pack</Text>
            <ArrowRight size={20} color="#1F2937" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Besoin d'aide ?</Text>
        <Text style={styles.contactDescription}>
          Notre équipe est là pour vous accompagner
        </Text>
        <View style={styles.contactMethods}>
          <View style={styles.contactMethod}>
            <Text style={styles.contactLabel}>📧 Email</Text>
            <Text style={styles.contactValue}>contact@buyandgo.dz</Text>
          </View>
          <View style={styles.contactMethod}>
            <Text style={styles.contactLabel}>📞 Téléphone</Text>
            <Text style={styles.contactValue}>+213 770 00 00 00</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} Buy&Go. Tous droits réservés.
        </Text>
      </View>

      {/* Footer */}
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  ctaContainer: {
    padding: 20,
    gap: 12,
  },
  ctaPrimaryModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaPrimaryModernText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  ctaSecondaryModern: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  ctaSecondaryModernText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  homeButtonContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  hero: {
    backgroundColor: '#2563EB',
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    paddingHorizontal: 16,
  },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaPrimaryText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 22,
  },
  advantagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  advantageCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  advantageIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#EFF6FF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  advantageTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
  },
  advantageDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  categoryCardAll: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBEB',
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#EFF6FF',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 20,
    minHeight: 40,
  },
  categoryArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  pricingSection: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 32,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  pricingContent: {
    alignItems: 'center',
  },
  pricingIcon: {
    marginBottom: 16,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  pricingDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaSecondary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  ctaSecondaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.3,
  },
  faqContainer: {
    gap: 16,
    marginTop: 16,
  },
  faqItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqIconContainer: {
    marginTop: 2,
  },
  faqContent: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  footerCta: {
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 32,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  footerCtaContent: {
    alignItems: 'center',
  },
  footerCtaTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  footerCtaDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  contactSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  contactMethods: {
    gap: 16,
  },
  contactMethod: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  User,
  Briefcase,
  HelpCircle,
  FileText,
  Shield,
  MessageCircle
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

interface FooterLinkProps {
  onPress: () => void;
  text: string;
  isRTL: boolean;
}

function FooterLink({ onPress, text, isRTL }: FooterLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TouchableOpacity
      style={styles.footerLink}
      onPress={onPress}
      onMouseEnter={() => Platform.OS === 'web' && setIsHovered(true)}
      onMouseLeave={() => Platform.OS === 'web' && setIsHovered(false)}
    >
      <Text style={[
        styles.footerLinkText,
        isRTL && styles.textRTL,
        isHovered && styles.footerLinkTextHover
      ]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

export default function Footer() {
  const { t, isRTL, language } = useLanguage();

  const handleEmail = () => {
    Linking.openURL('mailto:contact@buygo.dz');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+213550123456');
  };

  const handleSocialMedia = (platform: string) => {
    const urls: { [key: string]: string } = {
      facebook: 'https://facebook.com/buygo.dz',
      twitter: 'https://twitter.com/buygo_dz',
      instagram: 'https://instagram.com/buygo.dz',
      linkedin: 'https://linkedin.com/company/buygo-dz'
    };
    Linking.openURL(urls[platform]);
  };

  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        {/* Section 1: À propos */}
        <View style={styles.footerSection}>
          <Text style={[styles.footerTitle, isRTL && styles.textRTL]}>
            {language === 'fr' ? 'À propos de BuyGo' : language === 'en' ? 'About BuyGo' : 'حول BuyGo'}
          </Text>
          <Text style={[styles.footerText, isRTL && styles.textRTL]}>
            {language === 'fr'
              ? 'BuyGo est la première plateforme algérienne de petites annonces en ligne. Achetez et vendez facilement entre particuliers et professionnels.'
              : language === 'en'
              ? 'BuyGo is the first Algerian online classifieds platform. Buy and sell easily between individuals and professionals.'
              : 'BuyGo هي أول منصة جزائرية للإعلانات المبوبة على الإنترنت. اشتري وبيع بسهولة بين الأفراد والمهنيين.'
            }
          </Text>

          {/* Réseaux sociaux */}
          <View style={styles.socialLinks}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialMedia('facebook')}
            >
              <Facebook size={20} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialMedia('instagram')}
            >
              <Instagram size={20} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialMedia('twitter')}
            >
              <Twitter size={20} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialMedia('linkedin')}
            >
              <Linkedin size={20} color="#0A66C2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Pour les particuliers */}
        <View style={styles.footerSection}>
          <View style={styles.sectionHeader}>
            <User size={18} color="#2563EB" />
            <Text style={[styles.footerTitle, styles.titleWithIcon, isRTL && styles.textRTL]}>
              {language === 'fr' ? 'Pour les Particuliers' : language === 'en' ? 'For Individuals' : 'للأفراد'}
            </Text>
          </View>

          <FooterLink
            onPress={() => router.push('/(tabs)/publish')}
            text={language === 'fr' ? 'Publier une annonce' : language === 'en' ? 'Post an ad' : 'نشر إعلان'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={() => router.push('/(tabs)/search')}
            text={language === 'fr' ? 'Rechercher des annonces' : language === 'en' ? 'Browse ads' : 'تصفح الإعلانات'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={() => router.push('/my-listings')}
            text={language === 'fr' ? 'Mes annonces' : language === 'en' ? 'My listings' : 'إعلاناتي'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={() => router.push('/(tabs)/profile')}
            text={language === 'fr' ? 'Mon profil' : language === 'en' ? 'My profile' : 'ملفي الشخصي'}
            isRTL={isRTL}
          />
        </View>

        {/* Section 3: Espace Professionnel */}
        <View style={styles.footerSection}>
          <View style={styles.sectionHeader}>
            <Briefcase size={18} color="#2563EB" />
            <Text style={[styles.footerTitle, styles.titleWithIcon, isRTL && styles.textRTL]}>
              {language === 'fr' ? 'Espace Professionnel' : language === 'en' ? 'For Professionals' : 'للمحترفين'}
            </Text>
          </View>

          <FooterLink
            onPress={() => router.push('/pro/index')}
            text={language === 'fr' ? 'Devenir Pro' : language === 'en' ? 'Become Pro' : 'كن محترفاً'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={() => router.push('/pro/packages')}
            text={language === 'fr' ? 'Nos forfaits Pro' : language === 'en' ? 'Pro packages' : 'باقات المحترفين'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={() => router.push('/pro/dashboard')}
            text={language === 'fr' ? 'Tableau de bord Pro' : language === 'en' ? 'Pro dashboard' : 'لوحة تحكم المحترفين'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={() => router.push('/pro/create-store')}
            text={language === 'fr' ? 'Créer ma boutique' : language === 'en' ? 'Create my store' : 'إنشاء متجري'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={() => router.push('/(tabs)/stores')}
            text={language === 'fr' ? 'Annuaire des boutiques' : language === 'en' ? 'Store directory' : 'دليل المتاجر'}
            isRTL={isRTL}
          />
        </View>

        {/* Section 4: Aide & Support */}
        <View style={styles.footerSection}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={18} color="#2563EB" />
            <Text style={[styles.footerTitle, styles.titleWithIcon, isRTL && styles.textRTL]}>
              {language === 'fr' ? 'Aide & Support' : language === 'en' ? 'Help & Support' : 'المساعدة والدعم'}
            </Text>
          </View>

          <FooterLink
            onPress={handleEmail}
            text={language === 'fr' ? 'FAQ - Questions fréquentes' : language === 'en' ? 'FAQ' : 'الأسئلة الشائعة'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={handleEmail}
            text={language === 'fr' ? 'Nous contacter' : language === 'en' ? 'Contact us' : 'اتصل بنا'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={handleEmail}
            text={language === 'fr' ? 'Conseils de sécurité' : language === 'en' ? 'Safety tips' : 'نصائح الأمان'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={() => router.push('/(tabs)')}
            text={language === 'fr' ? 'Comment ça marche ?' : language === 'en' ? 'How it works' : 'كيف يعمل؟'}
            isRTL={isRTL}
          />
        </View>

        {/* Section 5: Informations légales */}
        <View style={styles.footerSection}>
          <View style={styles.sectionHeader}>
            <Shield size={18} color="#2563EB" />
            <Text style={[styles.footerTitle, styles.titleWithIcon, isRTL && styles.textRTL]}>
              {language === 'fr' ? 'Légal' : language === 'en' ? 'Legal' : 'قانوني'}
            </Text>
          </View>

          <FooterLink
            onPress={() => router.push('/legal/privacy')}
            text={language === 'fr' ? 'Politique de confidentialité' : language === 'en' ? 'Privacy policy' : 'سياسة الخصوصية'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={() => router.push('/legal/terms')}
            text={language === 'fr' ? 'Conditions d\'utilisation' : language === 'en' ? 'Terms of use' : 'شروط الاستخدام'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={() => router.push('/legal/cookies')}
            text={language === 'fr' ? 'Politique de cookies' : language === 'en' ? 'Cookie policy' : 'سياسة ملفات تعريف الارتباط'}
            isRTL={isRTL}
          />

          <FooterLink
            onPress={() => router.push('/legal/mentions')}
            text={language === 'fr' ? 'Mentions légales' : language === 'en' ? 'Legal notice' : 'إشعار قانوني'}
            isRTL={isRTL}
          />
        </View>

        {/* Section 6: Contact */}
        <View style={styles.footerSection}>
          <View style={styles.sectionHeader}>
            <MessageCircle size={18} color="#2563EB" />
            <Text style={[styles.footerTitle, styles.titleWithIcon, isRTL && styles.textRTL]}>
              {language === 'fr' ? 'Contact' : language === 'en' ? 'Contact' : 'اتصل'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleEmail}
          >
            <Mail size={16} color="#64748B" />
            <Text style={[styles.contactText, isRTL && styles.textRTL]}>
              contact@buygo.dz
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={handlePhone}
          >
            <Phone size={16} color="#64748B" />
            <Text style={[styles.contactText, isRTL && styles.textRTL]}>
              +213 550 123 456
            </Text>
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <MapPin size={16} color="#64748B" />
            <Text style={[styles.contactText, isRTL && styles.textRTL]}>
              {language === 'fr'
                ? 'Alger, Algérie'
                : language === 'en'
                ? 'Algiers, Algeria'
                : 'الجزائر العاصمة، الجزائر'
              }
            </Text>
          </View>

          <View style={styles.businessHours}>
            <Text style={[styles.businessHoursTitle, isRTL && styles.textRTL]}>
              {language === 'fr' ? 'Horaires' : language === 'en' ? 'Business hours' : 'ساعات العمل'}
            </Text>
            <Text style={[styles.businessHoursText, isRTL && styles.textRTL]}>
              {language === 'fr'
                ? 'Dim - Jeu: 9h - 17h'
                : language === 'en'
                ? 'Sun - Thu: 9am - 5pm'
                : 'الأحد - الخميس: 9 صباحاً - 5 مساءً'
              }
            </Text>
            <Text style={[styles.businessHoursText, isRTL && styles.textRTL]}>
              {language === 'fr'
                ? 'Vendredi: Fermé'
                : language === 'en'
                ? 'Friday: Closed'
                : 'الجمعة: مغلق'
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Copyright */}
      <View style={styles.copyright}>
        <Text style={[styles.copyrightText, isRTL && styles.textRTL]}>
          © {currentYear} BuyGo. {language === 'fr'
            ? 'Tous droits réservés.'
            : language === 'en'
            ? 'All rights reserved.'
            : 'جميع الحقوق محفوظة.'
          }
        </Text>
        <Text style={[styles.copyrightSubtext, isRTL && styles.textRTL]}>
          {language === 'fr'
            ? 'Plateforme de petites annonces en Algérie'
            : language === 'en'
            ? 'Classified ads platform in Algeria'
            : 'منصة الإعلانات المبوبة في الجزائر'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#1E293B',
    paddingTop: 48,
    paddingBottom: 24,
    marginTop: 'auto',
  },
  footerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  footerSection: {
    minWidth: 200,
    flex: 1,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  titleWithIcon: {
    marginBottom: 0,
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
    marginBottom: 20,
  },
  footerLink: {
    marginBottom: 12,
  },
  footerLinkText: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'color 0.2s ease',
      },
    }),
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  socialButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  businessHours: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  businessHoursTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  businessHoursText: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
  copyright: {
    marginTop: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  copyrightSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  textRTL: {
    textAlign: 'right',
  },
  footerLinkTextHover: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});

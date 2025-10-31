import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Cookie, Settings, Eye, Shield } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CookiePolicyScreen() {
  const { language, isRTL } = useLanguage();

  const content = {
    fr: {
      title: "Politique de Cookies",
      lastUpdate: "Dernière mise à jour : 20 octobre 2025",
      intro: "Buy&Go utilise des cookies et technologies similaires pour améliorer votre expérience sur notre plateforme. Cette politique explique comment nous utilisons ces technologies conformément à la législation algérienne.",
      sections: [
        {
          icon: "🍪",
          title: "Qu'est-ce qu'un cookie ?",
          content: "Un cookie est un petit fichier texte stocké sur votre appareil lors de la visite d'un site web. Il permet de mémoriser vos préférences et d'améliorer votre navigation."
        },
        {
          icon: "📊",
          title: "Types de cookies utilisés",
          content: "• Cookies essentiels : Nécessaires au fonctionnement de la plateforme (connexion, panier, sécurité)\n\n• Cookies de performance : Mesure de l'audience et amélioration de l'expérience\n\n• Cookies de préférences : Mémorisation de vos choix (langue, localisation)\n\n• Cookies tiers : Google Analytics, réseaux sociaux (avec votre consentement)"
        },
        {
          icon: "⚙️",
          title: "Gestion des cookies",
          content: "Vous pouvez accepter ou refuser les cookies non essentiels lors de votre première visite. Pour modifier vos préférences :\n\n1. Accédez à Profil > Paramètres > Cookies\n2. Paramètres de votre navigateur (Chrome, Firefox, Safari)\n3. Contactez-nous : privacy@buygo.dz"
        },
        {
          icon: "🔒",
          title: "Durée de conservation",
          content: "• Cookies de session : Supprimés à la fermeture du navigateur\n• Cookies persistants : Jusqu'à 12 mois maximum\n• Vous pouvez les supprimer à tout moment via les paramètres de votre navigateur"
        },
        {
          icon: "📱",
          title: "Cookies sur mobile",
          content: "Notre application mobile utilise des technologies similaires aux cookies pour stocker vos préférences localement. Ces données restent sur votre appareil et ne sont jamais transférées sans votre consentement."
        }
      ],
      banner: {
        title: "Votre Consentement, Votre Choix",
        desc: "Vous gardez le contrôle total sur l'utilisation des cookies non essentiels."
      }
    },
    en: {
      title: "Cookie Policy",
      lastUpdate: "Last updated: October 20, 2025",
      intro: "Buy&Go uses cookies and similar technologies to improve your experience on our platform. This policy explains how we use these technologies in accordance with Algerian legislation.",
      sections: [
        {
          icon: "🍪",
          title: "What is a cookie?",
          content: "A cookie is a small text file stored on your device when visiting a website. It helps remember your preferences and improve your browsing experience."
        }
      ],
      banner: {
        title: "Your Consent, Your Choice",
        desc: "You maintain full control over the use of non-essential cookies."
      }
    },
    ar: {
      title: "سياسة ملفات تعريف الارتباط",
      lastUpdate: "آخر تحديث: 20 أكتوبر 2025",
      intro: "تستخدم Buy&Go ملفات تعريف الارتباط والتقنيات المماثلة لتحسين تجربتك على منصتنا. توضح هذه السياسة كيفية استخدامنا لهذه التقنيات وفقًا للتشريع الجزائري.",
      sections: [
        {
          icon: "🍪",
          title: "ما هو ملف تعريف الارتباط؟",
          content: "ملف تعريف الارتباط هو ملف نصي صغير يتم تخزينه على جهازك عند زيارة موقع ويب. يساعد على تذكر تفضيلاتك وتحسين تجربة التصفح."
        }
      ],
      banner: {
        title: "موافقتك، اختيارك",
        desc: "أنت تحتفظ بالسيطرة الكاملة على استخدام ملفات تعريف الارتباط غير الأساسية."
      }
    }
  };

  const currentContent = content[language as keyof typeof content] || content.fr;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Cookie size={32} color="#FFFFFF" />
            <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{currentContent.title}</Text>
            <View style={styles.updateBadge}>
              <Text style={styles.updateText}>{currentContent.lastUpdate}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.introCard}>
            <Text style={[styles.introText, isRTL && styles.textRTL]}>{currentContent.intro}</Text>
          </View>

          {currentContent.sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>{section.icon}</Text>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{section.title}</Text>
              </View>
              <Text style={[styles.sectionContent, isRTL && styles.textRTL]}>{section.content}</Text>
            </View>
          ))}

          {/* Control Banner */}
          <View style={styles.controlBanner}>
            <Settings size={28} color="#2563EB" />
            <View style={styles.bannerText}>
              <Text style={[styles.bannerTitle, isRTL && styles.textRTL]}>
                {currentContent.banner.title}
              </Text>
              <Text style={[styles.bannerDesc, isRTL && styles.textRTL]}>
                {currentContent.banner.desc}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#F59E0B',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  updateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  updateText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 24,
    gap: 20,
  },
  introCard: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  introText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#92400E',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  controlBanner: {
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    gap: 16,
    marginTop: 20,
  },
  bannerText: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
  },
  bannerDesc: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  textRTL: {
    textAlign: 'right',
  },
});

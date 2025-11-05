import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText, Users, Globe } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LegalNoticeScreen() {
  const { language, isRTL } = useLanguage();

  const content = {
    fr: {
      title: "Mentions Légales",
      lastUpdate: "Dernière mise à jour : 20 octobre 2025",
      sections: [
        {
          icon: Building2,
          color: '#2563EB',
          title: "Identification de l'Entreprise",
          items: [
            { label: "Raison sociale", value: "Buy&Go SARL" },
            { label: "Forme juridique", value: "Société à Responsabilité Limitée (SARL)" },
            { label: "Capital social", value: "1 000 000 DZD" },
            { label: "Registre de Commerce (RC)", value: "[À compléter]" },
            { label: "NIF", value: "[À compléter]" },
            { label: "Siège social", value: "Alger, Algérie" }
          ]
        },
        {
          icon: Users,
          color: '#10B981',
          title: "Direction",
          items: [
            { label: "Directeur de Publication", value: "[Nom du Directeur]" },
            { label: "Responsable Légal", value: "[Nom du Responsable]" },
            { label: "Contact Direction", value: "direction@buygo.dz" }
          ]
        },
        {
          icon: Globe,
          color: '#F59E0B',
          title: "Hébergement",
          items: [
            { label: "Hébergeur", value: "Supabase Inc." },
            { label: "Pays d'hébergement", value: "Conformité avec la législation algérienne" },
            { label: "Adresse hébergeur", value: "San Francisco, CA, USA" },
            { label: "Données en Algérie", value: "Stockées localement conformément à la Loi n° 18-07" }
          ]
        },
        {
          icon: FileText,
          color: '#8B5CF6',
          title: "Propriété Intellectuelle",
          items: [
            { label: "Marque", value: "Buy&Go® - Tous droits réservés" },
            { label: "Logo et Design", value: "© Buy&Go SARL 2025" },
            { label: "Code Source", value: "Propriété exclusive de Buy&Go SARL" },
            { label: "Protection", value: "Droit d'auteur algérien et international" }
          ]
        }
      ],
      contact: {
        title: "Nous Contacter",
        items: [
          { icon: Mail, label: "Email général", value: "contact@buygo.dz", link: "mailto:contact@buygo.dz" },
          { icon: Mail, label: "Email légal", value: "legal@buygo.dz", link: "mailto:legal@buygo.dz" },
          { icon: Mail, label: "Protection des données", value: "privacy@buygo.dz", link: "mailto:privacy@buygo.dz" },
          { icon: Phone, label: "Téléphone", value: "+213 550 123 456", link: "tel:+213550123456" },
          { icon: MapPin, label: "Adresse", value: "Alger, Algérie" }
        ]
      },
      legislation: {
        title: "Législation Applicable",
        desc: "Cette plateforme est soumise à la législation algérienne, notamment :",
        laws: [
          "Loi n° 18-05 du 10 mai 2018 relative au commerce électronique",
          "Loi n° 18-07 du 10 mai 2018 relative à la protection des données personnelles",
          "Loi n° 09-03 du 25 février 2009 relative à la protection du consommateur"
        ]
      }
    },
    en: {
      title: "Legal Notice",
      lastUpdate: "Last updated: October 20, 2025",
      sections: [
        {
          icon: Building2,
          color: '#2563EB',
          title: "Company Identification",
          items: [
            { label: "Company name", value: "Buy&Go SARL" },
            { label: "Legal form", value: "Limited Liability Company (SARL)" },
            { label: "Share capital", value: "1,000,000 DZD" }
          ]
        }
      ],
      contact: {
        title: "Contact Us",
        items: [
          { icon: Mail, label: "General email", value: "contact@buygo.dz", link: "mailto:contact@buygo.dz" }
        ]
      },
      legislation: {
        title: "Applicable Legislation",
        desc: "This platform is subject to Algerian legislation, including:",
        laws: [
          "Law No. 18-05 of May 10, 2018 on electronic commerce"
        ]
      }
    },
    ar: {
      title: "إشعار قانوني",
      lastUpdate: "آخر تحديث: 20 أكتوبر 2025",
      sections: [
        {
          icon: Building2,
          color: '#2563EB',
          title: "تحديد الشركة",
          items: [
            { label: "اسم الشركة", value: "Buy&Go SARL" }
          ]
        }
      ],
      contact: {
        title: "اتصل بنا",
        items: [
          { icon: Mail, label: "البريد الإلكتروني العام", value: "contact@buygo.dz", link: "mailto:contact@buygo.dz" }
        ]
      },
      legislation: {
        title: "التشريع المعمول به",
        desc: "تخضع هذه المنصة للتشريع الجزائري:",
        laws: [
          "القانون رقم 18-05 المؤرخ 10 مايو 2018 المتعلق بالتجارة الإلكترونية"
        ]
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
            <Building2 size={32} color="#FFFFFF" />
            <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{currentContent.title}</Text>
            <View style={styles.updateBadge}>
              <Text style={styles.updateText}>{currentContent.lastUpdate}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {currentContent.sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <View key={index} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: `${section.color}15` }]}>
                    <IconComponent size={24} color={section.color} />
                  </View>
                  <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{section.title}</Text>
                </View>
                <View style={styles.itemsList}>
                  {section.items.map((item, idx) => (
                    <View key={idx} style={styles.item}>
                      <Text style={[styles.itemLabel, isRTL && styles.textRTL]}>{item.label}</Text>
                      <Text style={[styles.itemValue, isRTL && styles.textRTL]}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={[styles.contactTitle, isRTL && styles.textRTL]}>
              {currentContent.contact.title}
            </Text>
            {currentContent.contact.items.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.contactItem}
                  onPress={() => item.link && Linking.openURL(item.link)}
                  disabled={!item.link}
                >
                  <IconComponent size={20} color="#2563EB" />
                  <View style={styles.contactItemText}>
                    <Text style={[styles.contactLabel, isRTL && styles.textRTL]}>{item.label}</Text>
                    <Text style={[styles.contactValue, isRTL && styles.textRTL]}>{item.value}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legislation */}
          <View style={styles.legislationSection}>
            <Text style={[styles.legislationTitle, isRTL && styles.textRTL]}>
              {currentContent.legislation.title}
            </Text>
            <Text style={[styles.legislationDesc, isRTL && styles.textRTL]}>
              {currentContent.legislation.desc}
            </Text>
            {currentContent.legislation.laws.map((law, index) => (
              <View key={index} style={styles.lawItem}>
                <Text style={styles.lawBullet}>•</Text>
                <Text style={[styles.lawText, isRTL && styles.textRTL]}>{law}</Text>
              </View>
            ))}
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
    backgroundColor: '#0F172A',
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
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  itemsList: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },
  itemValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  contactSection: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  contactItemText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    color: '#1E40AF',
    fontWeight: '700',
  },
  legislationSection: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  legislationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 8,
  },
  legislationDesc: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 16,
  },
  lawItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  lawBullet: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
  },
  lawText: {
    fontSize: 14,
    color: '#065F46',
    flex: 1,
    lineHeight: 20,
  },
  textRTL: {
    textAlign: 'right',
  },
});

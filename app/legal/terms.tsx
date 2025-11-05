import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Scale, AlertCircle, Shield, FileText } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsOfServiceScreen() {
  const { language, isRTL } = useLanguage();

  const content = {
    fr: {
      title: "Conditions Générales d'Utilisation",
      lastUpdate: "Dernière mise à jour : 20 octobre 2025",
      sections: [
        {
          title: "1. Objet et Champ d'Application",
          content: "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme Buy&Go, accessible à l'adresse www.buygo.dz. En accédant et en utilisant cette plateforme, vous acceptez sans réserve les présentes CGU conformément à la législation algérienne, notamment la Loi n° 18-05 du 10 mai 2018 relative au commerce électronique."
        },
        {
          title: "2. Inscription et Compte Utilisateur",
          content: "L'inscription sur Buy&Go est gratuite pour les particuliers. Vous devez être âgé d'au moins 18 ans et fournir des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute utilisation frauduleuse peut entraîner la suspension ou la suppression de votre compte."
        },
        {
          title: "3. Services Proposés",
          content: "Buy&Go propose deux types de services :\n\n• Compte Particulier (Gratuit) : Publication d'annonces gratuites, recherche, messagerie.\n\n• Compte Professionnel (Payant) : Boutique en ligne personnalisée, annonces illimitées, mise en avant, statistiques avancées.\n\nLes tarifs des forfaits PRO sont disponibles sur la page Devenir Pro et sont exprimés en Dinars Algériens (DZD) TTC."
        },
        {
          title: "4. Obligations de l'Utilisateur",
          content: "Vous vous engagez à :\n\n• Publier des annonces conformes à la réalité\n• Respecter les lois algériennes\n• Ne pas diffuser de contenus interdits\n• Utiliser la plateforme de manière loyale\n• Respecter les droits des autres utilisateurs\n• Payer les forfaits PRO dans les délais convenus"
        },
        {
          title: "5. Contenus Interdits",
          content: "Conformément à la législation algérienne, il est strictement interdit de publier :\n\n❌ Armes et munitions\n❌ Drogues et substances illicites\n❌ Médicaments sans autorisation\n❌ Contenu pornographique ou obscène\n❌ Produits contrefaits ou piratés\n❌ Documents officiels falsifiés\n❌ Alcool (sauf autorisation légale)\n❌ Animaux protégés\n❌ Contenus diffamatoires ou racistes\n\nToute violation entraînera la suppression de l'annonce et la sanction du compte."
        },
        {
          title: "6. Modération et Sanctions",
          content: "Buy&Go se réserve le droit de modérer tous les contenus publiés. Les annonces suspectes peuvent être supprimées sans préavis. En cas de violation grave ou répétée, les sanctions suivantes peuvent être appliquées :\n\n• Avertissement\n• Suppression d'annonces\n• Suspension temporaire du compte\n• Bannissement définitif\n• Signalement aux autorités compétentes"
        },
        {
          title: "7. Tarifs et Paiement",
          content: "Les forfaits PRO sont payables en Dinars Algériens (DZD) via les moyens de paiement suivants :\n\n• CCP (Compte Chèques Postaux)\n• BaridiMob\n• Virement bancaire\n• Cartes CIB (Algérie Poste)\n\nLes prix sont indiqués TTC. Une facture conforme sera émise pour chaque transaction. Les paiements sont sécurisés et conformes à la réglementation bancaire algérienne."
        },
        {
          title: "8. Propriété Intellectuelle",
          content: "Tous les éléments de la plateforme Buy&Go (logo, design, code, textes) sont protégés par le droit d'auteur algérien et international. Toute reproduction, même partielle, est interdite sans autorisation écrite. Les utilisateurs conservent leurs droits sur les contenus qu'ils publient mais accordent à Buy&Go une licence d'utilisation pour afficher leurs annonces."
        },
        {
          title: "9. Responsabilité",
          content: "Buy&Go agit en tant qu'intermédiaire technique conformément à la Loi n° 18-05. Nous ne sommes pas responsables :\n\n• Du contenu des annonces publiées par les utilisateurs\n• Des transactions effectuées entre utilisateurs\n• De la qualité, conformité ou légalité des biens et services proposés\n• Des litiges entre acheteurs et vendeurs\n\nLes utilisateurs sont seuls responsables de leurs annonces et transactions."
        },
        {
          title: "10. Protection des Données Personnelles",
          content: "Vos données personnelles sont traitées conformément à la Loi n° 18-07 du 10 mai 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel. Consultez notre Politique de Confidentialité pour plus d'informations sur vos droits (accès, rectification, suppression, opposition)."
        },
        {
          title: "11. Droit de Rétractation",
          content: "Conformément à la Loi n° 09-03 relative à la protection du consommateur, vous disposez d'un délai de 7 jours calendaires pour exercer votre droit de rétractation pour les forfaits PRO, à compter de la date de souscription. Pour exercer ce droit, contactez-nous à l'adresse : legal@buygo.dz. Le remboursement sera effectué dans un délai de 14 jours."
        },
        {
          title: "12. Résolution des Litiges",
          content: "En cas de litige, nous vous encourageons à nous contacter d'abord pour une résolution amiable. Si aucun accord n'est trouvé, les tribunaux d'Alger sont seuls compétents. Le droit algérien est applicable."
        },
        {
          title: "13. Modification des CGU",
          content: "Buy&Go se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email et/ou notification sur la plateforme. L'utilisation continue de la plateforme après modification vaut acceptation des nouvelles CGU."
        },
        {
          title: "14. Contact et Informations Légales",
          content: "Buy&Go SARL\nRegistre de Commerce (RC) : [À compléter]\nNuméro d'Identification Fiscale (NIF) : [À compléter]\nAdresse : Alger, Algérie\n\nEmail général : contact@buygo.dz\nEmail légal : legal@buygo.dz\nTéléphone : +213 550 123 456\n\nHoraires : Dimanche - Jeudi : 9h00 - 17h00"
        }
      ],
      rights: "Vos Droits Sont Protégés",
      rightsDesc: "Ces CGU sont conformes à la législation algérienne et protègent vos droits en tant qu'utilisateur et consommateur."
    },
    en: {
      title: "Terms of Service",
      lastUpdate: "Last updated: October 20, 2025",
      sections: [
        {
          title: "1. Purpose and Scope",
          content: "These Terms of Service govern the use of the Buy&Go platform, accessible at www.buygo.dz. By accessing and using this platform, you unconditionally accept these Terms in accordance with Algerian legislation, including Law No. 18-05 of May 10, 2018 on electronic commerce."
        },
        {
          title: "2. Registration and User Account",
          content: "Registration on Buy&Go is free for individuals. You must be at least 18 years old and provide accurate and up-to-date information. You are responsible for the confidentiality of your login credentials. Any fraudulent use may result in suspension or deletion of your account."
        }
      ],
      rights: "Your Rights Are Protected",
      rightsDesc: "These Terms comply with Algerian legislation and protect your rights as a user and consumer."
    },
    ar: {
      title: "شروط الاستخدام",
      lastUpdate: "آخر تحديث: 20 أكتوبر 2025",
      sections: [
        {
          title: "1. الغرض والنطاق",
          content: "تحكم شروط الاستخدام هذه استخدام منصة Buy&Go المتاحة على www.buygo.dz. من خلال الوصول إلى هذه المنصة واستخدامها، فإنك توافق دون قيد أو شرط على هذه الشروط وفقًا للتشريع الجزائري، بما في ذلك القانون رقم 18-05 المؤرخ 10 مايو 2018 المتعلق بالتجارة الإلكترونية."
        }
      ],
      rights: "حقوقك محمية",
      rightsDesc: "هذه الشروط متوافقة مع التشريع الجزائري وتحمي حقوقك كمستخدم ومستهلك."
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
            <Scale size={32} color="#FFFFFF" />
            <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{currentContent.title}</Text>
            <View style={styles.updateBadge}>
              <Text style={styles.updateText}>{currentContent.lastUpdate}</Text>
            </View>
          </View>
        </View>

        {/* Sections */}
        <View style={styles.content}>
          {currentContent.sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{section.title}</Text>
              <Text style={[styles.sectionContent, isRTL && styles.textRTL]}>{section.content}</Text>
            </View>
          ))}

          {/* Rights Protection Banner */}
          <View style={styles.rightsBanner}>
            <Shield size={28} color="#10B981" />
            <View style={styles.rightsBannerText}>
              <Text style={[styles.rightsBannerTitle, isRTL && styles.textRTL]}>
                {currentContent.rights}
              </Text>
              <Text style={[styles.rightsBannerDesc, isRTL && styles.textRTL]}>
                {currentContent.rightsDesc}
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
    backgroundColor: '#2563EB',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  rightsBanner: {
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    gap: 16,
    marginTop: 20,
  },
  rightsBannerText: {
    flex: 1,
    gap: 4,
  },
  rightsBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#047857',
  },
  rightsBannerDesc: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  textRTL: {
    textAlign: 'right',
  },
});

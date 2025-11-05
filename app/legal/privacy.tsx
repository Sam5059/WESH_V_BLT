import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Lock, Eye, Database, Shield, UserCheck } from 'lucide-react-native';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';

export default function PrivacyScreen() {
  return (
    <View style={styles.wrapper}>
      <TopBar />
      <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={20} color="#2563EB" />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Lock size={48} color="#10B981" />
        <Text style={styles.title}>Politique de Confidentialité</Text>
        <Text style={styles.subtitle}>Buy&Go - Protection de vos données</Text>
        <Text style={styles.date}>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.updateInfo}>
          <Shield size={16} color="#10B981" />
          <Text style={styles.updateText}>
            Conforme à la loi n° 18-07 du 10 mai 2018
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            La présente Politique de Confidentialité décrit comment Buy&Go SARL collecte, utilise,
            stocke et protège vos données personnelles conformément à la loi n° 18-07 du 10 mai 2018
            relative à la protection des personnes physiques dans le traitement des données à
            caractère personnel.
          </Text>
          <Text style={styles.paragraph}>
            Buy&Go s'engage à protéger votre vie privée et à traiter vos données de manière
            transparente, sécurisée et conforme à la réglementation algérienne.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Identité du Responsable du Traitement</Text>
          <Text style={styles.paragraph}>
            Responsable du traitement:
          </Text>
          <Text style={styles.listItem}>Raison sociale: Buy&Go SARL</Text>
          <Text style={styles.listItem}>Siège social: [Adresse], Alger, Algérie</Text>
          <Text style={styles.listItem}>RC: [Numéro RC]</Text>
          <Text style={styles.listItem}>NIF: [Numéro NIF]</Text>
          <Text style={styles.listItem}>Email: privacy@buygo.dz</Text>
          <Text style={styles.listItem}>Téléphone: +213 (0) 23 XX XX XX</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Données Collectées</Text>

          <Text style={styles.sectionSubtitle}>3.1 Données d'inscription</Text>
          <Text style={styles.listItem}>• Nom complet</Text>
          <Text style={styles.listItem}>• Adresse email</Text>
          <Text style={styles.listItem}>• Numéro de téléphone</Text>
          <Text style={styles.listItem}>• Wilaya et commune</Text>
          <Text style={styles.listItem}>• Mot de passe (crypté)</Text>

          <Text style={styles.sectionSubtitle}>3.2 Données des annonces</Text>
          <Text style={styles.listItem}>• Titre et description</Text>
          <Text style={styles.listItem}>• Prix et catégorie</Text>
          <Text style={styles.listItem}>• Photos et localisation</Text>
          <Text style={styles.listItem}>• État du produit</Text>

          <Text style={styles.sectionSubtitle}>3.3 Données de navigation</Text>
          <Text style={styles.listItem}>• Adresse IP</Text>
          <Text style={styles.listItem}>• Type d'appareil</Text>
          <Text style={styles.listItem}>• Système d'exploitation</Text>
          <Text style={styles.listItem}>• Pages consultées</Text>
          <Text style={styles.listItem}>• Durée de visite</Text>

          <Text style={styles.sectionSubtitle}>3.4 Données de communication</Text>
          <Text style={styles.listItem}>• Messages entre utilisateurs</Text>
          <Text style={styles.listItem}>• Historique des conversations</Text>
          <Text style={styles.listItem}>• Signalements et réclamations</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Finalités du Traitement</Text>
          <Text style={styles.paragraph}>Vos données sont collectées pour:</Text>

          <Text style={styles.sectionSubtitle}>4.1 Gestion du service</Text>
          <Text style={styles.listItem}>• Création et gestion de votre compte</Text>
          <Text style={styles.listItem}>• Publication et affichage des annonces</Text>
          <Text style={styles.listItem}>• Facilitation des transactions</Text>
          <Text style={styles.listItem}>• Service de messagerie</Text>

          <Text style={styles.sectionSubtitle}>4.2 Sécurité</Text>
          <Text style={styles.listItem}>• Prévention des fraudes</Text>
          <Text style={styles.listItem}>• Détection des contenus illicites</Text>
          <Text style={styles.listItem}>• Modération des annonces</Text>
          <Text style={styles.listItem}>• Gestion des signalements</Text>

          <Text style={styles.sectionSubtitle}>4.3 Amélioration du service</Text>
          <Text style={styles.listItem}>• Analyse des usages</Text>
          <Text style={styles.listItem}>• Statistiques anonymisées</Text>
          <Text style={styles.listItem}>• Optimisation de l'expérience utilisateur</Text>

          <Text style={styles.sectionSubtitle}>4.4 Communication</Text>
          <Text style={styles.listItem}>• Notifications liées à votre compte</Text>
          <Text style={styles.listItem}>• Alertes de messagerie</Text>
          <Text style={styles.listItem}>• Informations sur les services (avec votre accord)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Base Légale du Traitement</Text>
          <Text style={styles.paragraph}>
            Le traitement de vos données repose sur:
          </Text>
          <Text style={styles.listItem}>
            • Votre consentement explicite lors de l'inscription
          </Text>
          <Text style={styles.listItem}>
            • L'exécution du contrat (fourniture du service)
          </Text>
          <Text style={styles.listItem}>
            • Le respect d'obligations légales (conservation des données de facturation)
          </Text>
          <Text style={styles.listItem}>
            • L'intérêt légitime (sécurité, prévention des fraudes)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Destinataires des Données</Text>
          <Text style={styles.paragraph}>Vos données peuvent être communiquées à:</Text>

          <Text style={styles.sectionSubtitle}>6.1 Au sein de Buy&Go</Text>
          <Text style={styles.listItem}>• Équipe technique (maintenance)</Text>
          <Text style={styles.listItem}>• Service modération</Text>
          <Text style={styles.listItem}>• Service client</Text>

          <Text style={styles.sectionSubtitle}>6.2 Prestataires externes</Text>
          <Text style={styles.listItem}>• Hébergeur de données (serveurs en Algérie)</Text>
          <Text style={styles.listItem}>• Service d'envoi d'emails</Text>
          <Text style={styles.listItem}>• Plateforme de paiement (CCP, BaridiMob)</Text>

          <Text style={styles.sectionSubtitle}>6.3 Autorités compétentes</Text>
          <Text style={styles.paragraph}>
            Sur demande des autorités judiciaires ou administratives algériennes dans le cadre
            d'enquêtes légales.
          </Text>

          <Text style={styles.important}>
            ℹ️ Vos données ne sont JAMAIS vendues à des tiers à des fins commerciales.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Durée de Conservation</Text>

          <Text style={styles.sectionSubtitle}>7.1 Compte actif</Text>
          <Text style={styles.listItem}>
            • Données du compte: Durée de vie du compte + 1 an
          </Text>
          <Text style={styles.listItem}>
            • Annonces: 90 jours après suppression/expiration
          </Text>
          <Text style={styles.listItem}>
            • Messages: 1 an après la dernière conversation
          </Text>

          <Text style={styles.sectionSubtitle}>7.2 Compte inactif/supprimé</Text>
          <Text style={styles.listItem}>
            • Suppression automatique après 3 ans d'inactivité
          </Text>
          <Text style={styles.listItem}>
            • Conservation des données de facturation: 10 ans (obligation légale)
          </Text>

          <Text style={styles.sectionSubtitle}>7.3 Données de modération</Text>
          <Text style={styles.listItem}>
            • Logs de modération: 1 an
          </Text>
          <Text style={styles.listItem}>
            • Comptes bannis: 5 ans
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Vos Droits</Text>
          <Text style={styles.paragraph}>
            Conformément à la loi n° 18-07, vous disposez des droits suivants:
          </Text>

          <View style={styles.rightCard}>
            <Eye size={24} color="#2563EB" />
            <Text style={styles.rightTitle}>Droit d'accès</Text>
            <Text style={styles.rightText}>
              Consulter les données que nous détenons sur vous
            </Text>
          </View>

          <View style={styles.rightCard}>
            <UserCheck size={24} color="#10B981" />
            <Text style={styles.rightTitle}>Droit de rectification</Text>
            <Text style={styles.rightText}>
              Corriger vos données inexactes ou incomplètes
            </Text>
          </View>

          <View style={styles.rightCard}>
            <Database size={24} color="#F59E0B" />
            <Text style={styles.rightTitle}>Droit de suppression</Text>
            <Text style={styles.rightText}>
              Demander l'effacement de vos données personnelles
            </Text>
          </View>

          <View style={styles.rightCard}>
            <Lock size={24} color="#8B5CF6" />
            <Text style={styles.rightTitle}>Droit d'opposition</Text>
            <Text style={styles.rightText}>
              S'opposer au traitement de vos données à des fins marketing
            </Text>
          </View>

          <Text style={styles.paragraph}>
            Pour exercer vos droits, contactez-nous à: privacy@buygo.dz
          </Text>
          <Text style={styles.paragraph}>
            Nous répondrons dans un délai maximum de 30 jours conformément à la loi.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Sécurité des Données</Text>
          <Text style={styles.paragraph}>
            Buy&Go met en œuvre des mesures techniques et organisationnelles pour protéger vos
            données:
          </Text>

          <Text style={styles.sectionSubtitle}>9.1 Mesures techniques</Text>
          <Text style={styles.listItem}>• Cryptage SSL/TLS des communications</Text>
          <Text style={styles.listItem}>• Mots de passe hashés (bcrypt)</Text>
          <Text style={styles.listItem}>• Serveurs sécurisés</Text>
          <Text style={styles.listItem}>• Sauvegardes régulières</Text>
          <Text style={styles.listItem}>• Pare-feu et anti-virus</Text>

          <Text style={styles.sectionSubtitle}>9.2 Mesures organisationnelles</Text>
          <Text style={styles.listItem}>• Accès limité aux données</Text>
          <Text style={styles.listItem}>• Formation du personnel</Text>
          <Text style={styles.listItem}>• Audits de sécurité réguliers</Text>
          <Text style={styles.listItem}>• Procédures en cas de violation</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Cookies et Technologies Similaires</Text>
          <Text style={styles.paragraph}>
            Buy&Go utilise des cookies pour améliorer votre expérience:
          </Text>

          <Text style={styles.sectionSubtitle}>10.1 Cookies essentiels</Text>
          <Text style={styles.listItem}>• Gestion de session</Text>
          <Text style={styles.listItem}>• Authentification</Text>
          <Text style={styles.listItem}>• Sécurité</Text>

          <Text style={styles.sectionSubtitle}>10.2 Cookies de performance</Text>
          <Text style={styles.listItem}>• Statistiques d'utilisation</Text>
          <Text style={styles.listItem}>• Analyse du trafic</Text>

          <Text style={styles.paragraph}>
            Vous pouvez désactiver les cookies non essentiels dans les paramètres de votre
            navigateur ou de l'application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Transfert de Données</Text>
          <Text style={styles.paragraph}>
            Vos données sont hébergées sur des serveurs situés en Algérie. Elles ne sont pas
            transférées hors d'Algérie sauf:
          </Text>
          <Text style={styles.listItem}>
            • Services cloud nécessaires (avec garanties de protection)
          </Text>
          <Text style={styles.listItem}>
            • Avec votre consentement explicite
          </Text>
          <Text style={styles.listItem}>
            • Dans le respect de la réglementation algérienne
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Mineurs</Text>
          <Text style={styles.paragraph}>
            Les services de Buy&Go sont réservés aux personnes âgées d'au moins 18 ans. Nous ne
            collectons pas sciemment de données sur des mineurs. Si vous avez connaissance qu'un
            mineur utilise notre service, contactez-nous immédiatement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Modification de la Politique</Text>
          <Text style={styles.paragraph}>
            Cette politique peut être modifiée pour refléter les changements légaux ou de nos
            pratiques. Les utilisateurs seront informés par email de toute modification substantielle
            30 jours à l'avance.
          </Text>
          <Text style={styles.paragraph}>
            Date de dernière mise à jour: 7 octobre 2025
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Réclamations</Text>
          <Text style={styles.paragraph}>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez:
          </Text>
          <Text style={styles.listItem}>
            1. Nous contacter directement: privacy@buygo.dz
          </Text>
          <Text style={styles.listItem}>
            2. Saisir l'Autorité Nationale de Protection des Données à Caractère Personnel (ANPDP)
          </Text>
          <Text style={styles.listItem}>
            3. Exercer un recours judiciaire auprès des tribunaux algériens
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>15. Contact</Text>
          <Text style={styles.paragraph}>
            Pour toute question concernant cette politique:
          </Text>
          <Text style={styles.listItem}>Email: privacy@buygo.dz</Text>
          <Text style={styles.listItem}>Téléphone: +213 (0) 23 XX XX XX</Text>
          <Text style={styles.listItem}>
            Courrier: Buy&Go SARL - Service Protection des Données, [Adresse], Alger, Algérie
          </Text>
        </View>

        <View style={styles.protectionBanner}>
          <Shield size={48} color="#10B981" />
          <Text style={styles.bannerTitle}>Vos Données sont Protégées</Text>
          <Text style={styles.bannerText}>
            Buy&Go respecte la législation algérienne et s'engage à protéger votre vie privée.
            Vos données ne sont jamais vendues à des tiers.
          </Text>
        </View>
      </View>
    </ScrollView>
    <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  backText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
  },
  content: {
    padding: 24,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  updateText: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '700',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 6,
    paddingLeft: 8,
  },
  important: {
    fontSize: 14,
    color: '#065F46',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    fontWeight: '600',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  rightCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  rightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginTop: 8,
    marginBottom: 4,
  },
  rightText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  protectionBanner: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#065F46',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  bannerText: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 20,
  },
});

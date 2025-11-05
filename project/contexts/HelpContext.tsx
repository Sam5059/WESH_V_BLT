import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HelpItem {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface HelpContextType {
  showGlobalHelp: boolean;
  setShowGlobalHelp: (show: boolean) => void;
  currentHelpTopic: string | null;
  setCurrentHelpTopic: (topic: string | null) => void;
  helpItems: HelpItem[];
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within HelpProvider');
  }
  return context;
};

const defaultHelpItems: HelpItem[] = [
  {
    id: 'getting-started',
    title: 'Débuter sur BuyGo',
    content: 'BuyGo est votre plateforme de petites annonces en Algérie.\n\n📱 Créez un compte gratuit en quelques secondes\n🔍 Parcourez des milliers d\'annonces dans toutes les catégories\n📸 Publiez vos annonces gratuitement\n💬 Contactez directement les vendeurs\n⭐ Sauvegardez vos annonces favorites\n\nPas besoin de compte pour consulter les annonces, mais l\'inscription vous permet de publier, contacter les vendeurs et gérer vos favoris.',
    category: 'general',
  },
  {
    id: 'search',
    title: 'Comment rechercher efficacement ?',
    content: '🔍 UTILISER LA RECHERCHE\n\n1. Barre de recherche : Tapez ce que vous cherchez (ex: "iPhone 13", "Appartement Alger")\n\n2. Filtre par catégorie : Cliquez sur le menu déroulant à droite de la barre de recherche pour sélectionner une catégorie spécifique\n\n3. Localisation : Sélectionnez votre wilaya pour voir les annonces près de chez vous\n\n4. Type d\'annonce :\n   • Offres : Articles à vendre\n   • Demandes : Ce que les gens recherchent\n   • Location : Biens en location\n\n💡 ASTUCES DE RECHERCHE\n• Utilisez des mots-clés simples\n• Activez la géolocalisation pour voir les annonces proches\n• Consultez régulièrement pour ne rien manquer\n• Sauvegardez vos recherches favorites',
    category: 'general',
  },
  {
    id: 'publish',
    title: 'Comment publier une annonce ?',
    content: '📝 PUBLIER EN 5 ÉTAPES\n\n1. CLIQUEZ SUR "PUBLIER GRATUITEMENT"\n   Bouton vert dans la barre de navigation\n\n2. CHOISISSEZ LA CATÉGORIE\n   Sélectionnez la catégorie principale puis la sous-catégorie\n\n3. REMPLISSEZ LES INFORMATIONS\n   • Titre accrocheur (ex: "iPhone 13 Pro 256Go Bleu")\n   • Description détaillée (état, caractéristiques, raison de vente)\n   • Prix (soyez honnête et compétitif)\n   • Localisation (wilaya et commune)\n\n4. AJOUTEZ DES PHOTOS\n   • Minimum 1 photo, maximum 8\n   • Photos claires et bien éclairées\n   • Montrez différents angles\n   • Première photo = photo principale\n\n5. PUBLIEZ\n   Vérifiez tout et cliquez sur "Publier"\n\n✅ CONSEILS POUR UNE BONNE ANNONCE\n• Titre court et descriptif\n• Description complète et honnête\n• Photos de qualité\n• Prix réaliste\n• Répondez rapidement aux messages',
    category: 'general',
  },
  {
    id: 'photos',
    title: 'Comment ajouter de bonnes photos ?',
    content: '📸 GUIDE PHOTOS PARFAITES\n\n✅ À FAIRE\n• Nettoyez l\'objet avant la photo\n• Utilisez la lumière naturelle (journée)\n• Fond neutre et dégagé\n• Plusieurs angles (face, profil, détails)\n• Montrez les défauts s\'il y en a\n• Photo principale = meilleure vue\n\n❌ À ÉVITER\n• Photos floues ou sombres\n• Photos téléchargées d\'internet\n• Arrière-plan encombré\n• Flash direct qui éblouit\n• Une seule photo\n\n💡 CONSEILS PRO\n• Format carré ou paysage\n• Zoomez sur les détails importants\n• Pour les vêtements : portez-les ou utilisez un mannequin\n• Pour l\'immobilier : montrez chaque pièce\n• Maximum 8 photos par annonce',
    category: 'general',
  },
  {
    id: 'pricing',
    title: 'Comment fixer le bon prix ?',
    content: '💰 GUIDE DES PRIX\n\n🔍 RECHERCHER LES PRIX DU MARCHÉ\n1. Cherchez des articles similaires sur BuyGo\n2. Comparez l\'état et les caractéristiques\n3. Vérifiez les prix récents (pas ceux de 2 ans)\n\n📊 FACTEURS DE PRIX\n• État : Neuf, Excellent, Bon, À réparer\n• Âge : Plus récent = plus cher\n• Marque : Les marques réputées gardent leur valeur\n• Rareté : Article difficile à trouver\n• Accessoires : Boîte, facture, garantie\n\n💡 STRATÉGIES\n• Prix légèrement négociable : Ajoutez 5-10%\n• Prix ferme : Indiquez "Prix non négociable"\n• Prix attractif : Vendez rapidement\n• Prix premium : Article rare ou neuf\n\n✅ MENTIONS UTILES\n• "À débattre" = Négociable\n• "Prix ferme" = Non négociable\n• "Urgent" = Baisse possible\n• "Dernier prix" = Prix final',
    category: 'general',
  },
  {
    id: 'contact',
    title: 'Comment contacter un vendeur ?',
    content: '💬 CONTACTER UN VENDEUR\n\n1. CLIQUEZ SUR L\'ANNONCE\n   Parcourez et trouvez ce qui vous intéresse\n\n2. BOUTON "CONTACTER"\n   En bas de l\'annonce (connectez-vous d\'abord)\n\n3. ENVOYEZ UN MESSAGE\n   • Soyez poli et courtois\n   • Présentez-vous brièvement\n   • Posez des questions précises\n   • Proposez un lieu de rencontre public\n\n📱 EXEMPLE DE BON MESSAGE\n"Bonjour, je suis intéressé par votre iPhone. Est-il toujours disponible ? La batterie est-elle en bon état ? Je peux venir le voir à Alger centre. Merci !"\n\n❌ ÉVITEZ\n• "C\'est disponible ?" (trop court)\n• Messages sans formule de politesse\n• Demandes de prix après marchandage agressif\n• Demandes d\'envoi sans voir l\'article\n\n🔔 NOTIFICATIONS\nActivez les notifications pour recevoir les réponses rapidement',
    category: 'general',
  },
  {
    id: 'favorites',
    title: 'Gérer vos favoris',
    content: '❤️ SYSTÈME DE FAVORIS\n\n💾 SAUVEGARDER UNE ANNONCE\n1. Cliquez sur l\'icône cœur sur n\'importe quelle annonce\n2. L\'annonce est automatiquement sauvegardée\n3. Le cœur devient rouge\n\n📋 ACCÉDER À VOS FAVORIS\n1. Allez dans votre profil (icône utilisateur)\n2. Onglet "Favoris"\n3. Toutes vos annonces sauvegardées s\'affichent\n\n✅ AVANTAGES\n• Comparez plusieurs annonces facilement\n• Revenez plus tard sans chercher\n• Suivez les baisses de prix\n• Organisez votre recherche\n\n💡 ASTUCES\n• Sauvegardez plusieurs options pour comparer\n• Vérifiez régulièrement (annonces peuvent être vendues)\n• Contactez rapidement si l\'article vous plaît\n• Supprimez les favoris devenus inutiles',
    category: 'general',
  },
  {
    id: 'messages',
    title: 'Utiliser la messagerie',
    content: '💬 SYSTÈME DE MESSAGERIE\n\n📩 ENVOYER DES MESSAGES\n1. Trouvez une annonce intéressante\n2. Cliquez sur "Contacter le vendeur"\n3. Rédigez votre message\n4. Attendez la réponse\n\n📬 RECEVOIR DES MESSAGES\n1. Icône messagerie (bulle) dans le menu\n2. Notifications en temps réel\n3. Répondez rapidement pour concrétiser\n\n✅ BONNES PRATIQUES\n• Soyez courtois et professionnel\n• Répondez dans les 24h\n• Posez des questions précises\n• Proposez un rendez-vous en lieu public\n• Confirmez avant de vous déplacer\n\n🔒 SÉCURITÉ\n• Ne partagez jamais vos coordonnées bancaires\n• Privilégiez les rencontres en lieux publics\n• Signalez les comportements suspects\n• Toutes les conversations sont privées\n\n⚠️ NE JAMAIS\n• Envoyer d\'argent à l\'avance\n• Donner vos infos personnelles\n• Acheter sans voir l\'article',
    category: 'general',
  },
  {
    id: 'pro-account',
    title: 'Devenir Professionnel',
    content: '🏪 COMPTE PROFESSIONNEL\n\n💼 QUI PEUT ÊTRE PRO ?\n• Commerçants\n• Artisans\n• Agences immobilières\n• Concessionnaires auto\n• Professionnels de tout secteur\n\n⭐ AVANTAGES PRO\n• ✨ Badge PRO visible sur vos annonces\n• 🔝 Visibilité accrue (priorité dans les résultats)\n• 🏪 Boutique personnalisée avec votre URL\n• 📊 Statistiques détaillées\n• 📢 Annonces illimitées\n• 💎 Options de mise en avant\n• 🎨 Personnalisation de votre profil\n• 📞 Affichage de vos coordonnées pro\n\n💰 FORFAITS PAR CATÉGORIE\nChaque catégorie a ses propres forfaits adaptés :\n• Immobilier : 3 000 - 20 000 DA/mois\n• Véhicules : 2 500 - 15 000 DA/mois\n• Électronique : 1 500 - 8 000 DA/mois\n\n📝 COMMENT SOUSCRIRE ?\n1. Cliquez sur "Espace Pro"\n2. Choisissez votre forfait\n3. Complétez votre profil pro\n4. Profitez de votre visibilité !',
    category: 'pro',
  },
  {
    id: 'pro-store',
    title: 'Créer sa boutique professionnelle',
    content: '🏪 BOUTIQUE PROFESSIONNELLE\n\n🎨 PERSONNALISATION\n• Logo de votre entreprise\n• Bannière personnalisée\n• Couleurs de marque\n• Description de votre activité\n• Horaires d\'ouverture\n• Coordonnées complètes\n\n📍 URL PERSONNALISÉE\nExemple : buygo.dz/pro/votre-boutique\nPartagez facilement avec vos clients !\n\n✨ FONCTIONNALITÉS\n• Toutes vos annonces sur une seule page\n• Tri par catégorie\n• Galerie photos professionnelle\n• Bouton contact direct\n• Avis et évaluations clients\n• Réseaux sociaux liés\n\n📊 GESTION\n• Tableau de bord complet\n• Statistiques de vues\n• Gestion des annonces\n• Historique des ventes\n• Messages centralisés\n\n💡 CONSEILS\n• Photos professionnelles\n• Description complète de l\'entreprise\n• Mettez à jour régulièrement\n• Répondez rapidement aux messages\n• Proposez des promotions',
    category: 'pro',
  },
  {
    id: 'safety',
    title: 'Conseils de sécurité',
    content: '🔒 SÉCURITÉ ET BONNES PRATIQUES\n\n✅ RENCONTRES SÉCURISÉES\n• Lieux publics uniquement (café, centre commercial)\n• Journée de préférence\n• Venez accompagné si possible\n• Prévenez un proche\n• Faites confiance à votre instinct\n\n💰 PAIEMENT SÉCURISÉ\n• Cash en main propre uniquement\n• Vérifiez l\'article avant de payer\n• Ne payez JAMAIS à l\'avance\n• Pas de virement avant inspection\n• Demandez un reçu pour montants élevés\n\n🚫 SIGNAUX D\'ALERTE\n❌ Prix trop bas (arnaque probable)\n❌ Demande de paiement à l\'avance\n❌ Refuse de rencontrer en personne\n❌ Pression pour décider rapidement\n❌ Pas de photos réelles\n❌ Histoire compliquée ou louche\n\n📢 SIGNALER UN PROBLÈME\nSi vous détectez une annonce suspecte :\n1. Cliquez sur "Signaler"\n2. Choisissez le motif\n3. Notre équipe vérifie sous 24h\n\n💡 RÈGLE D\'OR\nSi ça semble trop beau pour être vrai, c\'est probablement une arnaque !',
    category: 'general',
  },
  {
    id: 'manage-ads',
    title: 'Gérer mes annonces',
    content: '📋 GESTION DE VOS ANNONCES\n\n📍 ACCÉDER À VOS ANNONCES\n1. Profil → Mes Annonces\n2. Toutes vos publications s\'affichent\n\n✏️ MODIFIER UNE ANNONCE\n1. Cliquez sur l\'annonce\n2. Bouton "Modifier"\n3. Changez ce que vous voulez\n4. Sauvegardez\n\n♻️ REPUBLIER\nAnnonce pas visible ? Republiez-la pour la remonter en haut !\n\n🗑️ SUPPRIMER\nArticle vendu ? Supprimez l\'annonce pour éviter les messages inutiles\n\n📊 STATISTIQUES\n• Nombre de vues\n• Nombre de favoris\n• Messages reçus\n• Date de publication\n\n⏰ DURÉE DE VIE\n• Annonces gratuites : 60 jours\n• Annonces PRO : Illimitée\n• Prolongez avant expiration\n\n💡 OPTIMISATION\n• Mettez à jour le prix si pas de réponse\n• Ajoutez des photos si besoin\n• Améliorez la description\n• Republiez régulièrement',
    category: 'general',
  },
];

export const HelpProvider = ({ children }: { children: ReactNode }) => {
  const [showGlobalHelp, setShowGlobalHelp] = useState(false);
  const [currentHelpTopic, setCurrentHelpTopic] = useState<string | null>(null);
  const helpItems = defaultHelpItems;

  return (
    <HelpContext.Provider
      value={{
        showGlobalHelp,
        setShowGlobalHelp,
        currentHelpTopic,
        setCurrentHelpTopic,
        helpItems,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
};

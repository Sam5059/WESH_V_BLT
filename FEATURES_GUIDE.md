# Guide des Fonctionnalités Buy&Go

## 📋 Table des Matières
1. [Système de Modération](#système-de-modération)
2. [Système de Signalement](#système-de-signalement)
3. [Système de Notation](#système-de-notation)
4. [KPIs et Statistiques](#kpis-et-statistiques)
5. [Pages Légales](#pages-légales)
6. [Formulaire de Publication](#formulaire-de-publication)

---

## 🛡️ Système de Modération

### Fonctionnement
Toutes les annonces publiées sur Buy&Go sont automatiquement placées en statut **"pending"** et nécessitent une validation par l'équipe de modération avant d'être visibles publiquement.

### Statuts d'Annonce
- **pending**: En attente de validation
- **active**: Approuvée et visible publiquement
- **rejected**: Refusée par les modérateurs
- **flagged**: Signalée pour contenu suspect
- **hidden**: Masquée temporairement
- **sold**: Vendue (changé par l'utilisateur)

### Fonctions Admin

#### Approuver une annonce
```sql
SELECT approve_listing(
  'listing-id-here',
  'moderator-id-here',
  'Notes optionnelles'
);
```

#### Rejeter une annonce
```sql
SELECT reject_listing(
  'listing-id-here',
  'moderator-id-here',
  'Raison du rejet (obligatoire)'
);
```

#### Voir les annonces en attente
```sql
SELECT * FROM listings WHERE status = 'pending' ORDER BY created_at ASC;
```

### Champs de Modération
- `moderation_notes`: Notes internes des modérateurs
- `reviewed_at`: Date de révision
- `reviewed_by`: ID du modérateur qui a révisé

---

## 🚩 Système de Signalement

### Pour les Utilisateurs
Les utilisateurs peuvent signaler des annonces suspectes via la table `reports`.

### Raisons de Signalement
- **spam**: Contenu publicitaire excessif
- **scam**: Tentative d'arnaque
- **inappropriate**: Contenu inapproprié
- **duplicate**: Annonce en double
- **wrong_category**: Mauvaise catégorie
- **fake**: Faux produit
- **offensive**: Contenu offensant
- **other**: Autre raison

### Créer un Signalement
```javascript
const { data, error } = await supabase
  .from('reports')
  .insert({
    listing_id: 'id-de-l-annonce',
    reporter_id: user.id,
    reason: 'scam',
    description: 'Cette annonce semble être une arnaque...'
  });
```

### Workflow de Signalement
1. **pending**: Signalement créé
2. **reviewed**: En cours d'examen
3. **resolved**: Résolu (action prise)
4. **dismissed**: Rejeté (pas de problème trouvé)

### Gestion Admin
```sql
-- Voir tous les signalements en attente
SELECT r.*, l.title as listing_title, p.full_name as reporter_name
FROM reports r
JOIN listings l ON l.id = r.listing_id
JOIN profiles p ON p.id = r.reporter_id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;

-- Mettre à jour un signalement
UPDATE reports
SET
  status = 'resolved',
  reviewed_by = 'moderator-id',
  reviewed_at = now(),
  resolution_notes = 'Annonce supprimée'
WHERE id = 'report-id';
```

---

## ⭐ Système de Notation

### Fonctionnalités
- Notes de 1 à 5 étoiles
- Commentaires optionnels
- Distinction acheteur/vendeur
- Moyenne automatique
- Impossible de s'auto-noter

### Laisser un Avis
```javascript
const { data, error } = await supabase
  .from('user_reviews')
  .insert({
    reviewer_id: user.id,
    reviewee_id: 'id-utilisateur-a-noter',
    listing_id: 'id-annonce-concernee',
    rating: 5,
    comment: 'Excellent vendeur, très professionnel!',
    transaction_type: 'seller' // ou 'buyer'
  });
```

### Récupérer les Avis d'un Utilisateur
```sql
SELECT * FROM get_user_reviews('user-id', 10);
```

### Statistiques de Notation
Chaque profil affiche:
- `rating_average`: Moyenne des notes (0-5)
- `rating_count`: Nombre total d'avis
- `reviews_as_seller`: Avis en tant que vendeur
- `reviews_as_buyer`: Avis en tant qu'acheteur

---

## 📊 KPIs et Statistiques

### Statistiques Utilisateur

Chaque utilisateur a accès à ses propres statistiques:

```javascript
const { data } = await supabase
  .rpc('get_user_dashboard_data', { user_id_param: user.id });

// Retourne:
// - total_listings: Total d'annonces
// - active_listings: Annonces actives
// - sold_listings: Annonces vendues
// - rejected_listings: Annonces rejetées
// - pending_listings: En attente
// - total_views: Vues totales
// - total_favorites: Favoris totaux
// - rating_average: Note moyenne
// - rating_count: Nombre d'avis
```

### Statistiques Plateforme (Admin uniquement)

KPIs réservés à l'équipe Buy&Go:

```javascript
const { data } = await supabase
  .rpc('get_platform_dashboard_data');

// Retourne:
// - total_users: Total utilisateurs
// - new_users_today: Nouveaux aujourd'hui
// - total_listings: Total annonces
// - pending_moderation: En attente de modération
// - total_reports: Total signalements
// - new_reports_today: Nouveaux signalements aujourd'hui
// - avg_rating: Note moyenne plateforme
```

### Historique Plateforme
La table `platform_statistics` garde l'historique quotidien:
- Nouveaux utilisateurs
- Nouvelles annonces
- Utilisateurs actifs
- Annonces approuvées/rejetées
- Signalements

```sql
-- Voir les stats des 30 derniers jours
SELECT * FROM platform_statistics
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

---

## ⚖️ Pages Légales

### Conditions d'Utilisation
**URL**: `/legal/terms`

Contenu:
- Acceptation des conditions
- Description du service
- Inscription et compte
- Publication d'annonces
- Modération obligatoire
- Contenu interdit
- Transactions
- Tarification
- Propriété intellectuelle
- Responsabilités
- Résiliation
- Loi applicable (Algérie)
- Contact

**Conformité**:
- Loi n° 18-05 (Commerce électronique)
- Loi n° 18-07 (Protection des données)
- Loi n° 09-03 (Protection consommateur)

### Politique de Confidentialité
**URL**: `/legal/privacy`

Contenu complet RGPD algérien:
1. Introduction
2. Responsable du traitement
3. Données collectées
4. Finalités du traitement
5. Base légale
6. Destinataires des données
7. Durée de conservation
8. Vos droits (accès, rectification, suppression, opposition)
9. Sécurité des données
10. Cookies
11. Transfert de données
12. Mineurs
13. Modifications
14. Réclamations
15. Contact DPO

**Conformité**: Loi n° 18-07 du 10 mai 2018

---

## 📝 Formulaire de Publication

### Améliorations Design

#### Champs Input
- Bordures arrondies modernes (10px)
- Ombres subtiles pour profondeur
- Padding confortable (16px)
- Couleurs cohérentes
- Focus states améliorés

#### Bouton "Professionnel"
**Nouveau comportement**:
- Si l'utilisateur n'a PAS de forfait PRO → Bouton orange "Devenir PRO" qui redirige vers `/pro/packages`
- Si l'utilisateur a un forfait PRO actif → Bouton bleu "Professionnel" sélectionnable normalement

**Avantages**:
- Plus intuitif pour les nouveaux utilisateurs
- Lien direct vers les forfaits PRO
- Pas de popup bloquante
- Meilleure conversion

#### Bouton de Publication
- Couleur orange signature Buy&Go (#FF6B00)
- Texte blanc en majuscules
- Ombres prononcées pour effet 3D
- Padding généreux (18px)
- Animation au survol (web)

#### Sections
- Fond blanc avec bordure subtile
- Ombres douces pour cartes
- Espacement cohérent
- Labels en gras et lisibles

---

## 🎨 Design System

### Couleurs Principales
- **Primary Blue**: #2563EB
- **Orange Buy&Go**: #FF6B00
- **Success Green**: #10B981
- **Error Red**: #DC2626
- **Warning Yellow**: #F59E0B

### Couleurs Neutres
- **Text Primary**: #1E293B
- **Text Secondary**: #64748B
- **Border**: #E2E8F0
- **Background**: #F5F7FA

### Espacement
- **Petit**: 8px
- **Moyen**: 16px
- **Grand**: 24px
- **Extra-large**: 32px

### Bordures
- **Radius Standard**: 10-12px
- **Radius Bouton**: 8-12px
- **Border Width**: 2px

### Ombres
```css
/* Subtile */
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.05,
shadowRadius: 4,
elevation: 2,

/* Moyenne */
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 3,

/* Forte (CTA) */
shadowColor: '#FF6B00',
shadowOffset: { width: 0, height: 6 },
shadowOpacity: 0.4,
shadowRadius: 12,
elevation: 6,
```

---

## 🔐 Sécurité et Conformité

### Row Level Security (RLS)
Toutes les tables ont RLS activé avec des politiques strictes:
- Utilisateurs voient uniquement leurs données
- Admins/modérateurs ont accès complet aux outils de gestion
- Données publiques accessibles à tous (annonces actives, avis)

### Protection des Données
- Mots de passe cryptés (bcrypt)
- Communications SSL/TLS
- Données hébergées en Algérie
- Conformité RGPD local
- Durées de conservation définies

### Modération Automatique
- Détection de spam/arnaque
- Blocage automatique de contenu critique
- Flagging des annonces suspectes
- Review manuelle systématique

---

## 📱 Responsive Design

Le formulaire et toutes les pages sont optimisés pour:
- **Mobile**: 320px - 767px
- **Tablette**: 768px - 1023px
- **Desktop**: 1024px+

**Breakpoints importants**:
```javascript
const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;
```

---

## 🚀 Prochaines Étapes

### À Implémenter
1. **Paiement pour Pros**
   - Intégration CCP
   - Intégration BaridiMob
   - Intégration Chargily Pay

2. **Notifications Push**
   - Nouveaux messages
   - Annonces approuvées/rejetées
   - Nouveaux favoris

3. **Dashboard Admin UI**
   - Interface graphique pour modération
   - Graphiques KPIs
   - Gestion des utilisateurs

4. **Messagerie Temps Réel**
   - WebSockets
   - Notifications instantanées
   - Indicateurs de lecture

---

## 📞 Support

Pour toute question sur ces fonctionnalités:
- Email technique: dev@buygo.dz
- Email légal: legal@buygo.dz
- Email confidentialité: privacy@buygo.dz

---

**Version**: 1.0.0
**Dernière mise à jour**: 12 octobre 2025
**Statut**: Production Ready ✅

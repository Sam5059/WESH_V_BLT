# Guide du Système PRO - Buy&Go

## 📋 Vue d'ensemble

Le système PRO de Buy&Go permet aux utilisateurs professionnels de bénéficier d'avantages exclusifs pour booster leur visibilité et vendre plus rapidement.

## 🏗️ Architecture Backend

### Tables Supabase

#### 1. `pro_packages`
Stocke les différents forfaits PRO disponibles par catégorie.

**Colonnes principales:**
- `id` - Identifiant unique
- `category_id` - Catégorie associée
- `name`, `name_ar`, `name_en` - Noms multilingues
- `description`, `description_ar`, `description_en` - Descriptions
- `price` - Prix en DA
- `duration_days` - Durée en jours
- `max_listings` - Nombre d'annonces (NULL = illimité)
- `featured_listings` - Nombre de mises en avant
- `priority_support` - Support prioritaire
- `custom_branding` - Badge personnalisé
- `analytics` - Accès aux statistiques
- `is_active` - Actif ou non
- `order_position` - Ordre d'affichage

#### 2. `pro_subscriptions`
Gère les abonnements PRO actifs et l'historique.

**Colonnes principales:**
- `id` - Identifiant unique
- `user_id` - Utilisateur
- `package_id` - Package souscrit
- `category_id` - Catégorie
- `starts_at`, `expires_at` - Dates de validité
- `status` - pending, active, expired, cancelled
- `listings_used` - Compteur d'annonces utilisées
- `featured_used` - Compteur de mises en avant
- `paid_amount` - Montant payé
- `payment_method` - Méthode de paiement
- `payment_reference` - Référence de paiement

#### 3. `pro_transactions`
Historique de toutes les transactions financières.

**Colonnes principales:**
- `id` - Identifiant unique
- `subscription_id` - Abonnement lié
- `user_id` - Utilisateur
- `transaction_type` - payment, refund, renewal, upgrade
- `amount` - Montant
- `payment_method` - Méthode
- `payment_status` - pending, completed, failed, refunded
- `metadata` - Données supplémentaires

#### 4. `pro_analytics`
Statistiques détaillées pour les comptes PRO.

**Colonnes principales:**
- `id` - Identifiant unique
- `user_id` - Utilisateur
- `listing_id` - Annonce (optionnel)
- `date` - Date du record
- `views` - Nombre de vues
- `clicks` - Nombre de clics
- `contacts` - Nombre de contacts
- `favorites` - Nombre de favoris

#### 5. `profiles` (champs PRO ajoutés)
Extension de la table profiles pour les données PRO.

**Nouveaux champs:**
- `pro_package_id` - Package actuel
- `pro_expires_at` - Date d'expiration
- `pro_listings_remaining` - Annonces restantes
- `pro_featured_remaining` - Mises en avant restantes
- `pro_category_id` - Catégorie du pack

### Fonctions SQL

#### 1. `activate_pro_subscription()`
Active un nouvel abonnement PRO.

**Paramètres:**
- `p_user_id` - ID de l'utilisateur
- `p_package_id` - ID du package
- `p_payment_method` - Méthode de paiement (optionnel)
- `p_payment_reference` - Référence de paiement (optionnel)

**Retour:**
```json
{
  "success": true,
  "subscription_id": "uuid",
  "transaction_id": "uuid",
  "expires_at": "timestamp"
}
```

#### 2. `check_pro_status()`
Vérifie le statut PRO d'un utilisateur.

**Paramètres:**
- `p_user_id` - ID de l'utilisateur

**Retour:**
```json
{
  "is_pro": true,
  "user_type": "professional",
  "expires_at": "timestamp",
  "listings_remaining": 10,
  "featured_remaining": 5,
  "category_id": "uuid"
}
```

#### 3. `can_publish_listing()`
Vérifie si un utilisateur peut publier une annonce.

**Paramètres:**
- `p_user_id` - ID de l'utilisateur
- `p_category_id` - ID de la catégorie

**Retour:**
```json
{
  "can_publish": true,
  "is_pro": true,
  "listings_remaining": 10,
  "featured_remaining": 5
}
```

#### 4. `get_pro_analytics()`
Récupère les statistiques détaillées.

**Paramètres:**
- `p_user_id` - ID de l'utilisateur
- `p_start_date` - Date de début (optionnel, par défaut: -30 jours)
- `p_end_date` - Date de fin (optionnel, par défaut: aujourd'hui)

**Retour:**
```json
{
  "period": {
    "start_date": "2024-10-15",
    "end_date": "2024-11-15"
  },
  "totals": {
    "views": 1250,
    "clicks": 340,
    "contacts": 85,
    "favorites": 120
  },
  "daily_data": [
    {
      "date": "2024-10-15",
      "views": 45,
      "clicks": 12,
      "contacts": 3,
      "favorites": 5
    }
  ]
}
```

## 🎨 Frontend - Pages React Native

### 1. `/pro/index.tsx` - Page d'accueil PRO
Page principale du système PRO avec présentation des avantages.

**Fonctionnalités:**
- Hero section avec CTA dynamique
- Grille des avantages PRO
- Sélecteur de catégories
- Section FAQ
- Contact

**Navigation:**
- Si utilisateur PRO → Bouton "Mon tableau de bord"
- Si utilisateur standard → Bouton "Découvrir les offres"

### 2. `/pro/packages.tsx` - Liste des forfaits
Affiche tous les forfaits PRO disponibles.

**Fonctionnalités:**
- Filtrage par catégorie
- Affichage des détails de chaque pack
- Badge "Plus populaire"
- Bouton d'abonnement
- FAQ intégrée

**Intégration backend:**
```typescript
// Activation d'un abonnement
const { data, error } = await supabase.rpc('activate_pro_subscription', {
  p_user_id: user.id,
  p_package_id: pkg.id,
  p_payment_method: 'pending',
  p_payment_reference: `REF-${Date.now()}`
});
```

### 3. `/pro/dashboard.tsx` - Tableau de bord PRO
Dashboard complet pour les utilisateurs PRO.

**Sections:**
- **Statut PRO:** Badge, dates, quotas
- **Statistiques:** Vues, clics, contacts, favoris (30 derniers jours)
- **Historique:** Liste des abonnements passés

**Intégration backend:**
```typescript
// Vérifier le statut PRO
const { data } = await supabase.rpc('check_pro_status', {
  p_user_id: user.id
});

// Récupérer les analytics
const { data } = await supabase.rpc('get_pro_analytics', {
  p_user_id: user.id,
  p_start_date: '2024-10-15',
  p_end_date: '2024-11-15'
});
```

## 🔒 Sécurité - Row Level Security (RLS)

Toutes les tables ont RLS activé avec des policies restrictives:

### pro_packages
- ✅ Lecture: Tous (authenticated + anon)

### pro_subscriptions
- ✅ Lecture: Utilisateur propriétaire uniquement
- ✅ Insertion: Utilisateur propriétaire uniquement
- ✅ Modification: Utilisateur propriétaire uniquement

### pro_transactions
- ✅ Lecture: Utilisateur propriétaire uniquement
- ✅ Insertion: Utilisateur propriétaire uniquement

### pro_analytics
- ✅ Lecture: Utilisateur propriétaire uniquement
- ✅ Insertion: Utilisateur propriétaire uniquement
- ✅ Modification: Utilisateur propriétaire uniquement

## 💰 Tarification par Catégorie

### Catégories Premium (Véhicules, Immobilier)
- Pack 5 annonces: 19 900 DA / 90 jours
- Pack 20 annonces: 59 900 DA / 30 jours
- Pack Illimité: 24 900 DA / 30 jours

### Catégories Standard (Électronique, Mode, Maison)
- Pack 5 annonces: 14 850 DA / 90 jours
- Pack 20 annonces: 47 250 DA / 30 jours
- Pack Illimité: 18 900 DA / 30 jours

### Catégories Économiques (Emploi, Services, Loisirs)
- Pack 5 annonces: 9 900 DA / 90 jours
- Pack 20 annonces: 29 900 DA / 30 jours
- Pack Illimité: 12 900 DA / 30 jours

## 🚀 Déploiement

### 1. Appliquer les migrations
```bash
# Appliquer la migration principale
supabase migration up
```

### 2. Vérifier les données
```sql
-- Vérifier les packages
SELECT * FROM pro_packages WHERE is_active = true;

-- Vérifier les RLS policies
SELECT * FROM pg_policies WHERE tablename LIKE 'pro_%';
```

### 3. Tester les fonctions
```sql
-- Tester le statut PRO
SELECT check_pro_status('user-uuid-here');

-- Tester l'activation
SELECT activate_pro_subscription(
  'user-uuid-here',
  'package-uuid-here',
  'CCP',
  'REF-123456'
);
```

## 📱 Flux Utilisateur

### Utilisateur Standard → PRO

1. **Découverte** → `/pro/index.tsx`
2. **Sélection pack** → `/pro/packages.tsx`
3. **Abonnement** → Fonction `activate_pro_subscription()`
4. **Confirmation** → Message avec instructions de paiement
5. **Accès dashboard** → `/pro/dashboard.tsx`

### Utilisateur PRO

1. **Page d'accueil** → Bouton "Mon tableau de bord"
2. **Dashboard** → `/pro/dashboard.tsx`
   - Voir statistiques
   - Gérer abonnement
   - Renouveler/Améliorer

## 🔧 Personnalisation

### Ajouter un nouveau pack

```sql
INSERT INTO pro_packages (
  category_id,
  name,
  name_ar,
  name_en,
  description,
  description_ar,
  description_en,
  price,
  duration_days,
  max_listings,
  featured_listings,
  priority_support,
  analytics,
  is_active,
  order_position
) VALUES (
  'category-uuid',
  'Pack Custom',
  'باقة مخصصة',
  'Custom Pack',
  'Description personnalisée',
  'وصف مخصص',
  'Custom description',
  15000.00,
  60,
  15,
  3,
  true,
  true,
  true,
  4
);
```

### Modifier les tarifs

```sql
UPDATE pro_packages
SET price = 19900.00
WHERE category_id = 'vehicules-category-id'
  AND name LIKE '%Illimité%';
```

## 📊 Monitoring

### Abonnements actifs
```sql
SELECT COUNT(*) as active_subscriptions
FROM pro_subscriptions
WHERE status = 'active'
  AND expires_at > now();
```

### Revenus par catégorie
```sql
SELECT
  c.name as category,
  COUNT(s.id) as subscriptions,
  SUM(s.paid_amount) as total_revenue
FROM pro_subscriptions s
JOIN categories c ON s.category_id = c.id
WHERE s.status = 'active'
GROUP BY c.name
ORDER BY total_revenue DESC;
```

### Top utilisateurs PRO
```sql
SELECT
  p.full_name,
  COUNT(l.id) as total_listings,
  SUM(pa.views) as total_views
FROM profiles p
JOIN listings l ON l.user_id = p.id
LEFT JOIN pro_analytics pa ON pa.user_id = p.id
WHERE p.user_type = 'professional'
  AND p.pro_expires_at > now()
GROUP BY p.full_name
ORDER BY total_views DESC
LIMIT 10;
```

## 🆘 Support

Pour toute question ou problème:
- 📧 Email: contact@buyandgo.dz
- 📞 Téléphone: +213 770 00 00 00

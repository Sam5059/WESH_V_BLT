# 🏪 Architecture du Système Stores PRO

## 📋 Vue d'ensemble

Le système de **Stores PRO** permet aux professionnels d'avoir une vitrine dédiée sur la plateforme Buy&Go après avoir souscrit à un forfait PRO.

---

## 🎯 Flux utilisateur complet

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX COMPLET STORES PRO                      │
└─────────────────────────────────────────────────────────────────┘

1️⃣  L'utilisateur consulte les forfaits PRO
    └→ Route: /pro/packages
    └→ Affiche les forfaits par catégorie avec prix

2️⃣  L'utilisateur achète un forfait PRO dans une catégorie
    └→ Création d'un enregistrement dans `pro_subscriptions`
    └→ Status: 'active', expires_at: now + duration
    └→ Lié à une category_id spécifique

3️⃣  Après l'achat, l'utilisateur peut créer son Store PRO
    └→ Modal propose: "Créer mon Store" ou "Plus tard"
    └→ Redirection vers: /pro/create-store

4️⃣  Création du Store PRO
    └→ Vérification: abonnement PRO actif ?
       ├─ ✅ OUI → Formulaire de création
       └─ ❌ NON → Message + Redirection vers /pro/packages

5️⃣  Le Store est créé
    └→ Enregistrement dans `pro_stores`
    └→ URL dédiée: /store/[slug]
    └→ Visible dans l'onglet "Stores PRO"

6️⃣  Le Store est accessible publiquement
    └→ Tous les utilisateurs peuvent consulter
    └→ Affiche annonces, coordonnées, description
```

---

## 🗄️ Structure de la Base de Données

### Table: `pro_packages`
Définit les forfaits PRO disponibles

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique |
| `name` | text | Nom du forfait (FR) |
| `name_ar` | text | Nom du forfait (AR) |
| `name_en` | text | Nom du forfait (EN) |
| `price` | numeric | Prix en DZD |
| `duration_days` | integer | Durée en jours |
| `category_id` | uuid | Catégorie liée |
| `max_listings` | integer | Nombre d'annonces max |
| `featured_listings` | integer | Annonces en vedette |
| `is_active` | boolean | Forfait actif ? |

### Table: `pro_subscriptions`
Gère les abonnements des utilisateurs

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique |
| `user_id` | uuid | Référence auth.users |
| `package_id` | uuid | Forfait souscrit |
| `category_id` | uuid | Catégorie de l'abonnement |
| `starts_at` | timestamptz | Date de début |
| `expires_at` | timestamptz | Date d'expiration |
| `status` | text | pending, active, expired, cancelled |
| `listings_used` | integer | Compteur d'annonces utilisées |
| `featured_used` | integer | Compteur vedettes utilisées |
| `paid_amount` | numeric | Montant payé |

### Table: `pro_stores`
Stores des professionnels

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique |
| `user_id` | uuid | Propriétaire du store |
| `name` | text | Nom du store |
| `slug` | text | URL-friendly (unique) |
| `description` | text | Description du store |
| `logo_url` | text | URL du logo |
| `banner_url` | text | URL de la bannière |
| `location` | text | Localisation |
| `category_id` | uuid | Catégorie principale |
| `contact_email` | text | Email de contact |
| `contact_phone` | text | Téléphone |
| `website_url` | text | Site web (optionnel) |
| `whatsapp_number` | text | WhatsApp (optionnel) |
| `is_active` | boolean | Store actif ? |

---

## 📱 Pages et Routes

### 1. `/pro/packages` - Page des forfaits PRO
**Fichier:** `app/pro/packages.tsx`

**Fonctionnalités:**
- Affiche tous les forfaits PRO groupés par catégorie
- Filtrage par catégorie
- Bouton "Souscrire" pour chaque forfait
- Après souscription → Propose de créer le Store PRO

**États:**
- `packages[]` - Liste des forfaits
- `selectedCategory` - Catégorie sélectionnée

### 2. `/pro/create-store` - Création du Store PRO
**Fichier:** `app/pro/create-store.tsx`

**Vérifications:**
1. ✅ Utilisateur connecté ?
2. ✅ Abonnement PRO actif ?
3. ✅ Pas de store existant ?

**Si pas d'abonnement PRO:**
- Affiche un message de blocage avec icône Lock
- Liste les avantages d'un Store PRO
- Bouton CTA → `/pro/packages`

**Si abonnement PRO actif:**
- Formulaire de création:
  - Nom du store *
  - Description *
  - Localisation
  - Email de contact *
  - Téléphone *
  - WhatsApp (optionnel)
  - Site web (optionnel)

**Actions:**
- Génère un slug unique à partir du nom
- Vérifie l'unicité du slug
- Crée l'enregistrement dans `pro_stores`
- Met à jour `profiles.user_type` → 'professional'
- Redirige vers `/store/[slug]`

### 3. `/(tabs)/stores` - Liste des Stores PRO
**Fichier:** `app/(tabs)/stores.tsx`

**Fonctionnalités:**
- Affiche tous les stores actifs
- Filtrage par catégorie
- Grille responsive (2-5 colonnes selon écran)
- Bouton "Créer mon Store PRO" (si user PRO)

**Cartes de store:**
- Logo (ou placeholder)
- Nom du store
- Badge catégorie coloré
- Localisation
- Bouton "Voir le Store" → `/store/[slug]`

### 4. `/store/[slug]` - Détail d'un Store
**Fichier:** `app/pro/[slug].tsx` (déjà existant)

**Affichage:**
- Bannière
- Logo
- Nom et description
- Coordonnées (email, téléphone, site web, WhatsApp)
- Réseaux sociaux
- Liste des annonces du professionnel

---

## 🔒 Règles de Sécurité (RLS)

### `pro_stores`
```sql
-- Lecture publique (stores actifs)
CREATE POLICY "Public can view active stores"
  ON pro_stores FOR SELECT
  TO public
  USING (is_active = true);

-- Création réservée aux utilisateurs avec abonnement PRO actif
CREATE POLICY "PRO users can create stores"
  ON pro_stores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pro_subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND expires_at > now()
    )
  );

-- Modification par le propriétaire uniquement
CREATE POLICY "Users can update own store"
  ON pro_stores FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### `pro_subscriptions`
```sql
-- Lecture par l'utilisateur uniquement
CREATE POLICY "Users can view own subscriptions"
  ON pro_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

---

## 🎨 Design et UX

### Codes couleurs par catégorie
```javascript
const CATEGORY_COLORS = {
  'vehicules': '#3B82F6',        // Bleu
  'immobilier': '#10B981',       // Vert
  'electronique': '#F59E0B',     // Orange
  'mode-beaute': '#EC4899',      // Rose
  'maison-jardin': '#8B5CF6',    // Violet
  'animaux': '#F97316',          // Orange foncé
  'emploi-services': '#06B6D4',  // Cyan
  'loisirs-hobbies': '#EF4444',  // Rouge
  // ... autres catégories
};
```

### Composants réutilisables
- **Badge catégorie** - Coloré selon la catégorie
- **Carte Store** - Format uniforme avec logo + infos
- **Bouton CTA PRO** - Design premium avec icône Crown
- **Message de blocage** - Pour utilisateurs sans abonnement

---

## ✅ Checklist de Validation

### Avant création d'un Store:
- [ ] Utilisateur connecté
- [ ] Abonnement PRO actif (status='active')
- [ ] Date d'expiration > maintenant
- [ ] Pas de store existant pour cet utilisateur

### Lors de la création:
- [ ] Nom du store non vide
- [ ] Description non vide
- [ ] Téléphone non vide
- [ ] Email valide
- [ ] Slug unique généré
- [ ] Vérification d'unicité du slug

### Après création:
- [ ] Store visible dans `/stores`
- [ ] Store accessible via `/store/[slug]`
- [ ] Profil mis à jour (user_type='professional')
- [ ] Store lié à la catégorie de l'abonnement

---

## 🚀 Prochaines Améliorations

### Court terme:
- [ ] Upload de logo et bannière
- [ ] Réseaux sociaux (Facebook, Instagram)
- [ ] Horaires d'ouverture
- [ ] Galerie photos

### Moyen terme:
- [ ] Statistiques du store (vues, contacts)
- [ ] Avis et notes clients
- [ ] Gestion multi-catégories
- [ ] Personnalisation des couleurs du store

### Long terme:
- [ ] Sous-domaine dédié (ex: garage-amine.buygo.dz)
- [ ] Thèmes personnalisables
- [ ] Intégration catalogue produits
- [ ] Système de réservation en ligne

---

## 📞 Support

Pour toute question sur l'architecture des Stores PRO:
- Documentation technique: Ce fichier
- Backend: Voir `supabase/migrations/`
- Frontend: Voir `app/pro/` et `app/(tabs)/stores.tsx`

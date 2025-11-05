# 🧪 Guide de Test - Système PRO & Stores

## 📋 Vue d'ensemble

Ce guide vous explique comment tester complètement le système PRO et la création de stores.

---

## 🎯 Méthode 1: Test Rapide avec SQL (RECOMMANDÉ)

### Étape 1: Créer un compte de test

1. **Inscrivez-vous normalement** dans l'application
   - Email: `test-pro@example.com`
   - Mot de passe: `Test123!`

2. **Notez votre User ID** après connexion
   - Il sera visible dans votre profil ou dans Supabase

### Étape 2: Activer un abonnement PRO via SQL

Exécutez ce script SQL dans **Supabase > SQL Editor**:

```sql
-- ============================================
-- SCRIPT DE TEST - ACTIVER UN COMPTE PRO
-- ============================================

-- 1. Remplacez par votre email de test
DO $$
DECLARE
  v_user_id uuid;
  v_package_id uuid;
  v_category_id uuid;
BEGIN
  -- Récupérer l'ID de votre utilisateur
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'test-pro@example.com';  -- CHANGEZ ICI

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé. Vérifiez l''email.';
  END IF;

  -- Récupérer une catégorie (Véhicules)
  SELECT id INTO v_category_id
  FROM categories
  WHERE slug = 'vehicules'
  LIMIT 1;

  -- Récupérer un forfait PRO pour cette catégorie
  SELECT id INTO v_package_id
  FROM pro_packages
  WHERE category_id = v_category_id
  AND is_active = true
  LIMIT 1;

  IF v_package_id IS NULL THEN
    RAISE EXCEPTION 'Aucun forfait PRO trouvé pour cette catégorie.';
  END IF;

  -- Supprimer les anciens abonnements (pour éviter les doublons)
  DELETE FROM pro_subscriptions WHERE user_id = v_user_id;

  -- Créer un abonnement PRO actif
  INSERT INTO pro_subscriptions (
    user_id,
    package_id,
    category_id,
    starts_at,
    expires_at,
    status,
    paid_amount,
    payment_method,
    payment_reference
  ) VALUES (
    v_user_id,
    v_package_id,
    v_category_id,
    now(),
    now() + interval '30 days',  -- Expire dans 30 jours
    'active',
    5000,  -- 5000 DA
    'test',
    'TEST-' || EXTRACT(EPOCH FROM now())::text
  );

  -- Mettre à jour le profil en "professional"
  UPDATE profiles
  SET user_type = 'professional'
  WHERE id = v_user_id;

  RAISE NOTICE 'Abonnement PRO activé avec succès pour %', v_user_id;
END $$;
```

### Étape 3: Vérifier l'activation

```sql
-- Vérifier votre abonnement PRO
SELECT
  ps.id,
  ps.status,
  ps.starts_at,
  ps.expires_at,
  c.name as category_name,
  pp.name as package_name,
  pp.price
FROM pro_subscriptions ps
JOIN categories c ON ps.category_id = c.id
JOIN pro_packages pp ON ps.package_id = pp.id
JOIN auth.users u ON ps.user_id = u.id
WHERE u.email = 'test-pro@example.com';  -- CHANGEZ ICI
```

---

## 🎯 Méthode 2: Test Via l'Interface (Flux Complet)

### Étape 1: Consulter les forfaits
1. Connectez-vous à l'application
2. Naviguez vers **Profil** → **Achetez un forfait PRO**
3. Ou allez directement sur `/pro/packages`

### Étape 2: Souscrire à un forfait
1. Sélectionnez une catégorie (ex: Véhicules)
2. Choisissez un forfait (Basic, Avancé, ou Expert)
3. Cliquez sur **"Choisir..."**
4. Confirmez la souscription
5. Une modal apparaît: **"Créer mon Store"** ou **"Plus tard"**

### Étape 3: Créer votre Store PRO
**Option A: Via la modal**
- Cliquez sur **"Créer mon Store"**

**Option B: Via l'onglet Stores**
- Allez sur l'onglet **"Stores PRO"** (🏪)
- Cliquez sur **"Créer mon Store PRO"**

**Option C: Via URL directe**
- Naviguez vers `/pro/create-store`

### Étape 4: Remplir le formulaire
Remplissez les informations:
- ✅ **Nom du Store*** : Ex: "Garage El Amine"
- ✅ **Description*** : Ex: "Spécialiste en réparation automobile..."
- **Localisation** : Ex: "Bab Ezzouar, Alger"
- ✅ **Email de contact*** : Ex: "contact@garage-amine.dz"
- ✅ **Téléphone*** : Ex: "0555 12 34 56"
- **WhatsApp** : Ex: "0555 12 34 56" (optionnel)
- **Site web** : Ex: "https://garage-amine.dz" (optionnel)

### Étape 5: Valider
1. Cliquez sur **"Créer mon Store PRO"**
2. Votre store est créé ! 🎉
3. Vous êtes redirigé vers `/store/garage-el-amine`

---

## 🧪 Scénarios de Test

### ✅ Scénario 1: Utilisateur sans abonnement PRO

**Actions:**
1. Connectez-vous avec un compte standard (sans PRO)
2. Allez sur `/pro/create-store`

**Résultat attendu:**
- ❌ Message "Abonnement PRO requis"
- 🔒 Icône Lock affichée
- Liste des avantages visible
- Bouton "Découvrir les forfaits PRO"

---

### ✅ Scénario 2: Utilisateur avec abonnement PRO (première fois)

**Actions:**
1. Activez un abonnement PRO (via SQL ou interface)
2. Allez sur `/pro/create-store`

**Résultat attendu:**
- ✅ Formulaire de création affiché
- Badge catégorie visible (ex: "VÉHICULES")
- Tous les champs présents
- Bouton "Créer mon Store PRO" actif

---

### ✅ Scénario 3: Utilisateur avec store existant

**Actions:**
1. Créez un store
2. Retournez sur `/pro/create-store`

**Résultat attendu:**
- ⚠️ Alert: "Vous avez déjà un store professionnel"
- Redirection automatique vers votre store existant

---

### ✅ Scénario 4: Vérifier la visibilité du store

**Actions:**
1. Créez un store
2. Allez sur l'onglet **"Stores PRO"** (🏪)

**Résultat attendu:**
- ✅ Votre store est visible dans la liste
- Badge catégorie coloré
- Localisation affichée
- Bouton "Voir le Store"

---

### ✅ Scénario 5: Page publique du store

**Actions:**
1. Cliquez sur votre store depuis la liste
2. Ou naviguez vers `/store/[votre-slug]`

**Résultat attendu:**
- ✅ Nom du store
- Description complète
- Coordonnées (email, téléphone, site web, WhatsApp)
- Localisation
- Liste des annonces du professionnel

---

## 🔍 Vérifications dans la Base de Données

### Vérifier les forfaits disponibles
```sql
SELECT
  pp.name,
  pp.price,
  pp.duration_days,
  c.name as category_name
FROM pro_packages pp
JOIN categories c ON pp.category_id = c.id
WHERE pp.is_active = true
ORDER BY c.name, pp.price;
```

### Vérifier les abonnements actifs
```sql
SELECT
  u.email,
  ps.status,
  ps.expires_at,
  c.name as category_name,
  pp.name as package_name
FROM pro_subscriptions ps
JOIN auth.users u ON ps.user_id = u.id
JOIN categories c ON ps.category_id = c.id
JOIN pro_packages pp ON ps.package_id = pp.id
WHERE ps.status = 'active'
AND ps.expires_at > now()
ORDER BY ps.created_at DESC;
```

### Vérifier les stores créés
```sql
SELECT
  s.name,
  s.slug,
  s.location,
  s.is_active,
  u.email as owner_email,
  c.name as category_name
FROM pro_stores s
JOIN auth.users u ON s.user_id = u.id
JOIN categories c ON s.category_id = c.id
ORDER BY s.created_at DESC;
```

---

## 🎨 Points à vérifier visuellement

### Page `/pro/packages`
- [ ] Header avec couronne dorée
- [ ] Section "Avantages PRO" avec icônes
- [ ] Dropdown de sélection de catégorie
- [ ] Cartes de forfaits colorées (vert, violet, rouge)
- [ ] Badge "Recommandé Pro" sur le forfait du milieu
- [ ] Prix en DA correctement formatés
- [ ] Boutons "Choisir..." cliquables

### Page `/pro/create-store`
- [ ] Header avec bouton retour
- [ ] Badge catégorie coloré en haut
- [ ] Instructions avec icône info
- [ ] Tous les champs du formulaire
- [ ] Champs obligatoires marqués avec *
- [ ] Bouton "Créer mon Store PRO" avec icône

### Onglet "Stores PRO"
- [ ] Header "Découvrez nos Stores PRO"
- [ ] Filtres de catégories horizontaux
- [ ] Grille responsive (2-5 colonnes)
- [ ] Cartes avec logo (ou placeholder)
- [ ] Badges catégories colorés
- [ ] Bouton "Créer mon Store PRO" si PRO

### Page store `/store/[slug]`
- [ ] Bannière (si configurée)
- [ ] Logo (si configuré)
- [ ] Nom et description
- [ ] Coordonnées complètes
- [ ] Boutons d'action (Appeler, WhatsApp, Site web)
- [ ] Liste des annonces

---

## 🐛 Résolution de Problèmes

### Problème 1: "Aucun forfait PRO trouvé"
**Solution:**
```sql
-- Vérifier que des forfaits existent
SELECT COUNT(*) FROM pro_packages WHERE is_active = true;

-- Si 0, exécuter une migration pour créer les forfaits
```

### Problème 2: "L'abonnement n'est pas reconnu"
**Solution:**
```sql
-- Vérifier le statut
SELECT status, expires_at
FROM pro_subscriptions
WHERE user_id = 'VOTRE_USER_ID';

-- Réactiver si expiré
UPDATE pro_subscriptions
SET
  status = 'active',
  expires_at = now() + interval '30 days'
WHERE user_id = 'VOTRE_USER_ID';
```

### Problème 3: "Le store n'apparaît pas"
**Solution:**
```sql
-- Vérifier l'état du store
SELECT * FROM pro_stores WHERE user_id = 'VOTRE_USER_ID';

-- Activer le store
UPDATE pro_stores
SET is_active = true
WHERE user_id = 'VOTRE_USER_ID';
```

### Problème 4: "Erreur de slug déjà existant"
**Solution:**
- Choisissez un autre nom de store
- Le slug est généré automatiquement à partir du nom
- Vérifiez les stores existants:
```sql
SELECT name, slug FROM pro_stores ORDER BY name;
```

---

## 📝 Script SQL Complet de Test

Voici un script complet pour créer un environnement de test:

```sql
-- ============================================
-- SCRIPT COMPLET DE TEST - SYSTÈME PRO
-- ============================================

-- 1. TROUVER VOTRE USER ID
SELECT id, email FROM auth.users WHERE email = 'VOTRE_EMAIL';

-- 2. ACTIVER UN ABONNEMENT PRO (REMPLACEZ LES UUID)
DO $$
DECLARE
  v_user_id uuid := 'VOTRE_USER_ID';  -- ⚠️ CHANGEZ ICI
  v_package_id uuid;
  v_category_id uuid;
BEGIN
  -- Catégorie Véhicules
  SELECT id INTO v_category_id FROM categories WHERE slug = 'vehicules' LIMIT 1;

  -- Forfait PRO pour Véhicules
  SELECT id INTO v_package_id
  FROM pro_packages
  WHERE category_id = v_category_id
  AND is_active = true
  LIMIT 1;

  -- Supprimer les anciens abonnements
  DELETE FROM pro_subscriptions WHERE user_id = v_user_id;

  -- Créer l'abonnement PRO
  INSERT INTO pro_subscriptions (
    user_id, package_id, category_id,
    starts_at, expires_at, status,
    paid_amount, payment_method, payment_reference
  ) VALUES (
    v_user_id, v_package_id, v_category_id,
    now(), now() + interval '30 days', 'active',
    5000, 'test', 'TEST-' || EXTRACT(EPOCH FROM now())::text
  );

  -- Mettre à jour le profil
  UPDATE profiles SET user_type = 'professional' WHERE id = v_user_id;

  RAISE NOTICE 'Abonnement PRO activé !';
END $$;

-- 3. VÉRIFIER
SELECT
  ps.status,
  ps.expires_at,
  c.name as category,
  pp.name as package
FROM pro_subscriptions ps
JOIN categories c ON ps.category_id = c.id
JOIN pro_packages pp ON ps.package_id = pp.id
WHERE ps.user_id = 'VOTRE_USER_ID';  -- ⚠️ CHANGEZ ICI
```

---

## ✅ Checklist Finale

Avant de valider le système, vérifiez que:

- [ ] Un utilisateur sans PRO voit le message de blocage
- [ ] Un utilisateur avec PRO peut créer un store
- [ ] Le formulaire valide les champs obligatoires
- [ ] Le slug est généré automatiquement
- [ ] Le slug est unique (pas de doublon)
- [ ] Le store apparaît dans la liste publique
- [ ] Le store est accessible via son URL dédiée
- [ ] Les coordonnées sont correctement affichées
- [ ] Le badge PRO est visible
- [ ] Les annonces du pro sont listées dans son store

---

## 🚀 Prêt pour la Production

Une fois tous les tests validés:
1. Configurez les vrais moyens de paiement
2. Définissez les prix finaux des forfaits
3. Activez les notifications email
4. Mettez en place le support client
5. Créez la documentation utilisateur

**Bon test ! 🎉**

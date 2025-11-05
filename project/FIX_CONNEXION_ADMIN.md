# 🔧 Corrections Appliquées - Connexion & Erreurs

## ✅ **Problèmes Résolus**

### 1. Erreur DOM: "Failed to execute 'insertBefore' on 'Node'"
**Cause:** Utilisation de `window.location.origin` qui n'existe pas en React Native/Expo

**Fichiers corrigés:**
- ✅ `app/(auth)/forgot-password.tsx` - Suppression de window.location
- ✅ `app/listing/[id].tsx` - URL fixe pour le partage

**Impact:** Plus d'erreur JavaScript lors de l'utilisation de "Mot de passe oublié"

---

## 🚨 SOLUTION RAPIDE : Connexion pour Samir.ouaaz@bilinfolan.fr

### Problème: Email de réinitialisation non reçu
**Cause:** Service email Supabase limité en développement
- ❌ **Le compte n'existe pas encore** dans la base de données
- ❌ **Les migrations ne sont pas appliquées** (tables manquantes)

---

## ✅ SOLUTION EN 3 ÉTAPES RAPIDES

### **ÉTAPE 1 : Vérifier si les migrations sont appliquées** ⚠️

1. Allez sur : https://tliwclxcgtjzaxbbfulr.supabase.co
2. Connectez-vous
3. Allez dans **SQL Editor**
4. Exécutez cette requête :

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'profiles'
);
```

**Si le résultat est `false`** → Les migrations ne sont PAS appliquées, passez à l'Étape 1A

**Si le résultat est `true`** → Les migrations SONT appliquées, passez directement à l'Étape 2

---

### **ÉTAPE 1A : Appliquer les migrations (si nécessaire)**

Si les migrations ne sont pas appliquées, vous devez exécuter **TOUS** les fichiers SQL dans le dossier `supabase/migrations/` dans l'ordre chronologique.

**Option A : Via SQL Editor (Manuel mais sûr)**

Pour chaque fichier de migration (dans l'ordre), ouvrez-le et exécutez son contenu dans SQL Editor :

1. `20251006070608_create_buygo_schema.sql` ← **COMMENCEZ ICI**
2. `20251006073612_add_search_and_functions.sql`
3. `20251006073639_setup_storage_buckets.sql`
4. ... (tous les autres dans l'ordre)

**Option B : Via Supabase CLI (Automatique)**

```bash
# Installer CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref tliwclxcgtjzaxbbfulr

# Appliquer toutes les migrations
supabase db push
```

---

### **ÉTAPE 2 : Créer votre compte**

Vous avez **2 options** :

#### **Option A : Via l'application (Plus Simple)** ✅ RECOMMANDÉ

1. Ouvrez l'application Buy&Go
2. Cliquez sur **"S'inscrire"**
3. Remplissez :
   - **Nom complet** : `Admin`
   - **Email** : `samouaaz@gmail.com`
   - **Mot de passe** : Votre mot de passe (au moins 6 caractères)
   - **Confirmation** : Le même mot de passe
4. Cliquez sur **"S'inscrire"**

**Puis passez directement à l'Étape 3**

---

#### **Option B : Via SQL (Si l'inscription ne fonctionne pas)**

Dans **SQL Editor** de Supabase, exécutez :

```sql
-- ATTENTION : CHANGEZ LE MOT DE PASSE !
-- Remplacez 'VotreMotDePasse123' par un mot de passe sécurisé

-- 1. Créer l'utilisateur
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'samouaaz@gmail.com',
  crypt('VotreMotDePasse123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Admin"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'samouaaz@gmail.com'
)
RETURNING id;
```

**⚠️ IMPORTANT** : Notez l'ID retourné (par exemple : `a1b2c3d4-...`)

Puis exécutez (remplacez `L_ID_RETOURNÉ` par l'ID noté) :

```sql
-- 2. Créer le profil (REMPLACEZ L_ID_RETOURNÉ)
INSERT INTO profiles (
  id,
  full_name,
  created_at,
  updated_at
)
VALUES (
  'L_ID_RETOURNÉ',  -- ← REMPLACEZ ICI
  'Admin',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
```

---

### **ÉTAPE 3 : Obtenir les privilèges SUPER ADMIN** 🛡️

Dans **SQL Editor**, exécutez cette commande :

```sql
-- Option 1 : Via la fonction helper (Recommandé)
SELECT promote_user_to_admin('samouaaz@gmail.com');
```

**OU** si la fonction n'existe pas :

```sql
-- Option 2 : Mise à jour manuelle
UPDATE profiles
SET
  role = 'admin',
  is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'samouaaz@gmail.com'
);
```

---

### **ÉTAPE 4 : Vérifier que tout fonctionne** ✓

Exécutez cette requête pour confirmer :

```sql
SELECT
  u.email,
  p.full_name,
  p.role,
  p.is_admin,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  p.created_at
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'samouaaz@gmail.com';
```

**Résultat attendu :**

| email | full_name | role | is_admin | email_confirmed | created_at |
|-------|-----------|------|----------|-----------------|------------|
| samouaaz@gmail.com | Admin | admin | true | true | 2025-10-14... |

✅ Si vous voyez cette ligne avec `role = 'admin'` et `is_admin = true`, **C'EST BON !**

---

### **ÉTAPE 5 : Se connecter** 🎉

1. Retournez sur l'application Buy&Go
2. Allez sur la page **Connexion**
3. Entrez :
   - **Email** : `samouaaz@gmail.com`
   - **Mot de passe** : Le mot de passe que vous avez défini
4. Cliquez sur **"Se connecter"**

**VOUS ÊTES MAINTENANT CONNECTÉ EN TANT QU'ADMIN ! 🎊**

---

## 🛡️ Vos Privilèges Admin

En tant qu'admin, vous pouvez accéder au **Dashboard Admin** :

1. Allez dans l'onglet **Profil** (en bas)
2. Cliquez sur l'onglet **Paramètres**
3. Vous verrez le bouton **🛡️ Dashboard Admin**
4. Cliquez dessus

**Fonctionnalités disponibles :**
- ✅ Gérer tous les utilisateurs
- ✅ Approuver/Rejeter les annonces
- ✅ Voir et traiter les signalements
- ✅ Bannir des utilisateurs
- ✅ Voir les statistiques globales
- ✅ Gérer les packages PRO
- ✅ Promouvoir d'autres admins
- ✅ Accès complet à toutes les fonctionnalités

---

## 🆘 Résolution de Problèmes

### ❌ Problème : "Erreur lors de la connexion"

**Cause** : Le compte n'est pas confirmé

**Solution** :
```sql
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'samouaaz@gmail.com';
```

---

### ❌ Problème : "Je n'ai toujours pas accès au dashboard"

**Cause** : Le rôle n'est pas bien défini

**Solution** :
```sql
-- Vérifier le rôle
SELECT role, is_admin FROM profiles WHERE id = (
  SELECT id FROM auth.users WHERE email = 'samouaaz@gmail.com'
);

-- Si pas admin, corriger :
UPDATE profiles
SET role = 'admin', is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'samouaaz@gmail.com'
);
```

Puis **déconnectez-vous et reconnectez-vous**.

---

### ❌ Problème : "La table profiles n'existe pas"

**Cause** : Les migrations ne sont pas appliquées

**Solution** : Retournez à l'**ÉTAPE 1A** et appliquez toutes les migrations.

---

## 📋 CHECKLIST RAPIDE

Cochez au fur et à mesure :

- [ ] Les migrations sont appliquées (table `profiles` existe)
- [ ] Le compte `samouaaz@gmail.com` est créé
- [ ] L'email est confirmé (`email_confirmed_at` non null)
- [ ] Le profil existe dans la table `profiles`
- [ ] Le rôle est `'admin'` et `is_admin = true`
- [ ] Je peux me connecter avec email/mot de passe
- [ ] Je vois le bouton "Dashboard Admin" dans Profil → Paramètres
- [ ] Je peux accéder au dashboard admin

---

## 🚀 Commandes SQL Complètes (Copier-Coller)

Si vous voulez tout faire en une fois, voici le script complet :

```sql
-- 1. Vérifier si le compte existe déjà
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Vérifier si l'utilisateur existe
  SELECT id INTO user_id FROM auth.users WHERE email = 'samouaaz@gmail.com';

  IF user_id IS NULL THEN
    -- Créer l'utilisateur s'il n'existe pas
    -- ⚠️ CHANGEZ LE MOT DE PASSE !
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'samouaaz@gmail.com',
      crypt('VotreMotDePasse123', gen_salt('bf')), -- ← CHANGEZ ICI
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin"}'::jsonb,
      now(),
      now()
    )
    RETURNING id INTO user_id;

    -- Créer le profil
    INSERT INTO profiles (id, full_name, created_at, updated_at)
    VALUES (user_id, 'Admin', now(), now());

    RAISE NOTICE 'Compte créé avec succès';
  ELSE
    -- Confirmer l'email si pas déjà fait
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = user_id;

    -- S'assurer que le profil existe
    INSERT INTO profiles (id, full_name, created_at, updated_at)
    VALUES (user_id, 'Admin', now(), now())
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Compte déjà existant';
  END IF;

  -- 2. Promouvoir en admin
  UPDATE profiles
  SET
    role = 'admin',
    is_admin = true
  WHERE id = user_id;

  RAISE NOTICE 'Utilisateur promu en admin';
END $$;

-- 3. Vérifier le résultat
SELECT
  u.email,
  p.full_name,
  p.role,
  p.is_admin,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'samouaaz@gmail.com';
```

**⚠️ N'OUBLIEZ PAS DE CHANGER LE MOT DE PASSE DANS LE SCRIPT !**

---

## 📞 Support

Si ça ne fonctionne toujours pas :

1. Vérifiez que vous utilisez le bon mot de passe
2. Vérifiez que l'email est bien `samouaaz@gmail.com` (pas de faute de frappe)
3. Déconnectez-vous complètement et reconnectez-vous
4. Videz le cache de votre navigateur
5. Consultez le fichier `ADMIN_SETUP_GUIDE.md` pour plus de détails

---

**Bonne chance ! 🎉**

*Ce guide est spécifiquement créé pour résoudre votre problème de connexion.*

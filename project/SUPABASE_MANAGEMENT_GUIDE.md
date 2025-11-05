# 🔐 Guide de Gestion Supabase - Buy&Go

## 📊 **Informations de Connexion**

### Accès au Dashboard Supabase
```
URL Dashboard: https://supabase.com/dashboard
Project URL: https://jchywwamhmzzvhgbywkj.supabase.co
Project ID: jchywwamhmzzvhgbywkj
```

### Liens Directs
- **Dashboard Principal**: https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj
- **Éditeur de Tables**: https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/editor
- **Auth Management**: https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/auth/users
- **SQL Editor**: https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/sql
- **Storage**: https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/storage/buckets
- **API Docs**: https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/api

---

## 👥 **Gestion des Utilisateurs**

### 1. Voir tous les utilisateurs
Dans le dashboard Supabase, allez sur:
```
Authentication > Users
https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/auth/users
```

### 2. Créer un utilisateur manuellement
**Via le Dashboard:**
1. Allez sur `Authentication > Users`
2. Cliquez sur `Add user`
3. Remplissez:
   - Email
   - Password (minimum 6 caractères)
   - Auto Confirm User: ✅ (important!)
4. Cliquez sur `Create user`

**Via SQL Editor:**
```sql
-- Créer un nouvel utilisateur avec profil
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'nouveau@email.com',
  crypt('MotDePasse123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Nom Complet"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

### 3. Réinitialiser le mot de passe d'un utilisateur

**Option 1: Via Dashboard (Recommandé)**
1. Allez sur `Authentication > Users`
2. Trouvez l'utilisateur
3. Cliquez sur les 3 points `...`
4. Sélectionnez `Send password recovery email`

**Option 2: Via SQL**
```sql
-- Réinitialiser le mot de passe d'un utilisateur
UPDATE auth.users
SET
  encrypted_password = crypt('NouveauMotDePasse123', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'utilisateur@email.com';
```

### 4. Supprimer un utilisateur
```sql
-- Supprimer un utilisateur et son profil
DELETE FROM auth.users WHERE email = 'utilisateur@email.com';
-- Le profil dans public.profiles sera supprimé automatiquement grâce à ON DELETE CASCADE
```

### 5. Lister tous les comptes avec informations détaillées
```sql
SELECT
  au.id,
  au.email,
  au.created_at,
  au.last_sign_in_at,
  au.email_confirmed_at,
  p.full_name,
  p.user_type,
  p.phone_number,
  p.wilaya,
  p.commune,
  (SELECT COUNT(*) FROM listings WHERE user_id = au.id) as total_listings
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ORDER BY au.created_at DESC;
```

---

## 🔑 **Comptes de Test Disponibles**

### Compte Admin
```
Email: samouaaz@gmail.com
Mot de passe: Admin2025
Type: admin
Privilèges: Accès complet administration
```

### Compte Professionnel Test
```
Email: pro@test.com
Mot de passe: Test123
Type: professional
Privilèges: Boutique PRO avec 120+ annonces
Slug: demo-boutique-pro
```

---

## 🛠️ **Requêtes SQL Utiles**

### Statistiques Générales
```sql
-- Statistiques de la plateforme
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM listings WHERE status = 'active') as active_listings,
  (SELECT COUNT(*) FROM listings WHERE created_at > NOW() - INTERVAL '7 days') as listings_this_week,
  (SELECT COUNT(*) FROM profiles WHERE user_type = 'professional') as professional_users,
  (SELECT COUNT(*) FROM conversations) as total_conversations;
```

### Utilisateurs les plus actifs
```sql
SELECT
  p.full_name,
  p.user_type,
  au.email,
  COUNT(l.id) as total_annonces,
  SUM(l.views) as total_vues
FROM profiles p
JOIN auth.users au ON au.id = p.id
LEFT JOIN listings l ON l.user_id = p.id
GROUP BY p.id, p.full_name, p.user_type, au.email
ORDER BY total_annonces DESC
LIMIT 20;
```

### Rechercher un utilisateur
```sql
-- Par email
SELECT * FROM auth.users WHERE email LIKE '%recherche%';

-- Par nom
SELECT
  au.email,
  p.full_name,
  p.phone_number,
  p.user_type
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.full_name ILIKE '%nom%';
```

---

## 🚨 **Résolution de Problèmes**

### Problème: "Invalid login credentials"
**Causes possibles:**
1. Email ou mot de passe incorrect
2. Compte pas encore confirmé
3. Compte supprimé

**Solutions:**
```sql
-- Vérifier si le compte existe
SELECT email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'utilisateur@email.com';

-- Confirmer le compte manuellement
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'utilisateur@email.com';
```

### Problème: "Email not confirmed"
```sql
-- Confirmer l'email manuellement
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmation_token = ''
WHERE email = 'utilisateur@email.com';
```

### Problème: Profil non créé après inscription
```sql
-- Créer manuellement un profil
INSERT INTO profiles (id, full_name, user_type)
SELECT id, raw_user_meta_data->>'full_name', 'individual'
FROM auth.users
WHERE email = 'utilisateur@email.com'
ON CONFLICT (id) DO NOTHING;
```

---

## 📧 **Configuration Email**

### Templates d'Email
Accédez aux templates via:
```
Authentication > Email Templates
https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/auth/templates
```

**Templates disponibles:**
- Confirmation email
- Reset password
- Magic link
- Change email

---

## 🔒 **Sécurité**

### Changer les clés d'API
⚠️ **NE PAS CHANGER** sans mettre à jour le fichier `.env`:
```env
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_SUPABASE_URL=https://jchywwamhmzzvhgbywkj.supabase.co
```

### Vérifier les policies RLS
```sql
-- Lister toutes les policies actives
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 📊 **Monitoring**

### Voir l'activité récente
```sql
-- Dernières inscriptions
SELECT email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Dernières connexions
SELECT email, last_sign_in_at
FROM auth.users
WHERE last_sign_in_at IS NOT NULL
ORDER BY last_sign_in_at DESC
LIMIT 10;

-- Dernières annonces publiées
SELECT
  l.title,
  l.created_at,
  p.full_name as author
FROM listings l
JOIN profiles p ON p.id = l.user_id
ORDER BY l.created_at DESC
LIMIT 10;
```

---

## 📱 **Support & Contact**

Pour toute question sur la gestion Supabase:
- Documentation: https://supabase.com/docs
- Support Supabase: https://supabase.com/dashboard/support
- Discord Supabase: https://discord.supabase.com

---

## ✅ **Checklist de Vérification**

- [ ] Accès au dashboard Supabase confirmé
- [ ] Comptes de test fonctionnels
- [ ] Email de récupération configuré
- [ ] RLS policies activées sur toutes les tables
- [ ] Backups automatiques activés
- [ ] Logs d'erreur consultés régulièrement

---

**Dernière mise à jour:** 16 Octobre 2025
**Version de l'application:** 1.0.0
**Projet Supabase:** jchywwamhmzzvhgbywkj

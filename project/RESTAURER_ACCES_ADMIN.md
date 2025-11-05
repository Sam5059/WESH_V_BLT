# 🚨 URGENT : Restaurer l'accès admin pour samouaaz@gmail.com

## 🔍 Diagnostic du problème

Vous aviez accès avant, mais maintenant vous ne pouvez plus vous connecter car :
- ❌ **La base de données est vide** (aucune table n'existe)
- ❌ **Toutes les migrations ont été perdues**
- ❌ **Votre compte admin a disparu**

**Cela signifie que :**
1. Soit le projet Supabase a été réinitialisé
2. Soit vous utilisez un nouveau projet
3. Soit les migrations n'ont jamais été poussées vers Supabase

---

## ✅ SOLUTION : Réappliquer toutes les migrations

### **📋 Prérequis**

Vous avez 2 options pour restaurer votre base de données :

---

## **OPTION A : Via Supabase CLI** ⚡ (LE PLUS RAPIDE - 2 MINUTES)

### **Étape 1 : Installer Supabase CLI**

```bash
# Si vous êtes sur macOS/Linux
npm install -g supabase

# Ou avec Homebrew (macOS)
brew install supabase/tap/supabase
```

### **Étape 2 : Se connecter à Supabase**

```bash
supabase login
```

Cela ouvrira votre navigateur pour vous authentifier.

### **Étape 3 : Lier votre projet**

```bash
cd /tmp/cc-agent/58601087/project
supabase link --project-ref tliwclxcgtjzaxbbfulr
```

Entrez votre **mot de passe de base de données** si demandé.

### **Étape 4 : Appliquer toutes les migrations**

```bash
supabase db push
```

**Résultat attendu :**
```
Applying migration 20251006070608_create_buygo_schema.sql...
Applying migration 20251006073612_add_search_and_functions.sql...
... (toutes les migrations)
✅ All migrations applied successfully!
```

### **Étape 5 : Créer votre compte admin**

```bash
# Ouvrir le SQL Editor
supabase db sql
```

Puis copiez-collez ce script :

```sql
DO $$
DECLARE
  user_id uuid;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'samouaaz@gmail.com',
    crypt('VotreMotDePasse123', gen_salt('bf')), -- ⚠️ CHANGEZ ICI
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin"}'::jsonb, now(), now(), '', '', '', ''
  ) RETURNING id INTO user_id;

  INSERT INTO profiles (id, full_name, created_at, updated_at)
  VALUES (user_id, 'Admin', now(), now());

  UPDATE profiles SET role = 'admin', is_admin = true WHERE id = user_id;
END $$;
```

**Puis passez à l'Étape 6 (Vérification)**

---

## **OPTION B : Via Dashboard Supabase** 🖱️ (MANUEL - 20-30 MINUTES)

Si vous ne pouvez pas installer Supabase CLI, voici la méthode manuelle :

### **Étape 1 : Ouvrir le Dashboard**

1. Allez sur : https://tliwclxcgtjzaxbbfulr.supabase.co
2. Connectez-vous
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **"+ New query"**

### **Étape 2 : Appliquer les migrations dans l'ordre**

Vous devez appliquer **TOUTES** les migrations dans l'ordre chronologique.

#### **📂 Liste des migrations à appliquer**

Ouvrez chaque fichier et copiez-collez son contenu dans SQL Editor, puis cliquez sur **"Run"** :

1. ✅ `supabase/migrations/20251006070608_create_buygo_schema.sql`
2. ✅ `supabase/migrations/20251006073612_add_search_and_functions.sql`
3. ✅ `supabase/migrations/20251006073639_setup_storage_buckets.sql`
4. ✅ `supabase/migrations/20251006073932_fix_increment_views_function.sql`
5. ✅ `supabase/migrations/20251006075906_auto_create_profile_on_signup.sql`
6. ✅ `supabase/migrations/20251006172504_create_pro_packages.sql`
7. ✅ `supabase/migrations/20251006194727_create_subcategories_with_slugs.sql`
8. ✅ `supabase/migrations/20251006195817_add_listing_attributes.sql`
9. ✅ `supabase/migrations/20251006201723_add_english_category_names.sql`
10. ✅ `supabase/migrations/20251006202221_add_english_wilaya_names.sql`
11. ✅ `supabase/migrations/20251006203721_create_brands_and_models.sql`
12. ✅ `supabase/migrations/20251006203749_add_vehicle_models.sql`
13. ✅ `supabase/migrations/20251006203817_add_electronics_models.sql`
14. ✅ `supabase/migrations/20251007092527_fix_listings_public_access.sql`
15. ✅ `supabase/migrations/20251007132533_add_listing_type_field.sql`
16. ✅ `supabase/migrations/20251007132755_add_pro_user_type_to_profiles.sql`
17. ✅ `supabase/migrations/20251007152212_add_admin_roles_and_spam_filter.sql` ⭐ **IMPORTANT POUR ADMIN**
18. ✅ `supabase/migrations/20251007153057_add_listing_promotions.sql`
19. ✅ `supabase/migrations/20251007154450_add_admin_management_functions.sql` ⭐ **IMPORTANT POUR ADMIN**
20. ✅ `supabase/migrations/20251009064030_fix_listings_profiles_relationship.sql`
21. ✅ `supabase/migrations/20251009130134_create_communes_table.sql`
22. ✅ `supabase/migrations/20251009130444_add_more_communes.sql`
23. ✅ `supabase/migrations/20251010074421_05_create_brands_and_models.sql`
24. ✅ `supabase/migrations/20251010075000_add_pro_package_fields_to_profiles.sql`
25. ✅ `supabase/migrations/20251010075147_06_add_listing_attributes.sql`
26. ✅ `supabase/migrations/20251010083054_fix_listings_profiles_relationship.sql`
27. ✅ `supabase/migrations/20251010083144_add_missing_functions_and_tables_v2.sql`
28. ✅ `supabase/migrations/20251010083239_add_category_type_to_brands.sql`
29. ✅ `supabase/migrations/20251010104438_update_pro_packages_realistic_pricing.sql`
30. ✅ `supabase/migrations/20251010145740_add_category_based_pro_packages.sql`
31. ✅ `supabase/migrations/20251010152239_update_pro_packages_algerian_market_pricing.sql`
32. ✅ `supabase/migrations/20251011215318_add_more_vehicle_brands_and_models.sql`
33. ✅ `supabase/migrations/20251011215433_add_comprehensive_vehicle_models.sql`
34. ✅ `supabase/migrations/20251011215524_add_vehicle_subcategories_details.sql`
35. ✅ `supabase/migrations/20251012072653_add_admin_roles_system.sql` ⭐ **IMPORTANT POUR ADMIN**
36. ✅ `supabase/migrations/20251012072716_add_listing_moderation_and_reports.sql`
37. ✅ `supabase/migrations/20251012072754_add_user_ratings_and_reviews.sql`
38. ✅ `supabase/migrations/20251012072836_add_kpi_and_statistics_system.sql`
39. ✅ `supabase/migrations/20251012145258_disable_mandatory_moderation.sql`
40. ✅ `supabase/migrations/20251012152004_create_listings_storage_bucket.sql`
41. ✅ `supabase/migrations/20251013144347_add_professional_slug_to_profiles.sql`
42. ✅ `supabase/migrations/20251013145144_add_more_categories_particuliers_and_pro.sql`
43. ✅ `supabase/migrations/20251014085550_create_communes_table.sql`
44. ✅ `supabase/migrations/20251014093220_add_all_algerian_communes.sql`
45. ✅ `supabase/migrations/20251014095221_add_location_vacation_and_vehicles_categories.sql`
46. ✅ `supabase/migrations/20251014140000_add_professional_profile_fields.sql`

**⚠️ IMPORTANT** : Vous devez les appliquer **DANS CET ORDRE** !

### **Étape 3 : Vérifier que les migrations sont appliquées**

Après avoir exécuté toutes les migrations, vérifiez :

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Vous devriez voir au moins ces tables :
- `profiles`
- `listings`
- `categories`
- `messages`
- `conversations`
- `favorites`
- `wilayas`
- `communes`
- `brands`
- `models`
- `pro_packages`
- `listing_reports`
- `moderation_actions`
- `user_ratings`
- etc.

### **Étape 4 : Créer votre compte admin**

Dans SQL Editor, exécutez ce script :

```sql
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Créer l'utilisateur
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'samouaaz@gmail.com',
    crypt('Admin@2025', gen_salt('bf')), -- ⚠️ CHANGEZ CE MOT DE PASSE !
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Samouaaz Admin"}'::jsonb, now(), now(), '', '', '', ''
  ) RETURNING id INTO user_id;

  -- Créer le profil
  INSERT INTO profiles (id, full_name, created_at, updated_at)
  VALUES (user_id, 'Samouaaz Admin', now(), now());

  -- Promouvoir en super admin
  UPDATE profiles
  SET
    role = 'super_admin',
    is_admin = true,
    admin_permissions = ARRAY[
      'manage_users', 'manage_listings', 'manage_reports',
      'view_analytics', 'manage_categories', 'manage_settings',
      'manage_admins', 'manage_pro_packages'
    ]::text[]
  WHERE id = user_id;

  RAISE NOTICE '✅ Compte admin créé avec succès pour samouaaz@gmail.com';
END $$;
```

**⚠️ N'OUBLIEZ PAS DE CHANGER LE MOT DE PASSE !**

---

## **Étape 6 : Vérification finale** ✅

Exécutez cette requête pour vérifier que tout est OK :

```sql
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  p.is_admin,
  p.admin_permissions,
  p.created_at
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'samouaaz@gmail.com';
```

**Résultat attendu :**

| email | full_name | role | is_admin | admin_permissions |
|-------|-----------|------|----------|-------------------|
| samouaaz@gmail.com | Samouaaz Admin | super_admin | true | {manage_users, manage_listings, ...} |

✅ Si vous voyez cette ligne, **TOUT EST BON !**

---

## **Étape 7 : Se connecter** 🎉

1. Ouvrez l'application Buy&Go
2. Allez sur la page **Connexion**
3. Entrez :
   - **Email** : `samouaaz@gmail.com`
   - **Mot de passe** : Le mot de passe que vous avez défini dans le script
4. Cliquez sur **"Se connecter"**

**VOUS ÊTES DE RETOUR ! 🎊**

---

## **Accéder au Dashboard Admin** 🛡️

1. Allez dans **Profil** (onglet en bas)
2. Cliquez sur **Paramètres**
3. Vous verrez le bouton **🛡️ Dashboard Admin**
4. Cliquez dessus

Vous avez maintenant accès à toutes les fonctionnalités admin !

---

## 🆘 Si vous avez des erreurs pendant les migrations

### **Erreur : "relation already exists"**
C'est normal si vous réexécutez une migration. Ignorez et continuez.

### **Erreur : "syntax error"**
Vérifiez que vous avez copié **TOUT** le contenu du fichier SQL.

### **Erreur : "permission denied"**
Vous devez être connecté en tant que propriétaire du projet Supabase.

---

## 📊 Récapitulatif

| Méthode | Temps | Difficulté | Recommandation |
|---------|-------|------------|----------------|
| **Option A : CLI** | 2-5 min | Facile | ✅ **RECOMMANDÉ** |
| **Option B : Manuel** | 20-30 min | Moyenne | Si pas de CLI |

---

## 📝 Checklist complète

- [ ] Migrations appliquées (Option A ou B)
- [ ] Table `profiles` existe
- [ ] Table `auth.users` existe
- [ ] Compte `samouaaz@gmail.com` créé
- [ ] Email confirmé (`email_confirmed_at` non null)
- [ ] Profil créé avec `role = 'super_admin'`
- [ ] `is_admin = true`
- [ ] `admin_permissions` défini
- [ ] Connexion réussie dans l'app
- [ ] Bouton "Dashboard Admin" visible
- [ ] Accès au dashboard fonctionnel

---

## 🎯 Commande unique pour tout faire (CLI uniquement)

Si vous avez Supabase CLI installé :

```bash
cd /tmp/cc-agent/58601087/project
supabase link --project-ref tliwclxcgtjzaxbbfulr
supabase db push
```

Puis exécutez le script SQL pour créer votre compte admin.

---

## 📞 Besoin d'aide ?

1. Vérifiez que vous êtes sur le bon projet Supabase
2. Vérifiez votre URL : `https://tliwclxcgtjzaxbbfulr.supabase.co`
3. Consultez les logs d'erreur dans SQL Editor
4. Vérifiez que votre `.env` contient les bonnes clés

---

**Bon courage pour la restauration ! 🚀**

*Ce guide restaurera complètement votre accès admin.*

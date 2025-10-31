# 🚀 Tester le Système PRO en 3 Minutes

## ⚡ Méthode Ultra-Rapide

### Étape 1️⃣ : Créer un compte test (1 min)

Dans l'application mobile/web:
1. Cliquez sur **"S'inscrire"**
2. Remplissez:
   - Email: `testpro@example.com`
   - Mot de passe: `Test123!`
   - Nom: `Test Pro`
3. Cliquez sur **"S'inscrire"**

---

### Étape 2️⃣ : Activer le compte PRO via SQL (1 min)

1. Ouvrez **Supabase Dashboard**
2. Allez dans **SQL Editor**
3. Copiez-collez ce code:

```sql
-- REMPLACEZ UNIQUEMENT CETTE LIGNE 👇
DO $$
DECLARE
  v_email text := 'testpro@example.com';  -- 📧 VOTRE EMAIL ICI
  -- ⚠️ Ne touchez à rien d'autre ci-dessous
  v_user_id uuid;
  v_package_id uuid;
  v_category_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  SELECT id INTO v_category_id FROM categories WHERE slug = 'vehicules' LIMIT 1;
  SELECT id INTO v_package_id FROM pro_packages WHERE category_id = v_category_id LIMIT 1;

  DELETE FROM pro_subscriptions WHERE user_id = v_user_id;

  INSERT INTO pro_subscriptions (
    user_id, package_id, category_id, starts_at, expires_at,
    status, paid_amount, payment_method, payment_reference
  ) VALUES (
    v_user_id, v_package_id, v_category_id,
    now(), now() + interval '30 days',
    'active', 5000, 'test', 'TEST-001'
  );

  UPDATE profiles SET user_type = 'professional' WHERE id = v_user_id;

  RAISE NOTICE '✅ Compte PRO activé pour: %', v_email;
END $$;
```

4. Cliquez sur **"Run"** (Exécuter)

---

### Étape 3️⃣ : Tester la création de store (1 min)

1. **Reconnectez-vous** à l'application avec votre compte test
2. Allez sur l'onglet **"Stores PRO"** 🏪 (dans la navigation en bas)
3. Cliquez sur **"Créer mon Store PRO"**
4. Remplissez le formulaire:
   ```
   Nom du Store: Garage Test Pro
   Description: Spécialiste en réparation automobile
   Localisation: Alger
   Email: contact@test.dz
   Téléphone: 0555 12 34 56
   ```
5. Cliquez sur **"Créer mon Store PRO"**

✅ **C'est fait !** Votre store est créé et visible sur `/store/garage-test-pro`

---

## 🎯 Que tester maintenant ?

### Test 1: Voir votre store
- Allez sur l'onglet **"Stores PRO"**
- Votre store doit apparaître dans la liste
- Cliquez dessus pour voir la page détaillée

### Test 2: Tester sans abonnement PRO
1. Créez un autre compte (sans activer PRO)
2. Allez sur `/pro/create-store`
3. Vous devez voir: **"Abonnement PRO requis"** 🔒

### Test 3: Tester l'achat de forfait
1. Depuis l'application, allez sur **Profil** → **"Achetez un forfait PRO"**
2. Parcourez les forfaits disponibles
3. Cliquez sur **"Choisir..."** pour un forfait
4. Une modal vous propose: **"Créer mon Store"**

---

## 📊 Vérifier dans Supabase

### Voir les abonnements actifs
```sql
SELECT
  u.email,
  ps.status,
  ps.expires_at::date,
  c.name as categorie
FROM pro_subscriptions ps
JOIN auth.users u ON ps.user_id = u.id
JOIN categories c ON ps.category_id = c.id
WHERE ps.status = 'active';
```

### Voir les stores créés
```sql
SELECT
  name,
  slug,
  location,
  is_active
FROM pro_stores
ORDER BY created_at DESC;
```

---

## 🐛 Problèmes fréquents

### "Utilisateur non trouvé"
➡️ Vérifiez que vous avez bien créé le compte dans l'application d'abord

### "Aucun forfait PRO trouvé"
➡️ Exécutez cette requête pour créer des forfaits de test:
```sql
-- Créer un forfait PRO de test
INSERT INTO pro_packages (
  name, category_id, price, duration_days,
  max_listings, featured_listings, is_active
)
SELECT
  'Pack Pro Test',
  id,
  5000,
  30,
  50,
  5,
  true
FROM categories
WHERE slug = 'vehicules'
LIMIT 1;
```

### "Le formulaire ne s'affiche pas"
➡️ Vérifiez dans Supabase que:
1. Votre abonnement a `status = 'active'`
2. La date `expires_at` est dans le futur
3. Votre profil a `user_type = 'professional'`

---

## 🎓 Exemples de Stores à Créer

### Exemple 1: Garage automobile
```
Nom: Garage El Amine
Description: Spécialiste en mécanique auto, toutes marques
Localisation: Bab Ezzouar, Alger
Email: contact@garage-elamine.dz
Téléphone: 0555 12 34 56
WhatsApp: 0555 12 34 56
Site web: https://garage-elamine.dz
```

### Exemple 2: Agence immobilière
```
Nom: Immobilière Horizon
Description: Vente et location de biens immobiliers à Alger
Localisation: Hydra, Alger
Email: contact@horizon-immo.dz
Téléphone: 0661 23 45 67
WhatsApp: 0661 23 45 67
```

### Exemple 3: Magasin d'électronique
```
Nom: TechZone Algérie
Description: Vente de smartphones, laptops et accessoires
Localisation: Kouba, Alger
Email: info@techzone.dz
Téléphone: 0770 98 76 54
Site web: https://techzone.dz
```

---

## ✅ Checklist de Test

Cochez ce que vous avez testé:

- [ ] Compte test créé
- [ ] Abonnement PRO activé via SQL
- [ ] Page `/pro/create-store` accessible
- [ ] Formulaire de création affiché
- [ ] Store créé avec succès
- [ ] Store visible dans la liste "Stores PRO"
- [ ] Page détaillée `/store/[slug]` accessible
- [ ] Test sans abonnement (message de blocage)
- [ ] Badge PRO visible sur le store
- [ ] Coordonnées correctement affichées

---

## 🎉 Félicitations !

Si tous les tests passent, votre système PRO est **100% fonctionnel** !

**Prochaines étapes:**
1. Tester avec plusieurs catégories
2. Tester l'expiration d'abonnement
3. Ajouter des annonces en tant que PRO
4. Personnaliser le store (logo, bannière)

---

## 💡 Astuces

### Changer de catégorie
Pour tester avec une autre catégorie (ex: Immobilier):
```sql
UPDATE pro_subscriptions
SET category_id = (SELECT id FROM categories WHERE slug = 'immobilier' LIMIT 1)
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testpro@example.com');
```

### Prolonger l'abonnement
```sql
UPDATE pro_subscriptions
SET expires_at = now() + interval '60 days'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testpro@example.com');
```

### Supprimer un store (pour retester)
```sql
DELETE FROM pro_stores
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testpro@example.com');
```

---

**Besoin d'aide ?** Consultez `GUIDE_TEST_SYSTEM_PRO.md` pour plus de détails !

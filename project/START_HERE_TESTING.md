# 🎯 COMMENCER ICI - Test du Système PRO

## 📝 Ce dont vous avez besoin

1. ✅ Votre application Buy&Go lancée
2. ✅ Accès à Supabase Dashboard
3. ✅ 3 minutes de votre temps

---

## 🚀 3 ÉTAPES SIMPLES

### 1️⃣ Créez un compte dans l'application

Inscrivez-vous avec:
- **Email:** `testpro@example.com`
- **Mot de passe:** `Test123!`

---

### 2️⃣ Activez le PRO dans Supabase

Ouvrez **Supabase > SQL Editor** et exécutez:

```sql
DO $$
DECLARE
  v_user_id uuid;
  v_package_id uuid;
  v_category_id uuid;
BEGIN
  -- Trouvez votre utilisateur
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'testpro@example.com';  -- 👈 CHANGEZ L'EMAIL ICI

  -- Trouvez une catégorie et un forfait
  SELECT id INTO v_category_id FROM categories WHERE slug = 'vehicules' LIMIT 1;
  SELECT id INTO v_package_id FROM pro_packages WHERE category_id = v_category_id LIMIT 1;

  -- Activez l'abonnement PRO
  DELETE FROM pro_subscriptions WHERE user_id = v_user_id;
  INSERT INTO pro_subscriptions (
    user_id, package_id, category_id, starts_at, expires_at,
    status, paid_amount, payment_method, payment_reference
  ) VALUES (
    v_user_id, v_package_id, v_category_id,
    now(), now() + interval '30 days',
    'active', 5000, 'test', 'TEST-001'
  );

  -- Mettez à jour le profil
  UPDATE profiles SET user_type = 'professional' WHERE id = v_user_id;

  RAISE NOTICE '✅ COMPTE PRO ACTIVÉ !';
END $$;
```

---

### 3️⃣ Créez votre Store PRO

Dans l'application:
1. Allez sur l'onglet **"Stores PRO"** 🏪
2. Cliquez **"Créer mon Store PRO"**
3. Remplissez:
   - Nom: `Garage Test`
   - Description: `Test de garage`
   - Email: `contact@test.dz`
   - Téléphone: `0555123456`
4. Cliquez **"Créer mon Store PRO"**

---

## ✅ C'EST FAIT !

Votre store est maintenant:
- ✅ Créé dans la base de données
- ✅ Visible dans l'onglet "Stores PRO"
- ✅ Accessible via URL: `/store/garage-test`

---

## 🧪 Tests Supplémentaires

### Test sans abonnement PRO
1. Créez un 2ème compte (sans activer PRO)
2. Allez sur `/pro/create-store`
3. ➡️ Vous devez voir "Abonnement PRO requis" 🔒

### Voir votre store
1. Onglet "Stores PRO"
2. Votre store doit apparaître
3. Cliquez pour voir la page détaillée

---

## 📚 Documentation Complète

Pour plus de détails, consultez:

1. **`TESTER_RAPIDEMENT.md`** - Guide complet avec exemples
2. **`GUIDE_TEST_SYSTEM_PRO.md`** - Documentation détaillée
3. **`ARCHITECTURE_STORES_PRO.md`** - Architecture technique
4. **`ACTIVER_COMPTE_PRO_TEST.sql`** - Script SQL commenté

---

## 🆘 Problèmes ?

### Le script SQL ne fonctionne pas ?

Vérifiez que:
- Vous avez bien créé le compte d'abord
- L'email dans le script correspond exactement
- Vous êtes connecté à la bonne base Supabase

### Le formulaire ne s'affiche pas ?

1. Reconnectez-vous à l'application
2. Vérifiez dans Supabase:
```sql
SELECT * FROM pro_subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'testpro@example.com');
```
3. Status doit être 'active' et expires_at dans le futur

---

## 🎉 Tout fonctionne ?

**Félicitations !** Votre système de Stores PRO est opérationnel !

Vous pouvez maintenant:
- Créer plusieurs stores de test
- Tester différentes catégories
- Ajouter des annonces en tant que PRO
- Personnaliser les stores

---

**Questions ?** Lisez `GUIDE_TEST_SYSTEM_PRO.md` pour plus d'aide !

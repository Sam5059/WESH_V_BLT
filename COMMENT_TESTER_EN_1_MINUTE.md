# ⚡ Tester en 1 Minute

## 🎯 Ce que vous devez faire

### 1. Créer un compte (30 secondes)

Dans l'application:
- Email: `testpro@test.com`
- Mot de passe: `Test123!`
- Cliquez "S'inscrire"

---

### 2. Activer le PRO (30 secondes)

Ouvrez **Supabase > SQL Editor** et collez:

```sql
DO $$
DECLARE
  v_user_id uuid;
  v_package_id uuid;
  v_category_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'testpro@test.com';
  SELECT id INTO v_category_id FROM categories WHERE slug = 'vehicules' LIMIT 1;
  SELECT id INTO v_package_id FROM pro_packages WHERE category_id = v_category_id LIMIT 1;

  DELETE FROM pro_subscriptions WHERE user_id = v_user_id;

  INSERT INTO pro_subscriptions (
    user_id, package_id, category_id, starts_at, expires_at,
    status, paid_amount, payment_method, payment_reference
  ) VALUES (
    v_user_id, v_package_id, v_category_id, now(), now() + interval '30 days',
    'active', 5000, 'test', 'TEST-001'
  );

  UPDATE profiles SET user_type = 'professional' WHERE id = v_user_id;
END $$;
```

Cliquez **"Run"** ▶️

---

### 3. Créer le store (30 secondes)

Dans l'application:
1. Reconnectez-vous
2. Onglet **"Stores PRO"** 🏪
3. **"Créer mon Store PRO"**
4. Remplissez:
   - Nom: `Test Store`
   - Description: `Mon store de test`
   - Email: `test@test.com`
   - Téléphone: `0555123456`
5. **"Créer mon Store PRO"**

---

## ✅ C'EST FAIT !

Votre store est créé et visible dans la liste des stores !

---

## 🆘 Ça ne marche pas ?

### Le script SQL échoue ?
➡️ Changez l'email dans le script (ligne avec `testpro@test.com`)

### Le formulaire ne s'affiche pas ?
➡️ Reconnectez-vous à l'application après le script SQL

### "Aucun forfait PRO trouvé" ?
➡️ Consultez `GUIDE_TEST_SYSTEM_PRO.md` section "Problèmes"

---

**Plus de détails ?** → `START_HERE_TESTING.md`

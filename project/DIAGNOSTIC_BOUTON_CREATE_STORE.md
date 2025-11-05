# 🔍 Diagnostic: Bouton "Créer mon Store PRO" ne fonctionne pas

## ✅ Solutions Rapides

### Solution 1: Vérifier la console du navigateur

1. **Ouvrez la console** (F12 ou Clic droit > Inspecter > Console)
2. **Cliquez sur le bouton** "Créer mon Store PRO"
3. **Regardez les logs** qui apparaissent

Vous devriez voir:
```
=== DÉBUT CRÉATION STORE ===
Store name: Garage sam
Description: test
Contact phone: 0551555510
Active subscription: {...}
Slug généré: garage-sam
...
```

**Si vous voyez une erreur**, notez-la et continuez ci-dessous.

---

### Solution 2: Vérifier que la table existe

**Allez dans Supabase > SQL Editor** et exécutez:

```sql
-- Vérifier que la table pro_stores existe
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'pro_stores';
```

**Résultat attendu:**
```
table_name
-----------
pro_stores
```

**Si la table n'existe PAS:**
➡️ Exécutez le fichier **`VERIFIER_TABLE_PRO_STORES.sql`**

---

### Solution 3: Vérifier votre abonnement PRO

```sql
-- Remplacez par votre email
SELECT
  ps.id,
  ps.status,
  ps.expires_at,
  ps.category_id,
  c.name as category_name,
  CASE
    WHEN ps.expires_at > now() THEN '✅ Actif'
    ELSE '❌ Expiré'
  END as etat
FROM pro_subscriptions ps
JOIN categories c ON ps.category_id = c.id
JOIN auth.users u ON ps.user_id = u.id
WHERE u.email = 'VOTRE_EMAIL@example.com'
ORDER BY ps.created_at DESC
LIMIT 1;
```

**Résultat attendu:**
- `status` = 'active'
- `etat` = '✅ Actif'
- `expires_at` dans le futur

**Si l'abonnement est expiré ou n'existe pas:**
➡️ Exécutez **`SCRIPT_SIMPLE_PRO.sql`** pour en créer un

---

### Solution 4: Vérifier les permissions RLS

```sql
-- Vérifier les policies de la table pro_stores
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'pro_stores';
```

**Si aucune policy n'existe:**
➡️ Exécutez **`VERIFIER_TABLE_PRO_STORES.sql`**

---

### Solution 5: Tester manuellement l'insertion

```sql
-- Remplacez USER_ID et CATEGORY_ID
INSERT INTO pro_stores (
  user_id,
  name,
  slug,
  description,
  location,
  contact_email,
  contact_phone,
  category_id,
  is_active
) VALUES (
  'VOTRE_USER_ID',  -- ⚠️ CHANGEZ ICI
  'Test Store Manual',
  'test-store-manual',
  'Test de création manuelle',
  'Alger',
  'test@test.com',
  '0555123456',
  'VOTRE_CATEGORY_ID',  -- ⚠️ CHANGEZ ICI
  true
);
```

**Si cette requête fonctionne:**
➡️ Le problème vient du frontend, regardez la console

**Si cette requête échoue:**
➡️ Le problème vient des permissions, exécutez `VERIFIER_TABLE_PRO_STORES.sql`

---

## 🐛 Erreurs Communes

### Erreur: "permission denied for table pro_stores"

**Solution:**
```sql
-- Activer RLS et créer les policies
ALTER TABLE pro_stores ENABLE ROW LEVEL SECURITY;

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
```

---

### Erreur: "null value in column user_id violates not-null constraint"

**Cause:** Vous n'êtes pas connecté ou le user_id n'est pas passé

**Solution:**
1. Vérifiez que vous êtes connecté
2. Reconnectez-vous à l'application
3. Vérifiez dans la console: `console.log('User ID:', user?.id)`

---

### Erreur: "duplicate key value violates unique constraint pro_stores_slug_key"

**Cause:** Un store avec ce nom existe déjà

**Solution:**
1. Changez le nom du store
2. Ou supprimez l'ancien:
```sql
DELETE FROM pro_stores WHERE slug = 'garage-sam';
```

---

### Erreur: "insert or update on table pro_stores violates foreign key constraint"

**Cause:** La category_id n'existe pas

**Solution:**
```sql
-- Vérifier les catégories disponibles
SELECT id, name, slug FROM categories WHERE parent_id IS NULL;

-- Si aucune catégorie, en créer une
INSERT INTO categories (name, slug, parent_id, order_position)
VALUES ('Véhicules', 'vehicules', NULL, 1);
```

---

## 🔬 Diagnostic Approfondi

### Étape 1: Activer les logs détaillés

Le code a maintenant des `console.log` partout. Regardez la console du navigateur pendant que vous cliquez sur le bouton.

### Étape 2: Vérifier l'état de l'application

Dans la console du navigateur, tapez:
```javascript
// Vérifier si le user existe
console.log('User:', user);

// Vérifier si l'abonnement existe
console.log('Active subscription:', activeSubscription);

// Vérifier l'état du bouton
console.log('Saving:', saving);
```

### Étape 3: Vérifier la requête réseau

1. Ouvrez l'onglet **Network** dans les DevTools
2. Cliquez sur le bouton "Créer mon Store PRO"
3. Regardez les requêtes qui partent
4. Cliquez sur la requête vers Supabase
5. Regardez la réponse

---

## 📋 Checklist Complète

Avant de créer un store, vérifiez:

- [ ] Table `pro_stores` existe
- [ ] RLS activé sur `pro_stores`
- [ ] Policies créées
- [ ] Abonnement PRO actif (status='active')
- [ ] Date d'expiration dans le futur
- [ ] Catégorie existe
- [ ] Utilisateur connecté
- [ ] Tous les champs obligatoires remplis

---

## 🆘 Si Rien ne Fonctionne

### Option 1: Recréer la table complètement

```sql
-- ⚠️ ATTENTION: Supprime tous les stores existants
DROP TABLE IF EXISTS pro_stores CASCADE;

-- Puis exécutez VERIFIER_TABLE_PRO_STORES.sql
```

### Option 2: Vérifier les migrations Supabase

Allez dans **Supabase > Database > Migrations**

Cherchez une migration contenant `pro_stores`.

Si aucune migration n'existe, la table n'a pas été créée.

**Solution:** Exécutez `VERIFIER_TABLE_PRO_STORES.sql`

---

## 📞 Support

Si le problème persiste après avoir essayé toutes ces solutions:

1. Copiez les logs de la console
2. Copiez le message d'erreur exact
3. Vérifiez que vous avez bien exécuté:
   - ✅ `SCRIPT_SIMPLE_PRO.sql` (activer compte PRO)
   - ✅ `VERIFIER_TABLE_PRO_STORES.sql` (créer table)

---

**Conseil:** Commencez par la **Solution 1** (vérifier la console) pour voir exactement où ça bloque !

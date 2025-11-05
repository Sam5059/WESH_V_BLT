# 🔧 Guide de Test : Bouton "Choisir PRO"

## 🎯 Objectif
Tester et déboguer le bouton "Choisir Pro Basic" dans la page `/pro/packages`

---

## ✅ MÉTHODE 1 : Test Automatique via SQL (Recommandé)

### Étape 1 : Exécuter le script SQL

1. **Ouvrez Supabase Dashboard** → SQL Editor
2. **Copiez-collez** le contenu du fichier `CREER_COMPTE_PRO_TEST.sql`
3. **Exécutez** le script (bouton "Run")

### Résultat Attendu

Vous verrez dans les logs :
```
====================================
✅ COMPTE PRO CRÉÉ AVEC SUCCÈS !
====================================

📋 INFORMATIONS DE CONNEXION :
   Email    : pro.test.12345@buygo.dz
   Password : Test123!

🔗 LIENS UTILES :
   Dashboard PRO : /pro/dashboard
   Mon Store     : /pro/store-test-12345
   Tous les stores : /stores
====================================
```

### Étape 2 : Se connecter

1. Allez sur `/login`
2. Connectez-vous avec l'email et le mot de passe affichés
3. Allez sur `/stores` pour voir votre store
4. Allez sur `/pro/dashboard` pour gérer votre compte PRO

---

## 🐛 MÉTHODE 2 : Déboguer le Bouton (Si ça ne marche pas)

### Diagnostic Étape par Étape

#### 1. Vérifier que vous êtes connecté

```javascript
// Ouvrez la console du navigateur (F12)
// Dans l'onglet Console, tapez :
localStorage.getItem('supabase.auth.token')
```

**Si `null`** → Vous n'êtes pas connecté, allez sur `/login`

#### 2. Vérifier la fonction RPC

```sql
-- Dans Supabase SQL Editor :
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'activate_pro_subscription';
```

**Si vide** → La fonction n'existe pas, appliquez la migration `20251015110000_complete_pro_system_backend.sql`

#### 3. Tester la fonction manuellement

```sql
-- Récupérer votre user_id
SELECT id, email FROM auth.users WHERE email = 'votre.email@test.com';

-- Récupérer un package_id
SELECT id, name, category_id FROM pro_packages WHERE name LIKE '%Basic%' LIMIT 1;

-- Tester la fonction
SELECT activate_pro_subscription(
  p_user_id := 'VOTRE_USER_ID'::uuid,
  p_package_id := 'PACKAGE_ID'::uuid,
  p_payment_method := 'test',
  p_payment_reference := 'TEST-123'
);
```

**Résultat attendu** :
```json
{
  "success": true,
  "subscription_id": "abc-123-...",
  "expires_at": "2025-11-17T..."
}
```

#### 4. Vérifier les logs du navigateur

Quand vous cliquez sur "Choisir Pro Basic" :

```javascript
// Dans la console (F12), vous devez voir :
handleSubscribe called with package: ...
Current user: ...
Showing confirmation dialog
```

**Si vous ne voyez rien** :
- Le bouton n'est pas correctement attaché
- Vérifiez le code dans `app/pro/packages.tsx` ligne 107

#### 5. Vérifier les permissions RLS

```sql
-- Vérifier les policies de la table pro_subscriptions
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'pro_subscriptions';
```

---

## 🚀 MÉTHODE 3 : Test Manuel Complet

### Étape 1 : Créer un compte utilisateur

1. Allez sur `/register`
2. Remplissez le formulaire :
   - **Email** : `test.vendeur@gmail.com`
   - **Password** : `Test123!`
   - **Nom complet** : `Test Vendeur`
   - **Téléphone** : `0555123456`
3. Cliquez sur "S'inscrire"

### Étape 2 : Aller sur la page Packages

1. **Une fois connecté**, cliquez sur l'onglet "Profile" en bas
2. Cherchez le bouton "Passer PRO" ou allez directement sur `/pro/packages`

### Étape 3 : Choisir un package

1. **Scrollez** pour voir les packages disponibles
2. **Cliquez** sur "Choisir Pro Basic" (premier package)
3. **Une popup apparaît** : "Voulez-vous souscrire à..."
4. **Cliquez** sur "Confirmer"

### Étape 4 : Vérifier l'activation

**Si ça marche** :
- Une nouvelle popup apparaît : "Votre abonnement PRO est activé !"
- Deux options : "Plus tard" ou "Créer mon Store"
- Cliquez sur "Créer mon Store"

**Si ça ne marche pas** :
- Ouvrez la console (F12)
- Regardez les erreurs en rouge
- Copiez-collez l'erreur et cherchez la solution

---

## 🔍 VÉRIFICATIONS POST-ACTIVATION

### Vérifier votre statut PRO

```sql
SELECT
  u.email,
  pr.user_type,
  pr.pro_expires_at,
  pr.pro_listings_remaining,
  pk.name as package_name
FROM auth.users u
LEFT JOIN profiles pr ON pr.id = u.id
LEFT JOIN pro_packages pk ON pk.id = pr.pro_package_id
WHERE u.email = 'votre.email@test.com';
```

**Résultat attendu** :
```
user_type: "professional"
pro_expires_at: "2025-11-17..."
pro_listings_remaining: 15 (ou selon le package)
package_name: "Pro Basic"
```

### Vérifier votre abonnement

```sql
SELECT
  s.id,
  s.status,
  s.expires_at,
  s.listings_used,
  pk.name as package_name,
  c.name as category_name
FROM pro_subscriptions s
LEFT JOIN pro_packages pk ON pk.id = s.package_id
LEFT JOIN categories c ON c.id = s.category_id
WHERE s.user_id = (SELECT id FROM auth.users WHERE email = 'votre.email@test.com')
ORDER BY s.created_at DESC
LIMIT 1;
```

**Résultat attendu** :
```
status: "active"
expires_at: date dans 30 jours
listings_used: 0
package_name: "Pro Basic"
category_name: "Véhicules" (ou autre)
```

---

## ❌ PROBLÈMES FRÉQUENTS ET SOLUTIONS

### 1. "Pas de user connecté"
**Cause** : Vous n'êtes pas connecté
**Solution** : Allez sur `/login` et connectez-vous

### 2. "Function activate_pro_subscription does not exist"
**Cause** : La migration n'a pas été appliquée
**Solution** : Appliquez la migration `20251015110000_complete_pro_system_backend.sql`

### 3. "Package not found"
**Cause** : Aucun package PRO n'existe en base
**Solution** : Exécutez la migration `20251015140000_add_all_category_packages.sql`

### 4. Le bouton ne fait rien
**Cause** : Problème JavaScript
**Solution** :
- Ouvrez la console (F12)
- Cherchez les erreurs JavaScript en rouge
- Rechargez la page (Ctrl+F5)

### 5. "Permission denied"
**Cause** : Problème de RLS
**Solution** : Vérifiez les policies sur `pro_subscriptions`

---

## 🎉 SUCCÈS !

Une fois que tout fonctionne, vous devriez pouvoir :

1. ✅ Cliquer sur "Choisir Pro Basic"
2. ✅ Voir la popup de confirmation
3. ✅ Confirmer et voir "Abonnement activé"
4. ✅ Cliquer sur "Créer mon Store"
5. ✅ Remplir le formulaire de création de store
6. ✅ Voir votre store sur `/pro/votre-slug`
7. ✅ Voir votre store dans l'onglet "Stores PRO"

---

## 📞 BESOIN D'AIDE ?

Si rien ne fonctionne après tous ces tests :

1. **Exportez les logs** de la console (F12)
2. **Copiez l'erreur SQL** si elle apparaît
3. **Vérifiez les migrations** appliquées dans Supabase
4. **Testez avec le script SQL** `CREER_COMPTE_PRO_TEST.sql`

Le script SQL est la méthode la plus fiable car elle ne dépend pas de l'interface utilisateur.

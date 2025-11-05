# 🛡️ Guide Complet: Créer et Gérer les Admins Buy&Go

## 📋 Table des Matières

1. [Créer un Compte Admin](#créer-un-compte-admin)
2. [Méthodes de Promotion](#méthodes-de-promotion)
3. [Fonctions SQL Pratiques](#fonctions-sql-pratiques)
4. [Vérification et Tests](#vérification-et-tests)
5. [Rôles et Permissions](#rôles-et-permissions)
6. [Accès au Dashboard](#accès-au-dashboard)

---

## 🎯 Créer un Compte Admin

### Méthode 1: Promouvoir un Utilisateur Existant (Recommandé)

**Étape 1: Créer un compte utilisateur**
1. Ouvrez l'application Buy&Go
2. Allez sur l'écran d'inscription
3. Créez un compte avec email/mot de passe
4. Notez l'email utilisé (exemple: `admin@buygo.dz`)

**Étape 2: Promouvoir en Admin**

Ouvrez le **SQL Editor** dans Supabase Dashboard et exécutez:

```sql
-- Promouvoir en Admin
SELECT promote_user_to_admin('admin@buygo.dz');
```

✅ Résultat attendu:
```
SUCCESS: User admin@buygo.dz promoted from user to admin
```

---

### Méthode 2: Promotion Manuelle via SQL

Si vous préférez le faire manuellement:

```sql
-- Promouvoir en Admin
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@buygo.dz'
);
```

Ou promouvoir en Modérateur:

```sql
-- Promouvoir en Modérateur
UPDATE profiles
SET role = 'moderator'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'moderateur@buygo.dz'
);
```

---

### Méthode 3: Créer un Admin Directement (Avancé)

**Via Supabase Dashboard:**

1. Allez dans `Authentication` → `Users`
2. Cliquez `Add User`
3. Remplissez:
   - Email: `admin@buygo.dz`
   - Password: (votre mot de passe sécurisé)
   - Auto Confirm User: ✅ Coché
4. Cliquez `Create User`
5. Notez l'ID utilisateur créé

**Puis exécutez ce SQL:**

```sql
-- Mettre à jour le profil créé automatiquement
UPDATE profiles
SET
  role = 'admin',
  full_name = 'Administrateur Principal'
WHERE id = 'ID_UTILISATEUR_CRÉÉ';
```

---

## ⚡ Méthodes de Promotion

### Fonctions SQL Pratiques

Buy&Go inclut des fonctions SQL pour faciliter la gestion:

#### 1. Promouvoir en Admin

```sql
SELECT promote_user_to_admin('email@exemple.com');
```

**Retourne:**
- ✅ `SUCCESS: User email@exemple.com promoted from user to admin`
- ❌ `ERROR: User not found with email: email@exemple.com`

---

#### 2. Promouvoir en Modérateur

```sql
SELECT promote_user_to_moderator('email@exemple.com');
```

---

#### 3. Rétrograder en Utilisateur

```sql
SELECT demote_user_to_user('email@exemple.com');
```

---

#### 4. Lister tous les Admins

```sql
SELECT * FROM list_admins();
```

**Résultat:**
| user_id | email | full_name | role | user_type | created_at |
|---------|-------|-----------|------|-----------|------------|
| uuid-1 | admin@buygo.dz | Admin | admin | professional | 2025-10-07 |
| uuid-2 | mod@buygo.dz | Modérateur | moderator | individual | 2025-10-07 |

---

## 🔍 Vérification et Tests

### Vérifier les Admins Actuels

```sql
SELECT
  p.id,
  u.email,
  p.full_name,
  p.role,
  p.user_type,
  p.is_banned,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('admin', 'moderator')
ORDER BY p.role, p.created_at DESC;
```

---

### Vérifier un Utilisateur Spécifique

```sql
SELECT
  p.id,
  u.email,
  p.full_name,
  p.role,
  p.user_type
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@buygo.dz';
```

---

### Statistiques des Rôles

```sql
SELECT
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;
```

**Résultat attendu:**
| role | count |
|------|-------|
| user | 1234 |
| admin | 2 |
| moderator | 5 |

---

## 👥 Rôles et Permissions

### Les 3 Rôles Disponibles

#### 🔵 User (Utilisateur Standard)
- Publier des annonces (limitées si non-PRO)
- Envoyer des messages
- Signaler des annonces
- Gérer son profil

#### 🟡 Moderator (Modérateur)
- **Toutes les permissions User**
- ✅ Accès Dashboard Admin
- ✅ Voir et gérer les signalements
- ✅ Approuver/Rejeter signalements
- ✅ Bannir des utilisateurs
- ✅ Masquer des annonces
- ✅ Consulter logs de modération
- ❌ Gérer les packages PRO
- ❌ Gérer les admins

#### 🔴 Admin (Administrateur)
- **Toutes les permissions Moderator**
- ✅ Accès complet Dashboard
- ✅ Gérer les utilisateurs
- ✅ Promouvoir/Rétrograder rôles
- ✅ Gérer les packages PRO
- ✅ Modifier les prix
- ✅ Voir toutes les statistiques
- ✅ Accès aux paramètres système
- ✅ Gérer les mots-clés bloqués

---

### Tableau des Permissions

| Fonctionnalité | User | Moderator | Admin |
|----------------|:----:|:---------:|:-----:|
| **Navigation** |
| Dashboard Admin | ❌ | ✅ | ✅ |
| Page Modération | ❌ | ✅ | ✅ |
| **Modération** |
| Voir signalements | ❌ | ✅ | ✅ |
| Approuver/Rejeter | ❌ | ✅ | ✅ |
| Bannir utilisateurs | ❌ | ✅ | ✅ |
| Masquer annonces | ❌ | ✅ | ✅ |
| **Administration** |
| Gérer utilisateurs | ❌ | ❌ | ✅ |
| Promouvoir admins | ❌ | ❌ | ✅ |
| Gérer packages PRO | ❌ | ❌ | ✅ |
| Modifier tarifs | ❌ | ❌ | ✅ |
| Analytics complètes | ❌ | ❌ | ✅ |
| Paramètres système | ❌ | ❌ | ✅ |
| **Autres** |
| Publier annonces | ✅ | ✅ | ✅ |
| Envoyer messages | ✅ | ✅ | ✅ |
| Signaler annonces | ✅ | ✅ | ✅ |

---

## 🚀 Accès au Dashboard

### Pour les Admins/Modérateurs

**Méthode 1: Via Profil**

1. Connectez-vous avec votre compte admin
2. Allez dans l'onglet **Profil** (en bas)
3. Cliquez sur l'onglet **Paramètres**
4. Vous verrez le bouton **🛡️ Dashboard Admin** (bleu)
5. Cliquez dessus

**Méthode 2: Navigation Directe**

Si vous connaissez l'URL:
```
/admin/dashboard
```

---

### Vérification du Bouton

Le bouton "Dashboard Admin" s'affiche **uniquement si:**
- ✅ `profile.role === 'admin'` **OU**
- ✅ `profile.role === 'moderator'`

Si vous ne voyez pas le bouton:
1. Vérifiez votre rôle dans la DB
2. Déconnectez-vous et reconnectez-vous
3. Videz le cache de l'app

---

## 🔐 Sécurité et Bonnes Pratiques

### ✅ Bonnes Pratiques

1. **Minimisez les Admins**
   - Créez seulement le nombre nécessaire
   - 1-2 admins + quelques modérateurs suffisent

2. **Mots de Passe Forts**
   - Utilisez des mots de passe complexes
   - Minimum 12 caractères
   - Majuscules, minuscules, chiffres, symboles

3. **Emails Dédiés**
   - Utilisez des emails professionnels
   - Exemple: `admin@buygo.dz`, `moderation@buygo.dz`

4. **Audit Régulier**
   - Listez les admins mensuellement
   - Supprimez les comptes inactifs
   - Vérifiez les logs de modération

5. **Rôles Appropriés**
   - Modérateur pour la modération quotidienne
   - Admin seulement pour les tâches critiques

---

### ❌ À Éviter

- ❌ Partager les identifiants admin
- ❌ Créer des admins pour tous les employés
- ❌ Utiliser des mots de passe faibles
- ❌ Laisser des admins inactifs
- ❌ Promouvoir sans vérification

---

## 📊 Monitoring et Logs

### Voir les Actions de Modération

```sql
SELECT
  ma.created_at,
  p.full_name as moderator,
  ma.target_type,
  ma.action,
  ma.reason
FROM moderation_actions ma
JOIN profiles p ON p.id = ma.moderator_id
ORDER BY ma.created_at DESC
LIMIT 50;
```

---

### Statistiques de Modération par Admin

```sql
SELECT
  p.full_name as moderator,
  p.role,
  COUNT(*) as total_actions,
  COUNT(CASE WHEN ma.action = 'ban' THEN 1 END) as bans,
  COUNT(CASE WHEN ma.action = 'approve' THEN 1 END) as approvals
FROM moderation_actions ma
JOIN profiles p ON p.id = ma.moderator_id
WHERE ma.created_at > NOW() - INTERVAL '30 days'
GROUP BY p.id, p.full_name, p.role
ORDER BY total_actions DESC;
```

---

## 🆘 Dépannage

### Problème: Le bouton Dashboard n'apparaît pas

**Solution:**
```sql
-- Vérifier le rôle
SELECT role FROM profiles WHERE id = auth.uid();

-- Si NULL ou 'user', promouvoir:
SELECT promote_user_to_admin('votre-email@exemple.com');

-- Déconnectez-vous et reconnectez-vous
```

---

### Problème: "Accès refusé" au Dashboard

**Solution:**
```sql
-- Vérifier le profil
SELECT * FROM profiles WHERE id = auth.uid();

-- Assurez-vous que role = 'admin' ou 'moderator'
```

---

### Problème: Oublié le mot de passe admin

**Solution:**
1. Dans Supabase Dashboard → Authentication → Users
2. Trouvez l'utilisateur
3. Cliquez `...` → `Reset Password`
4. Entrez nouveau mot de passe
5. Cliquez `Update User`

---

## 📝 Checklist de Création Admin

- [ ] Créer compte utilisateur dans l'app
- [ ] Noter l'email utilisé
- [ ] Exécuter `SELECT promote_user_to_admin('email')`
- [ ] Vérifier avec `SELECT * FROM list_admins()`
- [ ] Se déconnecter/reconnecter
- [ ] Aller dans Profil → Paramètres
- [ ] Vérifier présence bouton "Dashboard Admin"
- [ ] Cliquer et vérifier accès Dashboard
- [ ] Tester accès page Modération
- [ ] Documenter l'admin créé (nom, email, date)

---

## 🎓 Exemple Complet

```sql
-- 1. Créer 3 admins
SELECT promote_user_to_admin('admin@buygo.dz');
SELECT promote_user_to_admin('admin2@buygo.dz');

-- 2. Créer 2 modérateurs
SELECT promote_user_to_moderator('mod1@buygo.dz');
SELECT promote_user_to_moderator('mod2@buygo.dz');

-- 3. Vérifier
SELECT * FROM list_admins();

-- 4. Voir statistiques
SELECT
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role;
```

**Résultat:**
| role | count |
|------|-------|
| user | 1234 |
| moderator | 2 |
| admin | 2 |

---

## 📞 Support

Si vous avez des questions ou problèmes:

1. Vérifiez ce guide
2. Consultez les logs Supabase
3. Testez les requêtes SQL de vérification
4. Vérifiez les permissions RLS

---

**Dernière mise à jour:** 7 octobre 2025
**Version:** 1.0
**Statut:** Production Ready ✅

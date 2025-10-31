# 🔐 ACCÈS DASHBOARD ADMIN - GUIDE COMPLET

## ✅ PROBLÈME RÉSOLU

Le dashboard de gestion des utilisateurs est **déjà intégré** dans le dashboard admin principal !

---

## 📍 COMMENT Y ACCÉDER

### Étape 1: Lancer le serveur dev
```bash
npm run dev
```

### Étape 2: Accéder au dashboard principal
```
http://localhost:8081/admin/dashboard
```

### Étape 3: Cliquer sur "Utilisateurs"
Dans le dashboard, il y a une carte "Utilisateurs" avec l'icône 👥

### URL directe (alternative)
```
http://localhost:8081/admin/users
```

---

## 🎯 STRUCTURE DE NAVIGATION

```
/(tabs)/
  └── index (Accueil)

/admin/
  ├── dashboard       ← POINT D'ENTRÉE PRINCIPAL
  │   └── Bouton "Utilisateurs" →  /admin/users
  │
  ├── users           ← GESTION DES UTILISATEURS ✨
  ├── moderation      ← Modération annonces
  ├── financial-stats ← Statistiques financières
  └── ...
```

---

## 🔑 PRÉREQUIS D'ACCÈS

### 1. Être connecté
Vous devez être authentifié dans l'application

### 2. Avoir le rôle admin
Votre compte doit avoir `role = 'admin'` ou `'super_admin'` dans la table `admin_roles`

---

## 🚀 CRÉER VOTRE PREMIER SUPER ADMIN

### Option A: Via SQL (Dashboard Supabase)

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Menu: SQL Editor
4. Exécutez:

```sql
-- Remplacez par VOTRE email
SELECT assign_admin_role('votre-email@exemple.com', 'super_admin');
```

5. Vérifiez:

```sql
SELECT email, role FROM admin_roles
JOIN profiles ON admin_roles.user_id = profiles.id;
```

### Option B: Via fonction directe

```sql
-- Insérer directement dans admin_roles
INSERT INTO admin_roles (user_id, role, updated_at)
SELECT id, 'super_admin', NOW()
FROM profiles
WHERE email = 'votre-email@exemple.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
```

---

## ✨ FONCTIONNALITÉS DU DASHBOARD USERS

### Ce qui a été AMÉLIORÉ aujourd'hui:

#### ✅ Gestion des rôles via `admin_roles`
- **Avant:** Simple toggle Admin/User
- **Après:** 3 rôles complets (User/Admin/Super Admin)
- Via fonction `assign_admin_role()`

#### ✅ Chargement des rôles
- Lecture depuis table `admin_roles`
- Combinaison avec profils
- Affichage badge coloré

#### ✅ Changement de rôle
- Cliquer sur l'utilisateur
- Choisir: User / Admin / Super Admin
- Confirmation immédiate

---

## 🎨 INTERFACE

### Liste des utilisateurs
```
┌─────────────────────────────────────┐
│ [←] Gestion des Comptes    [↻]     │
│     127 utilisateurs                │
├─────────────────────────────────────┤
│ 🔍 Rechercher...                    │
│ [Tous] [👑 Admins] [Pros] [Bannis] │
├─────────────────────────────────────┤
│ Jean Dupont                         │
│ jean@exemple.com                    │
│ [👑 Admin] [Pro]              🛡️   │
├─────────────────────────────────────┤
│ Marie Martin                        │
│ marie@exemple.com                   │
│ [User]                        🛡️   │
└─────────────────────────────────────┘
```

### Actions disponibles
- 🔒 Réinitialiser mot de passe
- ✉️ Envoyer email de réinit
- 👑 Changer rôle (User/Admin/Super Admin) ✨ NOUVEAU
- 🚫 Bannir / Débannir
- 🗑️ Supprimer compte

---

## 🔐 RÔLES ET PERMISSIONS

### user
- Utilisateur standard
- Peut publier des annonces
- Aucun accès admin

### admin
- Accès dashboard admin
- Gérer utilisateurs
- Modérer annonces
- Voir statistiques

### super_admin
- Tous les droits admin
- Créer d'autres admins
- Créer super admins
- Gérer système

---

## 📝 CODE MODIFIÉ

### Fichier: `app/admin/users.tsx`

**Lignes modifiées:**
- L74-118: `loadUsers()` - Charge rôles depuis `admin_roles`
- L170-243: `handleChangeRole()` - Nouveau système à 3 rôles

**Nouveautés:**
```typescript
// Charger rôles depuis admin_roles
const { data: roles } = await supabase
  .from('admin_roles')
  .select('user_id, role');

// Combiner avec profiles
const usersWithRoles = profiles.map(profile => ({
  ...profile,
  role: roles?.find(r => r.user_id === profile.id)?.role || 'user'
}));

// Changer le rôle via RPC
const { data } = await supabase.rpc('assign_admin_role', {
  p_user_email: user.email,
  p_role: 'super_admin' // ou 'admin' ou 'user'
});
```

---

## 🧪 TESTS À EFFECTUER

### 1. Accès au dashboard
```
✅ Ouvrir http://localhost:8081/admin/dashboard
✅ Voir les statistiques
✅ Cliquer sur carte "Utilisateurs"
✅ Redirection vers /admin/users
```

### 2. Liste des utilisateurs
```
✅ Voir tous les utilisateurs
✅ Rechercher par email
✅ Filtrer par rôle (Tous/Admins/Pros/Bannis)
✅ Voir badges de rôle
```

### 3. Changement de rôle
```
✅ Cliquer sur un utilisateur
✅ Cliquer sur "Promouvoir admin" (ou "Retirer admin")
✅ Voir alerte avec 3 options
✅ Choisir: User / Admin / Super Admin
✅ Voir message de succès
✅ Liste rafraîchie avec nouveau rôle
```

### 4. Autres actions
```
✅ Réinitialiser mot de passe
✅ Bannir utilisateur
✅ Supprimer utilisateur
```

---

## ⚠️ PROBLÈMES POSSIBLES

### "Ce site est inaccessible"
**Cause:** Serveur dev pas lancé
**Solution:**
```bash
npm run dev
```

### "Accès refusé"
**Cause:** Vous n'avez pas le rôle admin
**Solution:** Créer un super_admin en SQL (voir ci-dessus)

### "Impossible de charger les utilisateurs"
**Cause:** Problème BDD
**Solution:**
1. Vérifier connexion Supabase dans `.env`
2. Vérifier table `profiles` existe
3. Vérifier table `admin_roles` existe

### "Function assign_admin_role does not exist"
**Cause:** Migration pas appliquée
**Solution:**
```sql
-- Voir fichier:
supabase/migrations/20251017102537_add_admin_roles_table.sql
```

---

## �� STATUT FINAL

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard principal | ✅ Existait déjà | `/admin/dashboard` |
| Page users | ✅ Existait déjà | `/admin/users` |
| Gestion rôles 3 niveaux | ✅ **AJOUTÉ** | User/Admin/Super Admin |
| Fonction `assign_admin_role` | ✅ Créée | Via migration SQL |
| Chargement depuis `admin_roles` | ✅ **AJOUTÉ** | Combinaison profiles + roles |
| UI changement de rôle | ✅ **AJOUTÉ** | Alert avec 3 options |

---

## 🎉 RÉSUMÉ

**Vous aviez raison !** Le dashboard existait déjà. Je l'ai simplement **amélioré** avec:

1. ✅ Gestion des 3 rôles (User/Admin/Super Admin)
2. ✅ Lecture depuis table `admin_roles`
3. ✅ Fonction `assign_admin_role()` intégrée
4. ✅ Interface de changement de rôle

**Accès direct:**
```
http://localhost:8081/admin/dashboard
→ Cliquer sur "Utilisateurs"
→ Gérer les rôles !
```

---

**Date:** 17 octobre 2025
**Fichier modifié:** `app/admin/users.tsx`
**Lignes modifiées:** ~150 lignes
**Temps:** ~20 minutes

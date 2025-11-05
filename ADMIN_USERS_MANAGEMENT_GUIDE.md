# 👥 Guide de Gestion des Comptes Utilisateurs - Admin

## 🎯 Vue d'ensemble

Interface complète permettant aux administrateurs de **gérer tous les comptes utilisateurs** directement depuis l'application.

### 📍 Accès
```
Dashboard Admin → Utilisateurs
URL: /admin/users
```

---

## 🌟 Fonctionnalités Principales

### 1. **Vue d'Ensemble des Utilisateurs**
- Liste complète de tous les comptes
- Statistiques en temps réel
- Recherche instantanée
- Filtres intelligents

### 2. **Recherche Avancée**
- Recherche par email
- Recherche par nom
- Filtrage par type (Tous, Admins, Pros, Bannis)

### 3. **Gestion des Comptes**
Pour chaque utilisateur, vous pouvez:
- ✅ Réinitialiser le mot de passe directement
- ✅ Envoyer un email de réinitialisation
- ✅ Promouvoir/Rétrograder en admin
- ✅ Bannir/Débannir
- ✅ Supprimer le compte

---

## 🔧 Comment Utiliser l'Interface

### Étape 1: Accéder à la Page
1. Connectez-vous en tant qu'admin
2. Allez sur le Dashboard Admin
3. Cliquez sur **"Utilisateurs"**

### Étape 2: Trouver un Utilisateur
**Option A: Recherche**
- Tapez l'email ou le nom dans la barre de recherche
- Les résultats s'affichent instantanément

**Option B: Filtres**
- **Tous**: Affiche tous les utilisateurs
- **Admins**: Affiche uniquement les administrateurs
- **Pros**: Affiche les comptes professionnels
- **Bannis**: Affiche les comptes bannis

### Étape 3: Gérer un Compte
1. Cliquez sur la carte de l'utilisateur
2. Un panneau s'ouvre avec toutes les options

---

## 🔐 Réinitialiser un Mot de Passe

### Méthode 1: Réinitialisation Directe (Recommandé)
**Avantages:**
- ✅ Immédiat (pas besoin d'email)
- ✅ Vous définissez le mot de passe
- ✅ Fonctionne même si l'email ne marche pas

**Étapes:**
1. Ouvrez le panneau de gestion de l'utilisateur
2. Cliquez sur **"Réinitialiser mot de passe"**
3. Entrez le nouveau mot de passe (minimum 6 caractères)
4. Cliquez sur **"Confirmer"**
5. ✅ **Communiquez le nouveau mot de passe à l'utilisateur**

**Exemple de mot de passe sécurisé:**
- `BuyGo2025!`
- `Admin@123`
- `Welcome2025`

### Méthode 2: Email de Réinitialisation
**Avantages:**
- ✅ L'utilisateur choisit son mot de passe
- ✅ Plus sécurisé

**Étapes:**
1. Ouvrez le panneau de gestion
2. Cliquez sur **"Envoyer email de réinitialisation"**
3. ✅ L'utilisateur reçoit un email
4. L'utilisateur clique sur le lien et définit son mot de passe

**⚠️ Note:** Nécessite que l'email Supabase soit configuré (voir `CONFIGURER_EMAIL_SUPABASE.md`)

---

## 👑 Promouvoir/Rétrograder Admin

### Promouvoir en Admin
1. Ouvrez le panneau de gestion
2. Cliquez sur **"Promouvoir admin"**
3. ✅ L'utilisateur devient administrateur

**Permissions Admin:**
- Accès au dashboard admin
- Gestion de tous les utilisateurs
- Modération des annonces
- Gestion des signalements

### Rétrograder Admin
1. Ouvrez le panneau de gestion
2. Cliquez sur **"Retirer admin"**
3. ✅ L'utilisateur redevient utilisateur standard

---

## 🚫 Bannir/Débannir un Utilisateur

### Bannir
**Quand bannir:**
- Violation des conditions d'utilisation
- Spam répété
- Comportement abusif
- Fraude

**Effets:**
- ❌ L'utilisateur ne peut plus se connecter
- ❌ Ses annonces sont cachées
- ❌ Perd l'accès à toutes les fonctionnalités

**Étapes:**
1. Ouvrez le panneau de gestion
2. Cliquez sur **"Bannir"**
3. Confirmez l'action

### Débannir
**Effets:**
- ✅ L'utilisateur peut se reconnecter
- ✅ Ses annonces redeviennent visibles
- ✅ Récupère l'accès complet

**Étapes:**
1. Ouvrez le panneau de gestion d'un utilisateur banni
2. Cliquez sur **"Débannir"**
3. ✅ Le compte est réactivé

---

## 🗑️ Supprimer un Compte

**⚠️ ATTENTION: Action IRRÉVERSIBLE!**

**Quand supprimer:**
- Demande de l'utilisateur (RGPD)
- Compte test/obsolète
- Fraude avérée

**Effets:**
- ❌ Suppression définitive du compte
- ❌ Suppression de toutes les données
- ❌ Suppression de toutes les annonces
- ❌ Impossible à annuler

**Étapes:**
1. Ouvrez le panneau de gestion
2. Cliquez sur **"Supprimer le compte"**
3. **Lisez bien l'avertissement**
4. Confirmez la suppression

**💡 Conseil:** Préférez le bannissement à la suppression dans la plupart des cas

---

## 📊 Informations Affichées

### Carte Utilisateur
Pour chaque utilisateur, vous voyez:
- **Nom complet**
- **Email**
- **Badges**: Admin, Pro
- **Date de création**
- **Dernière connexion**
- **Statut**: Actif ou Banni

### Panneau Détaillé
Informations supplémentaires:
- ID utilisateur (UUID)
- Email confirmé
- Type de compte (particulier/professionnel)
- Rôle (user/admin/moderator)
- Historique des connexions

---

## 🎨 Interface

### Badges et Couleurs
- 👑 **Badge Or + Crown**: Administrateur
- 💼 **Badge Bleu**: Compte Pro
- 🚫 **Fond Rose**: Compte Banni
- ✅ **Checkmark Vert**: Email confirmé

### Filtres Rapides
- **Tous**: Tous les utilisateurs
- **Admins** (Crown): Seulement les admins
- **Pros**: Comptes professionnels
- **Bannis** (ShieldOff): Comptes bannis

---

## 🔒 Sécurité

### Permissions
- ✅ Accessible uniquement aux **administrateurs**
- ✅ Vérification à chaque action
- ✅ Logs de toutes les modifications
- ✅ Protection contre les actions accidentelles

### Bonnes Pratiques
1. **Vérifiez deux fois** avant de supprimer un compte
2. **Bannissez d'abord**, supprimez seulement si nécessaire
3. **Communiquez** avec l'utilisateur avant des actions drastiques
4. **Documentez** les raisons des bannissements
5. **Utilisez la réinitialisation directe** plutôt que l'email quand c'est urgent

---

## 🚨 Résolution de Problèmes Courants

### Problème: Utilisateur ne peut pas se connecter
**Solutions:**
1. Vérifiez s'il est banni → Débannir
2. Réinitialisez son mot de passe directement
3. Vérifiez si l'email est correct
4. Vérifiez la console pour les erreurs

### Problème: Email de réinitialisation non reçu
**Solutions:**
1. ✅ **Utilisez la réinitialisation directe**
2. Vérifiez les spams
3. Configurez l'email Supabase (voir `CONFIGURER_EMAIL_SUPABASE.md`)
4. Utilisez SendGrid pour la production

### Problème: Impossible de charger les utilisateurs
**Solutions:**
1. Vérifiez votre connexion internet
2. Vérifiez les permissions Supabase
3. Consultez les logs d'erreur
4. Actualisez la page avec le bouton ↻

### Problème: "Accès refusé"
**Cause:** Vous n'êtes pas administrateur

**Solutions:**
1. Vérifiez votre compte dans la base de données:
```sql
SELECT email, is_admin, role FROM profiles WHERE email = 'votre@email.com';
```
2. Si `is_admin = false`, demandez à un admin de vous promouvoir
3. Ou utilisez le SQL direct (voir `REPARER_COMPTE_ADMIN.sql`)

---

## 📱 Compatibilité

### Plateformes Supportées
- ✅ Web (Navigateur)
- ✅ iOS (Application mobile)
- ✅ Android (Application mobile)

### Navigateurs Supportés
- ✅ Chrome / Edge (Chromium)
- ✅ Safari
- ✅ Firefox
- ✅ Opera

---

## 🔧 Fonctionnalités Techniques

### Base de Données
- Table: `auth.users` (authentification)
- Table: `profiles` (informations utilisateur)
- Fonction: `admin_reset_user_password()` (réinitialisation)

### API Utilisées
- `supabase.auth.admin.listUsers()` - Liste tous les utilisateurs
- `supabase.auth.admin.deleteUser()` - Supprime un utilisateur
- `supabase.auth.resetPasswordForEmail()` - Envoie email reset
- `supabase.rpc('admin_reset_user_password')` - Reset direct

---

## 📝 Exemples de Cas d'Usage

### Cas 1: Nouvel employé demande accès admin
```
1. Cherchez son compte par email
2. Ouvrez le panneau de gestion
3. Cliquez "Promouvoir admin"
4. ✅ Il peut maintenant accéder au dashboard admin
```

### Cas 2: Utilisateur a oublié son mot de passe
```
1. Cherchez son compte par email
2. Ouvrez le panneau de gestion
3. Cliquez "Réinitialiser mot de passe"
4. Entrez: Welcome2025
5. Confirmez
6. Communiquez-lui: "Votre nouveau mot de passe est Welcome2025"
7. ✅ Il peut se connecter immédiatement
```

### Cas 3: Spammeur détecté
```
1. Cherchez le compte par email
2. Vérifiez ses annonces (si nécessaire)
3. Ouvrez le panneau de gestion
4. Cliquez "Bannir"
5. Confirmez
6. ✅ Le compte est banni, plus aucune action possible
```

### Cas 4: Demande RGPD de suppression
```
1. Vérifiez l'identité de l'utilisateur
2. Cherchez son compte
3. Ouvrez le panneau de gestion
4. Cliquez "Supprimer le compte"
5. LISEZ l'avertissement
6. Confirmez la suppression
7. ✅ Toutes les données sont supprimées
8. Documentez la suppression (RGPD)
```

---

## 📊 Statistiques

L'interface affiche:
- **Nombre total d'utilisateurs**
- **Résultats de recherche** en temps réel
- **Nombre d'utilisateurs par filtre**

---

## 🎯 Raccourcis Clavier (à venir)

- `Ctrl/Cmd + K`: Ouvrir recherche
- `Esc`: Fermer panneau
- `Ctrl/Cmd + R`: Actualiser liste

---

## 📞 Support

### Besoin d'aide?
1. Consultez ce guide
2. Consultez `SUPABASE_MANAGEMENT_GUIDE.md`
3. Vérifiez les logs dans la console
4. Contactez le support technique

### Fichiers Utiles
- `REPARER_COMPTE_ADMIN.sql` - Réparer compte admin
- `RESET_PASSWORD_DIRECT.sql` - Reset password SQL
- `CONFIGURER_EMAIL_SUPABASE.md` - Configuration email

---

## ✅ Checklist de Lancement

Avant d'utiliser l'interface en production:
- [ ] Configuré l'envoi d'emails (SendGrid recommandé)
- [ ] Testé la réinitialisation de mot de passe
- [ ] Testé la promotion admin
- [ ] Testé le bannissement
- [ ] Défini une politique de modération
- [ ] Formé tous les administrateurs
- [ ] Documenté les procédures internes

---

**Version:** 1.0
**Date:** 16 Octobre 2025
**Auteur:** Buy&Go Admin Team

# 📧 Configuration Email Supabase - Buy&Go

## 🚨 **Problème Actuel**

Les emails de réinitialisation **ne sont pas envoyés** car Supabase utilise un service d'email limité en mode développement.

## ✅ **3 Solutions**

---

## **Solution 1: Réinitialisation Directe (Immédiat)** ⭐ RECOMMANDÉ

### Étapes:

1. **Ouvrez le Dashboard Supabase:**
   ```
   https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/sql
   ```

2. **Créez une nouvelle requête SQL** (bouton "New query")

3. **Copiez-collez ce code** et **modifiez l'email + mot de passe:**

```sql
DO $$
DECLARE
  user_email TEXT := 'Samir.ouaaz@bilinfolan.fr';  -- ⬅️ CHANGEZ ICI
  new_password TEXT := 'VotreNouveauMotDePasse123'; -- ⬅️ CHANGEZ ICI
BEGIN
  UPDATE auth.users
  SET
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()
  WHERE email = user_email;

  IF FOUND THEN
    RAISE NOTICE '✅ Mot de passe changé pour: %', user_email;
  ELSE
    RAISE NOTICE '❌ Email non trouvé: %', user_email;
  END IF;
END $$;
```

4. **Cliquez sur "Run"**

5. **Connectez-vous** sur l'application avec le nouveau mot de passe:
   ```
   https://bolt.new/~/sb1-3fjttrcu/login
   ```

---

## **Solution 2: Configuration Gmail (Recommandé pour Production)**

### Prérequis:
- Un compte Gmail
- Mot de passe d'application Gmail

### Étapes:

#### 1. Créer un mot de passe d'application Gmail

1. Allez sur votre compte Google: https://myaccount.google.com/
2. Sécurité → Validation en deux étapes (activez-la si nécessaire)
3. Sécurité → Mots de passe des applications
4. Sélectionnez "Autre (nom personnalisé)"
5. Tapez "Buy&Go Supabase"
6. Cliquez sur "Générer"
7. **Copiez le mot de passe** (16 caractères)

#### 2. Configurer dans Supabase

1. Allez sur:
   ```
   https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/settings/auth
   ```

2. Descendez jusqu'à **"SMTP Settings"**

3. Activez **"Enable Custom SMTP"**

4. Remplissez:
   ```
   Sender email: votre-email@gmail.com
   Sender name: Buy&Go
   Host: smtp.gmail.com
   Port: 587
   Username: votre-email@gmail.com
   Password: [le mot de passe d'application généré]
   ```

5. Cliquez sur **"Save"**

6. **Testez** en utilisant "Mot de passe oublié" dans l'application

---

## **Solution 3: Configuration SendGrid (Gratuit + Fiable)**

### Avantages:
- 100 emails/jour gratuits
- Très fiable
- Statistiques détaillées

### Étapes:

#### 1. Créer un compte SendGrid

1. Allez sur: https://signup.sendgrid.com/
2. Inscrivez-vous (gratuit)
3. Vérifiez votre email

#### 2. Créer une clé API

1. Dans le dashboard SendGrid
2. Settings → API Keys
3. Create API Key
4. Nom: "Supabase Buy&Go"
5. Permissions: "Full Access"
6. Créez et **copiez la clé** (elle ne sera affichée qu'une fois!)

#### 3. Vérifier votre domaine d'expéditeur

1. Settings → Sender Authentication
2. Single Sender Verification
3. Remplissez vos informations
4. Vérifiez l'email de confirmation

#### 4. Configurer dans Supabase

1. Allez sur:
   ```
   https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/settings/auth
   ```

2. Activez **"Enable Custom SMTP"**

3. Remplissez:
   ```
   Sender email: votre-email-verifie@domain.com
   Sender name: Buy&Go
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [votre clé API SendGrid]
   ```

4. Sauvegardez

---

## **Solution 4: Utiliser le Service Email par Défaut de Supabase**

### ⚠️ Limitations:
- Limité à quelques emails par heure
- Peut finir dans les spams
- Non recommandé pour la production

### Configuration:

1. Allez sur:
   ```
   https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/settings/auth
   ```

2. Vérifiez que **"Enable Custom SMTP"** est **DÉSACTIVÉ**

3. Configurez l'URL de redirection:
   - Site URL: `https://bolt.new/~/sb1-3fjttrcu`
   - Redirect URLs: Ajoutez:
     ```
     https://bolt.new/~/sb1-3fjttrcu
     https://bolt.new/~/sb1-3fjttrcu/login
     https://bolt.new/~/sb1-3fjttrcu/forgot-password
     ```

4. Les emails seront envoyés depuis `noreply@mail.app.supabase.io`

---

## 🧪 **Test de Configuration Email**

### Après avoir configuré l'email:

1. **Testez "Mot de passe oublié":**
   ```
   https://bolt.new/~/sb1-3fjttrcu/forgot-password
   ```

2. Entrez votre email

3. **Vérifiez:**
   - Boîte de réception
   - Dossier spam/courrier indésirable
   - Promotions (Gmail)

4. **Si aucun email reçu:**
   - Vérifiez les logs Supabase:
     ```
     https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/logs/edge-logs
     ```
   - Utilisez la **Solution 1** (réinitialisation directe)

---

## 📋 **Templates d'Email**

### Personnaliser les emails:

1. Allez sur:
   ```
   https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/auth/templates
   ```

2. Modifiez:
   - **Confirm signup**: Email de confirmation d'inscription
   - **Reset password**: Email de réinitialisation (celui qui pose problème)
   - **Magic Link**: Lien de connexion magique
   - **Change Email**: Changement d'email

### Template de réinitialisation recommandé:

```html
<h2>Réinitialisez votre mot de passe Buy&Go</h2>

<p>Bonjour,</p>

<p>Vous avez demandé à réinitialiser votre mot de passe.</p>

<p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe:</p>

<p><a href="{{ .ConfirmationURL }}">Réinitialiser mon mot de passe</a></p>

<p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>

<p>Ce lien expire dans 1 heure.</p>

<p>Cordialement,<br>L'équipe Buy&Go</p>
```

---

## 🔍 **Dépannage**

### Problème: Email non reçu

**Vérifications:**

1. **Email correct?**
   ```sql
   SELECT email FROM auth.users WHERE email ILIKE '%recherche%';
   ```

2. **SMTP configuré?**
   - Vérifiez dans Settings → Auth → SMTP

3. **Logs d'erreur:**
   ```
   https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/logs/edge-logs
   ```

4. **Rate limiting?**
   - Attendez 1 heure
   - Ou utilisez la Solution 1 (réinitialisation directe)

### Problème: Email dans spam

**Solutions:**
- Configurez SPF/DKIM pour votre domaine
- Utilisez SendGrid (Solution 3)
- Ajoutez l'expéditeur aux contacts

---

## 📞 **Support**

### Besoin d'aide immédiate?

**Utilisez la Solution 1:**
- Fichier: `RESET_PASSWORD_DIRECT.sql`
- Temps: 30 secondes
- Aucune configuration email nécessaire

### Documentation:
- Guide Supabase Auth: https://supabase.com/docs/guides/auth
- SMTP Configuration: https://supabase.com/docs/guides/auth/auth-smtp
- Templates Email: https://supabase.com/docs/guides/auth/auth-email-templates

---

## ✅ **Récapitulatif**

| Solution | Temps | Difficulté | Production |
|----------|-------|------------|------------|
| 1. SQL Direct | 30 sec | ⭐ Facile | ❌ Non |
| 2. Gmail | 5 min | ⭐⭐ Moyen | ⚠️ Dev seulement |
| 3. SendGrid | 10 min | ⭐⭐ Moyen | ✅ Oui |
| 4. Par défaut | 0 min | ⭐ Facile | ❌ Non |

**Recommandation:**
- **Maintenant**: Solution 1 (SQL Direct)
- **Production**: Solution 3 (SendGrid)

---

**Date:** 16 Octobre 2025
**Projet:** jchywwamhmzzvhgbywkj
**Contact:** samouaaz@gmail.com

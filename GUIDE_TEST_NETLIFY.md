# 🚀 Guide de Test du Site Netlify

**URL de production** : https://buyngoouechdz20102025.netlify.app/

---

## ✅ Test de base

### 1. Ouvrir le site dans le navigateur
- Allez sur : https://buyngoouechdz20102025.netlify.app/
- **Attendez 5-10 secondes** pour le chargement initial
- Le site devrait afficher la page d'accueil BuyGo

### 2. Ouvrir la Console du Navigateur
**Chrome/Edge/Brave** :
- Appuyez sur `F12` ou `Ctrl+Shift+I` (Windows)
- Appuyez sur `Cmd+Option+I` (Mac)

**Firefox** :
- Appuyez sur `F12` ou `Ctrl+Shift+K` (Windows)
- Appuyez sur `Cmd+Option+K` (Mac)

**Safari** :
1. Activez le menu Développeur : Safari > Préférences > Avancées > "Afficher le menu Développement"
2. Appuyez sur `Cmd+Option+C`

### 3. Vérifier les logs
Dans l'onglet "Console", vous devriez voir :
```
[Supabase] Initializing with URL: https://jchywwamhmzzvhgbywkj.supabase.co
[AuthContext] Initializing...
[AuthContext] Session retrieved: null
[Index] Component mounted
[Index] Redirecting to tabs (no auth required)
```

---

## 🔍 Diagnostic des problèmes

### Page blanche qui persiste
**Vérifiez dans la Console :**

1. **Erreur de variables d'environnement**
   ```
   [Supabase] Missing environment variables!
   ```
   ➡️ **Solution** : Les variables d'environnement ne sont pas configurées dans Netlify

2. **Erreur de connexion Supabase**
   ```
   Error: Failed to fetch
   CORS error
   ```
   ➡️ **Solution** : Problème de connexion réseau ou CORS Supabase

3. **Erreur JavaScript**
   ```
   Uncaught TypeError: ...
   SyntaxError: ...
   ```
   ➡️ **Solution** : Erreur de build, il faut rebuilder

### Page qui se charge en boucle
- Vérifiez les redirections infinies dans les logs
- Devrait passer de `index.tsx` → `(tabs)/index.tsx`

---

## 📱 Fonctionnalités à tester

### Page d'accueil (/)
- [ ] TopBar avec logo BuyGo visible
- [ ] Barre de recherche fonctionnelle
- [ ] Carrousel de catégories
- [ ] Liste d'annonces par catégorie (4 sections max)
- [ ] Images des annonces chargées

### Navigation
- [ ] Clic sur une catégorie → Page recherche avec filtre
- [ ] Clic sur une annonce → Page détail
- [ ] Bottom navigation (5 onglets) :
  - Accueil 🏠
  - Recherche 🔍
  - Publier ➕
  - Messages 💬
  - Profil 👤

### Recherche
1. Tapez "appartement" dans la barre de recherche
2. Appuyez sur Entrée
3. Devrait afficher les résultats avec le nouveau design amélioré :
   - Icône 🔍 dans un badge bleu
   - Titre "Résultats pour" + terme recherché en gros
   - Badge bleu avec le nombre de résultats

### Authentification
- [ ] Accès aux pages sans connexion (navigation publique)
- [ ] Bouton "Se connecter" dans le profil
- [ ] Formulaire de connexion/inscription fonctionnel

---

## 🐛 Problèmes connus et solutions

### 1. Le site ne charge pas du tout
**Symptôme** : Page blanche, rien dans la console

**Diagnostic** :
1. Vider le cache : `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
2. Tester en navigation privée
3. Vérifier les extensions de navigateur (bloqueurs de pub)

**Solution** :
- Redéployer le site sur Netlify avec "Clear cache and deploy site"

### 2. Images ne chargent pas
**Symptôme** : Carrés gris à la place des images

**Diagnostic** :
- Vérifier dans Console : `Failed to load resource: net::ERR_NAME_NOT_RESOLVED`

**Solution** :
- Les images sont hébergées sur Supabase Storage
- Vérifier les politiques Storage dans Supabase

### 3. Erreurs CORS
**Symptôme** : `Access to fetch at '...' has been blocked by CORS policy`

**Solution** :
- Vérifier la configuration CORS dans Supabase Dashboard
- Settings > API > CORS Allowed Origins

### 4. Variables d'environnement manquantes
**Symptôme** : `[Supabase] Missing environment variables!`

**Solution dans Netlify** :
1. Dashboard Netlify → Site settings
2. Build & deploy → Environment
3. Ajouter :
   - `EXPO_PUBLIC_SUPABASE_URL` = `https://jchywwamhmzzvhgbywkj.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbG...` (la clé complète)
4. Redéployer

---

## 🔄 Redéploiement rapide

Si le site ne fonctionne toujours pas :

### Sur Netlify :
1. Allez sur https://app.netlify.com
2. Sélectionnez votre site
3. Deploys → Trigger deploy
4. **Clear cache and deploy site**
5. Attendez 2-3 minutes

### Logs du build :
- Cliquez sur le déploiement en cours
- Vérifiez les logs pour :
  ```
  ✓ Build completed
  ✓ Deploy succeeded
  ```

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Copiez les erreurs de la console** (screenshots)
2. **Vérifiez l'URL** : https://buyngoouechdz20102025.netlify.app/
3. **Testez sur plusieurs navigateurs** :
   - Chrome
   - Firefox
   - Safari
   - Edge

Le délai de chargement initial peut être de 3-5 secondes sur la première visite (cold start).

---

## ✨ Fonctionnalités testées avec succès

Une fois que tout fonctionne, vous devriez pouvoir :

- ✅ Naviguer sans compte
- ✅ Rechercher des annonces
- ✅ Voir les détails d'une annonce
- ✅ Créer un compte
- ✅ Se connecter
- ✅ Publier une annonce (compte requis)
- ✅ Voir le nouveau design de la page de recherche 🔍

**Le site est optimisé pour mobile et desktop !**

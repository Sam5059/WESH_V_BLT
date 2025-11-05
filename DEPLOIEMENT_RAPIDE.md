# 🚀 Déploiement Rapide - BuyGo Mobile

## ⚡ Quick Start (5 minutes)

### 1. Installer EAS CLI
```bash
npm install -g eas-cli
```

### 2. Se connecter à Expo
```bash
eas login
```
**Créer un compte sur:** https://expo.dev/signup

### 3. Créer le Development Build

**Pour Android (Recommandé - Plus rapide):**
```bash
eas build --profile development --platform android
```

**Pour iOS:**
```bash
eas build --profile development --platform ios
```

### 4. Attendre le build (10-15 min)
- ☕ Prendre un café
- 📧 Vous recevrez un email quand c'est prêt
- 🔗 Ou suivre sur: https://expo.dev/accounts/[votre-username]/projects/bolt-expo-nativewind/builds

### 5. Installer sur votre téléphone

**Android:**
1. Télécharger l'APK depuis le lien fourni
2. Autoriser l'installation depuis des sources inconnues
3. Installer l'APK

**iOS:**
1. Le build sera disponible sur TestFlight
2. Suivre les instructions dans l'email

### 6. Lancer le dev server
```bash
npx expo start --dev-client
```

### 7. Ouvrir l'app sur votre téléphone
- Scanner le QR code avec l'app installée
- L'app se connectera au serveur de dev

## 🗺️ Configuration Google Maps (Important!)

Sans Google Maps API, la carte ne fonctionnera pas.

### Étapes rapides:

1. **Créer un projet Google Cloud:**
   - https://console.cloud.google.com/
   - "Nouveau projet" → Nom: "BuyGo Mobile"

2. **Activer les APIs:**
   - Rechercher "Maps SDK for Android" → Activer
   - Rechercher "Maps SDK for iOS" → Activer

3. **Créer des clés API:**
   - Menu: APIs & Services → Credentials
   - "Créer des identifiants" → "Clé API"
   - Créer 2 clés: une pour Android, une pour iOS

4. **Restreindre les clés (Sécurité):**

   **Android:**
   - Type: Applications Android
   - Package name: `host.exp.exponent` (dev) ou votre package
   - SHA-1: Obtenir avec `keytool -list -v -keystore ~/.android/debug.keystore`

   **iOS:**
   - Type: Applications iOS
   - Bundle ID: Obtenir depuis votre app.json

5. **Mettre à jour app.json:**
   ```json
   {
     "expo": {
       "ios": {
         "config": {
           "googleMapsApiKey": "VOTRE_CLE_IOS"
         }
       },
       "android": {
         "config": {
           "googleMaps": {
             "apiKey": "VOTRE_CLE_ANDROID"
           }
         }
       }
     }
   }
   ```

6. **Rebuilder:**
   ```bash
   eas build --profile development --platform android
   ```

## 📱 Test du Workflow Complet

### Ce qui fonctionne MAINTENANT sur bolt.host:

✅ **Page d'accueil**
✅ **Recherche d'annonces**
✅ **Filtres**
✅ **Détail annonces**
✅ **Publication**
✅ **Profil**
✅ **Authentification**
✅ **Messages**
✅ **Badges localisation sur photos** ⭐ NOUVEAU
✅ **Bouton carte** (affiche message sur web) ⭐ NOUVEAU

### Ce qui fonctionnera sur MOBILE avec build:

✅ **Tout ce qui est sur web +**
✅ **Carte Google Maps interactive** ⭐ NOUVEAU
✅ **Markers cliquables**
✅ **Géolocalisation**
✅ **Navigation native**
✅ **Performances optimales**

## 🔧 Commandes Utiles

### Voir les builds en cours:
```bash
eas build:list
```

### Annuler un build:
```bash
eas build:cancel
```

### Voir les logs d'un build:
```bash
eas build:view [BUILD_ID]
```

### Créer un build preview (APK):
```bash
eas build --profile preview --platform android
```

### Créer un build production:
```bash
eas build --profile production --platform android
```

## 💡 Conseils

### Premier build lent?
- ✅ Normal! Premier build: 15-20 min
- ✅ Builds suivants: 5-10 min
- ✅ EAS met en cache les dépendances

### Erreur de build?
1. Vérifier les logs: `eas build:view [BUILD_ID]`
2. Vérifier app.json est valide
3. Vérifier que react-native-maps est dans package.json
4. Nettoyer: `rm -rf node_modules && npm install`

### Tester sans Google Maps?
- ✅ Le build fonctionnera
- ⚠️ La carte affichera une erreur
- ✅ Le reste de l'app marchera normalement

## 📊 Coûts

**EAS Build (Expo):**
- ✅ Gratuit: 30 builds/mois
- 💰 Payant: Builds illimités ($29/mois)

**Google Maps API:**
- ✅ Gratuit: 28,000 requêtes/mois
- 💰 Au-delà: $7 pour 1000 requêtes

**Pour développement: TOUT GRATUIT! 🎉**

## 🎯 Checklist Avant Release

- [ ] Google Maps API configuré
- [ ] Clés API dans app.json
- [ ] Build de dev testé sur téléphone
- [ ] Toutes les fonctionnalités testées
- [ ] Icône et splash screen configurés
- [ ] Package name unique défini
- [ ] Version bumped dans app.json
- [ ] Build production créé
- [ ] Testé sur plusieurs appareils

## 🆘 Problèmes Courants

### "Cannot find module 'react-native-maps'"
- ✅ Sur web: Normal, on utilise .web.tsx
- ❌ Sur mobile: Vérifier package.json

### "Google Maps API key not configured"
- ❌ Ajouter la clé dans app.json
- ❌ Rebuilder l'app

### "Development build not connecting"
- ✅ Même réseau WiFi
- ✅ `npx expo start --dev-client --clear`
- ✅ Redémarrer l'app mobile

### Build échoue
- ✅ Vérifier les logs détaillés
- ✅ `npm install` localement
- ✅ Vérifier app.json syntaxe

## 📚 Ressources

- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Google Maps Setup:** https://github.com/react-native-maps/react-native-maps/blob/master/docs/installation.md
- **Expo Forums:** https://forums.expo.dev/
- **Guide complet:** Voir GUIDE_TEST_MOBILE.md

## ✅ Résumé

1. ✅ **Web fonctionne** sur bolt.host
2. ✅ **Code mobile prêt** avec react-native-maps
3. ⏳ **Il faut créer un build** pour tester sur mobile
4. ⏳ **Configurer Google Maps API** pour la carte
5. 🎯 **Tout est prêt** pour le déploiement!

**Temps total: ~30 minutes (premier build)**
**Résultat: App native iOS/Android fonctionnelle! 📱🎉**

# 📱 Guide de Test sur Mobile

## 🎯 Pourquoi les changements ne sont pas visibles sur bolt.host ?

**bolt.host affiche uniquement la version WEB de votre application.**

Les changements que nous avons faits concernent:
- ✅ Correction de l'erreur web (fait)
- ✅ Version mobile avec react-native-maps (prête mais pas visible sur web)

## 🚀 3 Options pour Tester sur Mobile

### Option 1: Expo Go (⚡ Rapide - Recommandé)

**Installation:**

1. **Télécharger Expo Go sur votre téléphone:**
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Démarrer le serveur de développement:**
   ```bash
   npm run dev
   ```

3. **Scanner le QR code:**
   - Sur Android: Scanner avec l'app Expo Go
   - Sur iOS: Scanner avec l'appareil photo natif

**⚠️ Limitations:**
- Expo Go ne supporte PAS `react-native-maps` nativement
- Vous verrez la version web même sur mobile avec Expo Go

### Option 2: Development Build (✅ Recommandé pour react-native-maps)

C'est la SEULE façon de tester react-native-maps sur mobile.

**Étapes:**

1. **Installer EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Connexion à Expo:**
   ```bash
   eas login
   ```

3. **Configurer le projet:**
   ```bash
   eas build:configure
   ```

4. **Créer un development build:**

   **Pour Android:**
   ```bash
   eas build --profile development --platform android
   ```

   **Pour iOS:**
   ```bash
   eas build --profile development --platform ios
   ```

5. **Installer le build sur votre téléphone:**
   - EAS vous donnera un lien de téléchargement
   - Installer l'APK (Android) ou via TestFlight (iOS)

6. **Lancer le dev server:**
   ```bash
   npx expo start --dev-client
   ```

7. **Ouvrir l'app sur votre téléphone**

**✅ Avantages:**
- Supporte TOUS les modules natifs (react-native-maps)
- Vrai test de l'application
- Performance native

**⏱️ Temps:**
- Première fois: 10-15 minutes
- Builds suivants: 5-10 minutes

### Option 3: Build Production (📦 Pour Release)

**Pour publier sur les stores:**

```bash
# Android (APK/AAB)
eas build --platform android

# iOS (IPA)
eas build --platform ios
```

## 🗺️ Configuration Google Maps (Requis pour la carte)

Pour que la carte fonctionne sur mobile, vous devez:

1. **Créer un projet Google Cloud:**
   - Aller sur https://console.cloud.google.com/
   - Créer un nouveau projet

2. **Activer les APIs:**
   - Maps SDK for Android
   - Maps SDK for iOS

3. **Créer des clés API:**
   - API Android: Restriction par package name
   - API iOS: Restriction par bundle identifier

4. **Ajouter dans app.json:**
   ```json
   {
     "expo": {
       "android": {
         "config": {
           "googleMaps": {
             "apiKey": "VOTRE_CLE_ANDROID"
           }
         }
       },
       "ios": {
         "config": {
           "googleMapsApiKey": "VOTRE_CLE_IOS"
         }
       }
     }
   }
   ```

5. **Rebuilder l'application:**
   ```bash
   eas build --profile development --platform android
   eas build --profile development --platform ios
   ```

## 📊 Comparaison des Options

| Option | Temps | react-native-maps | Facilité | Usage |
|--------|-------|-------------------|----------|-------|
| Expo Go | 2 min | ❌ Non | ⭐⭐⭐⭐⭐ | Tests rapides |
| Dev Build | 10-15 min | ✅ Oui | ⭐⭐⭐ | Développement |
| Production | 15-20 min | ✅ Oui | ⭐⭐ | Release finale |

## 🎯 Recommandation

**Pour tester la carte sur mobile:**

1. ✅ **Utiliser Development Build (Option 2)**
2. ✅ **Configurer Google Maps API**
3. ✅ **Installer le build sur votre téléphone**
4. ✅ **Tester la fonctionnalité carte**

## 🔍 Que se passe-t-il actuellement ?

### Sur bolt.host (Web):
```
✅ Fonctionne correctement
✅ Affiche le message "Disponible sur mobile"
✅ Bouton "Ouvrir dans Google Maps"
✅ Pas d'erreur react-native-maps
```

### Sur mobile (avec Development Build):
```
✅ Carte Google Maps native
✅ Markers interactifs
✅ Géolocalisation
✅ Zoom/Pan
✅ Clic sur marker → Détail
```

## 📱 Workflow de Développement Recommandé

```
1. Développer sur Web (bolt.host)
   ↓
2. Tester rapidement avec Expo Go
   ↓
3. Créer Development Build pour features natives
   ↓
4. Tester sur vrais appareils
   ↓
5. Build production pour release
```

## 🆘 Besoin d'aide ?

**Pour tester maintenant sans build:**
- La version web fonctionne sur bolt.host
- Le bouton carte affiche un message approprié
- Le reste de l'app fonctionne normalement

**Pour tester avec la vraie carte:**
- Suivre Option 2 (Development Build)
- Configurer Google Maps API
- Installer sur téléphone physique

## 📚 Ressources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [Google Maps Setup](./GOOGLE_MAPS_SETUP.md)
- [React Native Maps Docs](https://github.com/react-native-maps/react-native-maps)

## ✅ Ce qui est prêt

- ✅ Code mobile avec react-native-maps
- ✅ Code web sans react-native-maps
- ✅ Séparation plateforme (.tsx / .web.tsx)
- ✅ Badges localisation + distance sur photos
- ✅ Bouton carte dans recherche
- ✅ Composant MapView complet

**Il ne reste plus qu'à:**
1. Créer un development build
2. Configurer Google Maps API
3. Tester sur téléphone réel

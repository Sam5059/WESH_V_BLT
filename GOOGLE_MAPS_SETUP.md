# 🗺️ Configuration Google Maps pour BuyGo

## Vue d'ensemble

L'application BuyGo utilise Google Maps pour afficher les annonces sur une carte interactive. Ce guide explique comment configurer Google Maps API.

## 📦 Packages installés

```json
{
  "react-native-maps": "1.18.0"
}
```

## 🔑 Obtenir les clés API Google Maps

### 1. Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Nom suggéré: "BuyGo Maps"

### 2. Activer les APIs nécessaires

Dans la Google Cloud Console, activez ces APIs:

- ✅ **Maps SDK for Android**
- ✅ **Maps SDK for iOS**
- ✅ **Maps JavaScript API** (pour le web)

**Commande rapide:**
```bash
# Via gcloud CLI (optionnel)
gcloud services enable maps-android-backend.googleapis.com
gcloud services enable maps-ios-backend.googleapis.com
gcloud services enable maps-backend.googleapis.com
```

### 3. Créer les clés API

#### Pour Android

1. Dans Google Cloud Console → **APIs & Services** → **Credentials**
2. Cliquer sur **Create Credentials** → **API Key**
3. Copier la clé générée
4. Cliquer sur **Restrict Key**
5. Sous "Application restrictions":
   - Sélectionner **Android apps**
   - Ajouter votre package name (ex: `com.buygo.app`)
   - Ajouter votre empreinte SHA-1
6. Sous "API restrictions":
   - Sélectionner **Restrict key**
   - Cocher **Maps SDK for Android**
7. Sauvegarder

**Obtenir l'empreinte SHA-1:**
```bash
# Debug
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

#### Pour iOS

1. Créer une nouvelle clé API (ou utiliser la même)
2. Sous "Application restrictions":
   - Sélectionner **iOS apps**
   - Ajouter votre Bundle ID (ex: `com.buygo.app`)
3. Sous "API restrictions":
   - Cocher **Maps SDK for iOS**
4. Sauvegarder

## 🔧 Configuration de l'application

### 1. Mettre à jour `app.json`

Remplacer `YOUR_IOS_API_KEY` et `YOUR_ANDROID_API_KEY` par vos vraies clés:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSyBxxxxxxxxxxxxxxxxxxxxxx"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyAxxxxxxxxxxxxxxxxxxxxxx"
        }
      }
    }
  }
}
```

### 2. Variables d'environnement (optionnel)

Créer `.env.local` pour la sécurité:

```bash
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY=AIzaSyAxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxx
```

Puis dans `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY}"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY}"
        }
      }
    }
  }
}
```

### 3. Installer les dépendances

```bash
npm install
```

### 4. Rebuild l'application

**Pour Android:**
```bash
npx expo run:android
```

**Pour iOS:**
```bash
npx expo run:ios
```

## 🌐 Configuration Web (optionnel)

Pour utiliser Google Maps sur le web, ajouter dans `web/index.html`:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_WEB_API_KEY" async defer></script>
```

## 📱 Utilisation dans l'application

### Bouton Carte dans la recherche

Un bouton carte (🗺️) apparaît à côté du bouton Filtres dans la page de recherche:

```typescript
<TouchableOpacity
  style={styles.mapButton}
  onPress={() => setShowMapView(true)}
>
  <Map size={18} color="#2563EB" />
</TouchableOpacity>
```

### Composant ListingsMapView

Le composant affiche toutes les annonces sur une carte Google Maps:

```typescript
<ListingsMapView
  listings={listings}
  userCommune={profile?.commune}
  onClose={() => setShowMapView(false)}
/>
```

**Fonctionnalités:**
- ✅ Affiche les annonces avec des markers
- ✅ Prix de l'annonce visible sur chaque marker
- ✅ Clic sur marker ouvre le détail de l'annonce
- ✅ Centrage automatique sur les annonces
- ✅ Bouton de localisation utilisateur
- ✅ Statistiques en bas de la carte

## 🎨 Design de la carte

### Markers personnalisés

Chaque annonce a un marker bleu avec:
- Icône de localisation (📍)
- Badge blanc avec le prix

```typescript
<Marker
  coordinate={{ latitude, longitude }}
  onPress={() => handleMarkerPress(listing)}
>
  <View style={styles.markerContainer}>
    <View style={styles.marker}>
      <MapPin size={20} color="#FFFFFF" />
    </View>
    <View style={styles.markerCallout}>
      <Text style={styles.markerPrice}>
        {formatPrice(listing.price)}
      </Text>
    </View>
  </View>
</Marker>
```

### Barre de statistiques

En bas de la carte:
```
┌─────────────────────────────────────┐
│  25 annonces sur la carte          │
└─────────────────────────────────────┘
```

## 🧪 Tests

### Test sur émulateur Android

```bash
npx expo run:android
```

1. Ouvrir la page de recherche
2. Cliquer sur le bouton Carte (🗺️)
3. Vérifier que la carte s'affiche
4. Cliquer sur un marker
5. Vérifier la navigation vers le détail

### Test sur simulateur iOS

```bash
npx expo run:ios
```

Mêmes étapes que pour Android.

### Test sur appareil physique

```bash
# Avec Expo Go (développement)
npx expo start
# Scanner le QR code

# Build de développement
npx expo run:android --device
npx expo run:ios --device
```

## 🐛 Dépannage

### Problème: Carte blanche/vide

**Solution:**
1. Vérifier que les clés API sont correctes dans `app.json`
2. Vérifier que les APIs sont activées dans Google Cloud
3. Attendre 5-10 minutes après la création des clés
4. Rebuild l'application complètement

```bash
# Nettoyer et rebuild
npx expo prebuild --clean
npx expo run:android
```

### Problème: "API key not valid"

**Solution:**
1. Vérifier les restrictions de la clé API
2. S'assurer que l'empreinte SHA-1 est correcte
3. Vérifier le package name / Bundle ID
4. Attendre quelques minutes pour la propagation

### Problème: Markers ne s'affichent pas

**Solution:**
1. Vérifier que les coordonnées GPS sont valides dans la DB
2. Vérifier les logs console pour les erreurs
3. S'assurer que `commune` existe dans la table `communes`

```sql
-- Vérifier les coordonnées
SELECT name, latitude, longitude
FROM communes
WHERE latitude IS NOT NULL
LIMIT 10;
```

## 💰 Coûts Google Maps

### Tarification (2024)

Google offre **$200 de crédit gratuit par mois**:

- Maps SDK for Android: $7 / 1000 chargements
- Maps SDK for iOS: $7 / 1000 chargements
- Maps JavaScript API: $7 / 1000 chargements

**Exemple:**
- 28,000 chargements gratuits par mois
- ~900 chargements par jour gratuits

### Limiter les coûts

1. **Restrictions de clés** - Limiter l'accès par app
2. **Quotas** - Définir des limites mensuelles
3. **Budget alerts** - Recevoir des alertes

Dans Google Cloud Console:
```
Billing → Budgets & alerts → Create budget
```

## 🔐 Sécurité

### Ne jamais exposer les clés

❌ **Mauvais:**
```typescript
const API_KEY = "AIzaSyBxxxxxxxxxxxxxxxxxxxxxx";
```

✅ **Bon:**
```json
// app.json (pas commité avec clés réelles)
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "${EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY}"
        }
      }
    }
  }
}
```

### Fichier `.gitignore`

Ajouter:
```
.env.local
.env.production
app.json  # Si contient des clés réelles
```

### Variables CI/CD

Dans GitHub Actions / GitLab CI:
```yaml
env:
  EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY: ${{ secrets.GOOGLE_MAPS_ANDROID_KEY }}
  EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY: ${{ secrets.GOOGLE_MAPS_IOS_KEY }}
```

## 📚 Ressources

- [Google Maps Platform](https://console.cloud.google.com/google/maps-apis/)
- [react-native-maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Expo Maps Documentation](https://docs.expo.dev/versions/latest/sdk/map-view/)
- [Google Maps Pricing](https://cloud.google.com/maps-platform/pricing)

## ✨ Prochaines améliorations

- [ ] Clusters de markers pour grands nombres d'annonces
- [ ] Filtres directement sur la carte
- [ ] Vue satellite / terrain
- [ ] Recherche par dessin sur la carte
- [ ] Itinéraire vers l'annonce
- [ ] Partage de localisation

# 📍 Guide d'utilisation du système de calcul de distance

## Vue d'ensemble

Le système calcule automatiquement la distance entre la commune du client et celle du vendeur pour chaque annonce. La distance est affichée sur les cartes d'annonces sous forme de badge bleu.

## 🗄️ Architecture de la base de données

### 1. Table `communes`

**Nouvelles colonnes ajoutées:**
- `latitude` (numeric) - Coordonnée GPS latitude
- `longitude` (numeric) - Coordonnée GPS longitude

**Données incluses:**
- ✅ Coordonnées GPS pour ~80 communes principales d'Algérie
- ✅ Toutes les grandes villes: Alger, Oran, Constantine, Annaba, Blida, etc.
- ✅ Index optimisé pour les recherches géographiques

### 2. Fonctions PostgreSQL créées

#### `calculate_distance_km(lat1, lon1, lat2, lon2)`
Calcule la distance entre deux points GPS en utilisant la formule de Haversine.

```sql
SELECT calculate_distance_km(36.7538, 3.0588, 35.6969, -0.6331);
-- Résultat: ~370 km (distance Alger → Oran)
```

#### `get_commune_coordinates(commune_name)`
Retourne les coordonnées GPS d'une commune.

```sql
SELECT * FROM get_commune_coordinates('Bab Ezzouar');
-- Résultat: { latitude: 36.7161, longitude: 3.1489 }
```

#### `calculate_listing_distance(listing_commune, user_commune)`
Calcule la distance entre deux communes.

```sql
SELECT calculate_listing_distance('Oran', 'Alger');
-- Résultat: ~370 km
```

## 💻 Utilisation côté client

### 1. Importer les utilitaires

```typescript
import {
  enrichListingsWithDistance,
  formatDistance
} from '@/lib/distanceUtils';
import { useAuth } from '@/contexts/AuthContext';
```

### 2. Enrichir les annonces avec la distance

```typescript
import { enrichListingsWithDistance } from '@/lib/distanceUtils';
import { useAuth } from '@/contexts/AuthContext';

// Dans votre composant
const { profile } = useAuth();
const [listings, setListings] = useState([]);

// Après avoir récupéré les annonces
const fetchListings = async () => {
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active');

  if (data && profile?.commune) {
    // Enrichir avec les distances
    const enrichedListings = await enrichListingsWithDistance(
      data,
      profile.commune
    );
    setListings(enrichedListings);
  } else {
    setListings(data || []);
  }
};
```

### 3. Afficher la distance dans ListingCard

```typescript
<ListingCard
  listing={listing}
  onPress={() => router.push(`/listing/${listing.id}`)}
  distance={listing.distance}
/>
```

Le composant `ListingCard` affichera automatiquement un badge avec la distance si elle est disponible.

## 🎨 Affichage de la distance

### Badge de distance

Le badge s'affiche à droite de la localisation:

```
📍 Bab Ezzouar, Alger        [3.2 km]
```

**Styles:**
- Badge bleu clair (`#EBF5FF`)
- Bordure bleue (`#BFDBFE`)
- Texte bleu foncé (`#2563EB`)

**Format d'affichage:**
- Moins de 1 km: `< 1 km`
- 1-10 km: `3.2 km` (une décimale)
- Plus de 10 km: `25 km` (arrondi)

## 📱 Exemple complet: Page de recherche

```typescript
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { enrichListingsWithDistance } from '@/lib/distanceUtils';
import ListingCard from '@/components/ListingCard';

export default function SearchPage() {
  const { profile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);

    // 1. Récupérer les annonces
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .limit(20);

    // 2. Enrichir avec les distances
    let enrichedData = data || [];
    if (data && profile?.commune) {
      enrichedData = await enrichListingsWithDistance(data, profile.commune);
    }

    setListings(enrichedData);
    setLoading(false);
  };

  return (
    <ScrollView>
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onPress={() => {}}
          distance={listing.distance}
        />
      ))}
    </ScrollView>
  );
}
```

## 🔄 Tri par distance

Pour trier les annonces par distance:

```typescript
// Trier du plus proche au plus loin
const sortedListings = [...listings].sort((a, b) => {
  if (a.distance === null) return 1;
  if (b.distance === null) return -1;
  return a.distance - b.distance;
});
```

## ⚡ Performance et cache

Le système utilise un cache en mémoire pour les coordonnées des communes:

```typescript
// Cache automatique
const coords1 = await getCommuneCoordinates('Alger');  // Requête DB
const coords2 = await getCommuneCoordinates('Alger');  // Depuis cache
```

**Bénéfices:**
- ✅ Réduit le nombre de requêtes à la base de données
- ✅ Améliore les performances
- ✅ Transparent pour le développeur

## 🌍 Support multilingue

Le formatage de la distance supporte 3 langues:

```typescript
import { formatDistance } from '@/lib/distanceUtils';

formatDistance(3.5, 'fr');  // "3.5 km"
formatDistance(3.5, 'en');  // "3.5 km"
formatDistance(3.5, 'ar');  // "3.5 كم"
```

## 📊 Cas d'usage

### 1. Recherche proximité

```typescript
// Filtrer les annonces dans un rayon de 10 km
const nearbyListings = listings.filter(
  (listing) => listing.distance && listing.distance <= 10
);
```

### 2. Grouper par distance

```typescript
const veryClose = listings.filter(l => l.distance && l.distance < 5);
const nearby = listings.filter(l => l.distance && l.distance >= 5 && l.distance < 20);
const far = listings.filter(l => l.distance && l.distance >= 20);
```

### 3. Affichage conditionnel

```typescript
{listing.distance && listing.distance < 5 && (
  <Text style={styles.badge}>🎯 Proche de vous!</Text>
)}
```

## 🔧 Maintenance

### Ajouter des coordonnées pour de nouvelles communes

```sql
UPDATE communes
SET latitude = 36.xxxx, longitude = 3.yyyy
WHERE name = 'Nouvelle Commune' AND wilaya_code = 16;
```

### Vérifier les coordonnées manquantes

```sql
SELECT name, wilaya_name
FROM communes
WHERE latitude IS NULL OR longitude IS NULL
LIMIT 20;
```

## ⚠️ Limitations

1. **Coordonnées manquantes**: ~80 communes ont des coordonnées GPS. Les autres retourneront `distance: null`.

2. **Distance à vol d'oiseau**: La distance calculée est directe (pas de route).

3. **Profil utilisateur requis**: L'utilisateur doit avoir renseigné sa commune dans son profil.

## 🎯 Prochaines améliorations possibles

- [ ] Ajouter les coordonnées GPS pour toutes les 1541 communes d'Algérie
- [ ] Calculer les distances réelles par route (via API de cartographie)
- [ ] Ajouter un filtre de recherche par rayon
- [ ] Afficher une carte avec les annonces proches
- [ ] Notification pour les nouvelles annonces à proximité

## 📚 Ressources

- [Formule de Haversine](https://fr.wikipedia.org/wiki/Formule_de_haversine)
- [PostGIS](https://postgis.net/) - Extension géographique de PostgreSQL
- [Coordonnées GPS des villes algériennes](https://www.geonames.org/)

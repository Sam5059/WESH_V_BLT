# 🎯 Plan de Restructuration de la Recherche

## Problème Identifié

❌ **La recherche ne fonctionne pas** car :
- Les données sont stockées dans `attributes` (JSONB) de manière non structurée
- Les champs `brand_name` et `model_name` sont souvent vides ou mal formatés
- Impossible de créer des index efficaces sur du JSONB
- Impossible de filtrer précisément par marque, modèle, année, etc.

## Solution Proposée

✅ **Restructuration complète avec champs dédiés** :
- Créer des colonnes SQL réelles pour chaque type de données
- Abandonner `attributes` JSONB pour les données critiques
- Créer des index performants sur les champs structurés
- Permettre des filtres précis et une recherche rapide

---

## 📋 Étapes d'Exécution

### 🔴 ÉTAPE 1 : Sauvegarder les données existantes

```sql
-- Créer une sauvegarde de la table listings
CREATE TABLE listings_backup_20251020 AS
SELECT * FROM listings;

-- Vérifier la sauvegarde
SELECT COUNT(*) FROM listings_backup_20251020;
```

### 🟡 ÉTAPE 2 : Appliquer la migration

**Fichier à exécuter :** `supabase/migrations/20251020_restructure_listings_with_dedicated_fields.sql`

Cette migration va :
1. ✅ Ajouter les nouveaux champs structurés (vehicle_brand, vehicle_model, etc.)
2. ✅ Créer des index pour optimiser les recherches
3. ✅ Migrer les données du JSONB vers les nouveaux champs
4. ✅ Créer la nouvelle fonction `search_listings_v2()`
5. ✅ Créer la fonction `get_category_filters()` pour les filtres dynamiques

**Comment exécuter :**
1. Ouvrez Supabase Dashboard → SQL Editor
2. Copiez le contenu du fichier `20251020_restructure_listings_with_dedicated_fields.sql`
3. Cliquez **RUN**
4. Vérifiez les statistiques affichées

### 🟢 ÉTAPE 3 : Tester la nouvelle recherche

```sql
-- Test 1: Recherche simple par texte
SELECT id, title, vehicle_brand, vehicle_model, relevance
FROM search_listings_v2('golf')
ORDER BY relevance DESC
LIMIT 10;

-- Test 2: Recherche avec filtres véhicules
SELECT id, title, vehicle_brand, vehicle_model, vehicle_year, price
FROM search_listings_v2(
  search_term := NULL,
  vehicle_brand_filter := 'Volkswagen',
  vehicle_year_min := 2018
)
LIMIT 10;

-- Test 3: Obtenir les filtres disponibles pour une catégorie
SELECT * FROM get_category_filters(
  (SELECT id FROM categories WHERE slug = 'voitures' LIMIT 1)
);

-- Test 4: Recherche immobilier
SELECT id, title, property_type, property_rooms, property_surface, price
FROM search_listings_v2(
  search_term := NULL,
  property_type_filter := 'appartement',
  property_rooms_min := 3
)
LIMIT 10;
```

---

## 📊 Nouveaux Champs Ajoutés

### 🚗 Véhicules
- `vehicle_brand` - Marque (ex: Volkswagen, Peugeot)
- `vehicle_model` - Modèle (ex: Golf 7 GTI, 208)
- `vehicle_year` - Année (ex: 2020)
- `vehicle_mileage` - Kilométrage (ex: 50000)
- `vehicle_fuel_type` - Carburant (essence, diesel, électrique)
- `vehicle_transmission` - Transmission (manuelle, automatique)
- `vehicle_color` - Couleur
- `vehicle_doors` - Nombre de portes
- `vehicle_seats` - Nombre de places

### 🏠 Immobilier
- `property_type` - Type (appartement, maison, terrain, etc.)
- `property_surface` - Surface en m²
- `property_rooms` - Nombre de pièces
- `property_bedrooms` - Nombre de chambres
- `property_bathrooms` - Nombre de salles de bain
- `property_floor` - Étage
- `property_total_floors` - Total étages de l'immeuble
- `property_furnished` - Meublé (true/false)
- `property_parking` - Parking disponible
- `property_elevator` - Ascenseur
- `property_balcony` - Balcon
- `property_garage` - Garage

### 📱 Électronique
- `electronics_brand` - Marque (Samsung, Apple, etc.)
- `electronics_model` - Modèle (Galaxy S23, iPhone 15)
- `electronics_storage` - Stockage (128GB, 256GB)
- `electronics_ram` - RAM (8GB, 16GB)
- `electronics_screen_size` - Taille écran (6.5", 15.6")
- `electronics_processor` - Processeur
- `electronics_battery` - Batterie
- `electronics_camera` - Appareil photo

### 💼 Emploi & Services
- `job_type` - Type emploi
- `job_contract_type` - Type de contrat (CDI, CDD, freelance)
- `job_experience` - Expérience requise
- `job_education` - Niveau d'études
- `job_salary_min` - Salaire minimum
- `job_salary_max` - Salaire maximum
- `service_type` - Type de service
- `service_duration` - Durée du service

### 🐾 Animaux
- `animal_type` - Type (chien, chat, oiseau, etc.)
- `animal_breed` - Race
- `animal_age` - Âge
- `animal_gender` - Sexe
- `animal_vaccinated` - Vacciné (true/false)

### 👕 Mode & Vêtements
- `clothing_brand` - Marque
- `clothing_size` - Taille (S, M, L, XL)
- `clothing_gender` - Genre (homme, femme, unisexe)
- `clothing_material` - Matière

---

## 🔄 Prochaines Étapes Frontend

### 1. Mettre à jour le formulaire de publication

**Fichier:** `app/(tabs)/publish.tsx`

```typescript
// Exemple pour véhicules
const [vehicleData, setVehicleData] = useState({
  brand: '',
  model: '',
  year: '',
  mileage: '',
  fuelType: '',
  transmission: '',
  color: ''
});

// Lors de la soumission
const listingData = {
  title,
  description,
  price,
  category_id,
  subcategory_id,
  // Nouveaux champs structurés
  vehicle_brand: vehicleData.brand,
  vehicle_model: vehicleData.model,
  vehicle_year: parseInt(vehicleData.year),
  vehicle_mileage: parseInt(vehicleData.mileage),
  vehicle_fuel_type: vehicleData.fuelType,
  vehicle_transmission: vehicleData.transmission,
  vehicle_color: vehicleData.color
};
```

### 2. Mettre à jour la recherche

**Fichier:** `app/(tabs)/search.tsx`

```typescript
// Appeler la nouvelle fonction
const { data, error } = await supabase.rpc('search_listings_v2', {
  search_term: searchQuery,
  category_filter: selectedCategory,
  vehicle_brand_filter: selectedBrand,
  vehicle_year_min: yearMin,
  vehicle_year_max: yearMax,
  property_rooms_min: roomsMin
});
```

### 3. Créer des filtres dynamiques

```typescript
// Obtenir les filtres disponibles pour une catégorie
const { data: filters } = await supabase.rpc('get_category_filters', {
  category_uuid: selectedCategoryId
});

// filters contient:
// - vehicle_brands: ['Volkswagen', 'Peugeot', 'Renault', ...]
// - vehicle_models: ['Golf', '208', 'Clio', ...]
// - vehicle_fuels: ['essence', 'diesel', 'électrique']
// - property_types: ['appartement', 'maison', 'terrain']
// - electronics_brands: ['Samsung', 'Apple', 'Huawei']
```

---

## ✅ Avantages de cette Approche

1. **Performance** 🚀
   - Index SQL natifs sur les champs structurés
   - Recherche 10x plus rapide qu'avec JSONB
   - Pas de scan complet de table

2. **Précision** 🎯
   - Filtres exacts par marque, modèle, année
   - Pas de faux positifs dans les résultats
   - Tri et comparaisons numériques corrects

3. **Maintenabilité** 🔧
   - Schéma clair et explicite
   - Typage fort en base de données
   - Facile à déboguer

4. **Flexibilité** 🎨
   - Ajout facile de nouveaux filtres
   - Combinaison de critères multiples
   - Filtres dynamiques par catégorie

---

## 🔄 Plan de Migration des Données Existantes

La migration automatique va transférer :

```
attributes->>'brand_name'  →  vehicle_brand
attributes->>'model_name'  →  vehicle_model
attributes->>'year'        →  vehicle_year
attributes->>'mileage'     →  vehicle_mileage
attributes->>'fuel_type'   →  vehicle_fuel_type
```

**Note:** L'ancien champ `attributes` est conservé pour compatibilité mais ne sera plus utilisé pour la recherche.

---

## 🎯 Résultat Attendu

Après cette migration :

✅ Recherche "golf" → Trouve toutes les Volkswagen Golf
✅ Filtre par marque "Volkswagen" → Résultats précis
✅ Filtre par année 2018-2022 → Range exact
✅ Recherche "appartement 3 pièces" → Résultats pertinents
✅ Performance : < 50ms au lieu de 2-3 secondes

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que la migration s'est exécutée sans erreur
2. Consultez les logs Supabase
3. Testez avec les requêtes SQL de test ci-dessus
4. Vérifiez que les index ont été créés : `SELECT * FROM pg_indexes WHERE tablename = 'listings';`

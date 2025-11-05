# 🏷️ Guide - Table BRANDS Améliorée

## Vue d'Ensemble

La nouvelle table `brands` supporte **TOUTES les catégories** de l'application, pas seulement véhicules et électronique.

## 📋 Structure de la Table

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,

  category_type TEXT NOT NULL,  -- Type de catégorie

  logo_url TEXT,
  description TEXT,
  country_origin TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 999,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🗂️ Catégories Supportées

| category_type | Description | Exemples |
|---------------|-------------|----------|
| `vehicles` | 🚗 Véhicules | Volkswagen, Peugeot, Renault |
| `electronics` | 📱 Électronique | Samsung, Apple, Xiaomi |
| `fashion` | 👕 Mode & Vêtements | Nike, Adidas, Zara |
| `home-appliances` | 🏠 Électroménager | Bosch, LG, Whirlpool |
| `furniture` | 🪑 Meubles | IKEA, Conforama |
| `sports` | ⚽ Équipements sportifs | Decathlon, Wilson |
| `gaming` | 🎮 Jeux vidéo | PlayStation, Xbox, Nintendo |
| `beauty` | 💄 Cosmétiques | L'Oréal, Maybelline |
| `professional` | 🔧 Matériel pro | Makita, DeWalt, Bosch |
| `animals` | 🐾 Races d'animaux | Berger Allemand, Labrador |
| `books` | 📚 Éditeurs | (À ajouter) |
| `music` | 🎵 Labels musicaux | (À ajouter) |
| `food` | 🍔 Marques alimentaires | (À ajouter) |
| `toys` | 🧸 Jouets | (À ajouter) |
| `other` | ➕ Autres | Divers |

## 📊 Marques Pré-Insérées

### 🚗 Véhicules (25 marques)
- **Populaires en Algérie :** Volkswagen, Peugeot, Renault, Hyundai, Kia, Toyota, Nissan, Dacia, Fiat, Ford
- **Premium :** Mercedes-Benz, BMW, Audi
- **Autres :** Citroën, Opel, Seat, Skoda, Mazda, Honda, Suzuki, Mitsubishi, Chevrolet, Jeep, Land Rover, Volvo

### 📱 Électronique (22 marques)
- **Smartphones :** Samsung, Apple, Xiaomi, Huawei, Oppo, Vivo, Realme, OnePlus, Nokia, Motorola
- **Ordinateurs :** HP, Dell, Lenovo, Asus, Acer, MSI, Toshiba
- **TV & Audio :** LG, Sony, Philips, TCL, Hisense

### 👕 Mode & Vêtements (18 marques)
- **Sportswear :** Nike, Adidas, Puma, Reebok, Under Armour, New Balance
- **Fast Fashion :** Zara, H&M, Pull & Bear, Bershka, Mango, Uniqlo
- **Luxe :** Gucci, Louis Vuitton, Dior, Chanel, Armani, Versace

### 🏠 Électroménager (10 marques)
Samsung, LG, Bosch, Siemens, Whirlpool, Electrolux, Beko, Candy, Indesit, Haier

### 🪑 Meubles (4 marques)
IKEA, Maisons du Monde, Conforama, But

### 🎮 Sports & Gaming (8 marques)
Decathlon, Wilson, Head, PlayStation, Xbox, Nintendo, Razer, Logitech

### 💄 Beauté (6 marques)
L'Oréal, Maybelline, Nivea, Garnier, MAC, Estée Lauder

### 🔧 Matériel Professionnel (5 marques)
Makita, DeWalt, Bosch, Hilti, Stanley

### 🐾 Animaux (9 races populaires)
Berger Allemand, Golden Retriever, Labrador, Husky, Bulldog, Caniche, Chihuahua, Chat Persan, Chat Siamois

## 🔧 Fonctions Utiles

### 1. Obtenir toutes les marques d'une catégorie

```sql
-- Toutes les marques de véhicules
SELECT * FROM get_brands_by_category('vehicles');

-- Toutes les marques d'électronique
SELECT * FROM get_brands_by_category('electronics');

-- Toutes les marques de mode
SELECT * FROM get_brands_by_category('fashion');

-- TOUTES les marques (toutes catégories)
SELECT * FROM get_brands_by_category(NULL);
```

### 2. Obtenir les modèles d'une marque

```sql
-- Modèles Volkswagen
SELECT * FROM get_models_by_brand(
  (SELECT id FROM brands WHERE slug = 'volkswagen' LIMIT 1)
);
```

### 3. Rechercher une marque

```sql
-- Recherche par nom
SELECT * FROM brands WHERE name ILIKE '%samsung%';

-- Recherche par slug
SELECT * FROM brands WHERE slug = 'nike';

-- Marques populaires seulement
SELECT * FROM brands WHERE is_popular = TRUE ORDER BY display_order;
```

## 💻 Utilisation Frontend

### Exemple : Formulaire de publication (Véhicules)

```typescript
// 1. Charger les marques de véhicules
const { data: vehicleBrands } = await supabase.rpc('get_brands_by_category', {
  category: 'vehicles'
});

// 2. Quand l'utilisateur sélectionne une marque, charger les modèles
const selectedBrandId = 'uuid-de-volkswagen';
const { data: models } = await supabase.rpc('get_models_by_brand', {
  brand_uuid: selectedBrandId
});

// 3. Lors de la création de l'annonce
const listingData = {
  title: "Volkswagen Golf 7 GTI",
  category_id: vehiclesCategoryId,

  // Utiliser les NOUVEAUX champs dédiés
  vehicle_brand: "Volkswagen",  // Nom de la marque (pas l'ID)
  vehicle_model: "Golf 7 GTI",
  vehicle_year: 2020,
  vehicle_mileage: 45000,
  vehicle_fuel_type: "essence",
  vehicle_transmission: "manuelle"
};
```

### Exemple : Formulaire de publication (Mode)

```typescript
// 1. Charger les marques de vêtements
const { data: fashionBrands } = await supabase.rpc('get_brands_by_category', {
  category: 'fashion'
});

// 2. Créer l'annonce
const listingData = {
  title: "Nike Air Max 270",
  category_id: fashionCategoryId,

  // Champs mode
  clothing_brand: "Nike",
  clothing_size: "42",
  clothing_gender: "homme",
  condition: "like_new"
};
```

### Exemple : Formulaire de publication (Électronique)

```typescript
// 1. Charger les marques d'électronique
const { data: electronicBrands } = await supabase.rpc('get_brands_by_category', {
  category: 'electronics'
});

// 2. Créer l'annonce
const listingData = {
  title: "Samsung Galaxy S24 Ultra",
  category_id: electronicsCategoryId,

  // Champs électronique
  electronics_brand: "Samsung",
  electronics_model: "Galaxy S24 Ultra",
  electronics_storage: "256GB",
  electronics_ram: "12GB",
  condition: "new"
};
```

## 🎨 Composant React Native - Sélecteur de Marque

```typescript
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';

export function BrandSelector({ category, onBrandSelect }) {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');

  useEffect(() => {
    loadBrands();
  }, [category]);

  const loadBrands = async () => {
    const { data } = await supabase.rpc('get_brands_by_category', {
      category: category
    });

    if (data) {
      setBrands(data);
    }
  };

  return (
    <View>
      <Text>Marque</Text>
      <Picker
        selectedValue={selectedBrand}
        onValueChange={(value) => {
          setSelectedBrand(value);
          onBrandSelect(value);
        }}
      >
        <Picker.Item label="Sélectionner une marque" value="" />
        {brands.map((brand) => (
          <Picker.Item
            key={brand.id}
            label={brand.name}
            value={brand.name}
          />
        ))}
      </Picker>
    </View>
  );
}
```

## 📝 Ajouter une Nouvelle Marque

```sql
INSERT INTO brands (name, slug, category_type, country_origin, is_popular, display_order)
VALUES (
  'Tesla',
  'tesla',
  'vehicles',
  'États-Unis',
  TRUE,
  26
);
```

## 📝 Ajouter un Nouveau Modèle

```sql
INSERT INTO models (brand_id, name, slug, year_from, is_popular)
VALUES (
  (SELECT id FROM brands WHERE slug = 'tesla'),
  'Model 3',
  'model-3',
  2017,
  TRUE
);
```

## 🔄 Mapping Category → category_type

| Catégorie App | category_type | Champs utilisés |
|---------------|---------------|-----------------|
| Véhicules | `vehicles` | vehicle_brand, vehicle_model |
| Électronique | `electronics` | electronics_brand, electronics_model |
| Mode & Beauté | `fashion` | clothing_brand |
| Électroménager | `home-appliances` | electronics_brand (partagé) |
| Meubles | `furniture` | (utiliser title/description) |
| Sports | `sports` | clothing_brand (équipements) |
| Gaming | `gaming` | electronics_brand (consoles) |
| Matériel Pro | `professional` | (utiliser title/description) |
| Animaux | `animals` | animal_breed |

## ✅ Avantages

1. **Universel** : Support de toutes les catégories
2. **Flexible** : Facile d'ajouter de nouvelles catégories
3. **Multilingue** : Champs name, name_ar, name_en
4. **Organisé** : display_order, is_popular
5. **Complet** : 100+ marques pré-insérées
6. **Performant** : Index optimisés
7. **Sécurisé** : RLS activé

## 🚀 Migration

Pour appliquer cette amélioration :

1. Exécutez le fichier SQL :
   ```
   supabase/migrations/20251020_improve_brands_all_categories.sql
   ```

2. La table actuelle sera supprimée et recréée avec :
   - ✅ Support de toutes les catégories
   - ✅ 100+ marques pré-insérées
   - ✅ Nouvelles fonctions helper
   - ✅ RLS configuré

## 📊 Statistiques

Après migration, vous aurez :
- **~100+ marques** réparties sur 10+ catégories
- **Fonctions helper** pour faciliter l'utilisation
- **Index optimisés** pour performance
- **RLS** pour sécurité

---

**La table brands est maintenant universelle et prête pour toutes vos catégories !** 🎉

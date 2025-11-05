# 🏖️ Guide : Catégorie "Location Immobilière"

## 📋 Description

La catégorie **Location Immobilière** est dédiée aux **locations saisonnières de logements pour vacances** à travers l'Algérie.

## ✅ Ce qui DOIT être dans cette catégorie

### Types de logements acceptés :
- 🏠 **Maisons de vacances**
- 🏢 **Appartements meublés**
- 🏡 **Villas**
- 🏘️ **Studios**
- 🏕️ **Chalets**
- 🏰 **Résidences touristiques**
- 🏨 **Bungalows**

### Destinations saisonnières en Algérie :

#### 🌊 **Été (Juin-Septembre) - Côte Algérienne**
- Locations en bord de mer
- Stations balnéaires (Tipaza, Jijel, Béjaïa, Annaba, Oran, etc.)
- Villas avec vue mer
- Appartements près des plages

#### ⛷️ **Hiver (Décembre-Mars) - Montagnes et Ski**
- Chalets à Tikjda (Bouira)
- Logements à Chréa (Blida)
- Résidences en zones montagneuses
- Hébergements près des stations de ski

#### 🏜️ **Automne (Septembre-Novembre) - Sud Algérien**
- Maisons traditionnelles à Ghardaïa
- Hébergements à Tamanrasset
- Logements à Djanet
- Résidences dans les oasis

#### 🌸 **Printemps (Mars-Juin) - Hauts Plateaux**
- Locations à Sétif, Batna, Constantine
- Hébergements en zones rurales verdoyantes
- Gîtes dans les hauts plateaux

## ❌ Ce qui NE DOIT PAS être dans cette catégorie

### 🚫 Strictement interdit :
- 🚗 **Véhicules** (voitures, motos, camions, etc.)
  → Ces annonces doivent être dans **"Location Véhicules"**

- 📦 **Équipements** (outils, matériel, etc.)
  → Ces annonces doivent être dans **"Services"** ou catégories appropriées

- 🏢 **Locations commerciales** (bureaux, locaux commerciaux)
  → Ces annonces doivent être dans **"Immobilier Professionnel"**

- 🏘️ **Locations longue durée** (résidences principales)
  → Ces annonces doivent être dans **"Location Longue Durée"** si la catégorie existe

## 🔍 Exemples d'annonces valides

### ✅ Bon exemple 1
```
Titre: Villa 3 chambres bord de mer - Tipaza
Description: Magnifique villa meublée à louer pour l'été, capacité 6 personnes,
proche de la plage, terrasse avec vue mer.
Prix: 15 000 DA / nuit
```

### ✅ Bon exemple 2
```
Titre: Chalet montagne Tikjda - Séjour hiver
Description: Chalet cosy 2 chambres, cheminée, idéal pour séjour ski,
à 5 min de la station.
Prix: 12 000 DA / nuit
```

### ✅ Bon exemple 3
```
Titre: Appartement F3 Ghardaïa - Vacances Sud
Description: Appartement climatisé au cœur de Ghardaïa, idéal découverte du désert,
3 chambres, wifi inclus.
Prix: 8 000 DA / nuit
```

## ❌ Exemples d'annonces INCORRECTES

### ❌ Mauvais exemple 1 (VÉHICULE)
```
Titre: BMW Série 3 - Location avec chauffeur
Description: Voiture de luxe pour vos déplacements...
→ DOIT ÊTRE dans "Location Véhicules"
```

### ❌ Mauvais exemple 2 (VÉHICULE)
```
Titre: Dacia Logan automatique - Location journée
Description: Voiture économique en bon état...
→ DOIT ÊTRE dans "Location Véhicules"
```

### ❌ Mauvais exemple 3 (COMMERCIAL)
```
Titre: Local commercial 50m² - Centre ville
Description: Espace commercial à louer...
→ DOIT ÊTRE dans une catégorie commerciale
```

## 🛠️ Correction automatique

Une migration SQL a été créée pour :
1. ✅ Détecter automatiquement les véhicules mal catégorisés
2. ✅ Les déplacer vers "Location Véhicules" si la catégorie existe
3. ✅ Les supprimer sinon
4. ✅ Garantir que seuls les logements restent dans "Location Immobilière"

### Critères de détection des véhicules :
- Mots-clés : BMW, Mercedes, Dacia, Peugeot, Renault, Toyota, etc.
- Termes : voiture, auto, véhicule, car, 4x4, SUV, berline
- Attributs : fuel, mileage, transmission, year (sans bedrooms)

## 📊 Vérification

Pour vérifier que la catégorie est propre :
```sql
SELECT title, price, listing_type
FROM listings
WHERE category_id = (SELECT id FROM categories WHERE slug = 'location-immobiliere')
AND status = 'active'
LIMIT 20;
```

Les résultats doivent montrer UNIQUEMENT des logements, pas de véhicules !

## 🎯 Résumé

**Location Immobilière** = 🏠 **Vacances en Algérie**
- ✅ Maisons, villas, appartements
- ✅ Locations saisonnières
- ✅ Mer, montagne, désert, hauts plateaux
- ❌ PAS de véhicules
- ❌ PAS d'équipements
- ❌ PAS de locations commerciales

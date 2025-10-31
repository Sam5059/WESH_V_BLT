# TEST: Recherche par Catégorie depuis l'Accueil

## Problème
Quand on clique sur une catégorie de l'accueil (Véhicules, Immobilier, etc.), la page de recherche s'ouvre mais aucune annonce n'apparaît.

## Diagnostic
1. **Page d'accueil** affiche des catégories **parentes** (Véhicules, Immobilier)
2. **Annonces** dans la DB ont `category_id` pointant vers des **sous-catégories** (Voitures, Motos)
3. La fonction `search_listings` doit chercher dans toutes les sous-catégories quand on passe une catégorie parente

## Solution Appliquée
Migration `20251023000000_force_fix_search_with_parent_categories.sql` créée avec:
- Détection automatique des sous-catégories d'une catégorie parente
- Recherche dans `listings.category_id = ANY(subcategory_ids)`
- Logs NOTICE pour debug

## Comment Tester

### 1. Appliquer la Migration
Allez dans votre dashboard Supabase → SQL Editor → Coller le contenu de:
```
supabase/migrations/20251023000000_force_fix_search_with_parent_categories.sql
```

### 2. Vérifier les Logs dans l'Application
Les logs suivants devraient apparaître dans la console du navigateur:

**Quand vous cliquez sur une catégorie dans l'accueil:**
```
[HomePage] Category clicked: {id: "xxx", name: "Véhicules", slug: "vehicules"}
```

**Quand la page de recherche se charge:**
```
[SearchPage] Mounted with params: {category_id: "xxx", initialCategoryId: "xxx", ...}
[CategoriesAndFilters] Initial category detected: xxx
```

**Quand applyFilters est appelé:**
```
[applyFilters] ========================================
[applyFilters] Applying filters: {selectedCategory: "xxx", filters: {}, searchQuery: ""}
[applyFilters] RPC params: {
  "search_term": "",
  "category_filter": "xxx",
  "subcategory_filter": null,
  ...
}
[applyFilters] Search result: {count: 50, hasData: true, ...}
```

### 3. Tester Manuellement
1. Ouvrir l'application
2. Sur la page d'accueil, cliquer sur "Véhicules" 🚗
3. **RÉSULTAT ATTENDU**: La page de recherche affiche toutes les annonces de véhicules (Voitures, Motos, Camions, etc.)
4. Répéter avec "Immobilier" 🏠
5. **RÉSULTAT ATTENDU**: La page affiche toutes les annonces immobilières (Appartements, Maisons, Terrains, etc.)

### 4. Vérifier dans Supabase
```sql
-- 1. Lister les catégories parentes
SELECT id, name, slug FROM categories WHERE parent_id IS NULL;

-- 2. Prendre un ID de catégorie parente (ex: xxx)
-- 3. Lister ses sous-catégories
SELECT id, name FROM categories WHERE parent_id = 'xxx';

-- 4. Compter les annonces dans ces sous-catégories
SELECT c.name, COUNT(l.id) as count
FROM categories c
LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
WHERE c.parent_id = 'xxx'
GROUP BY c.name;

-- 5. Tester la fonction search_listings
SELECT * FROM search_listings(
  search_term := '',
  category_filter := 'xxx', -- ID catégorie parente
  subcategory_filter := NULL,
  wilaya_filter := NULL,
  commune_filter := NULL,
  min_price_filter := NULL,
  max_price_filter := NULL,
  listing_type_filter := NULL
);
-- Devrait retourner toutes les annonces des sous-catégories
```

## Checklist de Validation
- [ ] Migration appliquée sans erreur
- [ ] Console logs visibles dans le navigateur
- [ ] Clic sur "Véhicules" → annonces affichées
- [ ] Clic sur "Immobilier" → annonces affichées  
- [ ] Clic sur "Électronique" → annonces affichées
- [ ] Le nombre d'annonces correspond aux données DB

## En Cas de Problème
1. Ouvrir la console du navigateur (F12)
2. Copier tous les logs qui commencent par `[HomePage]`, `[SearchPage]`, `[CategoriesAndFilters]`, `[applyFilters]`
3. Vérifier que `category_filter` n'est pas `null`
4. Vérifier que la fonction RPC ne retourne pas d'erreur

# 🔍 DIAGNOSTIC: Recherche par Catégorie

## Symptôme
✅ Les catégories s'affichent correctement dans la sidebar
❌ Mais aucune annonce n'apparaît quand on clique sur une catégorie depuis l'accueil

---

## Étapes de Diagnostic

### ÉTAPE 1: Vérifier les Logs de la Console

1. **Ouvrir la console du navigateur** (F12)
2. **Cliquer sur une catégorie** de l'accueil (ex: Véhicules)
3. **Observer les logs suivants** :

```javascript
[HomePage] Category clicked: {id: "xxx", name: "Véhicules", slug: "vehicules"}
[SearchPage] Mounted with params: {category_id: "xxx", ...}
[CategoriesAndFilters] Initial category detected: xxx
[applyFilters] ========================================
[applyFilters] Applying filters: {selectedCategory: "xxx", filters: {}, searchQuery: ""}
[applyFilters] RPC params: {
  "search_term": "",
  "category_filter": "xxx",
  "subcategory_filter": null,
  ...
}
```

#### ✅ CAS 1: Pas d'erreur, mais count = 0
```javascript
[applyFilters] Search result: {count: 0, hasData: true, ...}
⚠️ No data returned from search_listings
  1. The migration has not been applied
  2. No listings exist in the subcategories
  3. The category_filter UUID is invalid
```

**👉 CAUSE**: La migration SQL n'a pas été appliquée !
**👉 SOLUTION**: Aller à l'ÉTAPE 2

---

#### ❌ CAS 2: Erreur RPC
```javascript
[applyFilters] ❌ Search error: {message: "...", code: "...", ...}
Error message: function search_listings(...) does not exist
```

**👉 CAUSE**: La fonction search_listings n'existe pas ou a une mauvaise signature
**👉 SOLUTION**: Aller à l'ÉTAPE 2

---

#### ❌ CAS 3: Erreur de syntaxe SQL
```javascript
Error message: syntax error at or near "..."
Error hint: ...
```

**👉 CAUSE**: La migration a été mal appliquée
**👉 SOLUTION**: Supprimer et recréer la fonction (ÉTAPE 2)

---

### ÉTAPE 2: Appliquer la Migration SQL

#### A. Ouvrir Supabase Dashboard
1. Aller sur https://supabase.com
2. Sélectionner votre projet
3. Cliquer sur **SQL Editor** dans le menu de gauche

#### B. Copier et Exécuter la Migration
1. Ouvrir le fichier : `supabase/migrations/20251023000000_force_fix_search_with_parent_categories.sql`
2. **COPIER TOUT LE CONTENU** du fichier
3. **COLLER** dans l'éditeur SQL de Supabase
4. Cliquer sur **Run** (ou Ctrl/Cmd + Enter)

#### C. Vérifier l'Exécution
Vous devriez voir :
```
✅ Success. No rows returned
```

Si vous voyez une erreur :
- Lire le message d'erreur
- Vérifier que vous avez copié TOUT le fichier
- Si l'erreur persiste, exécuter d'abord :
  ```sql
  DROP FUNCTION IF EXISTS search_listings;
  ```
  Puis réessayer.

---

### ÉTAPE 3: Tester dans Supabase SQL Editor

Après avoir appliqué la migration, tester directement dans SQL Editor :

```sql
-- 1. Récupérer l'ID d'une catégorie parente
SELECT id, name, slug FROM categories
WHERE slug = 'vehicules' LIMIT 1;
-- Note l'ID retourné (ex: abc-123-def-456)

-- 2. Tester la fonction search_listings
SELECT COUNT(*) FROM search_listings(
  search_term := '',
  category_filter := 'abc-123-def-456', -- Remplacer par l'ID ci-dessus
  subcategory_filter := NULL,
  wilaya_filter := NULL,
  commune_filter := NULL,
  min_price_filter := NULL,
  max_price_filter := NULL,
  listing_type_filter := NULL
);
-- Devrait retourner un nombre > 0
```

**Résultat attendu** :
```
count
-----
42
```

Si `count = 0` :
```sql
-- 3. Vérifier les sous-catégories et leurs annonces
SELECT
  c.name as subcategory,
  COUNT(l.id) as listings_count
FROM categories c
LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
WHERE c.parent_id = 'abc-123-def-456' -- Remplacer par l'ID de la catégorie parente
GROUP BY c.id, c.name;
```

---

### ÉTAPE 4: Script de Debug dans la Console

Si les étapes précédentes ne fonctionnent pas, utilisez le script de debug :

1. Ouvrir le fichier : `DEBUG_SEARCH_CONSOLE.js`
2. **COPIER TOUT LE CONTENU**
3. Ouvrir la **console du navigateur** (F12)
4. **COLLER** et appuyer sur Enter

Le script va :
- ✅ Trouver une catégorie parente
- ✅ Lister ses sous-catégories
- ✅ Compter les annonces dans chaque sous-catégorie
- ✅ Tester la fonction search_listings
- ✅ Afficher des diagnostics détaillés

---

## Solutions par Problème

### Problème 1: Migration non appliquée
**Symptôme** : `count = 0` ou erreur "function does not exist"
**Solution** : Appliquer la migration (ÉTAPE 2)

### Problème 2: Catégories sans annonces
**Symptôme** : Fonction fonctionne mais retourne 0 résultat
**Solution** : Vérifier dans SQL Editor :
```sql
SELECT c.name, COUNT(l.id)
FROM categories c
LEFT JOIN listings l ON l.category_id = c.id
WHERE c.parent_id = (SELECT id FROM categories WHERE slug = 'vehicules')
GROUP BY c.name;
```

Si toutes les sous-catégories ont 0 annonces :
→ Créer des annonces de test OU choisir une autre catégorie

### Problème 3: UUID invalide
**Symptôme** : Erreur "invalid input syntax for type uuid"
**Solution** : Vérifier que `category_id` passé dans l'URL est bien un UUID valide

### Problème 4: Fonction avec mauvaise signature
**Symptôme** : Erreur "function search_listings(...) does not exist"
**Solution** :
```sql
-- Supprimer toutes les versions
DROP FUNCTION IF EXISTS search_listings;

-- Puis réappliquer la migration complète
```

---

## Checklist Finale

Avant de dire que ça ne fonctionne pas, vérifier :

- [ ] La migration SQL a été appliquée (ÉTAPE 2)
- [ ] Pas d'erreur lors de l'application de la migration
- [ ] La fonction existe dans Supabase (`SELECT * FROM pg_proc WHERE proname = 'search_listings'`)
- [ ] La catégorie parente a des sous-catégories (`SELECT COUNT(*) FROM categories WHERE parent_id = 'xxx'`)
- [ ] Les sous-catégories ont des annonces actives
- [ ] Les logs de la console montrent le bon `category_filter`
- [ ] Pas d'erreur RPC dans les logs

---

## Si Rien ne Fonctionne

**Exécuter ces requêtes SQL et copier les résultats** :

```sql
-- 1. Vérifier la fonction
SELECT
  proname,
  pg_get_function_arguments(oid),
  pg_get_functiondef(oid) LIKE '%subcategory_ids%' as has_fix
FROM pg_proc
WHERE proname = 'search_listings';

-- 2. Vérifier une catégorie
SELECT * FROM categories WHERE slug = 'vehicules';

-- 3. Vérifier ses sous-catégories
SELECT c.*, COUNT(l.id) as listings_count
FROM categories c
LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
WHERE c.parent_id = (SELECT id FROM categories WHERE slug = 'vehicules')
GROUP BY c.id;

-- 4. Tester manuellement
SELECT COUNT(*) FROM search_listings(
  '',
  (SELECT id FROM categories WHERE slug = 'vehicules'),
  NULL, NULL, NULL, NULL, NULL, NULL
);
```

**Envoyer ces résultats pour un diagnostic plus approfondi.**

---

## Résumé des Fichiers

- ✅ **20251023000000_force_fix_search_with_parent_categories.sql** : Migration à appliquer
- ✅ **TEST_SEARCH_FUNCTION.sql** : Tests SQL à exécuter dans Supabase
- ✅ **DEBUG_SEARCH_CONSOLE.js** : Script de debug pour la console du navigateur
- ✅ **DIAGNOSTIC_RECHERCHE_CATEGORIES.md** : Ce guide (vous êtes ici)

---

## Support

Si après avoir suivi TOUTES ces étapes le problème persiste :

1. Ouvrir la console (F12)
2. Cliquer sur une catégorie
3. Copier TOUS les logs
4. Exécuter le script `DEBUG_SEARCH_CONSOLE.js`
5. Copier TOUS les résultats
6. Exécuter les requêtes SQL de "Si Rien ne Fonctionne"
7. Envoyer tout ça

🎯 **La cause la plus probable reste : LA MIGRATION N'A PAS ÉTÉ APPLIQUÉE**

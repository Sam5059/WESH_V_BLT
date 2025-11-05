# AUCUNE ANNONCE APRÈS FILTRE → SOLUTION

## Problème
Filtres ne fonctionnent pas → Aucune annonce

## Cause
Fonction SQL manquante dans Supabase

## Solution (5 min)

### 1. Supabase Dashboard
https://supabase.com/dashboard
→ SQL Editor
→ New Query

### 2. Copier fichier
`supabase/migrations/20251020_fix_category_filter_correct.sql`
Ctrl+A → Ctrl+C

### 3. Exécuter
Coller → Run ▶️

Messages attendus:
```
Test Véhicules : 2 annonces
✅ Tests terminés !
```

### 4. Redémarrer app
Fermer → Rouvrir

## Tests
- Filtre Véhicules → 2 annonces ✅
- Recherche BMW → 1 annonce ✅

## Si erreur
Appliquer d'abord: `20251020_restructure_with_subcategories_table.sql`

## Fichiers
- `FIX_SEARCH_NOW.md` - Guide complet
- `FIX_SEARCH_SQL.sql` - Test rapide

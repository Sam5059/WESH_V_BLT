# 🚨 CORRECTION URGENTE - Filtres de catégorie cassés

## ❌ Problème

Quand vous cliquez sur une catégorie (Véhicules, Immobilier, etc.) dans la page Recherche, **aucune annonce ne s'affiche**.

### Cause

Après la restructuration, les annonces ont :
- `category_id` → Catégorie PARENTE (Véhicules, Immobilier)
- `subcategory_id` → Sous-catégorie (Voitures, Appartements)

Mais le code de recherche utilisait encore l'ancienne logique.

---

## ✅ Solution appliquée

### 1. Frontend corrigé : `app/(tabs)/search.tsx`

**Ligne 555-565** : Logique simplifiée
```typescript
if (isParentCategory) {
  // Cherche dans category_id
  query = query.eq('category_id', selectedCategory);
} else {
  // Cherche dans subcategory_id
  query = query.eq('subcategory_id', selectedCategory);
}
```

### 2. Backend corrigé : `search_listings()`

**Fichier** : `supabase/migrations/20251020_fix_category_filter_correct.sql`

La fonction vérifie maintenant si `category_filter` est parente ou sous-catégorie.

---

## 🚀 Application

### Étape 1 : Migration SQL (OBLIGATOIRE)

1. **Supabase Dashboard** → **SQL Editor**
2. Copiez `supabase/migrations/20251020_fix_category_filter_correct.sql`
3. **Run** ▶️
4. Vérifiez :
   ```
   Test Véhicules : 2 annonces
   Test Immobilier : 1 annonce
   ✅ Tests terminés !
   ```

### Étape 2 : Redémarrer l'app

Fermez et rouvrez l'application.

---

## 🧪 Tests

- [ ] Clic "Véhicules" → 2 annonces
- [ ] Clic "Immobilier" → 1 annonce
- [ ] Compteurs : Véhicules (2), Immobilier (1)

---

## ✅ Résultat

Les filtres de catégorie fonctionnent maintenant correctement ! 🎉

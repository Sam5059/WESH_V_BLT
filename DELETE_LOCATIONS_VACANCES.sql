/*
  Suppression de la sous-catégorie "Locations vacances" de l'immobilier

  Cette sous-catégorie sera supprimée car elle n'est plus nécessaire.
  Les annonces associées seront également supprimées.
*/

-- Vérifier d'abord la sous-catégorie
SELECT id, name, slug, parent_id
FROM categories
WHERE slug = 'locations-vacances' OR name ILIKE '%location%vacances%';

-- Supprimer les annonces liées à cette sous-catégorie (si elle existe)
DELETE FROM listings
WHERE category_id IN (
  SELECT id FROM categories WHERE slug = 'locations-vacances'
);

-- Supprimer la sous-catégorie
DELETE FROM categories
WHERE slug = 'locations-vacances';

-- Vérifier que c'est bien supprimé
SELECT id, name, slug, parent_id
FROM categories
WHERE parent_id IN (SELECT id FROM categories WHERE slug = 'immobilier')
ORDER BY display_order, name;

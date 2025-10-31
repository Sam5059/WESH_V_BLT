-- Vérifier que les packages PRO ont été créés
SELECT
  c.name as "Catégorie",
  c.slug as "Slug",
  pp.name as "Package",
  pp.price as "Prix (DA/mois)",
  pp.max_listings as "Annonces Max",
  pp.featured_listings as "En Vedette",
  pp.order_position as "Ordre"
FROM pro_packages pp
JOIN categories c ON pp.category_id = c.id
WHERE c.parent_id IS NULL
ORDER BY c.order_position, pp.order_position;

-- Comptage total
SELECT COUNT(*) as "Total Packages" FROM pro_packages;

-- Par catégorie
SELECT
  c.name as "Catégorie",
  COUNT(pp.id) as "Nombre Packages"
FROM categories c
LEFT JOIN pro_packages pp ON pp.category_id = c.id
WHERE c.parent_id IS NULL
GROUP BY c.id, c.name
ORDER BY c.order_position;

/*
  # Réorganisation des sous-catégories d'animaux

  1. Objectif
    - Mettre les animaux de compagnie (chiens, chats, oiseaux, poissons, rongeurs) en fin de liste
    - Garder les catégories professionnelles (animaux de ferme, chevaux, accessoires) en début

  2. Nouvel ordre
    1. Accessoires animaux
    2. Animaux de ferme
    3. Chevaux
    4. Poissons & Aquariums
    5. Rongeurs
    6. Oiseaux
    7. Chats
    8. Chiens

  3. Notes
    - Les animaux domestiques sont moins prioritaires sur le marché algérien
*/

-- Réorganiser les sous-catégories d'animaux
DO $$
DECLARE
  animaux_id uuid;
BEGIN
  -- Get animaux category ID
  SELECT id INTO animaux_id FROM categories WHERE slug = 'animaux';

  IF animaux_id IS NOT NULL THEN
    -- Update order positions for animal subcategories
    UPDATE categories SET order_position = 1 WHERE slug = 'accessoires-animaux' AND parent_id = animaux_id;
    UPDATE categories SET order_position = 2 WHERE slug = 'animaux-ferme' AND parent_id = animaux_id;
    UPDATE categories SET order_position = 3 WHERE slug = 'chevaux' AND parent_id = animaux_id;
    UPDATE categories SET order_position = 4 WHERE slug = 'poissons-aquariums' AND parent_id = animaux_id;
    UPDATE categories SET order_position = 5 WHERE slug = 'rongeurs' AND parent_id = animaux_id;
    UPDATE categories SET order_position = 6 WHERE slug = 'oiseaux' AND parent_id = animaux_id;
    UPDATE categories SET order_position = 7 WHERE slug = 'chats' AND parent_id = animaux_id;
    UPDATE categories SET order_position = 8 WHERE slug = 'chiens' AND parent_id = animaux_id;
  END IF;
END $$;

/*
  # Add display_order to categories and reorganize order

  1. Changes
    - Add display_order column to categories table
    - Set display_order values to organize categories
    - Order: Stores PRO, Véhicules, Immobilier, Électronique, Location categories, then others, Animaux last
  
  2. New Order
    1. Stores PRO
    2. Véhicules
    3. Immobilier
    4. Électronique
    5. Location Immobilier
    6. Location Vacances
    7. Location Véhicules
    8. Location Équipements
    9. Mode & Beauté
    10. Maison & Jardin
    11. Emploi
    12. Services
    13. Emploi & Services
    14. Loisirs & Hobbies
    15. Loisirs & Divertissement
    16. Matériel Professionnel
    17. Entreprises à vendre
    18. Bébé & Enfants
    19. Animaux (last)
*/

-- Add display_order column
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Set display_order for main categories based on new order
UPDATE categories SET display_order = 1 WHERE slug = 'stores-pro';
UPDATE categories SET display_order = 2 WHERE slug = 'vehicules';
UPDATE categories SET display_order = 3 WHERE slug = 'immobilier';
UPDATE categories SET display_order = 4 WHERE slug = 'electronique';
UPDATE categories SET display_order = 5 WHERE slug = 'location-immobilier';
UPDATE categories SET display_order = 6 WHERE slug = 'location-vacances';
UPDATE categories SET display_order = 7 WHERE slug = 'location-vehicules';
UPDATE categories SET display_order = 8 WHERE slug = 'location-equipements';
UPDATE categories SET display_order = 9 WHERE slug = 'mode-beaute';
UPDATE categories SET display_order = 10 WHERE slug = 'maison-jardin';
UPDATE categories SET display_order = 11 WHERE slug = 'emploi';
UPDATE categories SET display_order = 12 WHERE slug = 'services';
UPDATE categories SET display_order = 13 WHERE slug = 'emploi-services';
UPDATE categories SET display_order = 14 WHERE slug = 'loisirs';
UPDATE categories SET display_order = 15 WHERE slug = 'loisirs-divertissement';
UPDATE categories SET display_order = 16 WHERE slug = 'materiel-professionnel';
UPDATE categories SET display_order = 17 WHERE slug = 'entreprises-vendre';
UPDATE categories SET display_order = 18 WHERE slug = 'bebe-enfants';
UPDATE categories SET display_order = 19 WHERE slug = 'animaux';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

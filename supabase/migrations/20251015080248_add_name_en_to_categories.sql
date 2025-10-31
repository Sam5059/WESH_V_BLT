/*
  # Ajouter la colonne name_en à la table categories

  1. Modifications
    - Ajouter la colonne `name_en` de type TEXT à la table `categories`
    - Remplir les valeurs avec des traductions anglaises des noms de catégories

  2. Notes
    - Cette colonne permet d'avoir les noms de catégories en anglais pour le support multilingue
*/

-- Ajouter la colonne name_en si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'name_en'
  ) THEN
    ALTER TABLE categories ADD COLUMN name_en TEXT;
  END IF;
END $$;

-- Mettre à jour les traductions anglaises pour les catégories principales
UPDATE categories SET name_en = 'Vehicles' WHERE slug = 'vehicules';
UPDATE categories SET name_en = 'Real Estate' WHERE slug = 'immobilier';
UPDATE categories SET name_en = 'Electronics' WHERE slug = 'electronique';
UPDATE categories SET name_en = 'Home & Garden' WHERE slug = 'maison-jardin';
UPDATE categories SET name_en = 'Fashion & Beauty' WHERE slug = 'mode-beaute';
UPDATE categories SET name_en = 'Jobs' WHERE slug = 'emploi';
UPDATE categories SET name_en = 'Services' WHERE slug = 'services';
UPDATE categories SET name_en = 'Leisure & Hobbies' WHERE slug = 'loisirs-hobbies';

-- Pour toutes les autres catégories sans name_en, utiliser le nom français comme fallback
UPDATE categories SET name_en = name WHERE name_en IS NULL;

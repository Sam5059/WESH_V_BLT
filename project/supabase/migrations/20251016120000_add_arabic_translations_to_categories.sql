/*
  # Ajouter les Traductions Arabes aux Catégories

  Cette migration ajoute la colonne `name_ar` à la table `categories`
  et remplit les traductions arabes pour toutes les catégories principales.

  ## Modifications
  - Ajouter la colonne `name_ar` (TEXT) à la table `categories`
  - Remplir les traductions arabes pour les catégories principales
  - Utiliser le nom français comme fallback si pas de traduction

  ## Notes
  - Les traductions arabes permettent l'affichage dans l'interface multilingue
  - Toutes les catégories héritent des traductions
*/

-- ============================================
-- 1. Ajouter la colonne name_ar
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'name_ar'
  ) THEN
    ALTER TABLE categories ADD COLUMN name_ar TEXT;
  END IF;
END $$;

-- ============================================
-- 2. Traductions arabes des catégories principales
-- ============================================

-- Véhicules
UPDATE categories SET name_ar = 'مركبات' WHERE slug = 'vehicules';

-- Immobilier
UPDATE categories SET name_ar = 'عقارات' WHERE slug = 'immobilier';

-- Électronique
UPDATE categories SET name_ar = 'إلكترونيات' WHERE slug = 'electronique';

-- Maison & Jardin
UPDATE categories SET name_ar = 'منزل وحديقة' WHERE slug = 'maison-jardin';

-- Mode & Beauté
UPDATE categories SET name_ar = 'موضة وجمال' WHERE slug = 'mode-beaute';

-- Emploi
UPDATE categories SET name_ar = 'وظائف' WHERE slug = 'emploi';

-- Services
UPDATE categories SET name_ar = 'خدمات' WHERE slug = 'services';

-- Loisirs & Hobbies
UPDATE categories SET name_ar = 'ترفيه وهوايات' WHERE slug = 'loisirs-hobbies';

-- Animaux
UPDATE categories SET name_ar = 'حيوانات' WHERE slug = 'animaux';

-- ============================================
-- 3. Sous-catégories Véhicules
-- ============================================

UPDATE categories SET name_ar = 'سيارات' WHERE slug = 'voitures';
UPDATE categories SET name_ar = 'دراجات نارية' WHERE slug = 'motos';
UPDATE categories SET name_ar = 'شاحنات' WHERE slug = 'camions';
UPDATE categories SET name_ar = 'معدات زراعية' WHERE slug = 'equipement-agricole';
UPDATE categories SET name_ar = 'قطع غيار' WHERE slug = 'pieces-detachees';

-- ============================================
-- 4. Sous-catégories Immobilier
-- ============================================

UPDATE categories SET name_ar = 'شقق' WHERE slug = 'appartements';
UPDATE categories SET name_ar = 'منازل' WHERE slug = 'maisons';
UPDATE categories SET name_ar = 'محلات تجارية' WHERE slug = 'locaux-commerciaux';
UPDATE categories SET name_ar = 'أراضي' WHERE slug = 'terrains';
UPDATE categories SET name_ar = 'مكاتب' WHERE slug = 'bureaux';

-- ============================================
-- 5. Sous-catégories Électronique
-- ============================================

UPDATE categories SET name_ar = 'هواتف ذكية' WHERE slug = 'smartphones';
UPDATE categories SET name_ar = 'حواسيب' WHERE slug = 'ordinateurs';
UPDATE categories SET name_ar = 'لابتوبات' WHERE slug = 'tablettes';
UPDATE categories SET name_ar = 'تلفزيونات' WHERE slug = 'tv-video';
UPDATE categories SET name_ar = 'صوتيات' WHERE slug = 'audio';

-- ============================================
-- 6. Sous-catégories Maison & Jardin
-- ============================================

UPDATE categories SET name_ar = 'أثاث' WHERE slug = 'meubles';
UPDATE categories SET name_ar = 'ديكور' WHERE slug = 'decoration';
UPDATE categories SET name_ar = 'كهرومنزلي' WHERE slug = 'electromenager';
UPDATE categories SET name_ar = 'حديقة' WHERE slug = 'jardin';

-- ============================================
-- 7. Sous-catégories Mode & Beauté
-- ============================================

UPDATE categories SET name_ar = 'ملابس رجالية' WHERE slug = 'vetements-hommes';
UPDATE categories SET name_ar = 'ملابس نسائية' WHERE slug = 'vetements-femmes';
UPDATE categories SET name_ar = 'ملابس أطفال' WHERE slug = 'vetements-enfants';
UPDATE categories SET name_ar = 'أحذية' WHERE slug = 'chaussures';
UPDATE categories SET name_ar = 'إكسسوارات' WHERE slug = 'accessoires';

-- ============================================
-- 8. Sous-catégories Emploi
-- ============================================

UPDATE categories SET name_ar = 'عروض عمل' WHERE slug = 'offres-emploi';
UPDATE categories SET name_ar = 'طلبات عمل' WHERE slug = 'demandes-emploi';

-- ============================================
-- 9. Sous-catégories Services
-- ============================================

UPDATE categories SET name_ar = 'خدمات منزلية' WHERE slug = 'services-maison';
UPDATE categories SET name_ar = 'دروس خصوصية' WHERE slug = 'cours-particuliers';
UPDATE categories SET name_ar = 'فعاليات' WHERE slug = 'evenements';

-- ============================================
-- 10. Sous-catégories Loisirs & Hobbies
-- ============================================

UPDATE categories SET name_ar = 'رياضة' WHERE slug = 'sport';
UPDATE categories SET name_ar = 'ألعاب فيديو' WHERE slug = 'jeux-video';
UPDATE categories SET name_ar = 'كتب' WHERE slug = 'livres';
UPDATE categories SET name_ar = 'موسيقى' WHERE slug = 'musique';

-- ============================================
-- 11. Sous-catégories Animaux
-- ============================================

UPDATE categories SET name_ar = 'كلاب' WHERE slug = 'chiens';
UPDATE categories SET name_ar = 'قطط' WHERE slug = 'chats';
UPDATE categories SET name_ar = 'طيور' WHERE slug = 'oiseaux';
UPDATE categories SET name_ar = 'حيوانات أخرى' WHERE slug = 'autres-animaux';

-- ============================================
-- 12. Fallback pour catégories sans traduction
-- ============================================

-- Pour toutes les catégories qui n'ont pas de traduction arabe, utiliser le nom français
UPDATE categories SET name_ar = name WHERE name_ar IS NULL;

-- ============================================
-- 13. Commentaire sur la colonne
-- ============================================

COMMENT ON COLUMN categories.name_ar IS 'Nom de la catégorie en arabe pour le support multilingue';

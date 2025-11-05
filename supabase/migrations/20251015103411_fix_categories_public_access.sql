/*
  # Correction accès public aux catégories

  Permet à TOUS les utilisateurs (même non connectés) de voir les catégories
*/

-- Supprimer l'ancienne policy restrictive
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;

-- Créer une nouvelle policy qui autorise TOUT LE MONDE à voir les catégories
CREATE POLICY "Public can view categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

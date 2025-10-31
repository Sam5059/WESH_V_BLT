/*
  # Correction des permissions du bucket listings
  
  Simplification des politiques pour permettre l'upload :
  - Tous les utilisateurs authentifiés peuvent uploader
  - Tous les utilisateurs authentifiés peuvent gérer leurs images
  - Le bucket reste public pour la lecture
*/

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Politique simplifiée : Les utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listings'
);

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listings' AND owner = auth.uid())
WITH CHECK (bucket_id = 'listings' AND owner = auth.uid());

-- Politique : Les utilisateurs peuvent supprimer leurs propres images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listings' AND owner = auth.uid());

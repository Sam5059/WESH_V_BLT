/*
  # Créer le bucket de stockage pour les photos d'annonces

  1. Création du bucket
    - Nom: `listings`
    - Public: true (pour afficher les images)
    - Taille max fichier: 5MB
    - Types acceptés: images

  2. Sécurité RLS
    - Les utilisateurs authentifiés peuvent uploader dans leur propre dossier
    - Tout le monde peut lire les images (bucket public)
    - Les utilisateurs peuvent supprimer leurs propres images
*/

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public Access for listings images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Créer le bucket public pour les images d'annonces
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings',
  'listings',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Politique: Tout le monde peut lire les images du bucket listings (public)
CREATE POLICY "Public Access for listings images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listings');

-- Politique: Les utilisateurs authentifiés peuvent uploader dans leur propre dossier
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique: Les utilisateurs peuvent mettre à jour leurs propres images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique: Les utilisateurs peuvent supprimer leurs propres images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

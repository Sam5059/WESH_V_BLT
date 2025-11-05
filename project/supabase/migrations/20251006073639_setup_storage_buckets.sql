/*
  # Setup Storage Buckets for Buy&Go

  ## Description
  Creates and configures Supabase Storage buckets for user avatars and listing images
  with appropriate security policies.

  ## New Buckets

  ### 1. avatars
  - Stores user profile pictures
  - Public access for viewing
  - Users can only upload/update their own avatars
  - Max file size: 2MB
  - Allowed types: image/jpeg, image/png, image/webp

  ### 2. listings
  - Stores listing images (up to 8 per listing)
  - Public access for viewing
  - Users can only upload images for their own listings
  - Max file size: 5MB per image
  - Allowed types: image/jpeg, image/png, image/webp

  ## Security
  - RLS policies ensure users can only manage their own files
  - Public read access for all authenticated users
  - Automatic cleanup handled by ON DELETE CASCADE in listings table
*/

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Create listings bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings',
  'listings',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Storage policies for avatars bucket

-- Allow authenticated users to view all avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for listings bucket

-- Allow authenticated users to view all listing images
CREATE POLICY "Anyone can view listing images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'listings');

-- Allow users to upload images for their own listings
CREATE POLICY "Users can upload listing images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'listings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update images for their own listings
CREATE POLICY "Users can update listing images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'listings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'listings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete images for their own listings
CREATE POLICY "Users can delete listing images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'listings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
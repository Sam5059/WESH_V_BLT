/*
  # Create Storage Bucket for Listing Images

  1. Bucket Creation
    - Create 'listings' bucket for storing listing photos
    - Set as public for easy image access
    - Configure file size limits and allowed MIME types

  2. Security Policies
    - Allow authenticated users to upload images
    - Allow public read access to all images
    - Allow users to delete their own images

  3. Notes
    - Max file size: 5MB per image
    - Allowed types: image/jpeg, image/png, image/webp
    - Files organized by user ID folders
*/

-- Create the listings storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings',
  'listings',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own listing images" ON storage.objects;

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listings');

-- Policy: Allow public read access to all images
CREATE POLICY "Public read access for listing images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'listings');

-- Policy: Allow users to update their own images
CREATE POLICY "Users can update own listing images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Allow users to delete their own images
CREATE POLICY "Users can delete own listing images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text);

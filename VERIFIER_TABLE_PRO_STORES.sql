-- ============================================
-- VÉRIFIER ET CRÉER LA TABLE PRO_STORES
-- ============================================

-- 1. Vérifier si la table existe
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'pro_stores'
    )
    THEN '✅ La table pro_stores existe'
    ELSE '❌ La table pro_stores N''EXISTE PAS'
  END as status;

-- 2. Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS pro_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  logo_url text,
  banner_url text,
  location text,
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  website_url text,
  whatsapp_number text,
  facebook_url text,
  instagram_url text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Activer RLS
ALTER TABLE pro_stores ENABLE ROW LEVEL SECURITY;

-- 4. Créer les policies (DROP d'abord pour éviter les doublons)
DROP POLICY IF EXISTS "Public can view active stores" ON pro_stores;
DROP POLICY IF EXISTS "PRO users can create stores" ON pro_stores;
DROP POLICY IF EXISTS "Users can update own store" ON pro_stores;

-- Lecture publique (stores actifs)
CREATE POLICY "Public can view active stores"
  ON pro_stores FOR SELECT
  TO public
  USING (is_active = true);

-- Création réservée aux utilisateurs avec abonnement PRO actif
CREATE POLICY "PRO users can create stores"
  ON pro_stores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pro_subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND expires_at > now()
    )
    AND NOT EXISTS (
      SELECT 1 FROM pro_stores
      WHERE user_id = auth.uid()
    )
  );

-- Modification par le propriétaire uniquement
CREATE POLICY "Users can update own store"
  ON pro_stores FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. Créer un index sur le slug
CREATE INDEX IF NOT EXISTS pro_stores_slug_idx ON pro_stores(slug);
CREATE INDEX IF NOT EXISTS pro_stores_user_id_idx ON pro_stores(user_id);
CREATE INDEX IF NOT EXISTS pro_stores_category_id_idx ON pro_stores(category_id);

-- 6. Vérifier les colonnes de la table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pro_stores'
ORDER BY ordinal_position;

-- 7. Vérifier les policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'pro_stores';

-- 8. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ TABLE PRO_STORES VÉRIFIÉE ET CONFIGURÉE';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Vérifications effectuées:';
  RAISE NOTICE '- Table créée (si nécessaire)';
  RAISE NOTICE '- RLS activé';
  RAISE NOTICE '- Policies créées';
  RAISE NOTICE '- Index créés';
  RAISE NOTICE '';
  RAISE NOTICE 'Vous pouvez maintenant créer des stores !';
  RAISE NOTICE '';
END $$;

/*
  # Système de limitation des annonces selon les forfaits Pro

  1. Nouvelles Fonctions
    - `get_user_active_listings_count` - Compte les annonces actives d'un utilisateur
    - `get_user_package_max_listings` - Récupère la limite d'annonces du forfait actif
    - `can_user_publish_listing` - Vérifie si l'utilisateur peut publier une nouvelle annonce
    - `get_user_listings_quota` - Récupère le quota complet (utilisé/limite)

  2. Sécurité
    - Fonctions accessibles aux utilisateurs authentifiés
    - Vérifie les dates d'expiration des forfaits
    - Gère les utilisateurs sans forfait (limite par défaut)

  3. Logique
    - Utilisateurs individuels : 3 annonces gratuites
    - Utilisateurs Pro avec forfait actif : limite selon le forfait
    - Utilisateurs Pro sans forfait actif : 3 annonces (comme individuel)
*/

-- =====================================================
-- FONCTION: Compter les annonces actives d'un utilisateur
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_active_listings_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)::integer
  INTO v_count
  FROM listings
  WHERE user_id = p_user_id
    AND status = 'active';

  RETURN COALESCE(v_count, 0);
END;
$$;

-- =====================================================
-- FONCTION: Récupérer la limite max d'annonces du forfait
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_package_max_listings(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_listings integer;
  v_user_type text;
  v_has_active_package boolean;
  v_package_expires_at timestamptz;
  v_package_id uuid;
BEGIN
  -- Récupérer les infos du profil utilisateur
  SELECT
    user_type,
    has_active_pro_package,
    pro_package_expires_at,
    pro_package_id
  INTO
    v_user_type,
    v_has_active_package,
    v_package_expires_at,
    v_package_id
  FROM profiles
  WHERE id = p_user_id;

  -- Si pas de profil trouvé, retourner limite par défaut
  IF NOT FOUND THEN
    RETURN 3;
  END IF;

  -- Vérifier si le forfait est vraiment actif
  IF v_has_active_package = true
     AND v_package_expires_at IS NOT NULL
     AND v_package_expires_at > NOW()
     AND v_package_id IS NOT NULL THEN

    -- Récupérer la limite du forfait actif
    SELECT max_listings
    INTO v_max_listings
    FROM pro_packages
    WHERE id = v_package_id;

    RETURN COALESCE(v_max_listings, 3);
  END IF;

  -- Par défaut : 3 annonces gratuites pour tous
  RETURN 3;
END;
$$;

-- =====================================================
-- FONCTION: Vérifier si l'utilisateur peut publier
-- =====================================================
CREATE OR REPLACE FUNCTION can_user_publish_listing(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_count integer;
  v_max_listings integer;
BEGIN
  -- Compter les annonces actives
  v_active_count := get_user_active_listings_count(p_user_id);

  -- Récupérer la limite maximale
  v_max_listings := get_user_package_max_listings(p_user_id);

  -- Retourner true si l'utilisateur n'a pas atteint la limite
  RETURN v_active_count < v_max_listings;
END;
$$;

-- =====================================================
-- FONCTION: Récupérer le quota complet (JSON)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_listings_quota(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_active_count integer;
  v_max_listings integer;
  v_can_publish boolean;
  v_user_type text;
  v_package_name text;
  v_package_expires_at timestamptz;
BEGIN
  -- Récupérer les infos
  v_active_count := get_user_active_listings_count(p_user_id);
  v_max_listings := get_user_package_max_listings(p_user_id);
  v_can_publish := can_user_publish_listing(p_user_id);

  -- Récupérer le type d'utilisateur et infos forfait
  SELECT
    p.user_type,
    pp.name,
    p.pro_package_expires_at
  INTO
    v_user_type,
    v_package_name,
    v_package_expires_at
  FROM profiles p
  LEFT JOIN pro_packages pp ON p.pro_package_id = pp.id
  WHERE p.id = p_user_id;

  -- Retourner le quota au format JSON
  RETURN json_build_object(
    'active_count', v_active_count,
    'max_listings', v_max_listings,
    'remaining', v_max_listings - v_active_count,
    'can_publish', v_can_publish,
    'user_type', COALESCE(v_user_type, 'individual'),
    'package_name', v_package_name,
    'package_expires_at', v_package_expires_at
  );
END;
$$;

-- =====================================================
-- GRANTS: Permissions d'accès
-- =====================================================
GRANT EXECUTE ON FUNCTION get_user_active_listings_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_package_max_listings(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_publish_listing(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_listings_quota(uuid) TO authenticated;

-- =====================================================
-- COMMENTAIRES: Documentation
-- =====================================================
COMMENT ON FUNCTION get_user_active_listings_count IS
'Compte le nombre d''annonces actives d''un utilisateur';

COMMENT ON FUNCTION get_user_package_max_listings IS
'Retourne la limite maximale d''annonces selon le forfait de l''utilisateur';

COMMENT ON FUNCTION can_user_publish_listing IS
'Vérifie si l''utilisateur peut publier une nouvelle annonce';

COMMENT ON FUNCTION get_user_listings_quota IS
'Retourne le quota complet avec toutes les informations (actives/max/restantes)';

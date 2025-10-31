-- ============================================
-- Script SQL : Restaurer l'accès admin pour samouaaz@gmail.com
-- ============================================
--
-- INSTRUCTIONS :
-- 1. Ouvrez Supabase Dashboard dans SQL Editor
-- 2. Copiez-collez ce script
-- 3. Cliquez sur "Run"
--
-- ============================================

DO $$
DECLARE
  user_id uuid;
  user_email text := 'samouaaz@gmail.com';
BEGIN
  -- Récupérer l'ID de l'utilisateur
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;

  IF user_id IS NULL THEN
    RAISE EXCEPTION '❌ Utilisateur % non trouvé !', user_email;
  END IF;

  RAISE NOTICE '📝 Utilisateur trouvé : %', user_id;

  -- Vérifier si le profil existe
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Créer le profil s'il n'existe pas
    INSERT INTO profiles (id, full_name, created_at, updated_at)
    VALUES (user_id, 'Sam OUAAZ', now(), now());
    RAISE NOTICE '✅ Profil créé';
  END IF;

  -- Promouvoir en admin
  UPDATE profiles
  SET
    role = 'admin',
    is_admin = true,
    updated_at = now()
  WHERE id = user_id;

  RAISE NOTICE '✅ Privilèges admin accordés !';

END $$;

-- ============================================
-- VÉRIFICATION DU RÉSULTAT
-- ============================================

SELECT
  '✅ ACCÈS ADMIN RESTAURÉ !' as status,
  u.id,
  u.email,
  p.full_name,
  p.role,
  p.is_admin,
  CASE
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmé'
    ELSE '❌ Non confirmé'
  END as email_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'samouaaz@gmail.com';

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════╗';
  RAISE NOTICE '║   ACCÈS ADMIN RESTAURÉ !                      ║';
  RAISE NOTICE '╠═══════════════════════════════════════════════╣';
  RAISE NOTICE '║                                               ║';
  RAISE NOTICE '║   📧 Email : samouaaz@gmail.com               ║';
  RAISE NOTICE '║   🛡️  Rôle  : admin                            ║';
  RAISE NOTICE '║                                               ║';
  RAISE NOTICE '╠═══════════════════════════════════════════════╣';
  RAISE NOTICE '║   PROCHAINES ÉTAPES :                         ║';
  RAISE NOTICE '║   1. Rechargez votre page                     ║';
  RAISE NOTICE '║   2. Allez dans Profil → Paramètres           ║';
  RAISE NOTICE '║   3. Le bouton "Dashboard Admin" est visible  ║';
  RAISE NOTICE '║                                               ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

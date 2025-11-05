-- ============================================
-- RÉINITIALISATION RAPIDE - Samir.ouaaz@bilinfolan.fr
-- ============================================
--
-- INSTRUCTIONS ULTRA-SIMPLES:
-- 1. Copiez TOUT ce fichier
-- 2. Allez sur: https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/sql
-- 3. Collez dans "New query"
-- 4. Cliquez "Run"
-- 5. Connectez-vous avec le nouveau mot de passe!
--
-- ============================================

-- 🔑 NOUVEAU MOT DE PASSE: Admin2025
DO $$
BEGIN
  -- Réinitialisation du mot de passe
  UPDATE auth.users
  SET
    encrypted_password = crypt('Admin2025', gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()
  WHERE email = 'Samir.ouaaz@bilinfolan.fr';

  -- Vérifier que ça a fonctionné
  IF FOUND THEN
    RAISE NOTICE '';
    RAISE NOTICE '╔══════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ MOT DE PASSE RÉINITIALISÉ AVEC SUCCÈS  ║';
    RAISE NOTICE '╚══════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Email: Samir.ouaaz@bilinfolan.fr';
    RAISE NOTICE '🔑 Mot de passe: Admin2025';
    RAISE NOTICE '';
    RAISE NOTICE '🌐 Connectez-vous maintenant:';
    RAISE NOTICE '   https://bolt.new/~/sb1-3fjttrcu/login';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '❌ Email non trouvé dans la base de données';
    RAISE NOTICE '💡 Créez un compte sur: https://bolt.new/~/sb1-3fjttrcu/register';
  END IF;
END $$;

-- ============================================
-- VÉRIFICATION DU COMPTE
-- ============================================
SELECT
  '✅ Votre compte:' as info,
  email,
  created_at as "créé le",
  email_confirmed_at as "email confirmé",
  last_sign_in_at as "dernière connexion"
FROM auth.users
WHERE email = 'Samir.ouaaz@bilinfolan.fr';

-- ============================================
-- ALTERNATIVE: Changez le mot de passe ici
-- ============================================

-- Si vous voulez un AUTRE mot de passe, décommentez ci-dessous
-- et remplacez 'VotreNouveauMotDePasse' par ce que vous voulez:

/*
UPDATE auth.users
SET encrypted_password = crypt('VotreNouveauMotDePasse', gen_salt('bf'))
WHERE email = 'Samir.ouaaz@bilinfolan.fr';
*/

-- ============================================
-- CRÉER LE COMPTE S'IL N'EXISTE PAS
-- ============================================

-- Si le compte n'existe pas encore, décommentez ci-dessous:

/*
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Créer l'utilisateur
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'Samir.ouaaz@bilinfolan.fr',
    crypt('Admin2025', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Samir Ouaaz"}'
  ) RETURNING id INTO new_user_id;

  -- Créer le profil
  INSERT INTO profiles (id, full_name, user_type, is_admin, role)
  VALUES (new_user_id, 'Samir Ouaaz', 'individual', true, 'admin');

  RAISE NOTICE '✅ Compte créé avec succès!';
  RAISE NOTICE '📧 Email: Samir.ouaaz@bilinfolan.fr';
  RAISE NOTICE '🔑 Mot de passe: Admin2025';
END $$;
*/

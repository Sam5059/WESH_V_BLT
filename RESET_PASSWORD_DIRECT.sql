-- ============================================
-- RÉINITIALISATION DIRECTE DE MOT DE PASSE
-- ============================================
--
-- Utilisez ce script pour réinitialiser un mot de passe
-- SANS attendre l'email (qui ne fonctionne pas en mode dev)
--
-- INSTRUCTIONS:
-- 1. Allez sur: https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/sql
-- 2. Créez une nouvelle requête
-- 3. Copiez le bloc ci-dessous
-- 4. MODIFIEZ l'email et le nouveau mot de passe
-- 5. Exécutez
-- ============================================

-- MODIFIEZ CES VALEURS:
DO $$
DECLARE
  user_email TEXT := 'Samir.ouaaz@bilinfolan.fr';  -- ⬅️ VOTRE EMAIL ICI
  new_password TEXT := 'NouveauMotDePasse123';     -- ⬅️ NOUVEAU MOT DE PASSE ICI (min 6 caractères)
BEGIN
  -- Mise à jour du mot de passe
  UPDATE auth.users
  SET
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW(),
    email_confirmed_at = NOW()  -- Confirme aussi l'email au cas où
  WHERE email = user_email;

  -- Vérification
  IF FOUND THEN
    RAISE NOTICE '✅ Mot de passe changé avec succès pour: %', user_email;
    RAISE NOTICE '📧 Email: %', user_email;
    RAISE NOTICE '🔑 Nouveau mot de passe: %', new_password;
    RAISE NOTICE '🎯 Vous pouvez maintenant vous connecter sur: https://bolt.new/~/sb1-3fjttrcu/login';
  ELSE
    RAISE NOTICE '❌ Aucun utilisateur trouvé avec l''email: %', user_email;
    RAISE NOTICE '💡 Vérifiez l''orthographe de l''email';
  END IF;
END $$;

-- ============================================
-- ALTERNATIVE: Réinitialiser PLUSIEURS comptes
-- ============================================

-- Décommentez et modifiez si besoin:
/*
UPDATE auth.users
SET encrypted_password = crypt('MotDePasseCommun123', gen_salt('bf'))
WHERE email IN (
  'email1@example.com',
  'email2@example.com',
  'email3@example.com'
);
*/

-- ============================================
-- VÉRIFIER QUE ÇA A FONCTIONNÉ
-- ============================================

-- Vérifier votre compte:
SELECT
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  updated_at
FROM auth.users
WHERE email = 'Samir.ouaaz@bilinfolan.fr';  -- ⬅️ VOTRE EMAIL ICI

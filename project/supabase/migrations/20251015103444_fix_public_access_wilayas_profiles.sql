/*
  # Correction accès public pour wilayas et profiles

  Permet à TOUS (même non connectés) d'accéder aux données publiques
*/

-- WILAYAS: accès public
DROP POLICY IF EXISTS "Anyone can view wilayas" ON wilayas;
CREATE POLICY "Public can view wilayas"
  ON wilayas FOR SELECT TO public USING (true);

-- PROFILES: accès public pour les profils (besoin de voir les vendeurs)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT TO public USING (true);

/*
  # Correction des relations parent_id entre catégories et sous-catégories

  ## Problème
  Les sous-catégories comme "Maisons & Villas" apparaissent comme des catégories parentes
  indépendantes au lieu d'être liées à leur catégorie parente "Immobilier".

  ## Solution
  - Identifier toutes les catégories qui devraient être des sous-catégories
  - Corriger leur parent_id pour les lier aux bonnes catégories parentes
  - Vérifier que toutes les sous-catégories ont un parent_id valide

  ## Catégories parentes (parent_id = NULL)
  - Véhicules
  - Immobilier
  - Électronique
  - Mode & Beauté
  - Maison & Jardin
  - Emploi
  - Services
  - Loisirs & Hobbies
  - Animaux
  - Éducation
  - Événements
  - Matériel Professionnel
  - Location Immobilier
  - Location Vacances
  - Location Véhicules
  - Location Équipements
  - Stores PRO (catégorie spéciale)
*/

-- D'abord, récupérer les IDs des catégories parentes
DO $$
DECLARE
  vehicules_id UUID;
  immobilier_id UUID;
  electronique_id UUID;
  mode_beaute_id UUID;
  maison_jardin_id UUID;
  emploi_id UUID;
  services_id UUID;
  loisirs_id UUID;
  animaux_id UUID;
  education_id UUID;
  evenements_id UUID;
  materiel_pro_id UUID;
  location_immo_id UUID;
  location_vacances_id UUID;
  location_vehicules_id UUID;
  location_equipements_id UUID;
BEGIN
  -- Récupérer les IDs des catégories parentes
  SELECT id INTO vehicules_id FROM categories WHERE slug = 'vehicules' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO immobilier_id FROM categories WHERE slug = 'immobilier' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO electronique_id FROM categories WHERE slug = 'electronique' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO mode_beaute_id FROM categories WHERE slug = 'mode-beaute' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO maison_jardin_id FROM categories WHERE slug = 'maison-jardin' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO emploi_id FROM categories WHERE slug = 'emploi' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO services_id FROM categories WHERE slug = 'services' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO loisirs_id FROM categories WHERE slug = 'loisirs-hobbies' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO animaux_id FROM categories WHERE slug = 'animaux' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO education_id FROM categories WHERE slug = 'education' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO evenements_id FROM categories WHERE slug = 'evenements' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO materiel_pro_id FROM categories WHERE slug = 'materiel-professionnel' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO location_immo_id FROM categories WHERE slug = 'location-immobilier' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO location_vacances_id FROM categories WHERE slug = 'location-vacances' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO location_vehicules_id FROM categories WHERE slug = 'location-vehicules' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO location_equipements_id FROM categories WHERE slug = 'location-equipements' AND parent_id IS NULL LIMIT 1;

  -- ===== IMMOBILIER =====
  IF immobilier_id IS NOT NULL THEN
    UPDATE categories SET parent_id = immobilier_id
    WHERE slug IN (
      'appartements',
      'maisons-villas',
      'terrains',
      'bureaux',
      'locaux-commerciaux',
      'garages'
    ) AND (parent_id IS NULL OR parent_id != immobilier_id);

    RAISE NOTICE 'Immobilier sous-catégories mises à jour';
  END IF;

  -- ===== VÉHICULES =====
  IF vehicules_id IS NOT NULL THEN
    UPDATE categories SET parent_id = vehicules_id
    WHERE slug IN (
      'voitures',
      'motos',
      'camions',
      'velos',
      'bateaux',
      'pieces-auto',
      'accessoires-auto',
      'equipements-moto'
    ) AND (parent_id IS NULL OR parent_id != vehicules_id);

    RAISE NOTICE 'Véhicules sous-catégories mises à jour';
  END IF;

  -- ===== ÉLECTRONIQUE =====
  IF electronique_id IS NOT NULL THEN
    UPDATE categories SET parent_id = electronique_id
    WHERE slug IN (
      'smartphones',
      'tablettes',
      'ordinateurs',
      'tv-video',
      'audio',
      'consoles-jeux',
      'appareils-photo',
      'accessoires-electronique'
    ) AND (parent_id IS NULL OR parent_id != electronique_id);

    RAISE NOTICE 'Électronique sous-catégories mises à jour';
  END IF;

  -- ===== MODE & BEAUTÉ =====
  IF mode_beaute_id IS NOT NULL THEN
    UPDATE categories SET parent_id = mode_beaute_id
    WHERE slug IN (
      'vetements-femme',
      'vetements-homme',
      'vetements-enfant',
      'chaussures',
      'accessoires-mode',
      'bijoux',
      'montres',
      'produits-beaute'
    ) AND (parent_id IS NULL OR parent_id != mode_beaute_id);

    RAISE NOTICE 'Mode & Beauté sous-catégories mises à jour';
  END IF;

  -- ===== MAISON & JARDIN =====
  IF maison_jardin_id IS NOT NULL THEN
    UPDATE categories SET parent_id = maison_jardin_id
    WHERE slug IN (
      'meubles',
      'electromenager',
      'decoration',
      'bricolage',
      'jardin',
      'cuisine'
    ) AND (parent_id IS NULL OR parent_id != maison_jardin_id);

    RAISE NOTICE 'Maison & Jardin sous-catégories mises à jour';
  END IF;

  -- ===== LOISIRS & HOBBIES =====
  IF loisirs_id IS NOT NULL THEN
    UPDATE categories SET parent_id = loisirs_id
    WHERE slug IN (
      'sports',
      'instruments-musique',
      'livres',
      'jeux-jouets',
      'collection',
      'velos-trottinettes'
    ) AND (parent_id IS NULL OR parent_id != loisirs_id);

    RAISE NOTICE 'Loisirs & Hobbies sous-catégories mises à jour';
  END IF;

  -- ===== ANIMAUX =====
  IF animaux_id IS NOT NULL THEN
    UPDATE categories SET parent_id = animaux_id
    WHERE slug IN (
      'chiens',
      'chats',
      'oiseaux',
      'poissons',
      'accessoires-animaux'
    ) AND (parent_id IS NULL OR parent_id != animaux_id);

    RAISE NOTICE 'Animaux sous-catégories mises à jour';
  END IF;

  -- ===== LOCATION IMMOBILIER =====
  IF location_immo_id IS NOT NULL THEN
    UPDATE categories SET parent_id = location_immo_id
    WHERE slug IN (
      'appartements-location',
      'maisons-location',
      'studios-location',
      'bureaux-location',
      'locaux-commerciaux-location'
    ) AND (parent_id IS NULL OR parent_id != location_immo_id);

    RAISE NOTICE 'Location Immobilier sous-catégories mises à jour';
  END IF;

  -- ===== LOCATION VACANCES =====
  IF location_vacances_id IS NOT NULL THEN
    UPDATE categories SET parent_id = location_vacances_id
    WHERE slug IN (
      'appartements-vacances',
      'villas-maisons-vacances',
      'studios-meubles-vacances',
      'chalets-montagne'
    ) AND (parent_id IS NULL OR parent_id != location_vacances_id);

    RAISE NOTICE 'Location Vacances sous-catégories mises à jour';
  END IF;

  -- ===== LOCATION VÉHICULES =====
  IF location_vehicules_id IS NOT NULL THEN
    UPDATE categories SET parent_id = location_vehicules_id
    WHERE slug IN (
      'voitures-location',
      'motos-location',
      'camions-location',
      'velos-location'
    ) AND (parent_id IS NULL OR parent_id != location_vehicules_id);

    RAISE NOTICE 'Location Véhicules sous-catégories mises à jour';
  END IF;

  -- ===== LOCATION ÉQUIPEMENTS =====
  IF location_equipements_id IS NOT NULL THEN
    UPDATE categories SET parent_id = location_equipements_id
    WHERE slug IN (
      'outils-bricolage-location',
      'materiel-evenements-location',
      'equipements-sport-location',
      'materiel-camping-location'
    ) AND (parent_id IS NULL OR parent_id != location_equipements_id);

    RAISE NOTICE 'Location Équipements sous-catégories mises à jour';
  END IF;

  RAISE NOTICE '✅ Toutes les relations parent-enfant ont été corrigées';
END $$;

-- Vérifier les catégories orphelines (qui devraient avoir un parent mais n'en ont pas)
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM categories
  WHERE parent_id IS NULL
    AND slug NOT IN (
      'vehicules', 'immobilier', 'electronique', 'mode-beaute',
      'maison-jardin', 'emploi', 'services', 'loisirs-hobbies',
      'animaux', 'education', 'evenements', 'materiel-professionnel',
      'location-immobilier', 'location-vacances', 'location-vehicules',
      'location-equipements', 'stores-pro', 'emploi-services', 'loisirs-divertissement'
    );

  IF orphan_count > 0 THEN
    RAISE NOTICE '⚠️ Attention: % catégories orphelines détectées', orphan_count;
    RAISE NOTICE 'Voici les catégories orphelines:';

    -- Afficher les catégories orphelines
    FOR r IN
      SELECT name, slug
      FROM categories
      WHERE parent_id IS NULL
        AND slug NOT IN (
          'vehicules', 'immobilier', 'electronique', 'mode-beaute',
          'maison-jardin', 'emploi', 'services', 'loisirs-hobbies',
          'animaux', 'education', 'evenements', 'materiel-professionnel',
          'location-immobilier', 'location-vacances', 'location-vehicules',
          'location-equipements', 'stores-pro', 'emploi-services', 'loisirs-divertissement'
        )
    LOOP
      RAISE NOTICE '  - % (slug: %)', r.name, r.slug;
    END LOOP;
  ELSE
    RAISE NOTICE '✅ Aucune catégorie orpheline détectée';
  END IF;
END $$;

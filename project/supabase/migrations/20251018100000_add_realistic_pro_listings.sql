/*
  # Ajout d'annonces professionnelles réalistes

  1. Création de comptes Pro vérifiés
    - Sociétés immobilières (Bessa Promotion, Aymen Immobilier, etc.)
    - Agences de location de vacances
    - Agences de location de véhicules
    - Salons de beauté et coiffure
    - Boutiques de mode

  2. Annonces réalistes par catégorie
    - Immobilier : appartements, villas, terrains à travers l'Algérie
    - Locations vacances : littoral (Tipaza, Oran, Béjaïa) et sud (Tamanrasset, Ghardaïa)
    - Locations véhicules : Alger (berlines, SUV, utilitaires)
    - Mode & Beauté : salons, boutiques, services

  3. Données réalistes
    - Prix du marché algérien
    - Descriptions professionnelles
    - Attributs complets
*/

-- =====================================================
-- ÉTAPE 1: Créer des boutiques Pro (pro_stores)
-- =====================================================

-- Bessa Promotion - Immobilier haut standing
INSERT INTO pro_stores (
  id,
  user_id,
  business_name,
  slug,
  description,
  category,
  phone,
  email,
  wilaya,
  commune,
  address,
  logo_url,
  cover_url,
  is_verified,
  rating,
  total_reviews,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'admin@buygo.dz' LIMIT 1),
  'Bessa Promotion',
  'bessa-promotion',
  'Promoteur immobilier de référence en Algérie. Spécialisé dans le haut standing et les résidences de luxe. Plus de 20 ans d''expérience.',
  'Immobilier',
  '021 XX XX XX',
  'contact@bessa-promotion.dz',
  'Alger',
  'Bab Ezzouar',
  'Zone industrielle, Bab Ezzouar, Alger',
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
  true,
  4.8,
  156,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Aymen Immobilier
INSERT INTO pro_stores (
  id,
  user_id,
  business_name,
  slug,
  description,
  category,
  phone,
  email,
  wilaya,
  commune,
  address,
  logo_url,
  is_verified,
  rating,
  total_reviews,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'admin@buygo.dz' LIMIT 1),
  'Aymen Immobilier',
  'aymen-immobilier',
  'Votre partenaire immobilier de confiance. Vente, location et gestion de biens à travers toute l''Algérie.',
  'Immobilier',
  '023 XX XX XX',
  'contact@aymen-immobilier.dz',
  'Oran',
  'Es Senia',
  'Centre ville, Es Senia, Oran',
  'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  4.6,
  89,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Oasis Vacances - Locations saisonnières
INSERT INTO pro_stores (
  id,
  user_id,
  business_name,
  slug,
  description,
  category,
  phone,
  email,
  wilaya,
  commune,
  address,
  logo_url,
  is_verified,
  rating,
  total_reviews,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'admin@buygo.dz' LIMIT 1),
  'Oasis Vacances',
  'oasis-vacances',
  'Locations de vacances dans toute l''Algérie. Littoral, désert, montagnes. Résidences équipées et sécurisées.',
  'Locations Vacances',
  '024 XX XX XX',
  'contact@oasis-vacances.dz',
  'Tipaza',
  'Tipaza',
  'Corniche, Tipaza',
  'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  4.9,
  234,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Rent Car Alger
INSERT INTO pro_stores (
  id,
  user_id,
  business_name,
  slug,
  description,
  category,
  phone,
  email,
  wilaya,
  commune,
  address,
  logo_url,
  is_verified,
  rating,
  total_reviews,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'admin@buygo.dz' LIMIT 1),
  'Rent Car Alger',
  'rent-car-alger',
  'Location de véhicules toutes catégories à Alger. Berlines, SUV, utilitaires. Service 24/7. Livraison gratuite.',
  'Location Véhicules',
  '021 XX XX XX',
  'contact@rentcar-alger.dz',
  'Alger',
  'Hydra',
  'Rue Didouche Mourad, Hydra, Alger',
  'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  4.7,
  312,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Salon Bella - Coiffure & Beauté
INSERT INTO pro_stores (
  id,
  user_id,
  business_name,
  slug,
  description,
  category,
  phone,
  email,
  wilaya,
  commune,
  address,
  logo_url,
  is_verified,
  rating,
  total_reviews,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'admin@buygo.dz' LIMIT 1),
  'Salon Bella',
  'salon-bella',
  'Institut de beauté et salon de coiffure haut de gamme. Coiffure, maquillage, soins esthétiques. Équipe professionnelle.',
  'Beauté & Coiffure',
  '021 XX XX XX',
  'contact@salon-bella.dz',
  'Alger',
  'Dely Ibrahim',
  'Centre commercial, Dely Ibrahim, Alger',
  'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  4.8,
  178,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Fashion Dz - Mode & Vêtements
INSERT INTO pro_stores (
  id,
  user_id,
  business_name,
  slug,
  description,
  category,
  phone,
  email,
  wilaya,
  commune,
  address,
  logo_url,
  is_verified,
  rating,
  total_reviews,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'admin@buygo.dz' LIMIT 1),
  'Fashion Dz',
  'fashion-dz',
  'Boutique de mode tendance. Collections homme, femme, enfant. Marques internationales et locales. Nouveautés chaque saison.',
  'Mode & Vêtements',
  '021 XX XX XX',
  'contact@fashion-dz.com',
  'Alger',
  'Kouba',
  'Avenue Ali Khodja, Kouba, Alger',
  'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  4.5,
  92,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ÉTAPE 2: Créer des annonces immobilières
-- =====================================================

-- Bessa Promotion - Appartements haut standing

DO $$
DECLARE
  v_bessa_store_id uuid;
  v_bessa_user_id uuid;
  v_category_immo uuid;
  v_subcat_appart uuid;
  v_subcat_villa uuid;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO v_bessa_store_id FROM pro_stores WHERE slug = 'bessa-promotion';
  SELECT user_id INTO v_bessa_user_id FROM pro_stores WHERE slug = 'bessa-promotion';
  SELECT id INTO v_category_immo FROM categories WHERE slug = 'immobilier' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO v_subcat_appart FROM categories WHERE slug = 'appartements' AND parent_id = v_category_immo LIMIT 1;
  SELECT id INTO v_subcat_villa FROM categories WHERE slug = 'villas' AND parent_id = v_category_immo LIMIT 1;

  -- Appartement F4 Bab Ezzouar
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    subcategory_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    is_featured,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_bessa_user_id,
    v_bessa_store_id,
    v_category_immo,
    v_subcat_appart,
    'Appartement F4 Haut Standing - Bab Ezzouar',
    'Magnifique appartement F4 de 120m² en résidence sécurisée. Finitions haut standing, cuisine équipée, 2 salles de bain, balcon avec vue dégagée. Parking sous-sol. Proche de toutes commodités.',
    45000000,
    true,
    'sell',
    'Alger',
    'Bab Ezzouar',
    ARRAY[
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    true,
    'new',
    jsonb_build_object(
      'surface', 120,
      'chambres', 3,
      'sdb', 2,
      'etage', 5,
      'type', 'Appartement',
      'meuble', false
    ),
    NOW() - INTERVAL '2 days'
  );

  -- Villa Zeralda
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    subcategory_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    is_featured,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_bessa_user_id,
    v_bessa_store_id,
    v_category_immo,
    v_subcat_villa,
    'Villa Moderne Vue Mer - Zeralda',
    'Superbe villa R+2 de 400m² sur terrain de 600m². Architecture moderne, 6 chambres, 4 SDB, piscine, garage 3 voitures. Vue panoramique sur la mer. Quartier calme et sécurisé.',
    180000000,
    true,
    'sell',
    'Alger',
    'Zeralda',
    ARRAY[
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    true,
    'new',
    jsonb_build_object(
      'surface', 400,
      'chambres', 6,
      'sdb', 4,
      'type', 'Villa',
      'meuble', false,
      'piscine', true,
      'jardin', true
    ),
    NOW() - INTERVAL '5 days'
  );

  -- Duplex Hydra
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    subcategory_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    is_featured,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_bessa_user_id,
    v_bessa_store_id,
    v_category_immo,
    v_subcat_appart,
    'Duplex de Luxe 250m² - Hydra',
    'Exceptionnel duplex de 250m² dans quartier prestigieux. Double séjour, 4 chambres, 3 SDB, cuisine américaine équipée, terrasse 50m². Standing luxueux, matériaux nobles.',
    95000000,
    true,
    'sell',
    'Alger',
    'Hydra',
    ARRAY[
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    true,
    'new',
    jsonb_build_object(
      'surface', 250,
      'chambres', 4,
      'sdb', 3,
      'type', 'Duplex',
      'meuble', false
    ),
    NOW() - INTERVAL '1 day'
  );
END $$;

-- Aymen Immobilier - Annonces Oran

DO $$
DECLARE
  v_aymen_store_id uuid;
  v_aymen_user_id uuid;
  v_category_immo uuid;
  v_subcat_appart uuid;
BEGIN
  SELECT id INTO v_aymen_store_id FROM pro_stores WHERE slug = 'aymen-immobilier';
  SELECT user_id INTO v_aymen_user_id FROM pro_stores WHERE slug = 'aymen-immobilier';
  SELECT id INTO v_category_immo FROM categories WHERE slug = 'immobilier' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO v_subcat_appart FROM categories WHERE slug = 'appartements' AND parent_id = v_category_immo LIMIT 1;

  -- F3 Oran Centre
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    subcategory_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_aymen_user_id,
    v_aymen_store_id,
    v_category_immo,
    v_subcat_appart,
    'F3 Rénové Centre Ville - Oran',
    'Appartement F3 de 85m² entièrement rénové au centre ville d''Oran. 2 chambres, salon, cuisine équipée, salle de bain moderne. Proche commerces et transports.',
    18500000,
    true,
    'sell',
    'Oran',
    'Oran',
    ARRAY[
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    'like_new',
    jsonb_build_object(
      'surface', 85,
      'chambres', 2,
      'sdb', 1,
      'etage', 3,
      'type', 'Appartement',
      'meuble', false
    ),
    NOW() - INTERVAL '3 days'
  );

  -- F4 Es Senia
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    subcategory_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_aymen_user_id,
    v_aymen_store_id,
    v_category_immo,
    v_subcat_appart,
    'F4 Standing Es Senia - Oran',
    'Bel appartement F4 de 110m² dans résidence moderne. 3 chambres, grand salon, cuisine semi-équipée, 2 SDB. Ascenseur, interphone, parking.',
    24000000,
    true,
    'sell',
    'Oran',
    'Es Senia',
    ARRAY[
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    'new',
    jsonb_build_object(
      'surface', 110,
      'chambres', 3,
      'sdb', 2,
      'etage', 4,
      'type', 'Appartement',
      'meuble', false
    ),
    NOW() - INTERVAL '6 days'
  );
END $$;

-- =====================================================
-- ÉTAPE 3: Locations de vacances
-- =====================================================

DO $$
DECLARE
  v_oasis_store_id uuid;
  v_oasis_user_id uuid;
  v_category_locations uuid;
  v_subcat_vacances uuid;
BEGIN
  SELECT id INTO v_oasis_store_id FROM pro_stores WHERE slug = 'oasis-vacances';
  SELECT user_id INTO v_oasis_user_id FROM pro_stores WHERE slug = 'oasis-vacances';
  SELECT id INTO v_category_locations FROM categories WHERE slug = 'locations-vacances' LIMIT 1;

  -- Appartement vue mer Tipaza
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    is_featured,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_oasis_user_id,
    v_oasis_store_id,
    v_category_locations,
    'Appartement Vue Mer - Tipaza (Été 2025)',
    'Magnifique appartement F3 avec vue panoramique sur la mer. 80m², climatisé, WiFi, TV satellite. À 50m de la plage. Idéal familles. Disponible été 2025.',
    8000,
    false,
    'rent',
    'Tipaza',
    'Tipaza',
    ARRAY[
      'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2598638/pexels-photo-2598638.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    true,
    'like_new',
    jsonb_build_object(
      'surface', 80,
      'chambres', 2,
      'sdb', 1,
      'type', 'Appartement',
      'meuble', true,
      'climatisation', true,
      'wifi', true,
      'prix_par', 'nuit'
    ),
    NOW() - INTERVAL '1 day'
  );

  -- Villa Béjaïa
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    is_featured,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_oasis_user_id,
    v_oasis_store_id,
    v_category_locations,
    'Villa Pieds dans l''Eau - Béjaïa',
    'Superbe villa 200m² directement sur la plage. 4 chambres, 3 SDB, jardin, BBQ, terrasse vue mer. Accès privé plage. Capacité 8 personnes. Calme et sécurité.',
    25000,
    true,
    'rent',
    'Béjaïa',
    'Béjaïa',
    ARRAY[
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    true,
    'like_new',
    jsonb_build_object(
      'surface', 200,
      'chambres', 4,
      'sdb', 3,
      'type', 'Villa',
      'meuble', true,
      'climatisation', true,
      'wifi', true,
      'jardin', true,
      'prix_par', 'semaine'
    ),
    NOW() - INTERVAL '4 days'
  );

  -- Riad Ghardaïa (Sud)
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_oasis_user_id,
    v_oasis_store_id,
    v_category_locations,
    'Riad Traditionnel - Ghardaïa',
    'Authentique riad rénové dans la vallée du M''Zab. Architecture traditionnelle, patio, 3 chambres climatisées. Découvrez le patrimoine UNESCO. Guide touristique disponible.',
    12000,
    false,
    'rent',
    'Ghardaïa',
    'Ghardaïa',
    ARRAY[
      'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    'like_new',
    jsonb_build_object(
      'surface', 150,
      'chambres', 3,
      'sdb', 2,
      'type', 'Riad',
      'meuble', true,
      'climatisation', true,
      'prix_par', 'semaine'
    ),
    NOW() - INTERVAL '2 days'
  );

  -- Campement Tamanrasset
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_oasis_user_id,
    v_oasis_store_id,
    v_category_locations,
    'Campement Touristique - Tamanrasset',
    'Séjour authentique dans le désert. Campement équipé avec tentes traditionnelles. Excursions Hoggar, Assekrem. Cuisine touareg. Guide expérimenté. Étoiles garanties !',
    15000,
    true,
    'rent',
    'Tamanrasset',
    'Tamanrasset',
    ARRAY[
      'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    'new',
    jsonb_build_object(
      'type', 'Campement',
      'meuble', true,
      'capacite', 6,
      'prix_par', 'séjour 3 nuits'
    ),
    NOW() - INTERVAL '7 days'
  );
END $$;

-- =====================================================
-- ÉTAPE 4: Locations de véhicules Alger
-- =====================================================

DO $$
DECLARE
  v_rentcar_store_id uuid;
  v_rentcar_user_id uuid;
  v_category_vehicules uuid;
  v_subcat_voitures uuid;
BEGIN
  SELECT id INTO v_rentcar_store_id FROM pro_stores WHERE slug = 'rent-car-alger';
  SELECT user_id INTO v_rentcar_user_id FROM pro_stores WHERE slug = 'rent-car-alger';
  SELECT id INTO v_category_vehicules FROM categories WHERE slug = 'vehicules' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO v_subcat_voitures FROM categories WHERE slug = 'voitures' AND parent_id = v_category_vehicules LIMIT 1;

  -- Peugeot 208
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    subcategory_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    is_featured,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_rentcar_user_id,
    v_rentcar_store_id,
    v_category_vehicules,
    v_subcat_voitures,
    'Location Peugeot 208 - Alger',
    'Peugeot 208 essence, 5 places, climatisation, GPS. Parfaite pour la ville. Kilométrage illimité. Livraison gratuite à l''aéroport. À partir de 4500 DA/jour.',
    4500,
    false,
    'rent',
    'Alger',
    'Hydra',
    ARRAY[
      'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    true,
    'like_new',
    jsonb_build_object(
      'marque', 'Peugeot',
      'modele', '208',
      'annee', 2023,
      'carburant', 'Essence',
      'boite', 'Manuelle',
      'places', 5,
      'kilometrage_inclus', 'illimité',
      'prix_par', 'jour'
    ),
    NOW() - INTERVAL '1 day'
  );

  -- Dacia Duster
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    subcategory_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    is_featured,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_rentcar_user_id,
    v_rentcar_store_id,
    v_category_vehicules,
    v_subcat_voitures,
    'Location Dacia Duster 4x4 - Alger',
    'Dacia Duster 4x4, idéal routes et pistes. 5 places, climatisation, GPS, porte-bagages. Parfait pour vos excursions. 6500 DA/jour. Réductions longue durée.',
    6500,
    true,
    'rent',
    'Alger',
    'Hydra',
    ARRAY[
      'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    true,
    'like_new',
    jsonb_build_object(
      'marque', 'Dacia',
      'modele', 'Duster',
      'annee', 2024,
      'carburant', 'Diesel',
      'boite', 'Manuelle',
      'transmission', '4x4',
      'places', 5,
      'kilometrage_inclus', 'illimité',
      'prix_par', 'jour'
    ),
    NOW() - INTERVAL '3 days'
  );

  -- Hyundai i10
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    subcategory_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_rentcar_user_id,
    v_rentcar_store_id,
    v_category_vehicules,
    v_subcat_voitures,
    'Location Hyundai i10 Économique - Alger',
    'Citadine économique, parfaite pour la ville. Climatisation, radio, consommation réduite. Location à partir de 3500 DA/jour. Disponible immédiatement.',
    3500,
    false,
    'rent',
    'Alger',
    'Hydra',
    ARRAY[
      'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    'like_new',
    jsonb_build_object(
      'marque', 'Hyundai',
      'modele', 'i10',
      'annee', 2023,
      'carburant', 'Essence',
      'boite', 'Manuelle',
      'places', 4,
      'kilometrage_inclus', 'illimité',
      'prix_par', 'jour'
    ),
    NOW() - INTERVAL '5 days'
  );
END $$;

-- =====================================================
-- ÉTAPE 5: Mode & Beauté
-- =====================================================

DO $$
DECLARE
  v_bella_store_id uuid;
  v_bella_user_id uuid;
  v_fashion_store_id uuid;
  v_fashion_user_id uuid;
  v_category_services uuid;
  v_category_mode uuid;
BEGIN
  SELECT id INTO v_bella_store_id FROM pro_stores WHERE slug = 'salon-bella';
  SELECT user_id INTO v_bella_user_id FROM pro_stores WHERE slug = 'salon-bella';
  SELECT id INTO v_fashion_store_id FROM pro_stores WHERE slug = 'fashion-dz';
  SELECT user_id INTO v_fashion_user_id FROM pro_stores WHERE slug = 'fashion-dz';
  SELECT id INTO v_category_services FROM categories WHERE slug = 'services' LIMIT 1;
  SELECT id INTO v_category_mode FROM categories WHERE slug = 'mode-et-beaute' LIMIT 1;

  -- Salon Bella - Coiffure femme
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    is_featured,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_bella_user_id,
    v_bella_store_id,
    v_category_services,
    'Coiffure & Maquillage Professionnel - Alger',
    'Institut de beauté haut de gamme. Coiffure, coloration, mèches, brushing, maquillage professionnel. Produits de qualité. Équipe expérimentée. Sur RDV.',
    3000,
    false,
    'offer',
    'Alger',
    'Dely Ibrahim',
    ARRAY[
      'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    true,
    'new',
    jsonb_build_object(
      'type_service', 'Coiffure',
      'duree', '1-2 heures',
      'prix_a_partir_de', true
    ),
    NOW() - INTERVAL '2 days'
  );

  -- Salon Bella - Soins esthétiques
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_bella_user_id,
    v_bella_store_id,
    v_category_services,
    'Soins Visage & Corps - Institut Bella',
    'Soins esthétiques professionnels : nettoyage de peau, gommage, masques, épilation, manucure, pédicure. Ambiance relaxante. Produits naturels.',
    2500,
    false,
    'offer',
    'Alger',
    'Dely Ibrahim',
    ARRAY[
      'https://images.pexels.com/photos/3992860/pexels-photo-3992860.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    'new',
    jsonb_build_object(
      'type_service', 'Soins esthétiques',
      'duree', '1 heure',
      'prix_a_partir_de', true
    ),
    NOW() - INTERVAL '4 days'
  );

  -- Fashion Dz - Vêtements femme
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    is_featured,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_fashion_user_id,
    v_fashion_store_id,
    v_category_mode,
    'Collection Printemps-Été 2025 Femme',
    'Nouvelle collection mode femme : robes, ensembles, pantalons, chemisiers. Styles variés : chic, casual, soirée. Tailles 36 à 46. Tissus de qualité. Prix attractifs.',
    4500,
    true,
    'sell',
    'Alger',
    'Kouba',
    ARRAY[
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    true,
    'new',
    jsonb_build_object(
      'type', 'Vêtements femme',
      'tailles_disponibles', '36-46',
      'marque', 'Fashion Dz Collection'
    ),
    NOW() - INTERVAL '1 day'
  );

  -- Fashion Dz - Vêtements homme
  INSERT INTO listings (
    user_id,
    pro_store_id,
    category_id,
    title,
    description,
    price,
    is_negotiable,
    listing_type,
    wilaya,
    commune,
    images,
    status,
    condition,
    attributes,
    created_at
  ) VALUES (
    v_fashion_user_id,
    v_fashion_store_id,
    v_category_mode,
    'Costumes & Tenues Homme Élégantes',
    'Costumes homme sur mesure et prêt-à-porter. Chemises, pantalons, vestes. Styles classique et moderne. Retouches gratuites. Conseils personnalisés.',
    12000,
    true,
    'sell',
    'Alger',
    'Kouba',
    ARRAY[
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'active',
    'new',
    jsonb_build_object(
      'type', 'Vêtements homme',
      'tailles_disponibles', 'S-XXL',
      'marque', 'Fashion Dz Collection'
    ),
    NOW() - INTERVAL '6 days'
  );
END $$;

-- =====================================================
-- COMMENTAIRES ET INDEX
-- =====================================================

COMMENT ON TABLE pro_stores IS 'Boutiques professionnelles vérifiées avec vraies entreprises algériennes';

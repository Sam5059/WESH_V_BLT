/*
  Create Test Professional Stores

  This script creates realistic test professional stores across different categories
  to populate the "Découvrez nos Stores PRO" section.
*/

-- First, get category IDs for reference
DO $$
DECLARE
  cat_vehicules UUID;
  cat_immobilier UUID;
  cat_electronique UUID;
  cat_mode UUID;
  cat_maison UUID;
  cat_emploi UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_vehicules FROM categories WHERE slug = 'vehicules';
  SELECT id INTO cat_immobilier FROM categories WHERE slug = 'immobilier';
  SELECT id INTO cat_electronique FROM categories WHERE slug = 'electronique';
  SELECT id INTO cat_mode FROM categories WHERE slug = 'mode-beaute';
  SELECT id INTO cat_maison FROM categories WHERE slug = 'maison-jardin';
  SELECT id INTO cat_emploi FROM categories WHERE slug = 'emploi';

  -- Create professional stores
  INSERT INTO pro_stores (
    user_id,
    name,
    slug,
    description,
    logo_url,
    banner_url,
    location,
    category_id,
    phone,
    email,
    website,
    is_active,
    subscription_start,
    subscription_end,
    theme_color,
    created_at
  ) VALUES
  -- Véhicules
  (
    (SELECT id FROM profiles WHERE email = 'samouaaz@gmail.com' LIMIT 1),
    'AutoPro Alger',
    'autopro-alger',
    'Spécialiste de la vente et location de véhicules de toutes marques. Plus de 15 ans d''expérience.',
    'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3311574/pexels-photo-3311574.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Alger',
    cat_vehicules,
    '+213 555 123 456',
    'contact@autopro-alger.dz',
    'https://autopro-alger.dz',
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '#3B82F6',
    NOW()
  ),
  (
    (SELECT id FROM profiles WHERE email = 'samouaaz@gmail.com' LIMIT 1),
    'Moto Center Oran',
    'moto-center-oran',
    'Votre partenaire pour l''achat et la vente de motos et scooters neufs et d''occasion.',
    'https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2138922/pexels-photo-2138922.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Oran',
    cat_vehicules,
    '+213 555 234 567',
    'info@motocenter-oran.dz',
    NULL,
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '#3B82F6',
    NOW()
  ),

  -- Immobilier
  (
    (SELECT id FROM profiles WHERE email = 'samouaaz@gmail.com' LIMIT 1),
    'ImmoPlus Alger',
    'immoplus-alger',
    'Agence immobilière spécialisée dans la vente, location et gestion de biens immobiliers.',
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Alger',
    cat_immobilier,
    '+213 555 345 678',
    'contact@immoplus-alger.dz',
    'https://immoplus-alger.dz',
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '#10B981',
    NOW()
  ),
  (
    (SELECT id FROM profiles WHERE email = 'samouaaz@gmail.com' LIMIT 1),
    'Habitat Confort',
    'habitat-confort',
    'Trouvez votre chez-vous idéal. Appartements, villas et terrains dans toute l''Algérie.',
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Constantine',
    cat_immobilier,
    '+213 555 456 789',
    'info@habitat-confort.dz',
    NULL,
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '#10B981',
    NOW()
  ),

  -- Électronique
  (
    (SELECT id FROM profiles WHERE email = 'samouaaz@gmail.com' LIMIT 1),
    'TechStore Alger',
    'techstore-alger',
    'Vente d''électronique et informatique : smartphones, ordinateurs, accessoires et plus.',
    'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Alger',
    cat_electronique,
    '+213 555 567 890',
    'contact@techstore-alger.dz',
    'https://techstore-alger.dz',
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '#F59E0B',
    NOW()
  ),
  (
    (SELECT id FROM profiles WHERE email = 'samouaaz@gmail.com' LIMIT 1),
    'Électro Express',
    'electro-express',
    'Tous vos besoins en électroménager et high-tech. Livraison rapide dans toute l''Algérie.',
    'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Oran',
    cat_electronique,
    '+213 555 678 901',
    'service@electro-express.dz',
    NULL,
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '#F59E0B',
    NOW()
  ),

  -- Mode & Beauté
  (
    (SELECT id FROM profiles WHERE email = 'samouaaz@gmail.com' LIMIT 1),
    'Fashion Boulevard',
    'fashion-boulevard',
    'Mode féminine et masculine, accessoires tendance. Les dernières collections internationales.',
    'https://images.pexels.com/photos/1050244/pexels-photo-1050244.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Alger',
    cat_mode,
    '+213 555 789 012',
    'info@fashion-boulevard.dz',
    'https://fashion-boulevard.dz',
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '#EC4899',
    NOW()
  ),

  -- Maison & Jardin
  (
    (SELECT id FROM profiles WHERE email = 'samouaaz@gmail.com' LIMIT 1),
    'Déco Maison',
    'deco-maison',
    'Tout pour embellir votre intérieur : meubles, décoration, luminaires et plus.',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Alger',
    cat_maison,
    '+213 555 890 123',
    'contact@deco-maison.dz',
    NULL,
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '#8B5CF6',
    NOW()
  ),
  (
    (SELECT id FROM profiles WHERE email = 'samouaaz@gmail.com' LIMIT 1),
    'Jardin Paradise',
    'jardin-paradise',
    'Spécialiste du jardinage : plantes, outils, mobilier de jardin et conseils d''experts.',
    'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1374295/pexels-photo-1374295.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Blida',
    cat_maison,
    '+213 555 901 234',
    'info@jardin-paradise.dz',
    NULL,
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '#8B5CF6',
    NOW()
  ),

  -- Emploi
  (
    (SELECT id FROM profiles WHERE email = 'samouaaz@gmail.com' LIMIT 1),
    'RecrutPlus Algeria',
    'recrutplus-algeria',
    'Cabinet de recrutement spécialisé. Trouvez les meilleurs talents pour votre entreprise.',
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'Alger',
    cat_emploi,
    '+213 555 012 345',
    'contact@recrutplus.dz',
    'https://recrutplus.dz',
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '#06B6D4',
    NOW()
  )
  ON CONFLICT (slug) DO NOTHING;

END $$;

-- Verify the created stores
SELECT
  ps.name,
  ps.slug,
  ps.location,
  c.name as category,
  ps.is_active
FROM pro_stores ps
LEFT JOIN categories c ON ps.category_id = c.id
WHERE ps.is_active = true
ORDER BY ps.created_at DESC;

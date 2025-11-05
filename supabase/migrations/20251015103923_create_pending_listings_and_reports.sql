/*
  # Création d'annonces en attente et signalements pour tester la modération

  Crée:
  - 5 annonces en statut pending_approval
  - 3 signalements sur des annonces actives
*/

DO $$
DECLARE
  main_user_id uuid;
  admin_user_id uuid;
  listing1_id uuid;
  listing2_id uuid;
  listing3_id uuid;
BEGIN
  -- Récupérer un utilisateur
  SELECT id INTO main_user_id FROM profiles LIMIT 1;
  
  -- Récupérer l'admin s'il existe
  SELECT id INTO admin_user_id FROM profiles WHERE role IN ('admin', 'super_admin') LIMIT 1;
  IF admin_user_id IS NULL THEN
    admin_user_id := main_user_id;
  END IF;

  -- Créer 5 annonces en attente de modération
  INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, is_negotiable, condition, wilaya, commune, images, status, listing_type, views_count) VALUES
  
  (main_user_id, 
   (SELECT id FROM categories WHERE slug = 'vehicules'), 
   (SELECT id FROM categories WHERE slug = 'voitures'),
   'Audi A3 2019 - À vérifier',
   'Audi A3 2019, essence, 45000 km. État impeccable. Toutes options. Prix à discuter.',
   3200000, true, 'like_new', 'Alger', 'Alger Centre', 
   ARRAY['https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg'],
   'pending_approval', 'sale', 0),

  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'electronique'),
   (SELECT id FROM categories WHERE slug = 'telephones'),
   'iPhone 15 Pro Max 512Go - NOUVEAU',
   'iPhone 15 Pro Max 512Go titanium. Jamais utilisé, sous blister. Garantie Apple 1 an.',
   250000, false, 'new', 'Oran', 'Oran',
   ARRAY['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'],
   'pending_approval', 'sale', 0),

  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'immobilier'),
   (SELECT id FROM categories WHERE slug = 'appartements'),
   'F4 Hydra 120m² - À valider',
   'Magnifique F4 à Hydra, 120m², standing, vue dégagée. Parking inclus.',
   25000000, true, 'good', 'Alger', 'Hydra',
   ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'],
   'pending_approval', 'sale', 0),

  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'maison-jardin'),
   (SELECT id FROM categories WHERE slug = 'electromenager'),
   'Réfrigérateur Samsung Side by Side',
   'Réfrigérateur Samsung américain, 2 ans, excellent état. Froid ventilé.',
   85000, true, 'good', 'Constantine', 'Constantine',
   ARRAY['https://images.pexels.com/photos/2343468/pexels-photo-2343468.jpeg'],
   'pending_approval', 'sale', 0),

  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'mode-beaute'),
   (SELECT id FROM categories WHERE slug = 'bijoux-montres'),
   'Montre Rolex Submariner - Authentique',
   'Rolex Submariner authentique avec certificat. Boîte et papiers. Année 2018.',
   1800000, false, 'like_new', 'Alger', 'El Biar',
   ARRAY['https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg'],
   'pending_approval', 'sale', 0);

  -- Récupérer 3 annonces actives pour créer des signalements
  SELECT id INTO listing1_id FROM listings WHERE status = 'active' ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO listing2_id FROM listings WHERE status = 'active' ORDER BY created_at DESC OFFSET 1 LIMIT 1;
  SELECT id INTO listing3_id FROM listings WHERE status = 'active' ORDER BY created_at DESC OFFSET 2 LIMIT 1;

  -- Créer 3 signalements
  IF listing1_id IS NOT NULL THEN
    INSERT INTO reports (listing_id, reporter_id, reason, description, status) VALUES
    (listing1_id, main_user_id, 'Prix suspect', 'Le prix semble trop bas, possibilité d''arnaque', 'pending');
  END IF;

  IF listing2_id IS NOT NULL THEN
    INSERT INTO reports (listing_id, reporter_id, reason, description, status) VALUES
    (listing2_id, main_user_id, 'Photos inappropriées', 'Les photos ne correspondent pas au produit annoncé', 'pending');
  END IF;

  IF listing3_id IS NOT NULL THEN
    INSERT INTO reports (listing_id, reporter_id, reason, description, status) VALUES
    (listing3_id, main_user_id, 'Contenu trompeur', 'Description mensongère, produit non conforme', 'pending');
  END IF;

END $$;

/*
  # Création d'annonces "Demandes" (wanted/purchase)
  
  10 annonces de type purchase dans différentes catégories
*/

DO $$
DECLARE
  main_user_id uuid;
BEGIN
  SELECT id INTO main_user_id FROM profiles LIMIT 1;

  INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, is_negotiable, condition, wilaya, commune, images, status, listing_type, views_count) VALUES

  (main_user_id, (SELECT id FROM categories WHERE slug = 'vehicules'), (SELECT id FROM categories WHERE slug = 'voitures'), 'RECHERCHE Peugeot 208 ou 2008', 'Je recherche une Peugeot 208 ou 2008 essence, année 2017-2020. Budget max 2.5M DA. Bon état général, faible kilométrage souhaité. Secteur Alger ou environs. Paiement comptant possible.', 2500000, true, 'good', 'Alger', 'Alger', ARRAY['https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg'], 'active', 'purchase', 89),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'vehicules'), (SELECT id FROM categories WHERE slug = 'voitures'), 'CHERCHE Golf 7 GTI', 'Recherche VW Golf 7 GTI manuelle ou DSG. Budget jusqu''à 4M DA. Année 2015-2018. Kilométrage max 100000 km. Historique entretien complet exigé.', 4000000, true, 'good', 'Oran', 'Oran', ARRAY['https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg'], 'active', 'purchase', 67),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'CHERCHE F3 Alger Centre', 'Couple cherche F3 60-80m² Alger centre. Budget 5-7M DA. Proche transports. Paiement possible échelonné.', 6000000, true, 'good', 'Alger', 'Alger Centre', ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'], 'active', 'purchase', 145),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'maisons-villas'), 'RECHERCHE Villa Hydra/Paradou', 'Cherche villa R+1 ou R+2 quartiers Hydra, Ben Aknoun, Paradou. Surface 200-300m². Jardin obligatoire. Budget 35-50M DA.', 45000000, true, 'good', 'Alger', 'Hydra', ARRAY['https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg'], 'active', 'purchase', 234),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'telephones'), 'ACHÈTE iPhone 14 Pro Max', 'Achète iPhone 14 Pro Max 256Go ou 512Go. État impeccable. Batterie min 90%. Budget 130-150k DA.', 140000, true, 'like_new', 'Alger', 'Bab Ezzouar', ARRAY['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'], 'active', 'purchase', 178),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'ordinateurs'), 'CHERCHE MacBook Pro M1/M2', 'Recherche MacBook Pro 14" ou 16" puce M1 Pro/Max ou M2. 32Go RAM minimum. Budget 250-400k DA.', 350000, true, 'like_new', 'Constantine', 'Constantine', ARRAY['https://images.pexels.com/photos/18105/pexels-photo.jpg'], 'active', 'purchase', 123),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'mode-beaute'), (SELECT id FROM categories WHERE slug = 'bijoux-montres'), 'RECHERCHE Montre Rolex authentique', 'Collectionneur recherche Rolex. Submariner, GMT-Master, Datejust. Avec boîte et papiers. Budget 800k-1.5M DA.', 1200000, true, 'good', 'Alger', 'El Biar', ARRAY['https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg'], 'active', 'purchase', 234),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'maison-jardin'), (SELECT id FROM categories WHERE slug = 'meubles'), 'CHERCHE Canapé angle cuir', 'Cherche canapé d''angle cuir gris ou beige. 6-7 places. Bon état. Budget max 150k DA.', 150000, true, 'good', 'Alger', 'Alger', ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'active', 'purchase', 89),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'animaux'), (SELECT id FROM categories WHERE slug = 'chiens'), 'RECHERCHE Chiot Husky Sibérien', 'Famille cherche chiot Husky pure race. 2-3 mois. Carnet santé à jour. Budget 60-100k DA.', 80000, true, 'new', 'Alger', 'Birtouta', ARRAY['https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg'], 'active', 'purchase', 156),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), (SELECT id FROM categories WHERE slug = 'poussettes-sieges'), 'CHERCHE Poussette Trio Bugaboo', 'Cherche poussette trio Bugaboo Cameleon ou Donkey. Bon état. Toutes couleurs. Budget 70-90k DA.', 80000, true, 'good', 'Oran', 'Oran', ARRAY['https://images.pexels.com/photos/1648374/pexels-photo-1648374.jpeg'], 'active', 'purchase', 67);

END $$;

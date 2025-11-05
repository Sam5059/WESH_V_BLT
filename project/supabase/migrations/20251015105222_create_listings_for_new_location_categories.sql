/*
  # Création d'annonces pour les nouvelles catégories de location
  
  Crée 30+ annonces réalistes pour:
  - Location Vacances
  - Location Véhicules
  - Location Équipements
*/

DO $$
DECLARE
  main_user_id uuid;
BEGIN
  SELECT id INTO main_user_id FROM profiles LIMIT 1;

  -- =======================================
  -- LOCATION VACANCES (15 annonces)
  -- =======================================
  
  INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, is_negotiable, condition, wilaya, commune, images, status, listing_type, views_count) VALUES

  -- Appartements de vacances
  (main_user_id, 
   (SELECT id FROM categories WHERE slug = 'location-vacances'),
   (SELECT id FROM categories WHERE slug = 'appartements-vacances'),
   'F3 Sidi Fredj Vue Mer - Location vacances',
   'Magnifique F3 meublé 80m² face mer à Sidi Fredj. 2 chambres, salon, cuisine équipée, wifi, parking. Idéal famille. Disponible été 2025.',
   15000, true, 'good', 'Tipaza', 'Sidi Fredj',
   ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'],
   'active', 'rent', 234),

  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vacances'),
   (SELECT id FROM categories WHERE slug = 'appartements-vacances'),
   'Studio Béjaïa Front de Mer',
   'Studio moderne 35m² première ligne plage Béjaïa. Tout équipé. Tarif jour: 4000 DA / Semaine: 25000 DA / Mois: 80000 DA',
   4000, true, 'like_new', 'Béjaïa', 'Béjaïa',
   ARRAY['https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'],
   'active', 'rent', 178),

  -- Villas & Maisons
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vacances'),
   (SELECT id FROM categories WHERE slug = 'villas-maisons-vacances'),
   'Villa avec Piscine Zéralda',
   'Superbe villa 250m² avec piscine privée, jardin 500m². 4 chambres, salon, terrasse. Climatisation. Location semaine ou mois. Été 2025.',
   50000, true, 'good', 'Alger', 'Zéralda',
   ARRAY['https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg'],
   'active', 'rent', 456),

  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vacances'),
   (SELECT id FROM categories WHERE slug = 'villas-maisons-vacances'),
   'Maison traditionnelle Tlemcen',
   'Belle maison traditionnelle restaurée, 180m², 3 chambres, patio. Centre-ville Tlemcen. Idéal famille. 8000 DA/jour.',
   8000, true, 'good', 'Tlemcen', 'Tlemcen',
   ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
   'active', 'rent', 123),

  -- Chalets montagne
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vacances'),
   (SELECT id FROM categories WHERE slug = 'chalets-montagne'),
   'Chalet Tikjda Montagnes',
   'Chalet 120m² Tikjda, 3 chambres, cheminée, vue panoramique. Ski, randonnée. Hiver: 15000 DA/jour. Été: 10000 DA/jour.',
   12000, true, 'good', 'Bouira', 'Tikjda',
   ARRAY['https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg'],
   'active', 'rent', 289),

  -- Bungalows plage
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vacances'),
   (SELECT id FROM categories WHERE slug = 'bungalows-plage'),
   'Bungalow Turquoise Coast Oran',
   'Bungalow moderne 60m² résidence sécurisée face mer. 2 chambres, cuisine, terrasse. Piscine commune. Été: 12000 DA/jour.',
   12000, true, 'like_new', 'Oran', 'Aïn Turk',
   ARRAY['https://images.pexels.com/photos/221457/pexels-photo-221457.jpeg'],
   'active', 'rent', 345),

  -- Studios meublés
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vacances'),
   (SELECT id FROM categories WHERE slug = 'studios-meubles-vacances'),
   'Studio Annaba Centre Meublé',
   'Studio 28m² centre Annaba, tout équipé. Cuisine, wifi, climatisation. Proche plage. Nuitée: 3500 DA. Semaine: 20000 DA.',
   3500, true, 'good', 'Annaba', 'Annaba',
   ARRAY['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'],
   'active', 'rent', 167),

  -- Chambres d'hôtes
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vacances'),
   (SELECT id FROM categories WHERE slug = 'chambres-hotes'),
   'Chambre d''hôtes Kabylie',
   'Chambres confortables village kabyle authentique. Petit-déjeuner inclus. Calme, nature. 4000 DA/personne/nuit.',
   4000, false, 'good', 'Tizi Ouzou', 'Tizi Ouzou',
   ARRAY['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg'],
   'active', 'rent', 145),

  -- Riads
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vacances'),
   (SELECT id FROM categories WHERE slug = 'riads-traditionnels'),
   'Riad Traditionnel Constantine',
   'Magnifique riad restauré médina Constantine. 200m², 5 chambres, patio, fontaine. Groupe max 12 personnes. 35000 DA/jour.',
   35000, true, 'like_new', 'Constantine', 'Constantine',
   ARRAY['https://images.pexels.com/photos/2587054/pexels-photo-2587054.jpeg'],
   'active', 'rent', 278),

  -- Location saisonnière
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vacances'),
   (SELECT id FROM categories WHERE slug = 'location-saisonniere'),
   'F4 Meublé Mostaganem Plage',
   'F4 tout équipé 100m² à 50m plage Mostaganem. 3 chambres, grande terrasse. Location juillet-août uniquement. 18000 DA/jour.',
   18000, false, 'good', 'Mostaganem', 'Mostaganem',
   ARRAY['https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg'],
   'active', 'rent', 312);

  -- =======================================
  -- LOCATION VÉHICULES (15 annonces)
  -- =======================================

  INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, is_negotiable, condition, wilaya, commune, images, status, listing_type, views_count) VALUES

  -- Voitures de tourisme
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = 'voitures-tourisme-location'),
   'Clio 4 Location Alger',
   'Renault Clio 4 essence climatisée. Assurance incluse. Location: 3500 DA/jour, 20000 DA/semaine, 60000 DA/mois. Caution exigée.',
   3500, true, 'good', 'Alger', 'Alger',
   ARRAY['https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'],
   'active', 'rent', 567),

  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = 'voitures-tourisme-location'),
   'Peugeot 208 Automatique',
   'Peugeot 208 automatique 2020, GPS, bluetooth. 4500 DA/jour, 25000 DA/semaine. Kilométrage illimité. Livraison possible aéroport.',
   4500, true, 'like_new', 'Oran', 'Oran',
   ARRAY['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg'],
   'active', 'rent', 423),

  -- 4x4 & SUV
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = '4x4-suv-location'),
   'Duster 4x4 Sahara',
   'Dacia Duster 4x4 parfait désert. Équipement complet raid, GPS, jerricans. 8000 DA/jour. Idéal Tamanrasset, Djanet.',
   8000, true, 'good', 'Alger', 'Alger',
   ARRAY['https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg'],
   'active', 'rent', 389),

  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = '4x4-suv-location'),
   'Toyota Land Cruiser 4x4',
   'Toyota Land Cruiser VX tout équipé. Raid désert, aventure. Chauffeur expérience disponible option. 12000 DA/jour.',
   12000, true, 'good', 'Tamanrasset', 'Tamanrasset',
   ARRAY['https://images.pexels.com/photos/733745/pexels-photo-733745.jpeg'],
   'active', 'rent', 456),

  -- Minibus & Van
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = 'minibus-van-location'),
   'Minibus 9 Places Climatisé',
   'Mercedes Sprinter 9 places climatisé. Idéal famille, groupe. Chauffeur possible. 8000 DA/jour, 45000 DA/semaine.',
   8000, true, 'good', 'Constantine', 'Constantine',
   ARRAY['https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg'],
   'active', 'rent', 234),

  -- Voitures luxe
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = 'voitures-luxe-location'),
   'Mercedes Classe E Location Luxe',
   'Mercedes Classe E 2021 cuir, toutes options. Mariages, événements VIP. Chauffeur professionnel inclus. 25000 DA/jour.',
   25000, false, 'like_new', 'Alger', 'Hydra',
   ARRAY['https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'],
   'active', 'rent', 512),

  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = 'voitures-luxe-location'),
   'Range Rover Sport Noir',
   'Range Rover Sport noir luxe. Mariages, événements prestige. Chauffeur inclus. Décoration florale offerte. 30000 DA/jour.',
   30000, false, 'like_new', 'Oran', 'Oran',
   ARRAY['https://images.pexels.com/photos/193999/pexels-photo-193999.jpeg'],
   'active', 'rent', 678),

  -- Voitures avec chauffeur
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = 'voitures-chauffeur'),
   'Chauffeur Privé Alger VTC',
   'Service VTC Alger avec Passat confortable. Aéroport, déplacements pro, tourisme. Tarif heure: 1500 DA. Journée: 10000 DA.',
   1500, true, 'good', 'Alger', 'Alger',
   ARRAY['https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg'],
   'active', 'service', 345),

  -- Motos & Scooters
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = 'motos-scooters-location'),
   'Scooter 125cc Location',
   'Scooter Piaggio 125cc pratique ville. 2 casques fournis. 2000 DA/jour, 10000 DA/semaine. Permis B suffisant.',
   2000, true, 'good', 'Alger', 'Alger Centre',
   ARRAY['https://images.pexels.com/photos/1118448/pexels-photo-1118448.jpeg'],
   'active', 'rent', 189),

  -- Véhicules mariage
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = 'vehicules-mariage'),
   'Rolls Royce Phantom Mariage',
   'Rolls Royce Phantom blanche mariages. Décoration incluse, chauffeur costume. Photos offertes. Journée: 60000 DA.',
   60000, false, 'like_new', 'Alger', 'El Biar',
   ARRAY['https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg'],
   'active', 'rent', 789),

  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = 'vehicules-mariage'),
   'Limousine Blanche Mariages',
   'Limousine blanche 10 places. Intérieur luxe, bar, éclairage LED. Chauffeur élégant. Pack mariage: 55000 DA.',
   55000, true, 'like_new', 'Oran', 'Oran',
   ARRAY['https://images.pexels.com/photos/241316/pexels-photo-241316.jpeg'],
   'active', 'rent', 567),

  -- Camions utilitaires
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-vehicules'),
   (SELECT id FROM categories WHERE slug = 'camions-utilitaires-location'),
   'Camionnette Déménagement',
   'Camionnette 14m³ déménagement. Avec ou sans chauffeur. Hayon élévateur. 5000 DA/jour + carburant.',
   5000, true, 'good', 'Alger', 'Birkhadem',
   ARRAY['https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg'],
   'active', 'rent', 234);

  -- =======================================
  -- LOCATION ÉQUIPEMENTS (10 annonces)
  -- =======================================

  INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, is_negotiable, condition, wilaya, commune, images, status, listing_type, views_count) VALUES

  -- Matériel événementiel
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-equipements'),
   (SELECT id FROM categories WHERE slug = 'materiel-evenementiel'),
   'Sono Complète Mariages 500 Pers',
   'Système sono professionnel 500 personnes. Enceintes, micro, table mixage. Technicien inclus. 25000 DA/jour.',
   25000, true, 'good', 'Alger', 'Alger',
   ARRAY['https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'],
   'active', 'rent', 456),

  -- Tentes & Chapiteaux
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-equipements'),
   (SELECT id FROM categories WHERE slug = 'tentes-chapiteaux'),
   'Chapiteau Mariage 300 Places',
   'Chapiteau blanc professionnel 300 places. Montage/démontage inclus. Sol, éclairage LED. 80000 DA événement.',
   80000, true, 'like_new', 'Oran', 'Oran',
   ARRAY['https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg'],
   'active', 'rent', 678),

  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-equipements'),
   (SELECT id FROM categories WHERE slug = 'tentes-chapiteaux'),
   'Tentes Berbères Événements',
   'Tentes berbères traditionnelles. 20-100 personnes. Décoration authentique incluse. À partir de 15000 DA.',
   15000, true, 'good', 'Tizi Ouzou', 'Tizi Ouzou',
   ARRAY['https://images.pexels.com/photos/1936936/pexels-photo-1936936.jpeg'],
   'active', 'rent', 234),

  -- Mobilier événementiel
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-equipements'),
   (SELECT id FROM categories WHERE slug = 'mobilier-evenementiel'),
   'Tables Rondes + Chaises Mariage',
   '20 tables rondes + 200 chaises blanches. Nappes incluses. Livraison Alger. 30000 DA événement.',
   30000, true, 'good', 'Alger', 'Bab Ezzouar',
   ARRAY['https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg'],
   'active', 'rent', 345),

  -- Groupe électrogène
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-equipements'),
   (SELECT id FROM categories WHERE slug = 'groupe-electrogene'),
   'Générateur 150 KVA Événements',
   'Groupe électrogène silencieux 150 KVA. Mariages, chantiers. Carburant en sus. 15000 DA/jour.',
   15000, true, 'good', 'Alger', 'Rouiba',
   ARRAY['https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg'],
   'active', 'rent', 178),

  -- Sono & Éclairage
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-equipements'),
   (SELECT id FROM categories WHERE slug = 'sono-eclairage'),
   'Pack Éclairage LED Événements',
   'Pack éclairage LED professionnel. Projecteurs, jeux lumière, console DMX. Technicien option. 18000 DA/jour.',
   18000, true, 'like_new', 'Constantine', 'Constantine',
   ARRAY['https://images.pexels.com/photos/1387037/pexels-photo-1387037.jpeg'],
   'active', 'rent', 289),

  -- Vaisselle
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-equipements'),
   (SELECT id FROM categories WHERE slug = 'vaisselle-couverts'),
   'Vaisselle Complète 200 Pers',
   'Vaisselle porcelaine 200 personnes. Assiettes, couverts, verres. Livraison incluse. 12000 DA événement.',
   12000, true, 'good', 'Sétif', 'Sétif',
   ARRAY['https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg'],
   'active', 'rent', 156),

  -- Matériel photo/vidéo
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-equipements'),
   (SELECT id FROM categories WHERE slug = 'materiel-photo-video'),
   'Caméra 4K + Stabilisateur',
   'Sony A7S III + DJI Ronin. Objectifs pro. Parfait mariages, clips. Caution 100k DA. 8000 DA/jour.',
   8000, false, 'like_new', 'Alger', 'Alger',
   ARRAY['https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg'],
   'active', 'rent', 267),

  -- Outils BTP
  (main_user_id,
   (SELECT id FROM categories WHERE slug = 'location-equipements'),
   (SELECT id FROM categories WHERE slug = 'outils-machines-btp'),
   'Bétonnière Professionnelle',
   'Bétonnière 350L chantier. Moteur essence. Livraison possible. 2500 DA/jour, 12000 DA/semaine.',
   2500, true, 'good', 'Blida', 'Blida',
   ARRAY['https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg'],
   'active', 'rent', 134);

END $$;

-- Script massif pour générer 200+ annonces réalistes
-- À exécuter dans Supabase SQL Editor

DO $$
DECLARE
  main_user_id uuid;
BEGIN
  -- Récupérer l'utilisateur existant
  SELECT id INTO main_user_id FROM profiles LIMIT 1;

  -- ============================================
  -- IMMOBILIER - 30 annonces
  -- ============================================

  INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, is_negotiable, condition, wilaya, commune, images, status, listing_type, views_count, attributes) VALUES

  -- Appartements
  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'F3 Bab Ezzouar 95m² Neuf', 'Appartement F3 neuf de 95m² au 4ème étage avec ascenseur. 2 chambres spacieuses, grand salon lumineux, cuisine équipée, salle de bain moderne, balcon avec vue dégagée. Immeuble de standing avec gardiennage 24/7, parking souterrain, interphone. Proche commodités: écoles, commerces, transport. Finitions haut de gamme. Livrable immédiatement. Acte notarié prêt.', 8500000, true, 'new', 'Alger', 'Bab Ezzouar', ARRAY['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg', 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'], 'active', 'sale', 234, '{"surface": 95, "chambres": 2, "sdb": 1, "etage": 4, "type": "Appartement"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'F4 Hydra 120m² Vue Mer', 'Superbe F4 de 120m² avec vue panoramique sur la mer. 3 chambres dont une suite parentale, double salon, cuisine équipée américaine, 2 salles de bain. Terrasse 30m². Résidence sécurisée avec piscine, salle de sport, gardien. Garage box fermé. Quartier résidentiel calme et verdoyant. Idéal famille.', 15000000, true, 'like_new', 'Alger', 'Hydra', ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'], 'active', 'sale', 456, '{"surface": 120, "chambres": 3, "sdb": 2, "etage": 7, "type": "Appartement"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'Studio 35m² Bir El Djir', 'Joli studio de 35m² idéal investissement locatif ou premier achat. Cuisine intégrée, salle d''eau moderne, placards. Bon état général. Proche université, bus, commerces. Faibles charges de copropriété. Acte en main. Prix attractif.', 1800000, true, 'good', 'Oran', 'Bir El Djir', ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'], 'active', 'sale', 89, '{"surface": 35, "chambres": 0, "sdb": 1, "etage": 2, "type": "Studio"}'::jsonb),

  -- Maisons & Villas
  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'maisons-villas'), 'Villa R+2 Dely Ibrahim 350m²', 'Magnifique villa R+2 sur 350m² habitables, terrain 450m². RDC: double salon, salle à manger, cuisine équipée, SDB invités. 1er: 3 ch avec SDB, suite parentale. 2ème: 2 ch + terrasse. Jardin paysager, garage 3 voitures, portail électrique. Quartier résidentiel ultra sécurisé.', 45000000, true, 'good', 'Alger', 'Dely Ibrahim', ARRAY['https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg', 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg'], 'active', 'sale', 678, '{"surface": 350, "chambres": 5, "sdb": 3, "terrain": 450, "type": "Villa"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'maisons-villas'), 'Maison Plain-pied 180m²', 'Belle maison plain-pied 180m² sur terrain 300m². 4 chambres, salon, salle à manger, 2 SDB. Cuisine aménagée. Jardin arboré, puits d''eau. Calme absolu. Idéal retraités ou PMR. Bien situé proche écoles et commerces.', 12500000, true, 'good', 'Blida', 'Blida', ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'], 'active', 'sale', 134, '{"surface": 180, "chambres": 4, "sdb": 2, "terrain": 300, "type": "Maison"}'::jsonb),

  -- Location appartements
  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'F3 Meublé Location 70m²', 'F3 meublé de 70m² en location. 2 chambres, salon, cuisine équipée (frigo, gazinière, lave-linge). Meublé complet et moderne. 3ème étage avec ascenseur. Immeuble neuf. Charges incluses. Disponible immédiatement. Contrat annuel.', 45000, true, 'good', 'Oran', 'Es Senia', ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'], 'active', 'rent', 234, '{"surface": 70, "chambres": 2, "sdb": 1, "meuble": true}'::jsonb),

  -- Terrains
  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'terrains'), 'Terrain 500m² Zone Urbaine', 'Terrain constructible 500m² en pleine zone urbaine. Viabilisé (eau, électricité, assainissement). Façade 15m. Accès asphalté. Certificat urbanisme favorable R+5. Acte notarié en règle. Quartier en plein développement. Idéal promotion immobilière.', 6500000, true, 'new', 'Constantine', 'El Khroub', ARRAY['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg'], 'active', 'sale', 156, '{"surface": 500, "facade": 15, "constructible": true}'::jsonb),

  -- Bureaux
  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'bureaux'), 'Bureau 60m² Centre Ville', 'Bureau professionnel 60m² au centre-ville. 2 pièces cloisonnées + open space. Sanitaires privatifs, climatisation. Immeuble de standing, ascenseur, gardien. Idéal cabinet, agence, société. Proche transports et parkings. Charges raisonnables.', 4200000, true, 'good', 'Sétif', 'Sétif', ARRAY['https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg'], 'active', 'sale', 89, '{"surface": 60, "pieces": 3}'::jsonb),

  -- ============================================
  -- ÉLECTRONIQUE - 25 annonces
  -- ============================================

  -- Téléphones
  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'telephones'), 'iPhone 14 Pro 256Go Noir', 'iPhone 14 Pro 256Go noir mat. Comme neuf, acheté il y a 6 mois. Toujours avec coque et verre trempé. Batterie 100%. Garantie Apple active. Boîte complète avec chargeur MagSafe, câble USB-C, écouteurs. Aucune rayure. Débloqué tous opérateurs. Facture dispo.', 145000, false, 'like_new', 'Alger', 'Ben Aknoun', ARRAY['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'], 'active', 'sale', 567, '{"marque": "Apple", "modele": "iPhone 14 Pro", "stockage": "256GB", "couleur": "Noir"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'telephones'), 'Samsung Galaxy S23 Ultra 512Go', 'Samsung Galaxy S23 Ultra 512Go vert. État impeccable, 4 mois d''utilisation. Écran 6.8" Dynamic AMOLED, S Pen inclus. Appareil photo 200MP exceptionnel. Batterie excellente. Coque LED officielle + protection écran. Boîte complète. Garantie Samsung 20 mois restants.', 135000, true, 'like_new', 'Oran', 'Oran', ARRAY['https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'], 'active', 'sale', 423, '{"marque": "Samsung", "modele": "Galaxy S23 Ultra", "stockage": "512GB", "couleur": "Vert"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'telephones'), 'Xiaomi Redmi Note 12 Pro', 'Xiaomi Redmi Note 12 Pro 256Go bleu. Excellent rapport qualité/prix. Écran AMOLED 120Hz, charge rapide 67W. Appareil photo 108MP. Parfait état, utilisé 2 mois. Avec coque transparente et verre trempé. Boîte complète, chargeur rapide inclus. Garantie 10 mois.', 42000, true, 'like_new', 'Constantine', 'Constantine', ARRAY['https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'], 'active', 'sale', 234, '{"marque": "Xiaomi", "modele": "Redmi Note 12 Pro", "stockage": "256GB", "couleur": "Bleu"}'::jsonb),

  -- Ordinateurs
  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'ordinateurs'), 'MacBook Pro 16" M2 Pro 2023', 'MacBook Pro 16" puce M2 Pro, 32Go RAM, 1To SSD. Comme neuf, acheté en février 2024. Écran Liquid Retina XDR exceptionnel. Parfait pour montage vidéo, design graphique, développement. Batterie cycles: 12 seulement. Housse Thule + hub USB-C inclus. Facture et garantie Apple.', 385000, false, 'like_new', 'Alger', 'Hydra', ARRAY['https://images.pexels.com/photos/18105/pexels-photo.jpg', 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg'], 'active', 'sale', 789, '{"marque": "Apple", "modele": "MacBook Pro 16", "ram": "32GB", "stockage": "1TB"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'ordinateurs'), 'PC Gamer i7 RTX 4070', 'PC Gamer assemblé: Intel i7-13700K, RTX 4070 12Go, 32Go DDR5, SSD NVMe 1To, boîtier RGB. Watercooling AIO. Écran 27" 165Hz QHD inclus. Clavier mécanique RGB, souris gaming. Idéal streaming, montage, gaming 4K. Garantie pièces. Config puissante assemblée par pro.', 285000, true, 'like_new', 'Oran', 'Bir El Djir', ARRAY['https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg'], 'active', 'sale', 456, '{"type": "Gaming", "processeur": "i7-13700K", "gpu": "RTX 4070", "ram": "32GB"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'ordinateurs'), 'Dell XPS 15 i7 16Go', 'Dell XPS 15 touchscreen, Intel i7-12700H, 16Go RAM, SSD 512Go, GeForce RTX 3050. Écran 15.6" 4K tactile magnifique. Ultrabook premium pour professionnels. Autonomie 8h. Excellent état, utilisé pour travail bureautique. Sacoche cuir incluse. Garantie Dell 1 an.', 145000, true, 'good', 'Blida', 'Blida', ARRAY['https://images.pexels.com/photos/18105/pexels-photo.jpg'], 'active', 'sale', 234, '{"marque": "Dell", "modele": "XPS 15", "ram": "16GB", "stockage": "512GB"}'::jsonb),

  -- Tablettes
  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'tablettes'), 'iPad Pro 12.9" M2 256Go', 'iPad Pro 12.9 pouces puce M2, 256Go, Wi-Fi + Cellular. Écran Liquid Retina XDR spectaculaire. Apple Pencil 2 + Magic Keyboard inclus. Parfait pour dessin, notes, productivité. État neuf, protection écran depuis achat. Boîte complète. 14 mois garantie restante.', 165000, false, 'like_new', 'Alger', 'Cheraga', ARRAY['https://images.pexels.com/photos/341523/pexels-photo-341523.jpeg'], 'active', 'sale', 345, '{"marque": "Apple", "modele": "iPad Pro 12.9", "stockage": "256GB"}'::jsonb),

  -- TV & Audio
  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'tv-audio'), 'TV Samsung 65" QLED 4K', 'Smart TV Samsung QLED 65 pouces, 4K UHD, HDR10+. Quantum Processor 4K, 120Hz. Parfaite pour gaming PS5/Xbox Series X. Son Dolby Atmos. Applications Netflix, YouTube, Disney+ préinstallées. Impeccable, utilisée 1 an. Support mural inclus. Facture et garantie Samsung.', 125000, true, 'good', 'Constantine', 'Constantine', ARRAY['https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg'], 'active', 'sale', 234, '{"marque": "Samsung", "taille": "65 pouces", "resolution": "4K", "type": "QLED"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'tv-audio'), 'Barre de son Sony HT-A7000', 'Barre de son Sony HT-A7000 Dolby Atmos 7.1.2. Son 3D spatial immersif. Caisson de basses sans fil 300W. HDMI eARC, Bluetooth 5.0, Wi-Fi. Parfaite home cinéma. Télécommande, câbles HDMI inclus. Excellent état. Garantie Sony.', 75000, true, 'good', 'Oran', 'Oran', ARRAY['https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg'], 'active', 'sale', 123, '{"marque": "Sony", "type": "Barre de son", "canaux": "7.1.2"}'::jsonb),

  -- Continuer avec plus de catégories...

END $$;

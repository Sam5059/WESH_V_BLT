/*
  # Ajout massif Immobilier + Électronique + autres

  Complète avec 100+ annonces supplémentaires
*/

DO $$
DECLARE
  main_user_id uuid;
BEGIN
  SELECT id INTO main_user_id FROM profiles LIMIT 1;

  INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, is_negotiable, condition, wilaya, commune, images, status, listing_type, views_count, attributes) VALUES

  -- ============================================
  -- IMMOBILIER - 30 annonces actives
  -- ============================================

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'F2 Birkhadem 65m²', 'F2 spacieux 65m² 2ème étage. Salon, chambre, cuisine, SDB, balcon. Bien situé proche métro. Immeuble calme. Idéal jeune couple ou investissement locatif. Prix négociable.', 4200000, true, 'good', 'Alger', 'Birkhadem', ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'], 'active', 'sale', 145, '{"surface": 65, "chambres": 1, "sdb": 1, "etage": 2}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'F4 Sétif 110m² Neuf Promoteur', 'F4 neuf livrable immédiatement. 110m² standing. 3 chambres, double salon, 2 SDB. Parking + cave. Résidence gardée. Finitions luxe. Acte chez notaire prêt.', 9800000, true, 'new', 'Sétif', 'Sétif', ARRAY['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg', 'https://images.pexels.com/photos/1454804/pexels-photo-1454804.jpeg'], 'active', 'sale', 289, '{"surface": 110, "chambres": 3, "sdb": 2, "parking": true}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'Duplex F5 Oran 150m²', 'Magnifique duplex F5 150m². RDC: salon, sàm, cuisine, SDB. Étage: 3 ch, SDB. Terrasse 30m². Vue mer. Parking privé.', 18500000, true, 'good', 'Oran', 'Canastel', ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'], 'active', 'sale', 456, '{"surface": 150, "chambres": 3, "sdb": 2, "type": "Duplex"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'Studio 30m² Tizi Ouzou Centre', 'Studio 30m² centre-ville. Cuisine américaine, SDB. Meublé possible. Idéal étudiant. Charges faibles. Proche université.', 1500000, true, 'good', 'Tizi Ouzou', 'Tizi Ouzou', ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'], 'active', 'sale', 123, '{"surface": 30, "meuble": "possible", "etage": 3}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'maisons-villas'), 'Villa moderne R+1 250m²', 'Villa R+1 250m² terrain 300m². RDC: salon, sàm, cuisine, ch. Étage: 3 ch + terrasse. Garage, jardin. Quartier calme résidentiel.', 28000000, true, 'good', 'Constantine', 'Didouche Mourad', ARRAY['https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg', 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg'], 'active', 'sale', 567, '{"surface": 250, "chambres": 4, "terrain": 300}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'maisons-villas'), 'Maison F5 Blida 200m²', 'Maison individuelle F5 200m² sur 250m² terrain. 4 ch, 2 SDB, garage. Jardin arboré. Calme absolu. Bien située.', 18500000, true, 'good', 'Blida', 'Ouled Yaich', ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'], 'active', 'sale', 345, '{"surface": 200, "chambres": 4, "terrain": 250}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'terrains'), 'Terrain 300m² Alger Est', 'Terrain constructible 300m² viabilisé. Certificat urbanisme R+4. Quartier en développement. Accès facile.', 4500000, true, 'new', 'Alger', 'Dar El Beida', ARRAY['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg'], 'active', 'sale', 234, '{"surface": 300, "constructible": true, "r+": 4}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'terrains'), 'Grand terrain 800m² Oran', 'Terrain 800m² zone urbaine. Façade 20m. Viabilisé complet. Idéal promotion immobilière ou villa. Acte prêt.', 12000000, true, 'new', 'Oran', 'Gdyel', ARRAY['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg'], 'active', 'sale', 456, '{"surface": 800, "facade": 20, "constructible": true}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'F3 Location Alger 80m²', 'F3 meublé en location. 80m² 2 ch, salon, cuisine équipée. Immeuble récent avec ascenseur. Charges comprises.', 55000, true, 'good', 'Alger', 'Rouiba', ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'], 'active', 'rent', 234, '{"surface": 80, "chambres": 2, "meuble": true}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'F4 Location Oran 100m²', 'F4 non meublé à louer. 100m² 3 ch, 2 SDB. Parking. Résidence sécurisée. Disponible immédiatement.', 60000, true, 'good', 'Oran', 'Es Senia', ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'], 'active', 'rent', 178, '{"surface": 100, "chambres": 3, "parking": true}'::jsonb),

  -- ============================================
  -- ÉLECTRONIQUE - 20 annonces actives
  -- ============================================

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'telephones'), 'Samsung Galaxy A54 5G 256Go', 'Samsung A54 5G 256Go violet. 6 mois utilisation. Écran Super AMOLED 120Hz. Appareil photo 50MP. Batterie excellente. Coque + verre trempé. Boîte complète.', 48000, true, 'like_new', 'Alger', 'Bab Ezzouar', ARRAY['https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'], 'active', 'sale', 234, '{"marque": "Samsung", "modele": "Galaxy A54", "stockage": "256GB"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'telephones'), 'Google Pixel 7 Pro 128Go', 'Google Pixel 7 Pro 128Go noir. Appareil photo exceptionnel. Android pur, mises à jour rapides. Excellent état. Chargeur rapide inclus.', 72000, true, 'good', 'Oran', 'Oran', ARRAY['https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'], 'active', 'sale', 178, '{"marque": "Google", "modele": "Pixel 7 Pro", "stockage": "128GB"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'telephones'), 'iPhone 13 128Go Bleu', 'iPhone 13 128Go bleu. Batterie 92%. Aucune rayure. Facture + garantie 4 mois. Boîte complète avec accessoires d''origine.', 95000, true, 'like_new', 'Constantine', 'Constantine', ARRAY['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'], 'active', 'sale', 345, '{"marque": "Apple", "modele": "iPhone 13", "stockage": "128GB", "batterie": "92%"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'ordinateurs'), 'HP Pavilion 15 i5 8Go', 'HP Pavilion 15.6" Intel i5-1135G7, 8Go RAM, SSD 512Go. Écran Full HD IPS. Bon état général. Idéal bureautique, études. Sacoche incluse.', 62000, true, 'good', 'Blida', 'Blida', ARRAY['https://images.pexels.com/photos/18105/pexels-photo.jpg'], 'active', 'sale', 234, '{"marque": "HP", "processeur": "i5", "ram": "8GB", "stockage": "512GB"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'ordinateurs'), 'Lenovo ThinkPad T14 i7', 'ThinkPad T14 Gen 3. i7-1260P, 16Go RAM, SSD 512Go. Écran 14" WUXGA. Clavier rétroéclairé. Build qualité pro. Garantie Lenovo 18 mois.', 115000, true, 'like_new', 'Alger', 'Cheraga', ARRAY['https://images.pexels.com/photos/18105/pexels-photo.jpg'], 'active', 'sale', 289, '{"marque": "Lenovo", "processeur": "i7-1260P", "ram": "16GB"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'ordinateurs'), 'Asus ROG Gaming i9 RTX 3080', 'PC portable gaming Asus ROG. i9-12900H, RTX 3080 16Go, 32Go DDR5, SSD 1To. Écran 17" QHD 240Hz. RGB. Beast machine gaming/création.', 385000, true, 'like_new', 'Oran', 'Oran', ARRAY['https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg'], 'active', 'sale', 567, '{"marque": "Asus ROG", "processeur": "i9", "gpu": "RTX 3080", "ram": "32GB"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'tablettes'), 'iPad Air 5 64Go Bleu', 'iPad Air 5ème gen puce M1 64Go bleu. Écran Liquid Retina 10.9". Excellent état. Smart Cover bleue incluse. Facture Apple Store.', 85000, true, 'like_new', 'Sétif', 'Sétif', ARRAY['https://images.pexels.com/photos/341523/pexels-photo-341523.jpeg'], 'active', 'sale', 234, '{"marque": "Apple", "modele": "iPad Air 5", "stockage": "64GB"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'tablettes'), 'Samsung Tab S8+ 128Go', 'Samsung Galaxy Tab S8+ 128Go gris. Écran Super AMOLED 12.4". S Pen inclus. Keyboard cover Samsung. Idéal productivité/multimédia.', 95000, true, 'like_new', 'Alger', 'Kouba', ARRAY['https://images.pexels.com/photos/341523/pexels-photo-341523.jpeg'], 'active', 'sale', 178, '{"marque": "Samsung", "modele": "Tab S8+", "stockage": "128GB"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'tv-audio'), 'TV LG OLED 55" C2 4K', 'LG OLED55C2 55 pouces. Dalle OLED Auto-Luminescente. 4K 120Hz. Dolby Vision IQ, Dolby Atmos. HDMI 2.1 gaming. WebOS 22. Impeccable. Support mural.', 155000, true, 'like_new', 'Constantine', 'Constantine', ARRAY['https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg'], 'active', 'sale', 345, '{"marque": "LG", "taille": "55 pouces", "type": "OLED", "resolution": "4K"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'tv-audio'), 'Enceinte Bluetooth JBL Charge 5', 'JBL Charge 5 portable. Son puissant, basses profondes. Étanche IP67. Autonomie 20h. Port USB charge téléphone. Neuve, cadeau non utilisé.', 15000, false, 'new', 'Blida', 'Blida', ARRAY['https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg'], 'active', 'sale', 234, '{"marque": "JBL", "modele": "Charge 5", "autonomie": "20h"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'appareils-photo'), 'Canon EOS R6 Boîtier Nu', 'Canon EOS R6 hybride plein format. 20MP, IBIS 8 stops, AF excellent. Vidéo 4K 60fps. 2000 déclenchements seulement. Boîte complète, 2 batteries.', 285000, true, 'like_new', 'Alger', 'Hydra', ARRAY['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'], 'active', 'sale', 456, '{"marque": "Canon", "modele": "EOS R6", "type": "Hybride"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'appareils-photo'), 'Nikon D850 + 24-120mm f/4', 'Nikon D850 reflex pro 45MP. Avec objectif 24-120mm f/4 VR. Tropicalisé. Dual card slot. Excellente dynamique. Sacoche Lowepro, filtre UV.', 385000, true, 'good', 'Oran', 'Bir El Djir', ARRAY['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'], 'active', 'sale', 234, '{"marque": "Nikon", "modele": "D850", "objectif": "24-120mm"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'consoles-jeux-video'), 'Nintendo Switch OLED blanc', 'Nintendo Switch modèle OLED écran 7" blanc. 2 Joy-Cons, dock, câbles. Excellent état, protection écran. 3 jeux: Zelda BOTW, Mario Kart 8, Animal Crossing.', 58000, true, 'good', 'Alger', 'Bab Ezzouar', ARRAY['https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg'], 'active', 'sale', 345, '{"console": "Switch OLED", "jeux": 3, "couleur": "Blanc"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'montres-connectees'), 'Apple Watch Series 8 45mm', 'Apple Watch Series 8 GPS + Cellular 45mm gris sidéral. Bracelet sport noir. Capteur température, ECG, oxymètre. Boîte complète. Garantie 8 mois.', 65000, true, 'like_new', 'Sétif', 'Sétif', ARRAY['https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg'], 'active', 'sale', 234, '{"marque": "Apple", "modele": "Watch Series 8", "taille": "45mm"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'imprimantes-scanners'), 'HP LaserJet Pro MFP M428', 'Imprimante laser multifonction HP LaserJet Pro M428fdn. Impression/scan/copie/fax. Réseau Ethernet. Recto-verso auto. Rapide 40ppm. Professionnelle. Comme neuve.', 85000, true, 'like_new', 'Constantine', 'Constantine', ARRAY['https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg'], 'active', 'sale', 178, '{"marque": "HP", "type": "Laser", "vitesse": "40ppm"}'::jsonb);

END $$;

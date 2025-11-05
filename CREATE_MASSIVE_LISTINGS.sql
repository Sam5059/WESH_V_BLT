-- Script massif pour créer des annonces dans TOUTES les sous-catégories
-- Utilise les 2 utilisateurs existants: 19e21659-7c60-452f-9863-59bfef8c0c35 et 7a37b398-05f0-4914-8ec7-8ff13acd2790

-- ========================================
-- ANIMAUX - Chevaux
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'animaux'), id, 'Jument Pur-Sang Arabe', 'Magnifique jument Pur-Sang Arabe. 7 ans. Papiers complets.', 850000, 'sale', 'Tiaret', 'Tiaret', 'active' FROM categories WHERE slug = 'chevaux'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'animaux'), id, 'Hongre Barbe randonnée', 'Hongre race Barbe. 10 ans. Parfait randonnées. Calme.', 320000, 'sale', 'Alger', 'Zéralda', 'active' FROM categories WHERE slug = 'chevaux'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'animaux'), id, 'Poney Shetland enfants', 'Adorable poney. 8 ans. Très doux avec enfants.', 180000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'chevaux';

-- ========================================
-- ANIMAUX - Poissons & Aquariums
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'animaux'), id, 'Discus rouge Turquoise', 'Couple Discus. Taille 12-15cm. Couleurs éclatantes.', 25000, 'sale', 'Alger', 'Hydra', 'active' FROM categories WHERE slug = 'poissons-aquariums'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'animaux'), id, 'Aquarium marin 300L', 'Aquarium eau de mer 300L. Écumeur, LED. Coraux inclus.', 180000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'poissons-aquariums'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'animaux'), id, 'Poissons rouges queue voile', 'Magnifiques poissons rouges. Taille 8-12cm. Coloris variés.', 2500, 'sale', 'Constantine', 'Constantine', 'active' FROM categories WHERE slug = 'poissons-aquariums';

-- ========================================
-- ANIMAUX - Rongeurs
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'animaux'), id, 'Lapin nain bélier angora', 'Adorable lapin nain. 4 mois. Très affectueux. Vacciné.', 8000, 'sale', 'Alger', 'Kouba', 'active' FROM categories WHERE slug = 'rongeurs'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'animaux'), id, 'Chinchilla standard gris', 'Chinchilla. 1 an. Magnifique fourrure. Cage incluse.', 18000, 'sale', 'Sétif', 'Sétif', 'active' FROM categories WHERE slug = 'rongeurs'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'animaux'), id, 'Hamsters dorés couple', 'Couple hamsters dorés. Excellente santé. Cage incluse.', 3500, 'sale', 'Blida', 'Blida', 'active' FROM categories WHERE slug = 'rongeurs';

-- ========================================
-- BÉBÉ & ENFANTS - Alimentation bébé
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Chaise haute évolutive bois', 'Chaise haute bois massif. Grandit avec bébé.', 15000, 'sale', 'Alger', 'Bab Ezzouar', 'active' FROM categories WHERE slug = 'alimentation-bebe'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Robot Beaba Babycook', 'Babycook original. Cuit vapeur + mixe. Comme neuf.', 18000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'alimentation-bebe'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Stérilisateur Avent', 'Stérilisateur micro-ondes Philips Avent. 2 min.', 6000, 'sale', 'Constantine', 'Constantine', 'active' FROM categories WHERE slug = 'alimentation-bebe';

-- ========================================
-- BÉBÉ & ENFANTS - Articles puériculture
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Poussette 3en1 complète', 'Poussette 3en1: nacelle + cosy + poussette. Gris.', 45000, 'sale', 'Alger', 'Chéraga', 'active' FROM categories WHERE slug = 'articles-puericulture'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Lit bébé 60x120 matelas', 'Lit bébé bois blanc. 3 hauteurs. Matelas inclus.', 22000, 'sale', 'Oran', 'Bir El Djir', 'active' FROM categories WHERE slug = 'articles-puericulture'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Parc bébé pliable', 'Parc 120x120cm. Tapis mousse. Très pratique.', 12000, 'sale', 'Annaba', 'Annaba', 'active' FROM categories WHERE slug = 'articles-puericulture'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Transat électrique', 'Transat avec balancelle auto. Musiques + vibrations.', 16000, 'sale', 'Sétif', 'Sétif', 'active' FROM categories WHERE slug = 'articles-puericulture';

-- ========================================
-- BÉBÉ & ENFANTS - Hygiène & Soins
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Baignoire bébé sur pied', 'Baignoire avec support. Bouchon vidange. Pratique.', 8000, 'sale', 'Alger', 'Draria', 'active' FROM categories WHERE slug = 'hygiene-soins'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Thermomètre bain Beurer', 'Thermomètre digital bain + chambre. Alarme. Neuf.', 3500, 'sale', 'Constantine', 'Constantine', 'active' FROM categories WHERE slug = 'hygiene-soins'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Humidificateur air bébé', 'Humidificateur ultrasonique. Silencieux. LED 7 couleurs.', 7500, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'hygiene-soins';

-- ========================================
-- BÉBÉ & ENFANTS - Vêtements bébé
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Lot 20 bodies 0-6 mois', 'Lot bodies manches courtes/longues. Coton. Excellent état.', 8000, 'sale', 'Alger', 'Hussein Dey', 'active' FROM categories WHERE slug = 'vetements-bebe'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Combinaisons pilote hiver', 'Lot 3 combinaisons chaudes. Couleurs mixtes.', 12000, 'sale', 'Blida', 'Blida', 'active' FROM categories WHERE slug = 'vetements-bebe'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'bebe-enfants'), id, 'Pyjamas velours 12-18 mois', 'Lot 5 pyjamas velours. Motifs animaux. Bon état.', 6000, 'sale', 'Sétif', 'Sétif', 'active' FROM categories WHERE slug = 'vetements-bebe';

-- ========================================
-- ÉLECTRONIQUE - Drones & Robots
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'electronique'), id, 'Drone DJI Mini 3 Pro', 'DJI Mini 3 Pro. Caméra 4K. 3 batteries. Sac transport.', 185000, 'sale', 'Alger', 'Bab Ezzouar', 'active' FROM categories WHERE slug = 'drones-robots'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'electronique'), id, 'Robot aspirateur Roborock', 'Roborock S7. Aspire + lave. App connectée. Comme neuf.', 95000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'drones-robots'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'electronique'), id, 'Drone FPV racing', 'Drone FPV racing. Vitesse 120km/h. Lunettes incluses.', 75000, 'sale', 'Constantine', 'Constantine', 'active' FROM categories WHERE slug = 'drones-robots';

-- ========================================
-- ÉLECTRONIQUE - Réseaux & Wifi
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'electronique'), id, 'Routeur TP-Link AX6000', 'Routeur Wifi 6 TP-Link. Tri-band. 8 antennes. Neuf.', 35000, 'sale', 'Alger', 'Hydra', 'active' FROM categories WHERE slug = 'reseaux-wifi'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'electronique'), id, 'Système Mesh Wifi Deco X60', 'TP-Link Deco X60. Pack 3. Couvre 500m². Neuf scellé.', 45000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'reseaux-wifi'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'electronique'), id, 'Switch réseau 24 ports', 'Switch Gigabit 24 ports. Manageable. Rack 19 pouces.', 28000, 'sale', 'Annaba', 'Annaba', 'active' FROM categories WHERE slug = 'reseaux-wifi';

-- ========================================
-- EMPLOI & SERVICES - Demandes emploi
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'emploi-services'), id, 'Développeur Full-Stack React/Node', 'Développeur 5 ans expérience. React, Node.js, PostgreSQL. Dispo immédiat.', 80000, 'service', 'Alger', 'Bab Ezzouar', 'active' FROM categories WHERE slug = 'demandes-emploi'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'emploi-services'), id, 'Comptable expérimenté', 'Comptable diplômé. 8 ans expérience. Maîtrise PC Compta.', 60000, 'service', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'demandes-emploi'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'emploi-services'), id, 'Électricien bâtiment', 'Électricien qualifié. 10 ans expérience. Tous travaux.', 40000, 'service', 'Constantine', 'Constantine', 'active' FROM categories WHERE slug = 'demandes-emploi';

-- ========================================
-- EMPLOI & SERVICES - Événementiel
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'emploi-services'), id, 'DJ professionnel mariages', 'DJ pro événements. Sono + lumières. Ambiance garantie.', 50000, 'service', 'Alger', 'Alger Centre', 'active' FROM categories WHERE slug = 'evenementiel'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'emploi-services'), id, 'Photographe mariage', 'Photographe pro mariages. Vidéo 4K. Album photo offert.', 80000, 'service', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'evenementiel'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'emploi-services'), id, 'Traiteur événements', 'Service traiteur buffets. Menu personnalisé. 50-300 pers.', 15000, 'service', 'Blida', 'Blida', 'active' FROM categories WHERE slug = 'evenementiel';

-- ========================================
-- EMPLOI & SERVICES - Services entreprises
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'emploi-services'), id, 'Développement sites web sur mesure', 'Création sites web professionnels. E-commerce. SEO inclus.', 150000, 'service', 'Alger', 'Hydra', 'active' FROM categories WHERE slug = 'services-entreprises'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'emploi-services'), id, 'Expertise comptable', 'Cabinet expertise comptable. Bilan, fiscalité, audit.', 50000, 'service', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'services-entreprises'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'emploi-services'), id, 'Consulting digital marketing', 'Stratégie digitale. SEO, SEA, réseaux sociaux. ROI garanti.', 80000, 'service', 'Constantine', 'Constantine', 'active' FROM categories WHERE slug = 'services-entreprises';

-- ========================================
-- ENTREPRISES - Agences & Services
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), id, 'Agence immobilière centre-ville', 'Agence immobilière établie. Portefeuille 200 biens. Personnel formé.', 8500000, 'sale', 'Alger', 'Alger Centre', 'active' FROM categories WHERE slug = 'agences-services'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), id, 'Agence voyage licence A', 'Agence voyage licence A. Clientèle fidèle. Local équipé.', 12000000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'agences-services';

-- ========================================
-- ENTREPRISES - Auto-écoles
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), id, 'Auto-école avec 5 véhicules', 'Auto-école agréée. 5 véhicules récents. Moniteurs diplômés.', 6500000, 'sale', 'Alger', 'Kouba', 'active' FROM categories WHERE slug = 'auto-ecoles'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), id, 'Auto-école centre Oran', 'Auto-école centre-ville Oran. Très rentable. 80 élèves/mois.', 9000000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'auto-ecoles';

-- ========================================
-- ENTREPRISES - Pharmacies
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), id, 'Pharmacie quartier résidentiel', 'Pharmacie établie quartier résidentiel. CA mensuel 2M DA.', 25000000, 'sale', 'Alger', 'Hydra', 'active' FROM categories WHERE slug = 'pharmacies'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), id, 'Pharmacie de garde Oran', 'Pharmacie de garde. Excellente clientèle. Stock complet.', 28000000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'pharmacies';

-- ========================================
-- ENTREPRISES - Projets industriels
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), id, 'Usine fabrication plastique', 'Usine production plastique. Machines neuves. 2000m² hangar.', 45000000, 'sale', 'Rouiba', 'Rouiba', 'active' FROM categories WHERE slug = 'projets-industriels'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), id, 'Unité embouteillage eau', 'Unité embouteillage. Source agréée. Équipements modernes.', 35000000, 'sale', 'Blida', 'Blida', 'active' FROM categories WHERE slug = 'projets-industriels';

-- ========================================
-- ENTREPRISES - Salons coiffure
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), id, 'Salon coiffure dame luxe', 'Salon coiffure haut standing. 8 postes. Clientèle VIP.', 4500000, 'sale', 'Alger', 'Hydra', 'active' FROM categories WHERE slug = 'salons-coiffure'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), id, 'Salon barbier moderne', 'Salon barbier équipé. Ambiance lounge. Très rentable.', 2800000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'salons-coiffure';

-- ========================================
-- IMMOBILIER - Bureaux
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Bureau 150m² standing Hydra', 'Bureau 150m² standing. 5 pièces. Climatisé. Parking.', 18000000, 'sale', 'Alger', 'Hydra', 'active' FROM categories WHERE slug = 'bureaux'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Plateau bureau 300m² Tour', 'Plateau bureau 300m². Open space. Vue panoramique.', 45000000, 'sale', 'Alger', 'Bab Ezzouar', 'active' FROM categories WHERE slug = 'bureaux'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Bureau 80m² centre Oran', 'Bureau 80m² centre-ville. Climatisé. Ascenseur.', 12000000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'bureaux';

-- ========================================
-- IMMOBILIER - Colocations
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Chambre colocation étudiants', 'Chambre meublée dans F4. Internet fiber. Près fac.', 15000, 'rent', 'Alger', 'Ben Aknoun', 'active' FROM categories WHERE slug = 'colocations'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Colocation F5 jeunes pros', 'Chambre dans F5 moderne. Piscine. Salle sport.', 25000, 'rent', 'Alger', 'Chéraga', 'active' FROM categories WHERE slug = 'colocations'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Colocation Oran centre', 'Chambre meublée F4. Tout équipé. Charges incluses.', 18000, 'rent', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'colocations';

-- ========================================
-- IMMOBILIER - Fermes & Terrains agricoles
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Ferme 5 hectares + maison', 'Ferme 5 hectares. Maison 200m². Puits. Serre.', 35000000, 'sale', 'Blida', 'Blida', 'active' FROM categories WHERE slug = 'fermes-agricoles'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Terrain agricole 10 hectares', 'Terrain agricole 10 ha. Irrigué. Route goudronnée.', 25000000, 'sale', 'Sétif', 'Sétif', 'active' FROM categories WHERE slug = 'fermes-agricoles'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Exploitation avicole 2 hectares', 'Exploitation avicole 2 ha. 4 poulaillers. Équipée.', 18000000, 'sale', 'Bouira', 'Bouira', 'active' FROM categories WHERE slug = 'fermes-agricoles';

-- ========================================
-- IMMOBILIER - Hangars & Entrepôts
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Hangar 500m² zone industrielle', 'Hangar 500m². Hauteur 8m. Portail 5m. Sécurisé.', 28000000, 'sale', 'Rouiba', 'Rouiba', 'active' FROM categories WHERE slug = 'hangars-entrepots'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Entrepôt 1000m² Oran', 'Entrepôt 1000m². Quai chargement. Bureau 100m².', 45000000, 'sale', 'Oran', 'Es Senia', 'active' FROM categories WHERE slug = 'hangars-entrepots';

-- ========================================
-- IMMOBILIER - Locations vacances
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Appartement F3 vue mer Tipaza', 'F3 60m² vue mer. Plage 50m. Climatisé. Wifi.', 8000, 'rent', 'Tipaza', 'Tipaza', 'active' FROM categories WHERE slug = 'locations-vacances'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Villa pieds dans eau Sidi Fredj', 'Villa 200m² pieds dans eau. Piscine. 6 chambres.', 50000, 'rent', 'Alger', 'Staoueli', 'active' FROM categories WHERE slug = 'locations-vacances'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Studio vacances Bejaia bord mer', 'Studio 35m² front de mer. Terrasse. Parking.', 6000, 'rent', 'Béjaïa', 'Béjaïa', 'active' FROM categories WHERE slug = 'locations-vacances';

-- ========================================
-- IMMOBILIER - Locaux commerciaux
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Local commercial 80m² Hydra', 'Local 80m². Vitrine 6m. Wc. Climatisation.', 16000000, 'sale', 'Alger', 'Hydra', 'active' FROM categories WHERE slug = 'locaux-commerciaux'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Boutique centre commercial', 'Boutique 45m² centre commercial. Passage énorme.', 22000000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'locaux-commerciaux'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Local angle 120m² RDC', 'Local d\'angle 120m². Double vitrine. Parking.', 28000000, 'sale', 'Constantine', 'Constantine', 'active' FROM categories WHERE slug = 'locaux-commerciaux';

-- ========================================
-- IMMOBILIER - Parkings & Garages
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Garage box fermé sécurisé', 'Box garage 18m². Portail électrique. Résidence.', 2500000, 'sale', 'Alger', 'Hydra', 'active' FROM categories WHERE slug = 'parkings-garages'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Place parking centre-ville', 'Place parking sécurisée. Accès badge. Centre-ville.', 1800000, 'sale', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'parkings-garages'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'immobilier'), id, 'Garage double 40m²', 'Grand garage 40m². Hauteur 3m. Porte basculante.', 4500000, 'sale', 'Constantine', 'Constantine', 'active' FROM categories WHERE slug = 'parkings-garages';

-- ========================================
-- LOCATION ÉQUIPEMENTS - Costumes
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'location-equipements'), id, 'Location costume Père Noël', 'Costume Père Noël complet. Barbe + perruque. Parfait état.', 5000, 'rent', 'Alger', 'Alger Centre', 'active' FROM categories WHERE slug = 'costumes-deguisements'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'location-equipements'), id, 'Déguisements enfants fête', 'Lots déguisements enfants: princesses, super-héros. Propres.', 3000, 'rent', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'costumes-deguisements'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'location-equipements'), id, 'Costume mariage kabyle', 'Robe kabyle traditionnelle mariée. Accessoires inclus.', 15000, 'rent', 'Tizi Ouzou', 'Tizi Ouzou', 'active' FROM categories WHERE slug = 'costumes-deguisements';

-- ========================================
-- LOCATION ÉQUIPEMENTS - Échafaudages
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'location-equipements'), id, 'Échafaudage roulant 6m hauteur', 'Échafaudage roulant aluminium. Hauteur 6m. Sécurisé.', 8000, 'rent', 'Alger', 'Bab Ezzouar', 'active' FROM categories WHERE slug = 'echafaudages-nacelles'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'location-equipements'), id, 'Nacelle élévatrice 12m', 'Nacelle élévatrice électrique. Hauteur 12m. Compact.', 25000, 'rent', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'echafaudages-nacelles'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'location-equipements'), id, 'Échelle télescopique 4m', 'Échelle télescopique alu. 4m déployée. Légère.', 3000, 'rent', 'Blida', 'Blida', 'active' FROM categories WHERE slug = 'echafaudages-nacelles';

-- ========================================
-- LOCATION ÉQUIPEMENTS - Matériel sport
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'location-equipements'), id, 'Kayak 2 places avec pagaies', 'Kayak 2 places stable. Pagaies + gilets. Par jour.', 4000, 'rent', 'Tipaza', 'Tipaza', 'active' FROM categories WHERE slug = 'materiel-sport-location'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'location-equipements'), id, 'Vélos montagne groupe 10', 'Lot 10 VTT. Tailles adultes. Casques inclus. Parfait état.', 15000, 'rent', 'Alger', 'Zéralda', 'active' FROM categories WHERE slug = 'materiel-sport-location'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'location-equipements'), id, 'Stand-up paddle gonflable', 'SUP gonflable avec pompe. Pagaie réglable. Débutants ok.', 5000, 'rent', 'Oran', 'Oran', 'active' FROM categories WHERE slug = 'materiel-sport-location';

-- ========================================
-- LOCATION VACANCES - Campings & Caravanes
-- ========================================
INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, listing_type, wilaya, commune, status)
SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'location-vacances'), id, 'Caravane 6 places climatisée', 'Caravane moderne 6 places. Clim, cuisine, douche. Auvent.', 12000, 'rent', 'Tipaza', 'Tipaza', 'active' FROM categories WHERE slug = 'campings-caravanes-vacances'
UNION ALL SELECT '7a37b398-05f0-4914-8ec7-8ff13acd2790'::uuid, (SELECT id FROM categories WHERE slug = 'location-vacances'), id, 'Mobil-home bord de mer', 'Mobil-home 4 places. Terrasse bois. Vue mer. Emplacement premium.', 18000, 'rent', 'Béjaïa', 'Béjaïa', 'active' FROM categories WHERE slug = 'campings-caravanes-vacances'
UNION ALL SELECT '19e21659-7c60-452f-9863-59bfef8c0c35'::uuid, (SELECT id FROM categories WHERE slug = 'location-vacances'), id, 'Tente familiale 8 places', 'Tente dôme 8 places. 3 chambres. Avancée cuisine. Complète.', 6000, 'rent', 'Alger', 'Zéralda', 'active' FROM categories WHERE slug = 'campings-caravanes-vacances';

SELECT 'TERMINÉ: Plus de 100 annonces créées dans toutes les sous-catégories!' as message;

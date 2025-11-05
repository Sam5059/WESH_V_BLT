/*
  # Ajout des catégories Location Vacances et Location Véhicules
  
  Nouvelles catégories principales:
  1. Location Vacances (avec sous-catégories)
  2. Location Véhicules (avec sous-catégories)
  3. Location Équipements (pour événements, matériel, etc.)
*/

DO $$
DECLARE
  cat_location_vacances_id uuid;
  cat_location_vehicules_id uuid;
  cat_location_equipements_id uuid;
BEGIN

  -- =============================================
  -- CATÉGORIE 1: LOCATION VACANCES
  -- =============================================
  INSERT INTO categories (name, name_en, name_ar, slug, parent_id, order_position, icon)
  VALUES ('Location Vacances', 'Vacation Rentals', 'إيجار عطل', 'location-vacances', NULL, 13, 'home')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_location_vacances_id;

  -- Sous-catégories Location Vacances
  INSERT INTO categories (name, name_en, name_ar, slug, parent_id, order_position) VALUES
  ('Appartements de vacances', 'Vacation Apartments', 'شقق عطل', 'appartements-vacances', cat_location_vacances_id, 1),
  ('Villas & Maisons', 'Villas & Houses', 'فيلات و منازل', 'villas-maisons-vacances', cat_location_vacances_id, 2),
  ('Studios meublés', 'Furnished Studios', 'استوديوهات مفروشة', 'studios-meubles-vacances', cat_location_vacances_id, 3),
  ('Chalets de montagne', 'Mountain Chalets', 'شاليهات جبلية', 'chalets-montagne', cat_location_vacances_id, 4),
  ('Bungalows & Résidences plage', 'Beach Bungalows', 'بنغالوهات شاطئية', 'bungalows-plage', cat_location_vacances_id, 5),
  ('Chambres d''hôtes', 'Guest Rooms', 'غرف ضيوف', 'chambres-hotes', cat_location_vacances_id, 6),
  ('Gîtes ruraux', 'Rural Cottages', 'أكواخ ريفية', 'gites-ruraux', cat_location_vacances_id, 7),
  ('Riads & Maisons traditionnelles', 'Riads & Traditional Houses', 'رياضات و منازل تقليدية', 'riads-traditionnels', cat_location_vacances_id, 8),
  ('Campings & Caravanes', 'Camping & Caravans', 'تخييم و كرافانات', 'campings-caravanes-vacances', cat_location_vacances_id, 9),
  ('Location saisonnière', 'Seasonal Rentals', 'إيجار موسمي', 'location-saisonniere', cat_location_vacances_id, 10)
  ON CONFLICT (slug) DO NOTHING;

  -- =============================================
  -- CATÉGORIE 2: LOCATION VÉHICULES
  -- =============================================
  INSERT INTO categories (name, name_en, name_ar, slug, parent_id, order_position, icon)
  VALUES ('Location Véhicules', 'Vehicle Rentals', 'تأجير مركبات', 'location-vehicules', NULL, 14, 'car')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_location_vehicules_id;

  -- Sous-catégories Location Véhicules
  INSERT INTO categories (name, name_en, name_ar, slug, parent_id, order_position) VALUES
  ('Voitures de tourisme', 'Passenger Cars', 'سيارات سياحية', 'voitures-tourisme-location', cat_location_vehicules_id, 1),
  ('4x4 & SUV', '4x4 & SUV', 'دفع رباعي', '4x4-suv-location', cat_location_vehicules_id, 2),
  ('Minibus & Van', 'Minibus & Van', 'ميني باص', 'minibus-van-location', cat_location_vehicules_id, 3),
  ('Voitures de luxe', 'Luxury Cars', 'سيارات فاخرة', 'voitures-luxe-location', cat_location_vehicules_id, 4),
  ('Voitures avec chauffeur', 'Cars with Driver', 'سيارات مع سائق', 'voitures-chauffeur', cat_location_vehicules_id, 5),
  ('Motos & Scooters', 'Motorcycles & Scooters', 'دراجات نارية', 'motos-scooters-location', cat_location_vehicules_id, 6),
  ('Vélos & Trottinettes', 'Bikes & Scooters', 'دراجات و دراجات كهربائية', 'velos-trottinettes-location', cat_location_vehicules_id, 7),
  ('Camions & Utilitaires', 'Trucks & Vans', 'شاحنات و نقل', 'camions-utilitaires-location', cat_location_vehicules_id, 8),
  ('Bus & Autocars', 'Buses & Coaches', 'حافلات', 'bus-autocars-location', cat_location_vehicules_id, 9),
  ('Véhicules de mariage', 'Wedding Vehicles', 'سيارات زفاف', 'vehicules-mariage', cat_location_vehicules_id, 10)
  ON CONFLICT (slug) DO NOTHING;

  -- =============================================
  -- CATÉGORIE 3: LOCATION ÉQUIPEMENTS
  -- =============================================
  INSERT INTO categories (name, name_en, name_ar, slug, parent_id, order_position, icon)
  VALUES ('Location Équipements', 'Equipment Rentals', 'تأجير معدات', 'location-equipements', NULL, 15, 'wrench')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO cat_location_equipements_id;

  -- Sous-catégories Location Équipements
  INSERT INTO categories (name, name_en, name_ar, slug, parent_id, order_position) VALUES
  ('Matériel événementiel', 'Event Equipment', 'معدات الحفلات', 'materiel-evenementiel', cat_location_equipements_id, 1),
  ('Tentes & Chapiteaux', 'Tents & Marquees', 'خيام و شادرات', 'tentes-chapiteaux', cat_location_equipements_id, 2),
  ('Sono & Éclairage', 'Sound & Lighting', 'صوت و إضاءة', 'sono-eclairage', cat_location_equipements_id, 3),
  ('Mobilier événementiel', 'Event Furniture', 'أثاث الحفلات', 'mobilier-evenementiel', cat_location_equipements_id, 4),
  ('Vaisselle & Couverts', 'Tableware & Cutlery', 'أواني و أدوات مائدة', 'vaisselle-couverts', cat_location_equipements_id, 5),
  ('Groupe électrogène', 'Generators', 'مولدات كهربائية', 'groupe-electrogene', cat_location_equipements_id, 6),
  ('Échafaudages & Nacelles', 'Scaffolding & Lifts', 'سقالات و رافعات', 'echafaudages-nacelles', cat_location_equipements_id, 7),
  ('Outils & Machines BTP', 'Construction Tools', 'أدوات بناء', 'outils-machines-btp', cat_location_equipements_id, 8),
  ('Matériel de nettoyage', 'Cleaning Equipment', 'معدات تنظيف', 'materiel-nettoyage', cat_location_equipements_id, 9),
  ('Costumes & Déguisements', 'Costumes', 'أزياء تنكرية', 'costumes-deguisements', cat_location_equipements_id, 10),
  ('Matériel photo/vidéo', 'Photo/Video Equipment', 'معدات تصوير', 'materiel-photo-video', cat_location_equipements_id, 11),
  ('Matériel de sport', 'Sports Equipment', 'معدات رياضية', 'materiel-sport-location', cat_location_equipements_id, 12)
  ON CONFLICT (slug) DO NOTHING;

END $$;

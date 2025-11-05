/*
  # Add Comprehensive Vehicle Models
  
  1. Models Added for Each Brand
    - Renault: Clio, Megane, Symbol, Logan, Sandero, Duster, Captur, Kangoo, Trafic, Master, etc.
    - Peugeot: 208, 308, 301, 2008, 3008, 5008, Partner, Boxer, Expert, etc.
    - Citroën: C3, C4, C5, Berlingo, Jumpy, Jumper, etc.
    - Mercedes-Benz: A-Class, C-Class, E-Class, S-Class, GLA, GLC, GLE, Sprinter, Vito, etc.
    - BMW: Série 1, Série 3, Série 5, Série 7, X1, X3, X5, X6, etc.
    - Toyota: Yaris, Corolla, Camry, Hilux, Land Cruiser, Prado, RAV4, etc.
    - And many more for all brands
    
  2. Important Notes
    - Uses ON CONFLICT to avoid duplicates
    - Models cover popular vehicles in Algeria
    - Includes sedans, SUVs, vans, trucks
*/

DO $$
DECLARE
  -- Brand IDs
  v_renault_id uuid;
  v_peugeot_id uuid;
  v_citroen_id uuid;
  v_dacia_id uuid;
  v_mercedes_id uuid;
  v_bmw_id uuid;
  v_audi_id uuid;
  v_vw_id uuid;
  v_toyota_id uuid;
  v_nissan_id uuid;
  v_honda_id uuid;
  v_hyundai_id uuid;
  v_kia_id uuid;
  v_ford_id uuid;
  v_chevrolet_id uuid;
  v_fiat_id uuid;
  v_opel_id uuid;
  v_seat_id uuid;
  v_skoda_id uuid;
  v_mazda_id uuid;
  v_mitsubishi_id uuid;
  v_suzuki_id uuid;
  v_chery_id uuid;
  v_geely_id uuid;
  v_mg_id uuid;
  v_jeep_id uuid;
  v_land_rover_id uuid;
  v_vehicles_category_id uuid;
BEGIN
  -- Get category ID
  SELECT id INTO v_vehicles_category_id FROM categories WHERE slug = 'vehicules';
  
  -- Get brand IDs
  SELECT id INTO v_renault_id FROM brands WHERE name = 'Renault' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_peugeot_id FROM brands WHERE name = 'Peugeot' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_citroen_id FROM brands WHERE name = 'Citroën' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_dacia_id FROM brands WHERE name = 'Dacia' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_mercedes_id FROM brands WHERE name = 'Mercedes-Benz' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_bmw_id FROM brands WHERE name = 'BMW' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_audi_id FROM brands WHERE name = 'Audi' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_vw_id FROM brands WHERE name = 'Volkswagen' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_toyota_id FROM brands WHERE name = 'Toyota' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_nissan_id FROM brands WHERE name = 'Nissan' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_honda_id FROM brands WHERE name = 'Honda' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_hyundai_id FROM brands WHERE name = 'Hyundai' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_kia_id FROM brands WHERE name = 'Kia' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_ford_id FROM brands WHERE name = 'Ford' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_chevrolet_id FROM brands WHERE name = 'Chevrolet' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_fiat_id FROM brands WHERE name = 'Fiat' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_opel_id FROM brands WHERE name = 'Opel' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_seat_id FROM brands WHERE name = 'Seat' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_skoda_id FROM brands WHERE name = 'Skoda' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_mazda_id FROM brands WHERE name = 'Mazda' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_mitsubishi_id FROM brands WHERE name = 'Mitsubishi' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_suzuki_id FROM brands WHERE name = 'Suzuki' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_chery_id FROM brands WHERE name = 'Chery' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_geely_id FROM brands WHERE name = 'Geely' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_mg_id FROM brands WHERE name = 'MG' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_jeep_id FROM brands WHERE name = 'Jeep' AND category_id = v_vehicles_category_id;
  SELECT id INTO v_land_rover_id FROM brands WHERE name = 'Land Rover' AND category_id = v_vehicles_category_id;

  -- Renault models
  IF v_renault_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Clio', v_renault_id),
      ('Clio 2', v_renault_id),
      ('Clio 3', v_renault_id),
      ('Clio 4', v_renault_id),
      ('Clio 5', v_renault_id),
      ('Megane', v_renault_id),
      ('Megane 2', v_renault_id),
      ('Megane 3', v_renault_id),
      ('Megane 4', v_renault_id),
      ('Symbol', v_renault_id),
      ('Logan', v_renault_id),
      ('Sandero', v_renault_id),
      ('Duster', v_renault_id),
      ('Captur', v_renault_id),
      ('Kadjar', v_renault_id),
      ('Koleos', v_renault_id),
      ('Kangoo', v_renault_id),
      ('Trafic', v_renault_id),
      ('Master', v_renault_id),
      ('Fluence', v_renault_id),
      ('Latitude', v_renault_id),
      ('Laguna', v_renault_id),
      ('Scenic', v_renault_id),
      ('Espace', v_renault_id),
      ('Twingo', v_renault_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Peugeot models
  IF v_peugeot_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('208', v_peugeot_id),
      ('2008', v_peugeot_id),
      ('301', v_peugeot_id),
      ('308', v_peugeot_id),
      ('3008', v_peugeot_id),
      ('408', v_peugeot_id),
      ('508', v_peugeot_id),
      ('5008', v_peugeot_id),
      ('Partner', v_peugeot_id),
      ('Expert', v_peugeot_id),
      ('Boxer', v_peugeot_id),
      ('Rifter', v_peugeot_id),
      ('Traveller', v_peugeot_id),
      ('206', v_peugeot_id),
      ('207', v_peugeot_id),
      ('307', v_peugeot_id),
      ('407', v_peugeot_id),
      ('607', v_peugeot_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Citroën models
  IF v_citroen_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('C3', v_citroen_id),
      ('C3 Aircross', v_citroen_id),
      ('C4', v_citroen_id),
      ('C4 Cactus', v_citroen_id),
      ('C5', v_citroen_id),
      ('C5 Aircross', v_citroen_id),
      ('Berlingo', v_citroen_id),
      ('Jumpy', v_citroen_id),
      ('Jumper', v_citroen_id),
      ('Spacetourer', v_citroen_id),
      ('C-Elysée', v_citroen_id),
      ('Xsara', v_citroen_id),
      ('Picasso', v_citroen_id),
      ('C2', v_citroen_id),
      ('C4 Picasso', v_citroen_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Dacia models
  IF v_dacia_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Logan', v_dacia_id),
      ('Sandero', v_dacia_id),
      ('Sandero Stepway', v_dacia_id),
      ('Duster', v_dacia_id),
      ('Lodgy', v_dacia_id),
      ('Dokker', v_dacia_id),
      ('Spring', v_dacia_id),
      ('Jogger', v_dacia_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Mercedes-Benz models
  IF v_mercedes_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Classe A', v_mercedes_id),
      ('Classe B', v_mercedes_id),
      ('Classe C', v_mercedes_id),
      ('Classe E', v_mercedes_id),
      ('Classe S', v_mercedes_id),
      ('CLA', v_mercedes_id),
      ('CLS', v_mercedes_id),
      ('GLA', v_mercedes_id),
      ('GLB', v_mercedes_id),
      ('GLC', v_mercedes_id),
      ('GLE', v_mercedes_id),
      ('GLS', v_mercedes_id),
      ('Classe G', v_mercedes_id),
      ('Vito', v_mercedes_id),
      ('Sprinter', v_mercedes_id),
      ('Viano', v_mercedes_id),
      ('Citan', v_mercedes_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- BMW models
  IF v_bmw_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Série 1', v_bmw_id),
      ('Série 2', v_bmw_id),
      ('Série 3', v_bmw_id),
      ('Série 4', v_bmw_id),
      ('Série 5', v_bmw_id),
      ('Série 6', v_bmw_id),
      ('Série 7', v_bmw_id),
      ('X1', v_bmw_id),
      ('X2', v_bmw_id),
      ('X3', v_bmw_id),
      ('X4', v_bmw_id),
      ('X5', v_bmw_id),
      ('X6', v_bmw_id),
      ('X7', v_bmw_id),
      ('Z4', v_bmw_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Audi models
  IF v_audi_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('A1', v_audi_id),
      ('A3', v_audi_id),
      ('A4', v_audi_id),
      ('A5', v_audi_id),
      ('A6', v_audi_id),
      ('A7', v_audi_id),
      ('A8', v_audi_id),
      ('Q2', v_audi_id),
      ('Q3', v_audi_id),
      ('Q5', v_audi_id),
      ('Q7', v_audi_id),
      ('Q8', v_audi_id),
      ('TT', v_audi_id),
      ('R8', v_audi_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Volkswagen models
  IF v_vw_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Polo', v_vw_id),
      ('Golf', v_vw_id),
      ('Passat', v_vw_id),
      ('Tiguan', v_vw_id),
      ('Touareg', v_vw_id),
      ('Touran', v_vw_id),
      ('Caddy', v_vw_id),
      ('Transporter', v_vw_id),
      ('Crafter', v_vw_id),
      ('Arteon', v_vw_id),
      ('T-Roc', v_vw_id),
      ('T-Cross', v_vw_id),
      ('Jetta', v_vw_id),
      ('Beetle', v_vw_id),
      ('Amarok', v_vw_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Toyota models
  IF v_toyota_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Yaris', v_toyota_id),
      ('Corolla', v_toyota_id),
      ('Camry', v_toyota_id),
      ('Prius', v_toyota_id),
      ('Hilux', v_toyota_id),
      ('Land Cruiser', v_toyota_id),
      ('Land Cruiser Prado', v_toyota_id),
      ('RAV4', v_toyota_id),
      ('C-HR', v_toyota_id),
      ('Fortuner', v_toyota_id),
      ('Avensis', v_toyota_id),
      ('Auris', v_toyota_id),
      ('Verso', v_toyota_id),
      ('Proace', v_toyota_id),
      ('4Runner', v_toyota_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Nissan models
  IF v_nissan_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Micra', v_nissan_id),
      ('Sunny', v_nissan_id),
      ('Sentra', v_nissan_id),
      ('Altima', v_nissan_id),
      ('Maxima', v_nissan_id),
      ('Juke', v_nissan_id),
      ('Qashqai', v_nissan_id),
      ('X-Trail', v_nissan_id),
      ('Patrol', v_nissan_id),
      ('Pathfinder', v_nissan_id),
      ('Navara', v_nissan_id),
      ('Murano', v_nissan_id),
      ('370Z', v_nissan_id),
      ('GT-R', v_nissan_id),
      ('NV200', v_nissan_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Honda models
  IF v_honda_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('City', v_honda_id),
      ('Civic', v_honda_id),
      ('Accord', v_honda_id),
      ('Jazz', v_honda_id),
      ('CR-V', v_honda_id),
      ('HR-V', v_honda_id),
      ('Pilot', v_honda_id),
      ('Odyssey', v_honda_id),
      ('Insight', v_honda_id),
      ('Fit', v_honda_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Hyundai models
  IF v_hyundai_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('i10', v_hyundai_id),
      ('i20', v_hyundai_id),
      ('i30', v_hyundai_id),
      ('i40', v_hyundai_id),
      ('Accent', v_hyundai_id),
      ('Elantra', v_hyundai_id),
      ('Sonata', v_hyundai_id),
      ('Tucson', v_hyundai_id),
      ('Santa Fe', v_hyundai_id),
      ('Kona', v_hyundai_id),
      ('Creta', v_hyundai_id),
      ('Venue', v_hyundai_id),
      ('Palisade', v_hyundai_id),
      ('H1', v_hyundai_id),
      ('Ioniq', v_hyundai_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Kia models
  IF v_kia_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Picanto', v_kia_id),
      ('Rio', v_kia_id),
      ('Cerato', v_kia_id),
      ('Optima', v_kia_id),
      ('Stinger', v_kia_id),
      ('Soul', v_kia_id),
      ('Seltos', v_kia_id),
      ('Sportage', v_kia_id),
      ('Sorento', v_kia_id),
      ('Carnival', v_kia_id),
      ('Stonic', v_kia_id),
      ('Niro', v_kia_id),
      ('EV6', v_kia_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Ford models
  IF v_ford_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Fiesta', v_ford_id),
      ('Focus', v_ford_id),
      ('Fusion', v_ford_id),
      ('Mondeo', v_ford_id),
      ('Mustang', v_ford_id),
      ('EcoSport', v_ford_id),
      ('Kuga', v_ford_id),
      ('Edge', v_ford_id),
      ('Explorer', v_ford_id),
      ('Ranger', v_ford_id),
      ('F-150', v_ford_id),
      ('Transit', v_ford_id),
      ('Transit Custom', v_ford_id),
      ('Tourneo', v_ford_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Chevrolet models
  IF v_chevrolet_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Spark', v_chevrolet_id),
      ('Aveo', v_chevrolet_id),
      ('Cruze', v_chevrolet_id),
      ('Malibu', v_chevrolet_id),
      ('Impala', v_chevrolet_id),
      ('Camaro', v_chevrolet_id),
      ('Corvette', v_chevrolet_id),
      ('Trax', v_chevrolet_id),
      ('Equinox', v_chevrolet_id),
      ('Tahoe', v_chevrolet_id),
      ('Suburban', v_chevrolet_id),
      ('Silverado', v_chevrolet_id),
      ('Colorado', v_chevrolet_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Fiat models
  IF v_fiat_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Panda', v_fiat_id),
      ('Punto', v_fiat_id),
      ('Tipo', v_fiat_id),
      ('500', v_fiat_id),
      ('500X', v_fiat_id),
      ('500L', v_fiat_id),
      ('Doblo', v_fiat_id),
      ('Ducato', v_fiat_id),
      ('Fiorino', v_fiat_id),
      ('Uno', v_fiat_id),
      ('Linea', v_fiat_id),
      ('Bravo', v_fiat_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Opel models
  IF v_opel_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Corsa', v_opel_id),
      ('Astra', v_opel_id),
      ('Insignia', v_opel_id),
      ('Mokka', v_opel_id),
      ('Crossland', v_opel_id),
      ('Grandland', v_opel_id),
      ('Combo', v_opel_id),
      ('Vivaro', v_opel_id),
      ('Movano', v_opel_id),
      ('Zafira', v_opel_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Seat models
  IF v_seat_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Ibiza', v_seat_id),
      ('Leon', v_seat_id),
      ('Arona', v_seat_id),
      ('Ateca', v_seat_id),
      ('Tarraco', v_seat_id),
      ('Alhambra', v_seat_id),
      ('Toledo', v_seat_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Skoda models
  IF v_skoda_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Fabia', v_skoda_id),
      ('Scala', v_skoda_id),
      ('Octavia', v_skoda_id),
      ('Superb', v_skoda_id),
      ('Kamiq', v_skoda_id),
      ('Karoq', v_skoda_id),
      ('Kodiaq', v_skoda_id),
      ('Rapid', v_skoda_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Mazda models
  IF v_mazda_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('2', v_mazda_id),
      ('3', v_mazda_id),
      ('6', v_mazda_id),
      ('CX-3', v_mazda_id),
      ('CX-5', v_mazda_id),
      ('CX-9', v_mazda_id),
      ('MX-5', v_mazda_id),
      ('BT-50', v_mazda_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Mitsubishi models
  IF v_mitsubishi_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Mirage', v_mitsubishi_id),
      ('Lancer', v_mitsubishi_id),
      ('ASX', v_mitsubishi_id),
      ('Eclipse Cross', v_mitsubishi_id),
      ('Outlander', v_mitsubishi_id),
      ('Pajero', v_mitsubishi_id),
      ('L200', v_mitsubishi_id),
      ('Attrage', v_mitsubishi_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Suzuki models
  IF v_suzuki_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Alto', v_suzuki_id),
      ('Celerio', v_suzuki_id),
      ('Swift', v_suzuki_id),
      ('Baleno', v_suzuki_id),
      ('Dzire', v_suzuki_id),
      ('Vitara', v_suzuki_id),
      ('S-Cross', v_suzuki_id),
      ('Jimny', v_suzuki_id),
      ('Ertiga', v_suzuki_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Chery models
  IF v_chery_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('QQ', v_chery_id),
      ('Arrizo 5', v_chery_id),
      ('Arrizo 6', v_chery_id),
      ('Tiggo 2', v_chery_id),
      ('Tiggo 3', v_chery_id),
      ('Tiggo 4', v_chery_id),
      ('Tiggo 5', v_chery_id),
      ('Tiggo 7', v_chery_id),
      ('Tiggo 8', v_chery_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Geely models
  IF v_geely_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Emgrand', v_geely_id),
      ('GC6', v_geely_id),
      ('Coolray', v_geely_id),
      ('Azkarra', v_geely_id),
      ('Okavango', v_geely_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- MG models
  IF v_mg_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('MG3', v_mg_id),
      ('MG5', v_mg_id),
      ('MG6', v_mg_id),
      ('ZS', v_mg_id),
      ('HS', v_mg_id),
      ('RX5', v_mg_id),
      ('Marvel R', v_mg_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Jeep models
  IF v_jeep_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Renegade', v_jeep_id),
      ('Compass', v_jeep_id),
      ('Cherokee', v_jeep_id),
      ('Grand Cherokee', v_jeep_id),
      ('Wrangler', v_jeep_id),
      ('Gladiator', v_jeep_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

  -- Land Rover models
  IF v_land_rover_id IS NOT NULL THEN
    INSERT INTO models (name, brand_id) VALUES
      ('Defender', v_land_rover_id),
      ('Discovery', v_land_rover_id),
      ('Discovery Sport', v_land_rover_id),
      ('Range Rover', v_land_rover_id),
      ('Range Rover Sport', v_land_rover_id),
      ('Range Rover Evoque', v_land_rover_id),
      ('Range Rover Velar', v_land_rover_id)
    ON CONFLICT (name, brand_id) DO NOTHING;
  END IF;

END $$;
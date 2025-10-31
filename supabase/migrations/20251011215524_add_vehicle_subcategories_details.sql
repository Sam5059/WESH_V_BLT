/*
  # Add More Vehicle Subcategories
  
  1. Current Subcategories (5 total)
    - Voitures (Cars)
    - Motos (Motorcycles)
    - Camions (Trucks)
    - Pièces et accessoires (Parts and Accessories)
    - Bateaux (Boats)
    
  2. New Subcategories Added
    Under Voitures:
      - Berlines
      - SUV & 4x4
      - Citadines
      - Break & Familiales
      - Coupés & Cabriolets
      - Utilitaires légers
      
    Under Motos:
      - Scooters
      - Motos sportives
      - Motos routières
      - Motos cross/enduro
      - Motos custom
      - Quads & ATVs
      
    Under Camions:
      - Camions légers
      - Camions moyens
      - Camions lourds
      - Semi-remorques
      - Bennes
      
    Under Pièces et accessoires:
      - Pneus & Jantes
      - Pièces moteur
      - Carrosserie
      - Électronique & GPS
      - Audio & Multimédia
      - Accessoires intérieurs
      - Accessoires extérieurs
      - Huiles & Fluides
      
    Under Bateaux:
      - Bateaux à moteur
      - Voiliers
      - Jet-ski
      - Bateaux de pêche
      
    New Main Categories:
      - Vélos & Trottinettes
      - Caravaning & Camping-car
      - Engins de chantier
      
  3. Important Notes
    - All subcategories have Arabic translations
    - Proper slugs for SEO
    - Logical order_position for display
*/

DO $$
DECLARE
  v_vehicles_id uuid;
  v_voitures_id uuid;
  v_motos_id uuid;
  v_camions_id uuid;
  v_pieces_id uuid;
  v_bateaux_id uuid;
  v_velos_id uuid;
  v_caravaning_id uuid;
  v_engins_id uuid;
BEGIN
  -- Get parent category IDs
  SELECT id INTO v_vehicles_id FROM categories WHERE slug = 'vehicules';
  SELECT id INTO v_voitures_id FROM categories WHERE slug = 'voitures';
  SELECT id INTO v_motos_id FROM categories WHERE slug = 'motos';
  SELECT id INTO v_camions_id FROM categories WHERE slug = 'camions';
  SELECT id INTO v_pieces_id FROM categories WHERE slug = 'pieces-accessoires';
  SELECT id INTO v_bateaux_id FROM categories WHERE slug = 'bateaux';

  -- Add new main vehicle subcategories
  INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
    ('Vélos & Trottinettes', 'دراجات وسكوترات', 'velos-trottinettes', v_vehicles_id, 6),
    ('Caravaning & Camping-car', 'كرفانات ومنازل متنقلة', 'caravaning', v_vehicles_id, 7),
    ('Engins de chantier', 'معدات البناء', 'engins-chantier', v_vehicles_id, 8)
  ON CONFLICT (slug) DO NOTHING;

  -- Get newly created category IDs
  SELECT id INTO v_velos_id FROM categories WHERE slug = 'velos-trottinettes';
  SELECT id INTO v_caravaning_id FROM categories WHERE slug = 'caravaning';
  SELECT id INTO v_engins_id FROM categories WHERE slug = 'engins-chantier';

  -- Add Voitures subcategories
  IF v_voitures_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
      ('Berlines', 'سيارات سيدان', 'berlines', v_voitures_id, 1),
      ('SUV & 4x4', 'سيارات دفع رباعي', 'suv-4x4', v_voitures_id, 2),
      ('Citadines', 'سيارات صغيرة', 'citadines', v_voitures_id, 3),
      ('Break & Familiales', 'سيارات عائلية', 'break-familiales', v_voitures_id, 4),
      ('Coupés & Cabriolets', 'سيارات رياضية مكشوفة', 'coupes-cabriolets', v_voitures_id, 5),
      ('Utilitaires légers', 'مركبات نفعية خفيفة', 'utilitaires-legers', v_voitures_id, 6)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Add Motos subcategories
  IF v_motos_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
      ('Scooters', 'سكوترات', 'scooters', v_motos_id, 1),
      ('Motos sportives', 'دراجات رياضية', 'motos-sportives', v_motos_id, 2),
      ('Motos routières', 'دراجات طرقية', 'motos-routieres', v_motos_id, 3),
      ('Motos cross/enduro', 'دراجات كروس/إندورو', 'motos-cross-enduro', v_motos_id, 4),
      ('Motos custom', 'دراجات مخصصة', 'motos-custom', v_motos_id, 5),
      ('Quads & ATVs', 'دراجات رباعية', 'quads-atvs', v_motos_id, 6)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Add Camions subcategories
  IF v_camions_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
      ('Camions légers', 'شاحنات خفيفة', 'camions-legers', v_camions_id, 1),
      ('Camions moyens', 'شاحنات متوسطة', 'camions-moyens', v_camions_id, 2),
      ('Camions lourds', 'شاحنات ثقيلة', 'camions-lourds', v_camions_id, 3),
      ('Semi-remorques', 'شاحنات نصف مقطورة', 'semi-remorques', v_camions_id, 4),
      ('Bennes', 'شاحنات قلابة', 'bennes', v_camions_id, 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Add Pièces et accessoires subcategories
  IF v_pieces_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
      ('Pneus & Jantes', 'إطارات وجنوط', 'pneus-jantes', v_pieces_id, 1),
      ('Pièces moteur', 'قطع المحرك', 'pieces-moteur', v_pieces_id, 2),
      ('Carrosserie', 'هيكل السيارة', 'carrosserie', v_pieces_id, 3),
      ('Électronique & GPS', 'إلكترونيات وجي بي إس', 'electronique-gps', v_pieces_id, 4),
      ('Audio & Multimédia', 'صوتيات ومولتيميديا', 'audio-multimedia', v_pieces_id, 5),
      ('Accessoires intérieurs', 'إكسسوارات داخلية', 'accessoires-interieurs', v_pieces_id, 6),
      ('Accessoires extérieurs', 'إكسسوارات خارجية', 'accessoires-exterieurs', v_pieces_id, 7),
      ('Huiles & Fluides', 'زيوت وسوائل', 'huiles-fluides', v_pieces_id, 8)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Add Bateaux subcategories
  IF v_bateaux_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
      ('Bateaux à moteur', 'قوارب بمحرك', 'bateaux-moteur', v_bateaux_id, 1),
      ('Voiliers', 'قوارب شراعية', 'voiliers', v_bateaux_id, 2),
      ('Jet-ski', 'جت سكي', 'jet-ski', v_bateaux_id, 3),
      ('Bateaux de pêche', 'قوارب صيد', 'bateaux-peche', v_bateaux_id, 4)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Add Vélos & Trottinettes subcategories
  IF v_velos_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
      ('Vélos de route', 'دراجات طريق', 'velos-route', v_velos_id, 1),
      ('VTT', 'دراجات جبلية', 'vtt', v_velos_id, 2),
      ('Vélos électriques', 'دراجات كهربائية', 'velos-electriques', v_velos_id, 3),
      ('Trottinettes électriques', 'سكوترات كهربائية', 'trottinettes-electriques', v_velos_id, 4),
      ('Accessoires vélos', 'إكسسوارات الدراجات', 'accessoires-velos', v_velos_id, 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Add Caravaning subcategories
  IF v_caravaning_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
      ('Camping-cars', 'منازل متنقلة', 'camping-cars', v_caravaning_id, 1),
      ('Caravanes', 'كرفانات', 'caravanes', v_caravaning_id, 2),
      ('Remorques', 'مقطورات', 'remorques', v_caravaning_id, 3),
      ('Accessoires caravaning', 'إكسسوارات كرفانات', 'accessoires-caravaning', v_caravaning_id, 4)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Add Engins de chantier subcategories
  IF v_engins_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
      ('Pelleteuses', 'حفارات', 'pelleteuses', v_engins_id, 1),
      ('Bulldozers', 'جرافات', 'bulldozers', v_engins_id, 2),
      ('Chariots élévateurs', 'رافعات شوكية', 'chariots-elevateurs', v_engins_id, 3),
      ('Grues', 'رافعات', 'grues', v_engins_id, 4),
      ('Compacteurs', 'ضواغط', 'compacteurs', v_engins_id, 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

END $$;
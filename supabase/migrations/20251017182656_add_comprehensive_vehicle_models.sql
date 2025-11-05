/*
  # Ajout de modèles complets pour toutes les marques de véhicules

  1. Modèles ajoutés
    - Hyundai : i10, i20, i30, Accent, Elantra, Tucson, Santa Fe
    - Kia : Picanto, Rio, Ceed, Sportage, Sorento
    - Citroën : C3, C4, C5, Berlingo, Jumper
    - Volkswagen : Modèles déjà présents + T-Roc, Arteon
    - Fiat : Panda, 500, Tipo, Doblo
    - Nissan : Micra, Sunny, Qashqai, X-Trail
    - Ford : Fiesta, Focus, Kuga, Ranger
    - Dacia : Sandero, Logan, Duster (déjà dans Renault)
    - Suzuki : Swift, Vitara, Jimny
    - Mitsubishi : L200, Pajero, ASX
    - Mercedes-Benz : Classe A, Classe C, Classe E, GLA, GLC
    - BMW : Série 1, Série 3, Série 5, X1, X3
    - Audi : A3, A4, A6, Q3, Q5
    - Opel : Corsa, Astra, Insignia, Crossland

  2. Notes
    - Tous les modèles sont populaires sur le marché algérien
    - Les noms sont en français pour cohérence
*/

DO $$
DECLARE
  v_hyundai_id uuid;
  v_kia_id uuid;
  v_citroen_id uuid;
  v_vw_id uuid;
  v_fiat_id uuid;
  v_nissan_id uuid;
  v_ford_id uuid;
  v_suzuki_id uuid;
  v_mitsubishi_id uuid;
  v_mercedes_id uuid;
  v_bmw_id uuid;
  v_audi_id uuid;
  v_opel_id uuid;
  v_dacia_id uuid;
  v_honda_id uuid;
  v_mazda_id uuid;
  v_seat_id uuid;
  v_skoda_id uuid;
  v_chevrolet_id uuid;
BEGIN
  -- Get brand IDs
  SELECT id INTO v_hyundai_id FROM brands WHERE name = 'Hyundai' AND category_type = 'vehicles';
  SELECT id INTO v_kia_id FROM brands WHERE name = 'Kia' AND category_type = 'vehicles';
  SELECT id INTO v_citroen_id FROM brands WHERE name = 'Citroën' AND category_type = 'vehicles';
  SELECT id INTO v_vw_id FROM brands WHERE name = 'Volkswagen' AND category_type = 'vehicles';
  SELECT id INTO v_fiat_id FROM brands WHERE name = 'Fiat' AND category_type = 'vehicles';
  SELECT id INTO v_nissan_id FROM brands WHERE name = 'Nissan' AND category_type = 'vehicles';
  SELECT id INTO v_ford_id FROM brands WHERE name = 'Ford' AND category_type = 'vehicles';
  SELECT id INTO v_suzuki_id FROM brands WHERE name = 'Suzuki' AND category_type = 'vehicles';
  SELECT id INTO v_mitsubishi_id FROM brands WHERE name = 'Mitsubishi' AND category_type = 'vehicles';
  SELECT id INTO v_mercedes_id FROM brands WHERE name = 'Mercedes-Benz' AND category_type = 'vehicles';
  SELECT id INTO v_bmw_id FROM brands WHERE name = 'BMW' AND category_type = 'vehicles';
  SELECT id INTO v_audi_id FROM brands WHERE name = 'Audi' AND category_type = 'vehicles';
  SELECT id INTO v_opel_id FROM brands WHERE name = 'Opel' AND category_type = 'vehicles';
  SELECT id INTO v_dacia_id FROM brands WHERE name = 'Dacia' AND category_type = 'vehicles';
  SELECT id INTO v_honda_id FROM brands WHERE name = 'Honda' AND category_type = 'vehicles';
  SELECT id INTO v_mazda_id FROM brands WHERE name = 'Mazda' AND category_type = 'vehicles';
  SELECT id INTO v_seat_id FROM brands WHERE name = 'Seat' AND category_type = 'vehicles';
  SELECT id INTO v_skoda_id FROM brands WHERE name = 'Skoda' AND category_type = 'vehicles';
  SELECT id INTO v_chevrolet_id FROM brands WHERE name = 'Chevrolet' AND category_type = 'vehicles';

  -- Hyundai
  IF v_hyundai_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_hyundai_id, 'i10'),
      (v_hyundai_id, 'i20'),
      (v_hyundai_id, 'i30'),
      (v_hyundai_id, 'Accent'),
      (v_hyundai_id, 'Elantra'),
      (v_hyundai_id, 'Tucson'),
      (v_hyundai_id, 'Santa Fe'),
      (v_hyundai_id, 'Kona')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Kia
  IF v_kia_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_kia_id, 'Picanto'),
      (v_kia_id, 'Rio'),
      (v_kia_id, 'Ceed'),
      (v_kia_id, 'Cerato'),
      (v_kia_id, 'Sportage'),
      (v_kia_id, 'Sorento'),
      (v_kia_id, 'Seltos')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Citroën
  IF v_citroen_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_citroen_id, 'C3'),
      (v_citroen_id, 'C4'),
      (v_citroen_id, 'C5'),
      (v_citroen_id, 'C-Elysée'),
      (v_citroen_id, 'Berlingo'),
      (v_citroen_id, 'Jumper'),
      (v_citroen_id, 'C3 Aircross')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Volkswagen (ajouts)
  IF v_vw_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_vw_id, 'T-Roc'),
      (v_vw_id, 'Arteon'),
      (v_vw_id, 'Touareg')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Fiat
  IF v_fiat_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_fiat_id, 'Panda'),
      (v_fiat_id, '500'),
      (v_fiat_id, 'Tipo'),
      (v_fiat_id, 'Doblo'),
      (v_fiat_id, 'Ducato'),
      (v_fiat_id, '500X')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Nissan
  IF v_nissan_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_nissan_id, 'Micra'),
      (v_nissan_id, 'Sunny'),
      (v_nissan_id, 'Note'),
      (v_nissan_id, 'Qashqai'),
      (v_nissan_id, 'X-Trail'),
      (v_nissan_id, 'Navara'),
      (v_nissan_id, 'Patrol')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Ford
  IF v_ford_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_ford_id, 'Fiesta'),
      (v_ford_id, 'Focus'),
      (v_ford_id, 'Mondeo'),
      (v_ford_id, 'Kuga'),
      (v_ford_id, 'Ranger'),
      (v_ford_id, 'Transit')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Suzuki
  IF v_suzuki_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_suzuki_id, 'Swift'),
      (v_suzuki_id, 'Vitara'),
      (v_suzuki_id, 'Jimny'),
      (v_suzuki_id, 'Celerio'),
      (v_suzuki_id, 'S-Cross')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Mitsubishi
  IF v_mitsubishi_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_mitsubishi_id, 'L200'),
      (v_mitsubishi_id, 'Pajero'),
      (v_mitsubishi_id, 'ASX'),
      (v_mitsubishi_id, 'Outlander')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Mercedes-Benz
  IF v_mercedes_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_mercedes_id, 'Classe A'),
      (v_mercedes_id, 'Classe C'),
      (v_mercedes_id, 'Classe E'),
      (v_mercedes_id, 'Classe S'),
      (v_mercedes_id, 'GLA'),
      (v_mercedes_id, 'GLC'),
      (v_mercedes_id, 'GLE'),
      (v_mercedes_id, 'Sprinter')
    ON CONFLICT DO NOTHING;
  END IF;

  -- BMW
  IF v_bmw_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_bmw_id, 'Série 1'),
      (v_bmw_id, 'Série 2'),
      (v_bmw_id, 'Série 3'),
      (v_bmw_id, 'Série 5'),
      (v_bmw_id, 'Série 7'),
      (v_bmw_id, 'X1'),
      (v_bmw_id, 'X3'),
      (v_bmw_id, 'X5')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Audi
  IF v_audi_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_audi_id, 'A1'),
      (v_audi_id, 'A3'),
      (v_audi_id, 'A4'),
      (v_audi_id, 'A6'),
      (v_audi_id, 'Q2'),
      (v_audi_id, 'Q3'),
      (v_audi_id, 'Q5'),
      (v_audi_id, 'Q7')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Opel
  IF v_opel_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_opel_id, 'Corsa'),
      (v_opel_id, 'Astra'),
      (v_opel_id, 'Insignia'),
      (v_opel_id, 'Crossland'),
      (v_opel_id, 'Grandland'),
      (v_opel_id, 'Combo')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Dacia
  IF v_dacia_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_dacia_id, 'Sandero'),
      (v_dacia_id, 'Logan'),
      (v_dacia_id, 'Duster'),
      (v_dacia_id, 'Lodgy'),
      (v_dacia_id, 'Dokker')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Honda
  IF v_honda_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_honda_id, 'Civic'),
      (v_honda_id, 'Accord'),
      (v_honda_id, 'CR-V'),
      (v_honda_id, 'HR-V'),
      (v_honda_id, 'Jazz')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Mazda
  IF v_mazda_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_mazda_id, 'Mazda2'),
      (v_mazda_id, 'Mazda3'),
      (v_mazda_id, 'Mazda6'),
      (v_mazda_id, 'CX-3'),
      (v_mazda_id, 'CX-5')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Seat
  IF v_seat_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_seat_id, 'Ibiza'),
      (v_seat_id, 'Leon'),
      (v_seat_id, 'Arona'),
      (v_seat_id, 'Ateca'),
      (v_seat_id, 'Tarraco')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Skoda
  IF v_skoda_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_skoda_id, 'Fabia'),
      (v_skoda_id, 'Scala'),
      (v_skoda_id, 'Octavia'),
      (v_skoda_id, 'Superb'),
      (v_skoda_id, 'Kodiaq'),
      (v_skoda_id, 'Karoq')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Chevrolet
  IF v_chevrolet_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_chevrolet_id, 'Spark'),
      (v_chevrolet_id, 'Aveo'),
      (v_chevrolet_id, 'Cruze'),
      (v_chevrolet_id, 'Captiva'),
      (v_chevrolet_id, 'Colorado')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;
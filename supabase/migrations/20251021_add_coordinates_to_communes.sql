/*
  # Ajout des coordonnées géographiques aux communes

  1. Modifications
    - Ajout de la colonne `latitude` (numeric) aux communes
    - Ajout de la colonne `longitude` (numeric) aux communes
    - Ajout d'index géographique pour optimiser les recherches
    - Population des coordonnées GPS pour les principales communes d'Algérie

  2. Fonction de calcul de distance
    - Création d'une fonction `calculate_distance_km` qui calcule la distance entre deux points GPS
    - Utilise la formule de Haversine pour la précision

  3. Sécurité
    - Les coordonnées sont publiques (lecture seule)
    - Pas d'impact sur les politiques RLS existantes
*/

-- Ajouter les colonnes de coordonnées
ALTER TABLE communes
  ADD COLUMN IF NOT EXISTS latitude numeric(10, 7),
  ADD COLUMN IF NOT EXISTS longitude numeric(10, 7);

-- Créer un index pour les recherches géographiques
CREATE INDEX IF NOT EXISTS communes_coordinates_idx ON communes(latitude, longitude);

-- Fonction pour calculer la distance en kilomètres entre deux points GPS
-- Utilise la formule de Haversine
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  earth_radius numeric := 6371; -- Rayon de la Terre en km
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
BEGIN
  -- Si une des coordonnées est NULL, retourner NULL
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  -- Convertir les degrés en radians
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);

  -- Formule de Haversine
  a := sin(dlat/2) * sin(dlat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));

  -- Distance en kilomètres
  RETURN earth_radius * c;
END;
$$;

-- Population des coordonnées GPS pour les principales communes d'Algérie
-- Wilaya 16 - ALGER
UPDATE communes SET latitude = 36.7538, longitude = 3.0588 WHERE name = 'Alger Centre' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.7840, longitude = 3.0470 WHERE name = 'Bab El Oued' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.7456, longitude = 3.0293 WHERE name = 'Hydra' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.7644, longitude = 3.0383 WHERE name = 'El Biar' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.7267, longitude = 3.0833 WHERE name = 'Kouba' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.7333, longitude = 3.0500 WHERE name = 'Bir Mourad Raïs' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.7161, longitude = 3.1489 WHERE name = 'Bab Ezzouar' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.6911, longitude = 3.1644 WHERE name = 'Dar El Beïda' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.8008, longitude = 3.1117 WHERE name = 'Rouiba' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.8519, longitude = 3.1778 WHERE name = 'Reghaia' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.7456, longitude = 3.0756 WHERE name = 'Bachdjerrah' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.7247, longitude = 3.1150 WHERE name = 'Hussein Dey' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.7522, longitude = 2.9900 WHERE name = 'Cheraga' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.7833, longitude = 2.9667 WHERE name = 'Dely Ibrahim' AND wilaya_code = 16;
UPDATE communes SET latitude = 36.7000, longitude = 3.2000 WHERE name = 'Baraki' AND wilaya_code = 16;

-- Wilaya 31 - ORAN
UPDATE communes SET latitude = 35.6969, longitude = -0.6331 WHERE name = 'Oran' AND wilaya_code = 31;
UPDATE communes SET latitude = 35.7500, longitude = -0.6167 WHERE name = 'Bir El Djir' AND wilaya_code = 31;
UPDATE communes SET latitude = 35.6500, longitude = -0.5833 WHERE name = 'Es Senia' AND wilaya_code = 31;
UPDATE communes SET latitude = 35.6333, longitude = -0.5000 WHERE name = 'Sidi Chami' AND wilaya_code = 31;
UPDATE communes SET latitude = 35.7000, longitude = -0.7000 WHERE name = 'Aïn El Turck' AND wilaya_code = 31;
UPDATE communes SET latitude = 35.7833, longitude = -0.6333 WHERE name = 'Oued Tlélat' AND wilaya_code = 31;

-- Wilaya 9 - BLIDA
UPDATE communes SET latitude = 36.4803, longitude = 2.8279 WHERE name = 'Blida' AND wilaya_code = 9;
UPDATE communes SET latitude = 36.5167, longitude = 2.9333 WHERE name = 'Boufarik' AND wilaya_code = 9;
UPDATE communes SET latitude = 36.6167, longitude = 2.9500 WHERE name = 'Bougara' AND wilaya_code = 9;
UPDATE communes SET latitude = 36.4500, longitude = 2.7333 WHERE name = 'Mouzaia' AND wilaya_code = 9;
UPDATE communes SET latitude = 36.5500, longitude = 2.7833 WHERE name = 'Bouinan' AND wilaya_code = 9;

-- Wilaya 15 - TIZI OUZOU
UPDATE communes SET latitude = 36.7167, longitude = 4.0500 WHERE name = 'Tizi Ouzou' AND wilaya_code = 15;
UPDATE communes SET latitude = 36.7333, longitude = 4.0833 WHERE name = 'Draa Ben Khedda' AND wilaya_code = 15;
UPDATE communes SET latitude = 36.7833, longitude = 4.2500 WHERE name = 'Azazga' AND wilaya_code = 15;
UPDATE communes SET latitude = 36.7167, longitude = 4.2333 WHERE name = 'Aïn El Hammam' AND wilaya_code = 15;
UPDATE communes SET latitude = 36.8000, longitude = 4.0333 WHERE name = 'Tigzirt' AND wilaya_code = 15;

-- Wilaya 6 - BÉJAÏA
UPDATE communes SET latitude = 36.7525, longitude = 5.0556 WHERE name = 'Béjaïa' AND wilaya_code = 6;
UPDATE communes SET latitude = 36.6833, longitude = 5.0833 WHERE name = 'Akbou' AND wilaya_code = 6;
UPDATE communes SET latitude = 36.7167, longitude = 4.9833 WHERE name = 'El Kseur' AND wilaya_code = 6;
UPDATE communes SET latitude = 36.6333, longitude = 4.8333 WHERE name = 'Amizour' AND wilaya_code = 6;
UPDATE communes SET latitude = 36.7000, longitude = 4.7667 WHERE name = 'Seddouk' AND wilaya_code = 6;

-- Wilaya 25 - CONSTANTINE
UPDATE communes SET latitude = 36.3650, longitude = 6.6147 WHERE name = 'Constantine' AND wilaya_code = 25;
UPDATE communes SET latitude = 36.3333, longitude = 6.6667 WHERE name = 'El Khroub' AND wilaya_code = 25;
UPDATE communes SET latitude = 36.3833, longitude = 6.7167 WHERE name = 'Aïn Smara' AND wilaya_code = 25;
UPDATE communes SET latitude = 36.4167, longitude = 6.5833 WHERE name = 'Hamma Bouziane' AND wilaya_code = 25;
UPDATE communes SET latitude = 36.3500, longitude = 6.5667 WHERE name = 'Didouche Mourad' AND wilaya_code = 25;

-- Wilaya 23 - ANNABA
UPDATE communes SET latitude = 36.9000, longitude = 7.7667 WHERE name = 'Annaba' AND wilaya_code = 23;
UPDATE communes SET latitude = 36.8833, longitude = 7.7167 WHERE name = 'El Bouni' AND wilaya_code = 23;
UPDATE communes SET latitude = 36.8500, longitude = 7.8000 WHERE name = 'El Hadjar' AND wilaya_code = 23;
UPDATE communes SET latitude = 36.9167, longitude = 7.6833 WHERE name = 'Berrahal' AND wilaya_code = 23;

-- Wilaya 19 - SÉTIF
UPDATE communes SET latitude = 36.1900, longitude = 5.4100 WHERE name = 'Sétif' AND wilaya_code = 19;
UPDATE communes SET latitude = 36.1833, longitude = 5.4667 WHERE name = 'El Eulma' AND wilaya_code = 19;
UPDATE communes SET latitude = 36.3500, longitude = 5.3667 WHERE name = 'Aïn Oulmène' AND wilaya_code = 19;
UPDATE communes SET latitude = 36.1167, longitude = 5.5500 WHERE name = 'Bougaa' AND wilaya_code = 19;

-- Wilaya 10 - BOUIRA
UPDATE communes SET latitude = 36.3744, longitude = 3.9000 WHERE name = 'Bouira' AND wilaya_code = 10;
UPDATE communes SET latitude = 36.4667, longitude = 3.8500 WHERE name = 'Lakhdaria' AND wilaya_code = 10;
UPDATE communes SET latitude = 36.3500, longitude = 3.7833 WHERE name = 'Aïn Bessem' AND wilaya_code = 10;

-- Wilaya 44 - AÏN DEFLA
UPDATE communes SET latitude = 36.2639, longitude = 1.9681 WHERE name = 'Aïn Defla' AND wilaya_code = 44;
UPDATE communes SET latitude = 36.3167, longitude = 2.0333 WHERE name = 'Khemis Miliana' AND wilaya_code = 44;
UPDATE communes SET latitude = 36.3500, longitude = 1.7833 WHERE name = 'El Attaf' AND wilaya_code = 44;

-- Wilaya 26 - MÉDÉA
UPDATE communes SET latitude = 36.2667, longitude = 2.7500 WHERE name = 'Médéa' AND wilaya_code = 26;
UPDATE communes SET latitude = 36.3333, longitude = 2.8167 WHERE name = 'Berrouaghia' AND wilaya_code = 26;
UPDATE communes SET latitude = 36.4667, longitude = 2.6833 WHERE name = 'Ksar El Boukhari' AND wilaya_code = 26;

-- Wilaya 2 - CHLEF
UPDATE communes SET latitude = 36.1650, longitude = 1.3350 WHERE name = 'Chlef' AND wilaya_code = 2;
UPDATE communes SET latitude = 36.2667, longitude = 1.3000 WHERE name = 'Oued Fodda' AND wilaya_code = 2;
UPDATE communes SET latitude = 36.1833, longitude = 1.2500 WHERE name = 'Ténès' AND wilaya_code = 2;

-- Wilaya 13 - TLEMCEN
UPDATE communes SET latitude = 34.8781, longitude = -1.3150 WHERE name = 'Tlemcen' AND wilaya_code = 13;
UPDATE communes SET latitude = 34.9333, longitude = -1.3667 WHERE name = 'Mansourah' AND wilaya_code = 13;
UPDATE communes SET latitude = 34.8667, longitude = -1.2500 WHERE name = 'Chetouane' AND wilaya_code = 13;
UPDATE communes SET latitude = 34.9000, longitude = -1.4667 WHERE name = 'Maghnia' AND wilaya_code = 13;

-- Wilaya 14 - TIARET
UPDATE communes SET latitude = 35.3711, longitude = 1.3228 WHERE name = 'Tiaret' AND wilaya_code = 14;
UPDATE communes SET latitude = 35.4167, longitude = 1.3833 WHERE name = 'Sougueur' AND wilaya_code = 14;
UPDATE communes SET latitude = 35.3833, longitude = 1.2500 WHERE name = 'Medroussa' AND wilaya_code = 14;

-- Wilaya 3 - LAGHOUAT
UPDATE communes SET latitude = 33.8069, longitude = 2.8639 WHERE name = 'Laghouat' AND wilaya_code = 3;
UPDATE communes SET latitude = 34.0833, longitude = 2.9167 WHERE name = 'Aflou' AND wilaya_code = 3;

-- Wilaya 30 - OUARGLA
UPDATE communes SET latitude = 31.9489, longitude = 5.3250 WHERE name = 'Ouargla' AND wilaya_code = 30;
UPDATE communes SET latitude = 31.7833, longitude = 5.4167 WHERE name = 'Hassi Messaoud' AND wilaya_code = 30;
UPDATE communes SET latitude = 32.9167, longitude = 6.1167 WHERE name = 'Touggourt' AND wilaya_code = 30;

-- Wilaya 47 - GHARDAÏA
UPDATE communes SET latitude = 32.4917, longitude = 3.6739 WHERE name = 'Ghardaïa' AND wilaya_code = 47;
UPDATE communes SET latitude = 32.8667, longitude = 3.7000 WHERE name = 'Berriane' AND wilaya_code = 47;
UPDATE communes SET latitude = 32.2167, longitude = 3.7833 WHERE name = 'Metlili' AND wilaya_code = 47;

-- Wilaya 1 - ADRAR
UPDATE communes SET latitude = 27.8667, longitude = -0.2833 WHERE name = 'Adrar' AND wilaya_code = 1;
UPDATE communes SET latitude = 28.0333, longitude = -0.5000 WHERE name = 'Reggane' AND wilaya_code = 1;

-- Wilaya 11 - TAMANRASSET
UPDATE communes SET latitude = 22.7850, longitude = 5.5228 WHERE name = 'Tamanrasset' AND wilaya_code = 11;
UPDATE communes SET latitude = 23.6167, longitude = 2.8833 WHERE name = 'In Salah' AND wilaya_code = 11;

-- Commentaire sur les coordonnées
COMMENT ON COLUMN communes.latitude IS 'Latitude GPS de la commune (format décimal)';
COMMENT ON COLUMN communes.longitude IS 'Longitude GPS de la commune (format décimal)';
COMMENT ON FUNCTION calculate_distance_km IS 'Calcule la distance en kilomètres entre deux points GPS en utilisant la formule de Haversine';

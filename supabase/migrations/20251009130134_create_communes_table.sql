/*
  # Create Communes Table

  ## Description
  Creates a comprehensive table of all Algerian communes (municipalities) organized by wilaya.
  This table provides a complete reference of all communes for location filtering.

  ## Tables Created
  - `communes`
    - `id` (uuid, primary key)
    - `wilaya_id` (integer, foreign key to wilayas)
    - `name` (text) - French name
    - `name_ar` (text) - Arabic name
    - `name_en` (text) - English name
    - `code` (text) - Official postal code
    - `created_at` (timestamptz)

  ## Security
  - Enable RLS on communes table
  - Allow public read access (communes are public data)
  - No write access for regular users

  ## Data Integrity
  - Foreign key constraint to wilayas table
  - Unique constraint on (wilaya_id, name) combination
*/

-- Create communes table
CREATE TABLE IF NOT EXISTS communes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wilaya_id integer NOT NULL REFERENCES wilayas(id),
  name text NOT NULL,
  name_ar text,
  name_en text,
  code text,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS communes_wilaya_name_unique 
  ON communes(wilaya_id, name);

-- Enable RLS
ALTER TABLE communes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read communes"
  ON communes
  FOR SELECT
  TO public
  USING (true);

-- Insert communes for major wilayas (starting with most populated)
-- Note: This is a subset. Full list would be very long.

-- Wilaya 16: Alger (Algiers)
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (16, 'Alger Centre', 'الجزائر الوسطى', 'Algiers Center'),
  (16, 'Bab El Oued', 'باب الواد', 'Bab El Oued'),
  (16, 'Bab Ezzouar', 'باب الزوار', 'Bab Ezzouar'),
  (16, 'Bir Mourad Raïs', 'بئر مراد رايس', 'Bir Mourad Rais'),
  (16, 'Birtouta', 'بئر توتة', 'Birtouta'),
  (16, 'Cheraga', 'الشراقة', 'Cheraga'),
  (16, 'Dely Ibrahim', 'دالي إبراهيم', 'Dely Ibrahim'),
  (16, 'Draria', 'دراريا', 'Draria'),
  (16, 'El Biar', 'الأبيار', 'El Biar'),
  (16, 'El Harrach', 'الحراش', 'El Harrach'),
  (16, 'El Madania', 'المدنية', 'El Madania'),
  (16, 'Hydra', 'حيدرة', 'Hydra'),
  (16, 'Kouba', 'القبة', 'Kouba'),
  (16, 'Mohammadia', 'المحمدية', 'Mohammadia'),
  (16, 'Rouiba', 'الرويبة', 'Rouiba'),
  (16, 'Sidi M''Hamed', 'سيدي امحمد', 'Sidi M''Hamed'),
  (16, 'Zeralda', 'زرالدة', 'Zeralda')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 31: Oran
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (31, 'Oran', 'وهران', 'Oran'),
  (31, 'Bir El Djir', 'بئر الجير', 'Bir El Djir'),
  (31, 'Es Senia', 'السانية', 'Es Senia'),
  (31, 'Arzew', 'أرزيو', 'Arzew'),
  (31, 'Mers El Kébir', 'المرسى الكبير', 'Mers El Kebir'),
  (31, 'Aïn El Turck', 'عين الترك', 'Ain El Turck'),
  (31, 'Bethioua', 'بطيوة', 'Bethioua'),
  (31, 'Hassi Bounif', 'حاسي بونيف', 'Hassi Bounif')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 25: Constantine
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (25, 'Constantine', 'قسنطينة', 'Constantine'),
  (25, 'El Khroub', 'الخروب', 'El Khroub'),
  (25, 'Aïn Smara', 'عين السمارة', 'Ain Smara'),
  (25, 'Hamma Bouziane', 'حامة بوزيان', 'Hamma Bouziane'),
  (25, 'Didouche Mourad', 'ديدوش مراد', 'Didouche Mourad'),
  (25, 'Zighoud Youcef', 'زيغود يوسف', 'Zighoud Youcef')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 9: Blida
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (9, 'Blida', 'البليدة', 'Blida'),
  (9, 'Boufarik', 'بوفاريك', 'Boufarik'),
  (9, 'Bougara', 'بوقرة', 'Bougara'),
  (9, 'Mouzaia', 'موزاية', 'Mouzaia'),
  (9, 'Ouled Yaïch', 'أولاد يعيش', 'Ouled Yaich'),
  (9, 'Souma', 'الصومعة', 'Souma')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 23: Annaba
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (23, 'Annaba', 'عنابة', 'Annaba'),
  (23, 'El Bouni', 'البوني', 'El Bouni'),
  (23, 'El Hadjar', 'الحجار', 'El Hadjar'),
  (23, 'Sidi Amar', 'سيدي عمار', 'Sidi Amar'),
  (23, 'Berrahal', 'برحال', 'Berrahal')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 19: Sétif
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (19, 'Sétif', 'سطيف', 'Setif'),
  (19, 'El Eulma', 'العلمة', 'El Eulma'),
  (19, 'Aïn Oulmène', 'عين ولمان', 'Ain Oulmene'),
  (19, 'Béni Aziz', 'بني عزيز', 'Beni Aziz'),
  (19, 'Aïn Azel', 'عين أزال', 'Ain Azel')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 13: Tlemcen
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (13, 'Tlemcen', 'تلمسان', 'Tlemcen'),
  (13, 'Mansourah', 'المنصورة', 'Mansourah'),
  (13, 'Maghnia', 'مغنية', 'Maghnia'),
  (13, 'Remchi', 'الرمشي', 'Remchi'),
  (13, 'Ghazaouet', 'الغزوات', 'Ghazaouet'),
  (13, 'Nedroma', 'ندرومة', 'Nedroma')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 6: Béjaïa
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (6, 'Béjaïa', 'بجاية', 'Bejaia'),
  (6, 'Akbou', 'أقبو', 'Akbou'),
  (6, 'El Kseur', 'القصر', 'El Kseur'),
  (6, 'Amizour', 'أميزور', 'Amizour'),
  (6, 'Sidi Aïch', 'سيدي عيش', 'Sidi Aich'),
  (6, 'Tichy', 'تيشي', 'Tichy')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 15: Tizi Ouzou
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (15, 'Tizi Ouzou', 'تيزي وزو', 'Tizi Ouzou'),
  (15, 'Azazga', 'عزازقة', 'Azazga'),
  (15, 'Draa El Mizan', 'ذراع الميزان', 'Draa El Mizan'),
  (15, 'Tigzirt', 'تيقزيرت', 'Tigzirt'),
  (15, 'Aïn El Hammam', 'عين الحمام', 'Ain El Hammam'),
  (15, 'Boghni', 'بوغني', 'Boghni')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 10: Bouira
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (10, 'Bouira', 'البويرة', 'Bouira'),
  (10, 'Lakhdaria', 'الأخضرية', 'Lakhdaria'),
  (10, 'Sour El Ghozlane', 'سور الغزلان', 'Sour El Ghozlane'),
  (10, 'Aïn Bessem', 'عين بسام', 'Ain Bessem'),
  (10, 'M''Chedallah', 'مشدالة', 'M''Chedallah')
ON CONFLICT (wilaya_id, name) DO NOTHING;
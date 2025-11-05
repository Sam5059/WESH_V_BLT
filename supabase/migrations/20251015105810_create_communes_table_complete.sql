/*
  # Création de la table communes avec toutes les communes d'Algérie
  
  1. Table communes
    - id (serial primary key)
    - name (text) - Nom de la commune
    - name_ar (text) - Nom en arabe
    - wilaya_code (integer) - Code de la wilaya (1-58)
    - wilaya_name (text) - Nom de la wilaya
    - postal_code (text) - Code postal
  
  2. Security
    - RLS enabled
    - Public read access
*/

-- Créer la table communes
CREATE TABLE IF NOT EXISTS communes (
  id serial PRIMARY KEY,
  name text NOT NULL,
  name_ar text,
  wilaya_code integer NOT NULL,
  wilaya_name text NOT NULL,
  postal_code text
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS communes_wilaya_code_idx ON communes(wilaya_code);
CREATE INDEX IF NOT EXISTS communes_wilaya_name_idx ON communes(wilaya_name);
CREATE INDEX IF NOT EXISTS communes_name_idx ON communes(name);

-- Enable RLS
ALTER TABLE communes ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access
CREATE POLICY "Public can view communes"
  ON communes FOR SELECT
  TO public
  USING (true);

-- Insertion des communes principales par wilaya (sample représentatif)
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code) VALUES

-- ALGER (Wilaya 16)
('Alger Centre', 'الجزائر الوسطى', 16, 'Alger', '16000'),
('Bab El Oued', 'باب الواد', 16, 'Alger', '16001'),
('Hydra', 'حيدرة', 16, 'Alger', '16035'),
('El Biar', 'الأبيار', 16, 'Alger', '16030'),
('Kouba', 'القبة', 16, 'Alger', '16050'),
('Bir Mourad Raïs', 'بئر مراد رايس', 16, 'Alger', '16055'),
('Birtouta', 'بئر توتة', 16, 'Alger', '16400'),
('Birkhadem', 'بئر خادم', 16, 'Alger', '16200'),
('El Harrach', 'الحراش', 16, 'Alger', '16100'),
('Baraki', 'براقي', 16, 'Alger', '16270'),
('Dar El Beïda', 'دار البيضاء', 16, 'Alger', '16300'),
('Bab Ezzouar', 'باب الزوار', 16, 'Alger', '16311'),
('Rouiba', 'الرويبة', 16, 'Alger', '16012'),
('Reghaïa', 'الرغاية', 16, 'Alger', '16019'),
('Aïn Taya', 'عين طاية', 16, 'Alger', '16013'),
('Bordj El Kiffan', 'برج الكيفان', 16, 'Alger', '16120'),
('Draria', 'دراريا', 16, 'Alger', '16015'),
('Douéra', 'الدويرة', 16, 'Alger', '16061'),
('Bouzareah', 'بوزريعة', 16, 'Alger', '16040'),
('Cheraga', 'الشراقة', 16, 'Alger', '16004'),
('Dely Ibrahim', 'دالي إبراهيم', 16, 'Alger', '16320'),
('Zéralda', 'زرالدة', 16, 'Alger', '16111'),
('Staoueli', 'سطاوالي', 16, 'Alger', '16113'),
('Sidi Fredj', 'سيدي فرج', 16, 'Alger', '16114'),

-- ORAN (Wilaya 31)
('Oran', 'وهران', 31, 'Oran', '31000'),
('Es Sénia', 'السانية', 31, 'Oran', '31004'),
('Bir El Djir', 'بئر الجير', 31, 'Oran', '31130'),
('Aïn Turk', 'عين الترك', 31, 'Oran', '31012'),
('Mers El Kébir', 'المرسى الكبير', 31, 'Oran', '31007'),
('Arzew', 'أرزيو', 31, 'Oran', '31200'),
('Bethioua', 'بطيوة', 31, 'Oran', '31130'),
('Sidi Chami', 'سيدي الشامي', 31, 'Oran', '31100'),

-- CONSTANTINE (Wilaya 25)
('Constantine', 'قسنطينة', 25, 'Constantine', '25000'),
('El Khroub', 'الخروب', 25, 'Constantine', '25100'),
('Aïn Smara', 'عين السمارة', 25, 'Constantine', '25005'),
('Hamma Bouziane', 'حامة بوزيان', 25, 'Constantine', '25033'),
('Zighoud Youcef', 'زيغود يوسف', 25, 'Constantine', '25330'),
('Didouche Mourad', 'ديدوش مراد', 25, 'Constantine', '25220'),

-- ANNABA (Wilaya 23)
('Annaba', 'عنابة', 23, 'Annaba', '23000'),
('El Bouni', 'البوني', 23, 'Annaba', '23004'),
('Sidi Amar', 'سيدي عمار', 23, 'Annaba', '23027'),
('El Hadjar', 'الحجار', 23, 'Annaba', '23200'),
('Berrahal', 'برحال', 23, 'Annaba', '23006'),

-- BLIDA (Wilaya 09)
('Blida', 'البليدة', 9, 'Blida', '09000'),
('Boufarik', 'بوفاريك', 9, 'Blida', '09100'),
('Bougara', 'بوقرة', 9, 'Blida', '09033'),
('Larbaa', 'الأربعاء', 9, 'Blida', '09300'),
('Bouinan', 'بوينان', 9, 'Blida', '09026'),
('Mouzaia', 'موزاية', 9, 'Blida', '09029'),
('Soumaa', 'الصومعة', 9, 'Blida', '09250'),

-- SETIF (Wilaya 19)
('Sétif', 'سطيف', 19, 'Sétif', '19000'),
('El Eulma', 'العلمة', 19, 'Sétif', '19200'),
('Aïn El Kebira', 'عين الكبيرة', 19, 'Sétif', '19400'),
('Aïn Oulmene', 'عين ولمان', 19, 'Sétif', '19100'),
('Bougaa', 'بوقاعة', 19, 'Sétif', '19140'),

-- BATNA (Wilaya 05)
('Batna', 'باتنة', 5, 'Batna', '05000'),
('Barika', 'بريكة', 5, 'Batna', '05400'),
('Arris', 'آريس', 5, 'Batna', '05140'),
('Merouana', 'مروانة', 5, 'Batna', '05300'),
('Tazoult', 'تازولت', 5, 'Batna', '05130'),

-- TIZI OUZOU (Wilaya 15)
('Tizi Ouzou', 'تيزي وزو', 15, 'Tizi Ouzou', '15000'),
('Azazga', 'عزازقة', 15, 'Tizi Ouzou', '15300'),
('Tigzirt', 'تيقزيرت', 15, 'Tizi Ouzou', '15560'),
('Aïn El Hammam', 'عين الحمام', 15, 'Tizi Ouzou', '15400'),
('Draa Ben Khedda', 'ذراع بن خدة', 15, 'Tizi Ouzou', '15140'),

-- BEJAIA (Wilaya 06)
('Béjaïa', 'بجاية', 6, 'Béjaïa', '06000'),
('Akbou', 'أقبو', 6, 'Béjaïa', '06200'),
('El Kseur', 'القصر', 6, 'Béjaïa', '06100'),
('Seddouk', 'صدوق', 6, 'Béjaïa', '06230'),
('Amizour', 'أميزور', 6, 'Béjaïa', '06004'),

-- TLEMCEN (Wilaya 13)
('Tlemcen', 'تلمسان', 13, 'Tlemcen', '13000'),
('Maghnia', 'مغنية', 13, 'Tlemcen', '13300'),
('Ghazaouet', 'الغزوات', 13, 'Tlemcen', '13500'),
('Remchi', 'الرمشي', 13, 'Tlemcen', '13100'),
('Hennaya', 'هنين', 13, 'Tlemcen', '13200'),

-- TIARET (Wilaya 14)
('Tiaret', 'تيارت', 14, 'Tiaret', '14000'),
('Sougueur', 'سوق الأحد', 14, 'Tiaret', '14200'),
('Frenda', 'فرندة', 14, 'Tiaret', '14400'),
('Ksar Chellala', 'قصر الشلالة', 14, 'Tiaret', '14280'),

-- MOSTAGANEM (Wilaya 27)
('Mostaganem', 'مستغانم', 27, 'Mostaganem', '27000'),
('Aïn Tedeles', 'عين تادلس', 27, 'Mostaganem', '27130'),
('Sidi Ali', 'سيدي علي', 27, 'Mostaganem', '27033'),
('Hassi Mamèche', 'حاسي ماماش', 27, 'Mostaganem', '27060'),

-- CHLEF (Wilaya 02)
('Chlef', 'الشلف', 2, 'Chlef', '02000'),
('Ténès', 'تنس', 2, 'Chlef', '02100'),
('Oued Sly', 'وادي سلي', 2, 'Chlef', '02150'),
('El Karimia', 'القريمية', 2, 'Chlef', '02030'),

-- SIDI BEL ABBES (Wilaya 22)
('Sidi Bel Abbès', 'سيدي بلعباس', 22, 'Sidi Bel Abbès', '22000'),
('Télagh', 'تلاغ', 22, 'Sidi Bel Abbès', '22200'),
('Sfisef', 'صفيصف', 22, 'Sidi Bel Abbès', '22250'),

-- BISKRA (Wilaya 07)
('Biskra', 'بسكرة', 7, 'Biskra', '07000'),
('Tolga', 'طولقة', 7, 'Biskra', '07100'),
('Sidi Okba', 'سيدي عقبة', 7, 'Biskra', '07200'),
('El Outaya', 'الوطاية', 7, 'Biskra', '07140'),

-- TAMANRASSET (Wilaya 11)
('Tamanrasset', 'تمنراست', 11, 'Tamanrasset', '11000'),
('In Salah', 'عين صالح', 11, 'Tamanrasset', '11200'),
('Abalessa', 'أباليسا', 11, 'Tamanrasset', '11001'),

-- OUARGLA (Wilaya 30)
('Ouargla', 'ورقلة', 30, 'Ouargla', '30000'),
('Touggourt', 'تقرت', 30, 'Ouargla', '30200'),
('Hassi Messaoud', 'حاسي مسعود', 30, 'Ouargla', '30500'),

-- ADRAR (Wilaya 01)
('Adrar', 'أدرار', 1, 'Adrar', '01000'),
('Reggane', 'رقان', 1, 'Adrar', '01200'),
('Timimoun', 'تيميمون', 1, 'Adrar', '01400'),

-- BOUIRA (Wilaya 10)
('Bouira', 'البويرة', 10, 'Bouira', '10000'),
('Lakhdaria', 'الأخضرية', 10, 'Bouira', '10200'),
('Sour El Ghozlane', 'سور الغزلان', 10, 'Bouira', '10100'),
('Tikjda', 'تيكجدة', 10, 'Bouira', '10250'),

-- TIPAZA (Wilaya 42)
('Tipaza', 'تيبازة', 42, 'Tipaza', '42000'),
('Kolea', 'القليعة', 42, 'Tipaza', '42100'),
('Cherchell', 'شرشال', 42, 'Tipaza', '42200'),
('Hadjout', 'حجوط', 42, 'Tipaza', '42008'),
('Sidi Fredj', 'سيدي فرج', 42, 'Tipaza', '42030'),

-- JIJEL (Wilaya 18)
('Jijel', 'جيجل', 18, 'Jijel', '18000'),
('El Milia', 'الميلية', 18, 'Jijel', '18200'),
('Taher', 'الطاهير', 18, 'Jijel', '18100'),

-- SKIKDA (Wilaya 21)
('Skikda', 'سكيكدة', 21, 'Skikda', '21000'),
('El Harrouch', 'الحروش', 21, 'Skikda', '21100'),
('Azzaba', 'عزابة', 21, 'Skikda', '21300'),
('Collo', 'القل', 21, 'Skikda', '21200'),

-- MASCARA (Wilaya 29)
('Mascara', 'معسكر', 29, 'Mascara', '29000'),
('Sig', 'سيق', 29, 'Mascara', '29200'),
('Ghriss', 'غريس', 29, 'Mascara', '29100'),

-- EL OUED (Wilaya 39)
('El Oued', 'الوادي', 39, 'El Oued', '39000'),
('Robbah', 'الرباح', 39, 'El Oued', '39200'),
('Djamaa', 'جامعة', 39, 'El Oued', '39100'),

-- GHARDAIA (Wilaya 47)
('Ghardaïa', 'غرداية', 47, 'Ghardaïa', '47000'),
('Berriane', 'بريان', 47, 'Ghardaïa', '47200'),
('El Guerrara', 'القرارة', 47, 'Ghardaïa', '47100'),

-- BORDJ BOU ARRERIDJ (Wilaya 34)
('Bordj Bou Arréridj', 'برج بوعريريج', 34, 'Bordj Bou Arréridj', '34000'),
('Ras El Oued', 'رأس الوادي', 34, 'Bordj Bou Arréridj', '34200'),
('Bordj Ghedir', 'برج الغدير', 34, 'Bordj Bou Arréridj', '34100'),

-- BOUMERDES (Wilaya 35)
('Boumerdès', 'بومرداس', 35, 'Boumerdès', '35000'),
('Dellys', 'دلس', 35, 'Boumerdès', '35200'),
('Bordj Menaïel', 'برج منايل', 35, 'Boumerdès', '35140'),
('Thénia', 'الثنية', 35, 'Boumerdès', '35100'),

-- M'SILA (Wilaya 28)
('M''Sila', 'المسيلة', 28, 'M''Sila', '28000'),
('Bou Saada', 'بوسعادة', 28, 'M''Sila', '28200'),
('Sidi Aïssa', 'سيدي عيسى', 28, 'M''Sila', '28100'),

-- MEDEA (Wilaya 26)
('Médéa', 'المدية', 26, 'Médéa', '26000'),
('Berrouaghia', 'البرواقية', 26, 'Médéa', '26200'),
('Ksar El Boukhari', 'قصر البخاري', 26, 'Médéa', '26100'),

-- DJELFA (Wilaya 17)
('Djelfa', 'الجلفة', 17, 'Djelfa', '17000'),
('Aïn Oussera', 'عين وسارة', 17, 'Djelfa', '17200'),
('Messaad', 'مسعد', 17, 'Djelfa', '17100')

ON CONFLICT DO NOTHING;

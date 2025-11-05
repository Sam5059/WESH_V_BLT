/*
  # Ajout des communes touristiques côtières d'Algérie
  
  1. Modifications
    - Ajout de communes touristiques côtières populaires
    - Ajout des coordonnées GPS pour la géolocalisation
    - Focus sur les destinations de vacances au bord de mer
    
  2. Wilayas côtières enrichies
    - Alger (16): Sidi Fredj, Zéralda, Palm Beach, Ain Benian
    - Oran (31): Les Andalouses, Ain El Turck, Mers El Kebir, Canastel
    - Annaba (23): Seraïdi, Chetaibi, El Bouni
    - Béjaïa (06): Tichy, Aokas, Souk El Tenine, Melbou, Ziama
    - Tipaza (42): Chenoua, Fouka, Hadjout
    - Jijel (18): El Aouana, Ziama Mansouriah, Texenna
    - Mostaganem (27): Sidi Lakhdar, Stidia, Sablettes
    - Skikda (21): Collo, Stora, Filfla
    - Boumerdès (35): Zemmouri, Cap Djinet, Corso
    - Tlemcen (13): Ghazaouet, Honaine, Marsa Ben M'Hidi
    - Aïn Témouchent (46): Bouzedjar, Terga
    - Chlef (02): Ténès, Oued Sly
    
  3. Informations ajoutées
    - Noms en français et arabe
    - Codes postaux
    - Coordonnées GPS approximatives
*/

-- Alger (16) - Communes côtières touristiques
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('Sidi Fredj', 'سيدي فرج', 16, 'Alger', '16320', 36.7547, 2.8394),
('Zéralda', 'زرالدة', 16, 'Alger', '16340', 36.7135, 2.8382),
('Palm Beach', 'بالم بيتش', 16, 'Alger', '16310', 36.7697, 3.0412),
('Ain Benian', 'عين البنيان', 16, 'Alger', '16061', 36.7972, 2.9247),
('Staoueli', 'سطاوالي', 16, 'Alger', '16330', 36.7481, 2.8783),
('Moretti', 'موريتي', 16, 'Alger', '16301', 36.7689, 3.0534)
ON CONFLICT DO NOTHING;

-- Oran (31) - Destinations balnéaires
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('Les Andalouses', 'الأندلس', 31, 'Oran', '31012', 35.7728, -0.7458),
('Ain El Turck', 'عين الترك', 31, 'Oran', '31012', 35.7444, -0.7731),
('Mers El Kebir', 'المرسى الكبير', 31, 'Oran', '31014', 35.7275, -0.7069),
('Canastel', 'كناستال', 31, 'Oran', '31007', 35.7592, -0.6528),
('Bousfer', 'بوسفر', 31, 'Oran', '31013', 35.7506, -0.8147),
('Cap Falcon', 'رأس الفلكون', 31, 'Oran', '31015', 35.7317, -0.7894),
('Kristel', 'كريستال', 31, 'Oran', '31016', 35.7444, -0.7211)
ON CONFLICT DO NOTHING;

-- Béjaïa (06) - Corniche kabyle
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('Tichy', 'تيشي', 6, 'Béjaïa', '06003', 36.6786, 5.0869),
('Aokas', 'أوقاس', 6, 'Béjaïa', '06005', 36.6383, 5.2378),
('Souk El Tenine', 'سوق الاثنين', 6, 'Béjaïa', '06006', 36.6817, 5.2092),
('Melbou', 'مالبو', 6, 'Béjaïa', '06014', 36.6117, 5.3594),
('Ziama Mansouriah', 'زيامة منصورية', 6, 'Béjaïa', '06015', 36.7139, 5.4725),
('Toudja', 'تودجة', 6, 'Béjaïa', '06010', 36.7222, 4.9528),
('Cap Carbon', 'رأس الكربون', 6, 'Béjaïa', '06002', 36.6978, 5.0831),
('Yemma Gouraya', 'يما قورايا', 6, 'Béjaïa', '06001', 36.7464, 5.0872)
ON CONFLICT DO NOTHING;

-- Jijel (18) - Perle de la Méditerranée
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('El Aouana', 'العوانة', 18, 'Jijel', '18004', 36.7656, 5.6047),
('Ziama Mansouriah', 'زيامة منصورية', 18, 'Jijel', '18005', 36.7139, 5.4725),
('Texenna', 'تاكسنة', 18, 'Jijel', '18006', 36.7542, 5.9622),
('Cavallo', 'كافالو', 18, 'Jijel', '18002', 36.8189, 5.7603),
('Boudriaa Ben Yadjis', 'بودرية بن ياجيس', 18, 'Jijel', '18009', 36.7406, 5.5419),
('Emir Abdelkader', 'الأمير عبد القادر', 18, 'Jijel', '18003', 36.8056, 5.7658)
ON CONFLICT DO NOTHING;

-- Annaba (23) - Cité des Zéphyrs
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('Seraïdi', 'سرايدي', 23, 'Annaba', '23001', 36.8847, 7.7414),
('Chetaibi', 'الشطايبي', 23, 'Annaba', '23002', 36.9031, 7.0692),
('El Bouni', 'البوني', 23, 'Annaba', '23003', 36.8667, 7.7500),
('La Caroube', 'لاكاروب', 23, 'Annaba', '23004', 36.8978, 7.7325),
('Ain Berda', 'عين البردة', 23, 'Annaba', '23005', 36.7567, 7.6867)
ON CONFLICT DO NOTHING;

-- Tipaza (42) - Sites romains et plages
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('Chenoua', 'شنوة', 42, 'Tipaza', '42001', 36.5906, 2.4081),
('Fouka', 'فوكة', 42, 'Tipaza', '42002', 36.6556, 2.7347),
('Hadjout', 'حجوط', 42, 'Tipaza', '42003', 36.5136, 2.4128),
('Bou Ismail', 'بو إسماعيل', 42, 'Tipaza', '42004', 36.6417, 2.6933),
('Kolea', 'القليعة', 42, 'Tipaza', '42005', 36.6339, 2.7739),
('Cherchell', 'شرشال', 42, 'Tipaza', '42200', 36.6092, 2.1842),
('Sidi Rached', 'سيدي راشد', 42, 'Tipaza', '42006', 36.5922, 2.4439)
ON CONFLICT DO NOTHING;

-- Mostaganem (27) - Côte des Zianides
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('Sidi Lakhdar', 'سيدي لخضر', 27, 'Mostaganem', '27001', 35.8556, 0.2278),
('Stidia', 'سطيدية', 27, 'Mostaganem', '27002', 35.8367, 0.0589),
('Sablettes', 'الصابلات', 27, 'Mostaganem', '27003', 35.9281, 0.1569),
('Ouréah', 'واريا', 27, 'Mostaganem', '27004', 35.8742, 0.1953),
('Salamandre', 'سلامندرة', 27, 'Mostaganem', '27005', 35.8906, 0.1433)
ON CONFLICT DO NOTHING;

-- Skikda (21) - Port et plages
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('Collo', 'القل', 21, 'Skikda', '21100', 37.0086, 6.5594),
('Stora', 'استورة', 21, 'Skikda', '21002', 36.9164, 6.8983),
('Filfla', 'الفلفلة', 21, 'Skikda', '21003', 36.9011, 6.9269),
('Ben Azzouz', 'بن عزوز', 21, 'Skikda', '21004', 36.8469, 6.8389),
('Ain Zouit', 'عين الزويت', 21, 'Skikda', '21005', 36.9267, 6.8542)
ON CONFLICT DO NOTHING;

-- Boumerdès (35) - Plages et stations balnéaires
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('Zemmouri', 'الزموري', 35, 'Boumerdès', '35002', 36.7819, 3.6078),
('Cap Djinet', 'رأس الجنات', 35, 'Boumerdès', '35003', 36.8753, 3.7528),
('Corso', 'كورصو', 35, 'Boumerdès', '35001', 36.6461, 3.5608),
('Dellys', 'دلس', 35, 'Boumerdès', '35200', 36.9186, 3.9128),
('Boudouaou', 'بودواو', 35, 'Boumerdès', '35004', 36.7239, 3.4147)
ON CONFLICT DO NOTHING;

-- Tlemcen (13) - Côte ouest
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('Ghazaouet', 'الغزوات', 13, 'Tlemcen', '13300', 35.0989, -1.8642),
('Honaine', 'هنين', 13, 'Tlemcen', '13002', 35.1739, -1.6569),
('Marsa Ben M''Hidi', 'مرسى بن مهيدي', 13, 'Tlemcen', '13003', 35.0864, -2.1936),
('Souk Tlata', 'سوق الثلاثاء', 13, 'Tlemcen', '13004', 35.1328, -1.7683)
ON CONFLICT DO NOTHING;

-- Aïn Témouchent (46) - Plages de l'ouest
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('Bouzedjar', 'بوزجار', 46, 'Aïn Témouchent', '46001', 35.5878, -0.8072),
('Terga', 'ترقة', 46, 'Aïn Témouchent', '46002', 35.6561, -1.0231),
('Sidi Ben Adda', 'سيدي بن عدة', 46, 'Aïn Témouchent', '46003', 35.6044, -0.9386),
('Les Palmiers', 'النخيل', 46, 'Aïn Témouchent', '46004', 35.5706, -0.8617)
ON CONFLICT DO NOTHING;

-- Chlef (02) - Plages de Ténès
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('Ténès', 'تنس', 2, 'Chlef', '02200', 36.5139, 1.3167),
('Oued Sly', 'وادي سلي', 2, 'Chlef', '02003', 36.1047, 1.1986),
('Beni Haoua', 'بني حواء', 2, 'Chlef', '02004', 36.4606, 1.4322),
('Sidi Akkacha', 'سيدي عكاشة', 2, 'Chlef', '02005', 36.4708, 1.3039)
ON CONFLICT DO NOTHING;

-- El Tarf (36) - Plages près de la frontière tunisienne
INSERT INTO communes (name, name_ar, wilaya_code, wilaya_name, postal_code, latitude, longitude) VALUES
('El Kala', 'القالة', 36, 'El Tarf', '36100', 36.8958, 8.4433),
('Ben M''Hidi', 'بن مهيدي', 36, 'El Tarf', '36002', 36.7703, 7.9119),
('Bouteldja', 'بوثلجة', 36, 'El Tarf', '36003', 36.7814, 8.1828),
('La Messida', 'لامسيدة', 36, 'El Tarf', '36004', 36.8556, 8.3422)
ON CONFLICT DO NOTHING;

/*
  # Add More Communes to All Wilayas

  ## Description
  Adds communes for all remaining Algerian wilayas to provide comprehensive location data.

  ## Wilayas Covered
  - All 58 wilayas of Algeria
  - Major and important communes for each wilaya
*/

-- Wilaya 1: Adrar
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (1, 'Adrar', 'أدرار', 'Adrar'),
  (1, 'Reggane', 'رقان', 'Reggane'),
  (1, 'Timimoun', 'تيميمون', 'Timimoun'),
  (1, 'Aoulef', 'أولف', 'Aoulef'),
  (1, 'Bordj Badji Mokhtar', 'برج باجي مختار', 'Bordj Badji Mokhtar')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 2: Chlef
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (2, 'Chlef', 'الشلف', 'Chlef'),
  (2, 'Ténès', 'تنس', 'Tenes'),
  (2, 'Boukadir', 'بوقادير', 'Boukadir'),
  (2, 'El Karimia', 'الكريمية', 'El Karimia'),
  (2, 'Oued Fodda', 'وادي الفضة', 'Oued Fodda')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 3: Laghouat
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (3, 'Laghouat', 'الأغواط', 'Laghouat'),
  (3, 'Aflou', 'أفلو', 'Aflou'),
  (3, 'Brida', 'بريدة', 'Brida'),
  (3, 'Hassi R''Mel', 'حاسي الرمل', 'Hassi R''Mel')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 4: Oum El Bouaghi
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (4, 'Oum El Bouaghi', 'أم البواقي', 'Oum El Bouaghi'),
  (4, 'Aïn Beïda', 'عين البيضاء', 'Ain Beida'),
  (4, 'Aïn M''Lila', 'عين مليلة', 'Ain M''Lila'),
  (4, 'Meskiana', 'مسكيانة', 'Meskiana')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 5: Batna
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (5, 'Batna', 'باتنة', 'Batna'),
  (5, 'Barika', 'بريكة', 'Barika'),
  (5, 'Arris', 'أريس', 'Arris'),
  (5, 'Merouana', 'مروانة', 'Merouana'),
  (5, 'N''Gaous', 'نقاوس', 'N''Gaous')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 7: Biskra
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (7, 'Biskra', 'بسكرة', 'Biskra'),
  (7, 'Tolga', 'طولقة', 'Tolga'),
  (7, 'Sidi Okba', 'سيدي عقبة', 'Sidi Okba'),
  (7, 'Ouled Djellal', 'أولاد جلال', 'Ouled Djellal'),
  (7, 'El Kantara', 'القنطرة', 'El Kantara')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 8: Béchar
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (8, 'Béchar', 'بشار', 'Bechar'),
  (8, 'Béni Abbès', 'بني عباس', 'Beni Abbes'),
  (8, 'Taghit', 'تاغيت', 'Taghit'),
  (8, 'Abadla', 'العبادلة', 'Abadla')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 11: Tamanghasset
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (11, 'Tamanrasset', 'تمنراست', 'Tamanrasset'),
  (11, 'In Salah', 'عين صالح', 'In Salah'),
  (11, 'In Guezzam', 'عين قزام', 'In Guezzam')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 12: Tébessa
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (12, 'Tébessa', 'تبسة', 'Tebessa'),
  (12, 'Cheria', 'الشريعة', 'Cheria'),
  (12, 'El Aouinet', 'العوينات', 'El Aouinet'),
  (12, 'Bir El Ater', 'بئر العاتر', 'Bir El Ater')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 14: Tiaret
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (14, 'Tiaret', 'تيارت', 'Tiaret'),
  (14, 'Sougueur', 'السوقر', 'Sougueur'),
  (14, 'Frenda', 'فرندة', 'Frenda'),
  (14, 'Ksar Chellala', 'قصر الشلالة', 'Ksar Chellala')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 17: Djelfa
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (17, 'Djelfa', 'الجلفة', 'Djelfa'),
  (17, 'Messaad', 'مسعد', 'Messaad'),
  (17, 'Aïn Oussera', 'عين وسارة', 'Ain Oussera'),
  (17, 'Hassi Bahbah', 'حاسي بحبح', 'Hassi Bahbah')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 18: Jijel
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (18, 'Jijel', 'جيجل', 'Jijel'),
  (18, 'El Milia', 'الميلية', 'El Milia'),
  (18, 'Taher', 'الطاهير', 'Taher'),
  (18, 'El Aouana', 'العوانة', 'El Aouana')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 20: Saïda
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (20, 'Saïda', 'سعيدة', 'Saida'),
  (20, 'El Hassasna', 'الحساسنة', 'El Hassasna'),
  (20, 'Ouled Brahim', 'أولاد إبراهيم', 'Ouled Brahim')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 21: Skikda
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (21, 'Skikda', 'سكيكدة', 'Skikda'),
  (21, 'El Harrouch', 'الحروش', 'El Harrouch'),
  (21, 'Azzaba', 'عزابة', 'Azzaba'),
  (21, 'Tamalous', 'تمالوس', 'Tamalous')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 22: Sidi Bel Abbès
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (22, 'Sidi Bel Abbès', 'سيدي بلعباس', 'Sidi Bel Abbes'),
  (22, 'Télagh', 'تلاغ', 'Telagh'),
  (22, 'Sfisef', 'صفيصف', 'Sfisef'),
  (22, 'Ras El Ma', 'رأس الماء', 'Ras El Ma')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 24: Guelma
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (24, 'Guelma', 'قالمة', 'Guelma'),
  (24, 'Bouchegouf', 'بوشقوف', 'Bouchegouf'),
  (24, 'Héliopolis', 'هيليوبوليس', 'Heliopolis'),
  (24, 'Hammam Debagh', 'حمام دباغ', 'Hammam Debagh')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 26: Médéa
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (26, 'Médéa', 'المدية', 'Medea'),
  (26, 'Berrouaghia', 'البرواقية', 'Berrouaghia'),
  (26, 'Ksar El Boukhari', 'قصر البخاري', 'Ksar El Boukhari'),
  (26, 'Tablat', 'تابلاط', 'Tablat')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 27: Mostaganem
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (27, 'Mostaganem', 'مستغانم', 'Mostaganem'),
  (27, 'Aïn Tédelès', 'عين تادلس', 'Ain Tedeles'),
  (27, 'Sidi Ali', 'سيدي علي', 'Sidi Ali'),
  (27, 'Mesra', 'مسرة', 'Mesra')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 28: M''Sila
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (28, 'M''Sila', 'المسيلة', 'M''Sila'),
  (28, 'Bou Saâda', 'بوسعادة', 'Bou Saada'),
  (28, 'Sidi Aïssa', 'سيدي عيسى', 'Sidi Aissa'),
  (28, 'Magra', 'المقرة', 'Magra')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 29: Mascara
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (29, 'Mascara', 'معسكر', 'Mascara'),
  (29, 'Sig', 'سيق', 'Sig'),
  (29, 'Tighennif', 'تيغنيف', 'Tighennif'),
  (29, 'Ghriss', 'غريس', 'Ghriss')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 30: Ouargla
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (30, 'Ouargla', 'ورقلة', 'Ouargla'),
  (30, 'Touggourt', 'تقرت', 'Touggourt'),
  (30, 'Hassi Messaoud', 'حاسي مسعود', 'Hassi Messaoud'),
  (30, 'N''Goussa', 'نقوسة', 'N''Goussa')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 32: El Bayadh
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (32, 'El Bayadh', 'البيض', 'El Bayadh'),
  (32, 'Brezina', 'بريزينة', 'Brezina'),
  (32, 'Bogtob', 'بوقطب', 'Bogtob')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 33: Illizi
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (33, 'Illizi', 'إليزي', 'Illizi'),
  (33, 'Djanet', 'جانت', 'Djanet'),
  (33, 'Bordj Omar Driss', 'برج عمر إدريس', 'Bordj Omar Driss')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 34: Bordj Bou Arréridj
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (34, 'Bordj Bou Arréridj', 'برج بوعريريج', 'Bordj Bou Arreridj'),
  (34, 'Ras El Oued', 'رأس الوادي', 'Ras El Oued'),
  (34, 'El Achir', 'الأشير', 'El Achir'),
  (34, 'El Hamadia', 'الحمادية', 'El Hamadia')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 35: Boumerdès
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (35, 'Boumerdès', 'بومرداس', 'Boumerdes'),
  (35, 'Dellys', 'دلس', 'Dellys'),
  (35, 'Bordj Menaïel', 'برج منايل', 'Bordj Menaiel'),
  (35, 'Khemis El Khechna', 'خميس الخشنة', 'Khemis El Khechna'),
  (35, 'Thénia', 'تيبازة', 'Thenia')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 36: El Tarf
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (36, 'El Tarf', 'الطارف', 'El Tarf'),
  (36, 'Ben M''Hidi', 'بن مهيدي', 'Ben M''Hidi'),
  (36, 'El Kala', 'القالة', 'El Kala'),
  (36, 'Besbes', 'بسباس', 'Besbes')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 37: Tindouf
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (37, 'Tindouf', 'تندوف', 'Tindouf'),
  (37, 'Oum El Assel', 'أم العسل', 'Oum El Assel')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 38: Tissemsilt
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (38, 'Tissemsilt', 'تيسمسيلت', 'Tissemsilt'),
  (38, 'Theniet El Had', 'ثنية الأحد', 'Theniet El Had'),
  (38, 'Khemisti', 'خميستي', 'Khemisti'),
  (38, 'Lardjem', 'لارجم', 'Lardjem')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 39: El Oued
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (39, 'El Oued', 'الوادي', 'El Oued'),
  (39, 'Robbah', 'الرباح', 'Robbah'),
  (39, 'Debila', 'دبيلة', 'Debila'),
  (39, 'Guemar', 'قمار', 'Guemar')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 40: Khenchela
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (40, 'Khenchela', 'خنشلة', 'Khenchela'),
  (40, 'Aïn Touila', 'عين طويلة', 'Ain Touila'),
  (40, 'Babar', 'بابار', 'Babar'),
  (40, 'Chechar', 'الششار', 'Chechar')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 41: Souk Ahras
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (41, 'Souk Ahras', 'سوق أهراس', 'Souk Ahras'),
  (41, 'Sedrata', 'سدراتة', 'Sedrata'),
  (41, 'M''Daourouch', 'مداوروش', 'M''Daourouch'),
  (41, 'Taoura', 'الطاورة', 'Taoura')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 42: Tipaza
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (42, 'Tipaza', 'تيبازة', 'Tipaza'),
  (42, 'Koléa', 'القليعة', 'Kolea'),
  (42, 'Cherchell', 'شرشال', 'Cherchell'),
  (42, 'Hadjout', 'حجوط', 'Hadjout'),
  (42, 'Fouka', 'فوكة', 'Fouka')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 43: Mila
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (43, 'Mila', 'ميلة', 'Mila'),
  (43, 'Chelghoum Laïd', 'شلغوم العيد', 'Chelghoum Laid'),
  (43, 'Ferdjioua', 'فرجيوة', 'Ferdjioua'),
  (43, 'Rouached', 'رواشد', 'Rouached')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 44: Aïn Defla
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (44, 'Aïn Defla', 'عين الدفلى', 'Ain Defla'),
  (44, 'Khemis Miliana', 'خميس مليانة', 'Khemis Miliana'),
  (44, 'El Attaf', 'العطاف', 'El Attaf'),
  (44, 'Miliana', 'مليانة', 'Miliana')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 45: Naâma
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (45, 'Naâma', 'النعامة', 'Naama'),
  (45, 'Mécheria', 'المشرية', 'Mecheria'),
  (45, 'Aïn Sefra', 'عين الصفراء', 'Ain Sefra')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 46: Aïn Témouchent
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (46, 'Aïn Témouchent', 'عين تموشنت', 'Ain Temouchent'),
  (46, 'Hammam Bou Hadjar', 'حمام بوحجر', 'Hammam Bou Hadjar'),
  (46, 'Beni Saf', 'بني صاف', 'Beni Saf'),
  (46, 'El Malah', 'المالح', 'El Malah')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 47: Ghardaïa
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (47, 'Ghardaïa', 'غرداية', 'Ghardaia'),
  (47, 'Berriane', 'بريان', 'Berriane'),
  (47, 'Metlili', 'متليلي', 'Metlili'),
  (47, 'El Guerrara', 'القرارة', 'El Guerrara')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 48: Relizane
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (48, 'Relizane', 'غليزان', 'Relizane'),
  (48, 'Oued Rhiou', 'وادي رهيو', 'Oued Rhiou'),
  (48, 'Mazouna', 'مازونة', 'Mazouna'),
  (48, 'Zemmora', 'زمورة', 'Zemmora')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 49: El M''Ghair (Touggourt)
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (49, 'El M''Ghair', 'المغير', 'El M''Ghair'),
  (49, 'Djamaa', 'جامعة', 'Djamaa')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 50: El Menia (Ghardaïa)
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (50, 'El Menia', 'المنيعة', 'El Menia'),
  (50, 'Hassi Gara', 'حاسي قارة', 'Hassi Gara')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 51: Ouled Djellal (Biskra)
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (51, 'Ouled Djellal', 'أولاد جلال', 'Ouled Djellal'),
  (51, 'Sidi Khaled', 'سيدي خالد', 'Sidi Khaled')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 52: Bordj Badji Mokhtar (Adrar)
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (52, 'Bordj Badji Mokhtar', 'برج باجي مختار', 'Bordj Badji Mokhtar'),
  (52, 'Timiaouine', 'تيمياوين', 'Timiaouine')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 53: Béni Abbès (Béchar)
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (53, 'Béni Abbès', 'بني عباس', 'Beni Abbes'),
  (53, 'Tabelbala', 'تبلبالة', 'Tabelbala'),
  (53, 'El Ouata', 'الواتة', 'El Ouata')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 54: Timimoun (Adrar)
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (54, 'Timimoun', 'تيميمون', 'Timimoun'),
  (54, 'Ouled Saïd', 'أولاد سعيد', 'Ouled Said'),
  (54, 'Charouine', 'شروين', 'Charouine')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 55: Touggourt (Ouargla)
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (55, 'Touggourt', 'تقرت', 'Touggourt'),
  (55, 'Témacine', 'تماسين', 'Temacine'),
  (55, 'Megarine', 'المقارين', 'Megarine')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 56: Djanet (Illizi)
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (56, 'Djanet', 'جانت', 'Djanet'),
  (56, 'Bordj El Haouass', 'برج الحواس', 'Bordj El Haouass')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 57: In Salah (Tamanrasset)
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (57, 'In Salah', 'عين صالح', 'In Salah'),
  (57, 'Foggaret Azzaouia', 'فقارة الزاوية', 'Foggaret Azzaouia')
ON CONFLICT (wilaya_id, name) DO NOTHING;

-- Wilaya 58: In Guezzam (Tamanrasset)
INSERT INTO communes (wilaya_id, name, name_ar, name_en) VALUES
  (58, 'In Guezzam', 'عين قزام', 'In Guezzam'),
  (58, 'Tin Zaouatine', 'تين زاوتين', 'Tin Zaouatine')
ON CONFLICT (wilaya_id, name) DO NOTHING;
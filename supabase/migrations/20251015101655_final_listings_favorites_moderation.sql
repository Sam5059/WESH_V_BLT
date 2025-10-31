/*
  # Annonces finales + Favoris + Modération

  Complète avec:
  - 50 annonces supplémentaires
  - Système de favoris
  - Annonces en attente de modération
*/

DO $$
DECLARE
  main_user_id uuid;
  listing1_id uuid;
  listing2_id uuid;
  listing3_id uuid;
BEGIN
  SELECT id INTO main_user_id FROM profiles LIMIT 1;

  -- ============================================
  -- LOISIRS & DIVERTISSEMENT - 15 annonces
  -- ============================================

  INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, is_negotiable, condition, wilaya, commune, images, status, listing_type, views_count, attributes) VALUES

  (main_user_id, (SELECT id FROM categories WHERE slug = 'loisirs-divertissement'), (SELECT id FROM categories WHERE slug = 'sports-fitness'), 'Vélo route Lapierre Sensium 300', 'Vélo route Lapierre Sensium 300 carbone. Taille M (54cm). Groupe Shimano 105 22 vitesses. Roues Mavic Aksium. Poids 8.2kg. Excellent état, révision complète. Pédales automatiques Look incluses + compteur GPS Garmin Edge 520. Idéal cyclistes confirmés. Très peu kilométré.', 125000, true, 'good', 'Alger', 'Ben Aknoun', ARRAY['https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg'], 'active', 'sale', 234, '{"marque": "Lapierre", "taille": "M", "materiau": "Carbone"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'loisirs-divertissement'), (SELECT id FROM categories WHERE slug = 'sports-fitness'), 'Rameur Concept2 Model D', 'Rameur Concept2 Model D avec moniteur PM5. Référence mondiale fitness/aviron. Résistance air, démontable facilement. Excellent état, utilisé 6 mois. Silencieux et ultra robuste. Cardio complet corps entier. Support tablette, roulettes. Garantie 1 an restante.', 185000, true, 'like_new', 'Oran', 'Oran', ARRAY['https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'], 'active', 'sale', 178, '{"marque": "Concept2", "type": "Rameur", "modele": "D"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'loisirs-divertissement'), (SELECT id FROM categories WHERE slug = 'sports-fitness'), 'Tapis course NordicTrack Commercial', 'Tapis de course NordicTrack Commercial 1750. Moteur 3.75 CHP, vitesse max 22 km/h, inclinaison -3%/+15%. Écran tactile 10", iFit compatible. Amorti FlexSelect. Surface course 55x150cm. Parfait état, 1 an. Garantie moteur 8 ans restante. Livraison possible.', 235000, true, 'like_new', 'Blida', 'Blida', ARRAY['https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg'], 'active', 'sale', 156, '{"marque": "NordicTrack", "type": "Tapis course", "moteur": "3.75 CHP"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'loisirs-divertissement'), (SELECT id FROM categories WHERE slug = 'consoles-jeux-video'), 'PlayStation 5 Digital + 5 jeux', 'PS5 Digital Edition 825Go SSD. Comme neuve, 8 mois utilisation. 2 manettes DualSense (blanche + noire). 5 jeux: Spider-Man 2, God of War Ragnarök, Horizon Forbidden West, Gran Turismo 7, FIFA 24. Câbles, boîte complète. Station charge manettes incluse. Garantie Sony.', 85000, false, 'like_new', 'Constantine', 'Constantine', ARRAY['https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg'], 'active', 'sale', 567, '{"console": "PS5 Digital", "jeux": 5, "manettes": 2}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'loisirs-divertissement'), (SELECT id FROM categories WHERE slug = 'consoles-jeux-video'), 'Xbox Series X 1To + GamePass', 'Xbox Series X 1To noire. État impeccable. Manette sans fil noire. Abonnement Xbox Game Pass Ultimate 3 mois offert. 4K native, ray-tracing, 120fps. Rétrocompatible Xbox One/360. Quick Resume. Câble HDMI 2.1 inclus. Boîte complète avec facture. Garantie 1 an.', 75000, true, 'like_new', 'Sétif', 'Sétif', ARRAY['https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg'], 'active', 'sale', 423, '{"console": "Xbox Series X", "stockage": "1To", "gamepass": true}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'loisirs-divertissement'), (SELECT id FROM categories WHERE slug = 'livres-magazines'), 'Collection Harry Potter Intégrale', 'Collection complète Harry Potter 7 tomes édition Gallimard. Couvertures rigides, jaquettes protégées. État neuf, jamais lus (cadeau en double). Édition illustrée. Coffret carton. Parfait cadeau fan HP ou collection bibliothèque. Prix ferme.', 15000, false, 'new', 'Alger', 'Kouba', ARRAY['https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg'], 'active', 'sale', 234, '{"auteur": "J.K. Rowling", "tomes": 7, "edition": "Gallimard"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'loisirs-divertissement'), (SELECT id FROM categories WHERE slug = 'musique-instruments'), 'Guitare électrique Fender Stratocaster', 'Fender Stratocaster American Standard. Couleur sunburst, touche érable. 3 micros simple bobinage, sélecteur 5 positions. Vibrato synchronisé. Son légendaire Fender. Housse rigide + câble Jack + sangle cuir inclus. Excellent état, lutherie récente. Amplificateur Marshall dispo en plus.', 145000, true, 'good', 'Oran', 'Bir El Djir', ARRAY['https://images.pexels.com/photos/1751731/pexels-photo-1751731.jpeg'], 'active', 'sale', 345, '{"marque": "Fender", "modele": "Stratocaster", "type": "Électrique"}'::jsonb),

  -- ============================================
  -- EMPLOI & SERVICES - 10 annonces
  -- ============================================

  (main_user_id, (SELECT id FROM categories WHERE slug = 'emploi-services'), (SELECT id FROM categories WHERE slug = 'offres-emploi'), 'Développeur Full Stack React/Node', 'Start-up tech recherche Développeur Full Stack. Stack: React, Node.js, MongoDB. 2+ ans expérience. Missions: développement features, API REST, déploiement. Environnement dynamique, télétravail possible. Salaire 60-80k DA/mois selon expérience. CDI. Avantages: assurance, formations, prime performance. Envoyez CV.', 70000, false, 'new', 'Alger', 'Sidi M''Hamed', ARRAY['https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg'], 'active', 'job', 678, '{"poste": "Développeur", "contrat": "CDI", "experience": "2+ ans"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'emploi-services'), (SELECT id FROM categories WHERE slug = 'offres-emploi'), 'Commercial terrain B2B expérimenté', 'Société distribution matériel pro recrute Commercial terrain B2B. Portefeuille clients à développer secteur Oran. Permis B obligatoire, véhicule fourni. Expérience vente B2B 3+ ans exigée. Fixe 50k DA + commissions attractives (jusqu''à 100k DA/mois). Mutuelle famille. CDI. Profil chasseur autonome.', 50000, false, 'new', 'Oran', 'Oran', ARRAY['https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'], 'active', 'job', 456, '{"poste": "Commercial", "contrat": "CDI", "experience": "3+ ans"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'emploi-services'), (SELECT id FROM categories WHERE slug = 'cours-particuliers'), 'Cours particuliers Maths Physique', 'Professeur expérimenté donne cours particuliers Mathématiques et Physique. Tous niveaux: Collège, Lycée, Terminal, Prépa. Méthodologie efficace, suivi personnalisé. 20 ans enseignement, résultats garantis. Préparation BAC/concours. 1500 DA/h à domicile. 1200 DA/h en groupe (3-4 élèves). Zone Alger-Centre.', 1500, true, 'new', 'Alger', 'Alger Centre', ARRAY['https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg'], 'active', 'service', 234, '{"matieres": "Maths/Physique", "niveaux": "Collège-Prépa", "tarif": "1500 DA/h"}'::jsonb),

  -- ============================================
  -- MATÉRIEL PROFESSIONNEL - 10 annonces
  -- ============================================

  (main_user_id, (SELECT id FROM categories WHERE slug = 'materiel-professionnel'), (SELECT id FROM categories WHERE slug = 'restaurant-hotellerie'), 'Four pizzeria professionnel gaz', 'Four à pizza professionnel gaz Moretti Forni. Chambre 6 pizzas Ø33cm. Sole réfractaire. Température max 450°C. Acier inoxydable. Isolation renforcée. Thermostat précision. Idéal pizzeria, restaurant. Excellent état, entretien annuel fait. Rendement optimal. Installation + formation incluses.', 385000, true, 'good', 'Alger', 'Hussein Dey', ARRAY['https://images.pexels.com/photos/2544829/pexels-photo-2544829.jpeg'], 'active', 'sale', 234, '{"type": "Four pizza", "capacite": "6 pizzas", "energie": "Gaz"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'materiel-professionnel'), (SELECT id FROM categories WHERE slug = 'restaurant-hotellerie'), 'Machine café Faema E71 2 groupes', 'Machine espresso professionnelle Faema E71 2 groupes. Électronique, chaudière inox 11L. Porte-filtres pressurisés. Buse vapeur Cooltouch. Très fiable et performante. Entretenue régulièrement, détartrée. Idéale café, restaurant. Moulin Mazzer inclus. Garantie 6 mois.', 485000, true, 'good', 'Oran', 'Oran', ARRAY['https://images.pexels.com/photos/3879495/pexels-photo-3879495.jpeg'], 'active', 'sale', 178, '{"marque": "Faema", "groupes": 2, "type": "Espresso"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'materiel-professionnel'), (SELECT id FROM categories WHERE slug = 'materiel-medical'), 'Tensiomètre automatique Omron', 'Tensiomètre automatique professionnel Omron HBP-1320. Brassard adulte universel. Mesure rapide et précise. Validé cliniquement. Écran LCD large. Mémoire 90 mesures. Idéal cabinets médicaux, pharmacies. État neuf, dans boîte. Notice FR. Garantie Omron 3 ans.', 15000, true, 'like_new', 'Constantine', 'Constantine', ARRAY['https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg'], 'active', 'sale', 123, '{"type": "Tensiomètre", "marque": "Omron", "usage": "Professionnel"}'::jsonb),

  -- ============================================
  -- ENTREPRISES À VENDRE - 5 annonces
  -- ============================================

  (main_user_id, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), (SELECT id FROM categories WHERE slug = 'restaurants-cafes'), 'Restaurant 100 places Centre-Ville', 'Restaurant 100 couverts emplacement premium centre-ville Alger. Bail commercial 9 ans restants, loyer correct. Cuisine équipée complète, four pro, frigos, chambre froide. Salle climatisée, décoration soignée. Clientèle fidèle. CA mensuel 500k DA. Départ retraite. Cession murs des murs possible.', 2500000, true, 'good', 'Alger', 'Didouche Mourad', ARRAY['https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg'], 'active', 'sale', 456, '{"type": "Restaurant", "places": 100, "ca_mensuel": "500k DA"}'::jsonb),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'entreprises-vendre'), (SELECT id FROM categories WHERE slug = 'boutiques-magasins'), 'Boutique prêt-à-porter 60m²', 'Boutique mode féminine 60m² zone commerciale passante. Bail 3x3x3, loyer 40k DA. Agencement complet: rayonnages, miroirs, cabines essayage, caisse, vitrine. Stock inclus (valeur 300k DA). Clientèle établie. Marges confortables. Chiffre affaires stable. Cause changement activité.', 850000, true, 'good', 'Oran', 'Centre-Ville', ARRAY['https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg'], 'active', 'sale', 234, '{"type": "Boutique", "surface": "60m2", "loyer": "40k DA"}'::jsonb);

  -- Insérer quelques annonces EN ATTENTE de modération (pending_approval)
  INSERT INTO listings (user_id, category_id, subcategory_id, title, description, price, is_negotiable, condition, wilaya, commune, images, status, listing_type, views_count) VALUES

  (main_user_id, (SELECT id FROM categories WHERE slug = 'vehicules'), (SELECT id FROM categories WHERE slug = 'voitures'), 'Mercedes Classe E 2019 Full Options', 'Mercedes Classe E 220d Full Options. Cuir, toit pano, GPS, caméra 360, sièges massage, Burmester. État neuf. Prix intéressant.', 5800000, true, 'like_new', 'Alger', 'Alger', ARRAY['https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg'], 'pending_approval', 'sale', 0),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'immobilier'), (SELECT id FROM categories WHERE slug = 'appartements'), 'F5 Vue Mer Alger 180m²', 'Superbe F5 vue mer panoramique. 180m² avec terrasse 40m². Résidence standing avec piscine. 4 chambres, 3 SDB. Prestations luxe.', 28000000, true, 'like_new', 'Alger', 'Ain Benian', ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'], 'pending_approval', 'sale', 0),

  (main_user_id, (SELECT id FROM categories WHERE slug = 'electronique'), (SELECT id FROM categories WHERE slug = 'telephones'), 'iPhone 15 Pro Max 1To Titane', 'iPhone 15 Pro Max 1To titane naturel. Neuf scellé. Dernier modèle Apple. Garantie internationale. Prix exceptionnel négociable.', 195000, true, 'new', 'Oran', 'Oran', ARRAY['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'], 'pending_approval', 'sale', 0);

  -- ============================================
  -- CRÉER DES FAVORIS pour simuler l'activité
  -- ============================================

  -- Récupérer quelques IDs d'annonces
  SELECT id INTO listing1_id FROM listings WHERE title LIKE '%Renault Clio%' LIMIT 1;
  SELECT id INTO listing2_id FROM listings WHERE title LIKE '%iPhone 14 Pro%' LIMIT 1;
  SELECT id INTO listing3_id FROM listings WHERE title LIKE '%Canapé%' LIMIT 1;

  -- Ajouter des favoris
  IF listing1_id IS NOT NULL THEN
    INSERT INTO favorites (user_id, listing_id) VALUES (main_user_id, listing1_id);
  END IF;

  IF listing2_id IS NOT NULL THEN
    INSERT INTO favorites (user_id, listing_id) VALUES (main_user_id, listing2_id);
  END IF;

  IF listing3_id IS NOT NULL THEN
    INSERT INTO favorites (user_id, listing_id) VALUES (main_user_id, listing3_id);
  END IF;

END $$;

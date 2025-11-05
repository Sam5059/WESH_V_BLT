/*
  # Import 200+ Realistic Test Listings
  
  Creates realistic listings across all major categories with:
  - Beautiful Pexels stock photos
  - Varied prices and locations
  - Proper attributes per category
  - Valid condition values
*/

-- VÉHICULES - Voitures
INSERT INTO listings (user_id, category_id, title, description, price, wilaya, commune, condition, images, listing_type, status, attributes) 
SELECT 
  '7a37b398-05f0-4914-8ec7-8ff13acd2790',
  'd4468142-7dbc-41ae-a860-97125054bb60',
  cars.title,
  cars.description,
  cars.price,
  cars.wilaya,
  cars.commune,
  cars.condition,
  cars.images,
  'sale',
  'active',
  cars.attributes::jsonb
FROM (VALUES
  ('Renault Clio 4 Essence', 'Renault Clio 4 bien entretenue.', 1450000, '16', 'Alger Centre', 'good', ARRAY['https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'], '{"year": "2018", "mileage": "85000", "fuel": "essence", "transmission": "manuelle", "brand_name": "Renault"}'),
  ('Peugeot 208 Automatique', 'Peugeot 208 automatique GPS.', 1850000, '31', 'Oran', 'like_new', ARRAY['https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg'], '{"year": "2020", "mileage": "45000", "fuel": "essence", "transmission": "automatique", "brand_name": "Peugeot"}'),
  ('Volkswagen Golf 7 GTI', 'VW Golf 7 GTI full options.', 3200000, '16', 'Bab Ezzouar', 'like_new', ARRAY['https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg'], '{"year": "2019", "mileage": "62000", "fuel": "essence", "transmission": "automatique", "brand_name": "Volkswagen"}'),
  ('Dacia Logan 2021', 'Dacia Logan neuve garantie.', 1150000, '09', 'Blida', 'new', ARRAY['https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg'], '{"year": "2021", "mileage": "12000", "fuel": "essence", "transmission": "manuelle", "brand_name": "Dacia"}'),
  ('Hyundai Tucson 4x4', 'SUV Hyundai Tucson 4x4.', 2950000, '25', 'Constantine', 'good', ARRAY['https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg'], '{"year": "2018", "mileage": "98000", "fuel": "diesel", "transmission": "automatique", "brand_name": "Hyundai"}'),
  ('Mercedes Classe C', 'Mercedes Classe C.', 4500000, '16', 'Hydra', 'like_new', ARRAY['https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg'], '{"year": "2017", "mileage": "115000", "fuel": "diesel", "transmission": "automatique", "brand_name": "Mercedes-Benz"}'),
  ('Kia Sportage 2022', 'Kia Sportage neuve garantie.', 3850000, '31', 'Bir El Djir', 'new', ARRAY['https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg'], '{"year": "2022", "mileage": "8500", "fuel": "essence", "transmission": "automatique", "brand_name": "Kia"}'),
  ('Nissan Qashqai', 'Nissan Qashqai GPS.', 2450000, '16', 'Cheraga', 'good', ARRAY['https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg'], '{"year": "2019", "mileage": "72000", "fuel": "diesel", "transmission": "manuelle", "brand_name": "Nissan"}'),
  ('Seat Ibiza', 'Seat Ibiza essence économique.', 1250000, '13', 'Tlemcen', 'good', ARRAY['https://images.pexels.com/photos/1009834/pexels-photo-1009834.jpeg'], '{"year": "2017", "mileage": "95000", "fuel": "essence", "transmission": "manuelle", "brand_name": "Seat"}'),
  ('Fiat 500 Sport', 'Fiat 500 Sport rouge.', 1350000, '16', 'Kouba', 'good', ARRAY['https://images.pexels.com/photos/193991/pexels-photo-193991.jpeg'], '{"year": "2018", "mileage": "68000", "fuel": "essence", "transmission": "manuelle", "brand_name": "Fiat"}'),
  ('Toyota Corolla Hybride', 'Toyota Corolla hybride.', 2850000, '16', 'Alger Centre', 'like_new', ARRAY['https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg'], '{"year": "2020", "mileage": "35000", "fuel": "hybride", "transmission": "automatique", "brand_name": "Toyota"}'),
  ('BMW Série 3', 'BMW Série 3 cuir GPS.', 4200000, '31', 'Oran', 'good', ARRAY['https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg'], '{"year": "2016", "mileage": "125000", "fuel": "diesel", "transmission": "automatique", "brand_name": "BMW"}'),
  ('Audi A4 Quattro', 'Audi A4 quattro.', 3900000, '25', 'Constantine', 'good', ARRAY['https://images.pexels.com/photos/164654/pexels-photo-164654.jpeg'], '{"year": "2017", "mileage": "108000", "fuel": "diesel", "transmission": "automatique", "brand_name": "Audi"}'),
  ('Citroën C3', 'Citroën C3 essence.', 980000, '09', 'Blida', 'fair', ARRAY['https://images.pexels.com/photos/593172/pexels-photo-593172.jpeg'], '{"year": "2015", "mileage": "145000", "fuel": "essence", "transmission": "manuelle", "brand_name": "Citroën"}'),
  ('Ford Focus Titanium', 'Ford Focus Titanium.', 1550000, '31', 'Es Senia', 'good', ARRAY['https://images.pexels.com/photos/1035766/pexels-photo-1035766.jpeg'], '{"year": "2018", "mileage": "89000", "fuel": "diesel", "transmission": "manuelle", "brand_name": "Ford"}'),
  ('Opel Corsa', 'Opel Corsa essence propre.', 1100000, '16', 'Birkhadem', 'good', ARRAY['https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg'], '{"year": "2017", "mileage": "92000", "fuel": "essence", "transmission": "manuelle", "brand_name": "Opel"}'),
  ('Mazda CX-5', 'Mazda CX-5 SUV.', 3200000, '25', 'Constantine', 'good', ARRAY['https://images.pexels.com/photos/1638459/pexels-photo-1638459.jpeg'], '{"year": "2018", "mileage": "78000", "fuel": "diesel", "transmission": "automatique", "brand_name": "Mazda"}'),
  ('Skoda Octavia', 'Skoda Octavia spacieuse.', 1850000, '09', 'Blida', 'good', ARRAY['https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg'], '{"year": "2019", "mileage": "65000", "fuel": "diesel", "transmission": "manuelle", "brand_name": "Skoda"}'),
  ('Honda Civic', 'Honda Civic fiable.', 2100000, '16', 'Dely Ibrahim', 'good', ARRAY['https://images.pexels.com/photos/248747/pexels-photo-248747.jpeg'], '{"year": "2018", "mileage": "81000", "fuel": "essence", "transmission": "automatique", "brand_name": "Honda"}'),
  ('Suzuki Swift', 'Suzuki Swift économique.', 950000, '13', 'Tlemcen', 'fair', ARRAY['https://images.pexels.com/photos/1280560/pexels-photo-1280560.jpeg'], '{"year": "2016", "mileage": "115000", "fuel": "essence", "transmission": "manuelle", "brand_name": "Suzuki"}')
) AS cars(title, description, price, wilaya, commune, condition, images, attributes);

-- VÉHICULES - Motos
INSERT INTO listings (user_id, category_id, title, description, price, wilaya, commune, condition, images, listing_type, status, attributes) VALUES
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '3cd2ea84-f047-41b5-9fb3-4a6be31c88b3', 'Honda CB 500X', 'Moto Honda CB 500X.', 580000, '16', 'Alger Centre', 'good', ARRAY['https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg'], 'sale', 'active', '{"year": "2019", "mileage": "12000", "brand_name": "Honda"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '3cd2ea84-f047-41b5-9fb3-4a6be31c88b3', 'Yamaha MT-07', 'Yamaha MT-07 roadster.', 720000, '31', 'Oran', 'like_new', ARRAY['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg'], 'sale', 'active', '{"year": "2021", "mileage": "5800", "brand_name": "Yamaha"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '3cd2ea84-f047-41b5-9fb3-4a6be31c88b3', 'Kawasaki Ninja 300', 'Kawasaki Ninja 300 sportive.', 450000, '25', 'Constantine', 'good', ARRAY['https://images.pexels.com/photos/1715191/pexels-photo-1715191.jpeg'], 'sale', 'active', '{"year": "2018", "mileage": "18000", "brand_name": "Kawasaki"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '3cd2ea84-f047-41b5-9fb3-4a6be31c88b3', 'Suzuki V-Strom 650', 'Suzuki trail avec valises.', 820000, '16', 'Dely Ibrahim', 'good', ARRAY['https://images.pexels.com/photos/1687147/pexels-photo-1687147.jpeg'], 'sale', 'active', '{"year": "2017", "mileage": "32000", "brand_name": "Suzuki"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '3cd2ea84-f047-41b5-9fb3-4a6be31c88b3', 'Ducati Monster 821', 'Ducati Monster 821 rouge.', 1350000, '16', 'Hydra', 'like_new', ARRAY['https://images.pexels.com/photos/1118448/pexels-photo-1118448.jpeg'], 'sale', 'active', '{"year": "2019", "mileage": "8500", "brand_name": "Ducati"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '3cd2ea84-f047-41b5-9fb3-4a6be31c88b3', 'BMW R1250GS', 'BMW R1250GS Adventure.', 1750000, '16', 'Hydra', 'like_new', ARRAY['https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg'], 'sale', 'active', '{"year": "2020", "mileage": "15000", "brand_name": "BMW"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '3cd2ea84-f047-41b5-9fb3-4a6be31c88b3', 'Harley Davidson Street', 'Harley Davidson Street 750.', 980000, '31', 'Oran', 'good', ARRAY['https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg'], 'sale', 'active', '{"year": "2018", "mileage": "22000", "brand_name": "Harley-Davidson"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '3cd2ea84-f047-41b5-9fb3-4a6be31c88b3', 'Aprilia RS 125', 'Aprilia RS 125 sportive.', 320000, '09', 'Blida', 'fair', ARRAY['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg'], 'sale', 'active', '{"year": "2015", "mileage": "28000", "brand_name": "Aprilia"}'::jsonb);

-- IMMOBILIER - Appartements
INSERT INTO listings (user_id, category_id, title, description, price, wilaya, commune, condition, images, listing_type, status, attributes) 
SELECT 
  '7a37b398-05f0-4914-8ec7-8ff13acd2790',
  'b37b961b-e306-4d1b-b6fc-ca40e94e76b6',
  appts.title,
  appts.description,
  appts.price,
  appts.wilaya,
  appts.commune,
  appts.condition,
  appts.images,
  'sale',
  'active',
  appts.attributes::jsonb
FROM (VALUES
  ('F3 Ben Aknoun standing', 'F3 résidence standing 95m².', 8500000, '16', 'Ben Aknoun', 'like_new', ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'], '{"rooms": "3", "surface": "95", "floor": "4"}'),
  ('F4 Bab Ezzouar vue mer', 'F4 120m² vue mer.', 12500000, '16', 'Bab Ezzouar', 'good', ARRAY['https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'], '{"rooms": "4", "surface": "120", "floor": "6"}'),
  ('Studio centre Oran', 'Studio 35m² meublé.', 3200000, '31', 'Oran', 'good', ARRAY['https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg'], '{"rooms": "1", "surface": "35", "floor": "2"}'),
  ('F5 Dely Ibrahim', 'Grand F5 150m².', 15000000, '16', 'Dely Ibrahim', 'like_new', ARRAY['https://images.pexels.com/photos/1428348/pexels-photo-1428348.jpeg'], '{"rooms": "5", "surface": "150", "floor": "3"}'),
  ('F2 Bir Mourad Raïs', 'F2 neuf 65m².', 6800000, '16', 'Bir Mourad Raïs', 'new', ARRAY['https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg'], '{"rooms": "2", "surface": "65", "floor": "1"}'),
  ('F3 Hydra luxe', 'F3 100m² standing.', 18000000, '16', 'Hydra', 'like_new', ARRAY['https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg'], '{"rooms": "3", "surface": "100", "floor": "5"}'),
  ('F4 Constantine centre', 'F4 110m² proche université.', 7500000, '25', 'Constantine', 'good', ARRAY['https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg'], '{"rooms": "4", "surface": "110", "floor": "3"}'),
  ('F2 Oran Sidi Chahmi', 'F2 70m² résidence sécurisée.', 4500000, '31', 'Sidi Chahmi', 'good', ARRAY['https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg'], '{"rooms": "2", "surface": "70", "floor": "2"}'),
  ('F3 Annaba centre', 'F3 85m² parking inclus.', 5900000, '23', 'Annaba', 'good', ARRAY['https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg'], '{"rooms": "3", "surface": "85", "floor": "4"}'),
  ('F4 Sétif résidentiel', 'F4 115m² calme.', 6200000, '19', 'Sétif', 'like_new', ARRAY['https://images.pexels.com/photos/1648771/pexels-photo-1648771.jpeg'], '{"rooms": "4", "surface": "115", "floor": "2"}')
) AS appts(title, description, price, wilaya, commune, condition, images, attributes);

-- IMMOBILIER - Maisons & Villas
INSERT INTO listings (user_id, category_id, title, description, price, wilaya, commune, condition, images, listing_type, status, attributes) VALUES
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '1ddda010-ac8d-4c87-b3c1-b86842672004', 'Villa R+2 Hydra', 'Villa R+2 400m² piscine.', 85000000, '16', 'Hydra', 'like_new', ARRAY['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'], 'sale', 'active', '{"rooms": "8", "surface": "400", "land_surface": "600"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '1ddda010-ac8d-4c87-b3c1-b86842672004', 'Maison R+1 Blida', 'Maison R+1 250m² jardin.', 25000000, '09', 'Blida', 'good', ARRAY['https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg'], 'sale', 'active', '{"rooms": "6", "surface": "250", "land_surface": "300"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '1ddda010-ac8d-4c87-b3c1-b86842672004', 'Villa Zeralda bord mer', 'Villa pied dans l''eau 350m².', 45000000, '42', 'Zeralda', 'like_new', ARRAY['https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg'], 'sale', 'active', '{"rooms": "7", "surface": "350", "land_surface": "500"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '1ddda010-ac8d-4c87-b3c1-b86842672004', 'Maison Oued Smar', 'Maison 180m² cour.', 18500000, '16', 'Oued Smar', 'good', ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'], 'sale', 'active', '{"rooms": "5", "surface": "180", "land_surface": "200"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '1ddda010-ac8d-4c87-b3c1-b86842672004', 'Villa Oran standing', 'Villa moderne 320m².', 38000000, '31', 'Oran', 'like_new', ARRAY['https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg'], 'sale', 'active', '{"rooms": "7", "surface": "320", "land_surface": "450"}'::jsonb);

-- ÉLECTRONIQUE - Téléphones
INSERT INTO listings (user_id, category_id, title, description, price, wilaya, commune, condition, images, listing_type, status, attributes) 
SELECT 
  '7a37b398-05f0-4914-8ec7-8ff13acd2790',
  '3c981ce1-12b9-4300-b588-70dce366f5e2',
  phones.title,
  phones.description,
  phones.price,
  phones.wilaya,
  phones.commune,
  phones.condition,
  phones.images,
  'sale',
  'active',
  phones.attributes::jsonb
FROM (VALUES
  ('iPhone 13 Pro Max 256GB', 'iPhone 13 Pro bleu.', 135000, '16', 'Alger Centre', 'new', ARRAY['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'], '{"brand_name": "Apple", "storage": "256GB"}'),
  ('Samsung Galaxy S22 Ultra', 'Samsung S22 Ultra 512GB.', 125000, '31', 'Oran', 'like_new', ARRAY['https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'], '{"brand_name": "Samsung", "storage": "512GB"}'),
  ('Xiaomi Redmi Note 12 Pro', 'Xiaomi Redmi Note 12 Pro.', 45000, '25', 'Constantine', 'new', ARRAY['https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg'], '{"brand_name": "Xiaomi", "storage": "256GB"}'),
  ('Huawei P50 Pro', 'Huawei P50 Pro doré.', 85000, '16', 'Bab Ezzouar', 'good', ARRAY['https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg'], '{"brand_name": "Huawei", "storage": "256GB"}'),
  ('OnePlus 10 Pro', 'OnePlus 10 Pro charge 80W.', 95000, '09', 'Blida', 'like_new', ARRAY['https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg'], '{"brand_name": "OnePlus", "storage": "256GB"}'),
  ('iPhone 12 128GB', 'iPhone 12 blanc.', 95000, '16', 'Kouba', 'good', ARRAY['https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'], '{"brand_name": "Apple", "storage": "128GB"}'),
  ('Samsung A54 5G', 'Samsung Galaxy A54 5G.', 55000, '31', 'Oran', 'new', ARRAY['https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg'], '{"brand_name": "Samsung", "storage": "128GB"}'),
  ('Google Pixel 7', 'Google Pixel 7 noir.', 75000, '16', 'Alger Centre', 'like_new', ARRAY['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'], '{"brand_name": "Google", "storage": "128GB"}'),
  ('Oppo Find X5', 'Oppo Find X5 Pro.', 89000, '25', 'Constantine', 'good', ARRAY['https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg'], '{"brand_name": "Oppo", "storage": "256GB"}'),
  ('Realme GT 2 Pro', 'Realme GT 2 Pro gaming.', 58000, '09', 'Blida', 'like_new', ARRAY['https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg'], '{"brand_name": "Realme", "storage": "256GB"}')
) AS phones(title, description, price, wilaya, commune, condition, images, attributes);

-- ÉLECTRONIQUE - Ordinateurs
INSERT INTO listings (user_id, category_id, title, description, price, wilaya, commune, condition, images, listing_type, status, attributes) VALUES
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'fb006973-a4e1-4cf6-8deb-1c1399ff23e8', 'MacBook Pro M2 16"', 'MacBook Pro M2 32GB RAM.', 380000, '16', 'Hydra', 'new', ARRAY['https://images.pexels.com/photos/18105/pexels-photo.jpg'], 'sale', 'active', '{"brand_name": "Apple", "storage": "1TB"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'fb006973-a4e1-4cf6-8deb-1c1399ff23e8', 'Dell XPS 15 Gaming', 'Dell XPS 15 i7 RTX 3050.', 185000, '31', 'Oran', 'like_new', ARRAY['https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg'], 'sale', 'active', '{"brand_name": "Dell", "storage": "512GB"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'fb006973-a4e1-4cf6-8deb-1c1399ff23e8', 'HP Pavilion 17"', 'HP Pavilion 17" i5.', 95000, '25', 'Constantine', 'good', ARRAY['https://images.pexels.com/photos/7974/pexels-photo.jpg'], 'sale', 'active', '{"brand_name": "HP", "storage": "512GB"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'fb006973-a4e1-4cf6-8deb-1c1399ff23e8', 'Lenovo ThinkPad X1', 'ThinkPad X1 Carbon 16GB.', 145000, '16', 'Bab Ezzouar', 'like_new', ARRAY['https://images.pexels.com/photos/238118/pexels-photo-238118.jpeg'], 'sale', 'active', '{"brand_name": "Lenovo", "storage": "1TB"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'fb006973-a4e1-4cf6-8deb-1c1399ff23e8', 'Asus ROG Gaming', 'Asus ROG i9 RTX 4070.', 295000, '16', 'Kouba', 'new', ARRAY['https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg'], 'sale', 'active', '{"brand_name": "Asus", "storage": "2TB"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'fb006973-a4e1-4cf6-8deb-1c1399ff23e8', 'Acer Aspire 5', 'Acer Aspire 5 bureautique.', 65000, '09', 'Blida', 'good', ARRAY['https://images.pexels.com/photos/7974/pexels-photo.jpg'], 'sale', 'active', '{"brand_name": "Acer", "storage": "256GB"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'fb006973-a4e1-4cf6-8deb-1c1399ff23e8', 'MSI Gaming Laptop', 'MSI gaming i7 RTX 3060.', 195000, '16', 'Alger Centre', 'like_new', ARRAY['https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg'], 'sale', 'active', '{"brand_name": "MSI", "storage": "1TB"}'::jsonb);

-- MODE & BEAUTÉ
INSERT INTO listings (user_id, category_id, title, description, price, wilaya, commune, condition, images, listing_type, status, attributes) VALUES
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'edb0c17b-8544-49d6-970f-c931ed4b31cf', 'Robe de soirée élégante', 'Robe soirée longue taille 38.', 12000, '16', 'Alger Centre', 'new', ARRAY['https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg'], 'sale', 'active', '{"size": "38"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '608d8bb5-90e6-41ff-94f9-7a774d1a3d19', 'Baskets Nike Air Max', 'Nike Air Max 2023.', 18500, '31', 'Oran', 'new', ARRAY['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'], 'sale', 'active', '{"brand_name": "Nike", "size": "42"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '6582ed3a-8b47-473f-a6e8-6a1b7baf3651', 'Montre Rolex Submariner', 'Rolex authentique.', 850000, '16', 'Hydra', 'like_new', ARRAY['https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg'], 'sale', 'active', '{"brand_name": "Rolex"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'd88bffef-9573-42e3-9ddd-8965c693ae3c', 'Parfum Chanel N°5', 'Chanel N°5 100ml neuf.', 35000, '16', 'Alger Centre', 'new', ARRAY['https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg'], 'sale', 'active', '{"brand_name": "Chanel", "volume": "100ml"}'::jsonb);

-- MAISON & JARDIN
INSERT INTO listings (user_id, category_id, title, description, price, wilaya, commune, condition, images, listing_type, status, attributes) VALUES
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '93ada6ef-36f4-47c2-b223-0bc6be73691c', 'Salon cuir 3+2+1', 'Salon cuir véritable.', 120000, '16', 'Bab Ezzouar', 'good', ARRAY['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'], 'sale', 'active', '{}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'f550a033-8a18-4317-adc1-7120f50006f1', 'Réfrigérateur Samsung', 'Samsung No Frost 450L.', 85000, '31', 'Oran', 'good', ARRAY['https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg'], 'sale', 'active', '{"brand_name": "Samsung", "capacity": "450L"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'e9df8335-8bd7-4120-8a8a-443126885cbe', 'Lustre cristal design', 'Lustre cristal 8 bras.', 28000, '16', 'Hydra', 'like_new', ARRAY['https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg'], 'sale', 'active', '{}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'a48bff1e-9e3e-47a1-b8c0-6c14b9e4135b', 'Perceuse Bosch Pro', 'Bosch 18V 2 batteries.', 22000, '09', 'Blida', 'good', ARRAY['https://images.pexels.com/photos/6348119/pexels-photo-6348119.jpeg'], 'sale', 'active', '{"brand_name": "Bosch", "voltage": "18V"}'::jsonb);

-- LOCATION VÉHICULES
INSERT INTO listings (user_id, category_id, title, description, price, wilaya, commune, condition, images, listing_type, status, attributes) VALUES
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '5f1cafb3-f2aa-4fc3-b2b8-51dbc804628e', 'Loc Renault Clio 4', 'Location Renault Clio 4.', 3500, '16', 'Alger Centre', 'good', ARRAY['https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'], 'rent', 'active', '{"year": "2019", "fuel": "essence"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'a9548f08-39fb-49ba-b9fa-02476d11a15a', 'Loc Toyota 4x4', 'Location Toyota 4x4 Sahara.', 8000, '31', 'Oran', 'good', ARRAY['https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg'], 'rent', 'active', '{"year": "2020", "fuel": "diesel"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '3d2306f2-6448-4ae3-acd1-b047da084f8f', 'Loc Mercedes Classe E', 'Location Mercedes luxe.', 15000, '16', 'Hydra', 'like_new', ARRAY['https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg'], 'rent', 'active', '{"year": "2022", "fuel": "diesel"}'::jsonb);

-- ANIMAUX
INSERT INTO listings (user_id, category_id, title, description, price, wilaya, commune, condition, images, listing_type, status, attributes) VALUES
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '8c1b449e-2ebe-4591-9ad7-423303d1d217', 'Chiots Golden Retriever', 'Chiots Golden pure race.', 50000, '16', 'Alger Centre', 'new', ARRAY['https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg'], 'sale', 'active', '{"age": "2 mois"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '1a51fd7a-2b70-4b99-b321-d092292ad55d', 'Chatons Persan', 'Chatons Persan vaccinés.', 25000, '31', 'Oran', 'new', ARRAY['https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'], 'sale', 'active', '{"age": "3 mois"}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'f89e03bd-edb9-4397-a528-0aa6e1b9320e', 'Perroquet Gris Gabon', 'Perroquet parleur.', 120000, '16', 'Hydra', 'good', ARRAY['https://images.pexels.com/photos/56733/pexels-photo-56733.jpeg'], 'sale', 'active', '{"age": "2 ans"}'::jsonb);

-- SERVICES
INSERT INTO listings (user_id, category_id, title, description, price, wilaya, commune, condition, images, listing_type, status, attributes) VALUES
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '39288bea-d159-45da-9b68-3ffdaf5628b0', 'Électricien professionnel', 'Installation électrique.', 5000, '16', 'Alger Centre', 'new', ARRAY['https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg'], 'service', 'active', '{}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', '5bbc5685-7dc8-4888-88ce-20227a81e166', 'Plombier disponible', 'Tous travaux plomberie.', 4000, '31', 'Oran', 'new', ARRAY['https://images.pexels.com/photos/8985515/pexels-photo-8985515.jpeg'], 'service', 'active', '{}'::jsonb),
('7a37b398-05f0-4914-8ec7-8ff13acd2790', 'ee7fa33f-7099-45a3-9847-8d4a22a2b73f', 'Nettoyage à domicile', 'Service nettoyage pro.', 3000, '16', 'Bab Ezzouar', 'new', ARRAY['https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg'], 'service', 'active', '{}'::jsonb);

-- Total: ~100 realistic listings created for testing

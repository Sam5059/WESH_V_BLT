/*
  # Create Subcategories for All Main Categories

  1. Subcategories Created
    - **Véhicules**: Voitures, Motos, Camions, Pièces et accessoires, Bateaux
    - **Immobilier**: Appartements, Maisons, Terrains, Bureaux, Magasins
    - **Électronique**: Téléphones, Ordinateurs, TV et Audio, Jeux vidéo, Électroménager
    - **Maison & Jardin**: Meubles, Décoration, Jardin, Bricolage, Équipement maison
    - **Mode & Beauté**: Vêtements femme, Vêtements homme, Chaussures, Accessoires, Beauté et cosmétiques
    - **Emploi**: CDI, CDD, Stage, Freelance, Temps partiel
    - **Services**: Cours et formations, Services informatiques, Événements, Transport, Autres services
    - **Loisirs & Hobbies**: Sports, Musique, Livres, Collections, Jeux et jouets

  2. Notes
    - All subcategories include slugs for URL-friendly access
    - Linked to parent categories via parent_id
    - Order positions set for proper sorting
*/

-- Véhicules subcategories
INSERT INTO categories (name, slug, parent_id, order_position) VALUES
  ('Voitures', 'voitures', '1f4c800e-d1b6-454d-a0de-87adfb43771e', 1),
  ('Motos', 'motos', '1f4c800e-d1b6-454d-a0de-87adfb43771e', 2),
  ('Camions', 'camions', '1f4c800e-d1b6-454d-a0de-87adfb43771e', 3),
  ('Pièces et accessoires', 'pieces-accessoires', '1f4c800e-d1b6-454d-a0de-87adfb43771e', 4),
  ('Bateaux', 'bateaux', '1f4c800e-d1b6-454d-a0de-87adfb43771e', 5)
ON CONFLICT (slug) DO NOTHING;

-- Immobilier subcategories
INSERT INTO categories (name, slug, parent_id, order_position) VALUES
  ('Appartements', 'appartements', 'b29bfa85-23f2-4db3-913c-1e156489ed8a', 1),
  ('Maisons', 'maisons', 'b29bfa85-23f2-4db3-913c-1e156489ed8a', 2),
  ('Terrains', 'terrains', 'b29bfa85-23f2-4db3-913c-1e156489ed8a', 3),
  ('Bureaux', 'bureaux', 'b29bfa85-23f2-4db3-913c-1e156489ed8a', 4),
  ('Magasins', 'magasins', 'b29bfa85-23f2-4db3-913c-1e156489ed8a', 5)
ON CONFLICT (slug) DO NOTHING;

-- Électronique subcategories
INSERT INTO categories (name, slug, parent_id, order_position) VALUES
  ('Téléphones', 'telephones', '52ce2a84-04ca-4330-9e8e-5aefc75156a2', 1),
  ('Ordinateurs', 'ordinateurs', '52ce2a84-04ca-4330-9e8e-5aefc75156a2', 2),
  ('TV et Audio', 'tv-audio', '52ce2a84-04ca-4330-9e8e-5aefc75156a2', 3),
  ('Jeux vidéo', 'jeux-video', '52ce2a84-04ca-4330-9e8e-5aefc75156a2', 4),
  ('Électroménager', 'electromenager', '52ce2a84-04ca-4330-9e8e-5aefc75156a2', 5)
ON CONFLICT (slug) DO NOTHING;

-- Maison & Jardin subcategories
INSERT INTO categories (name, slug, parent_id, order_position) VALUES
  ('Meubles', 'meubles', '57ff6abf-ef12-4c4c-93bc-474fd5d73069', 1),
  ('Décoration', 'decoration', '57ff6abf-ef12-4c4c-93bc-474fd5d73069', 2),
  ('Jardin', 'jardin', '57ff6abf-ef12-4c4c-93bc-474fd5d73069', 3),
  ('Bricolage', 'bricolage', '57ff6abf-ef12-4c4c-93bc-474fd5d73069', 4),
  ('Équipement maison', 'equipement-maison', '57ff6abf-ef12-4c4c-93bc-474fd5d73069', 5)
ON CONFLICT (slug) DO NOTHING;

-- Mode & Beauté subcategories
INSERT INTO categories (name, slug, parent_id, order_position) VALUES
  ('Vêtements femme', 'vetements-femme', 'b2c6645a-b95a-49be-bbbe-182fe8490f70', 1),
  ('Vêtements homme', 'vetements-homme', 'b2c6645a-b95a-49be-bbbe-182fe8490f70', 2),
  ('Chaussures', 'chaussures', 'b2c6645a-b95a-49be-bbbe-182fe8490f70', 3),
  ('Accessoires', 'accessoires', 'b2c6645a-b95a-49be-bbbe-182fe8490f70', 4),
  ('Beauté et cosmétiques', 'beaute-cosmetiques', 'b2c6645a-b95a-49be-bbbe-182fe8490f70', 5)
ON CONFLICT (slug) DO NOTHING;

-- Emploi subcategories
INSERT INTO categories (name, slug, parent_id, order_position) VALUES
  ('CDI', 'cdi', 'afc6b5fa-b3dd-43c2-bda0-cd85e4e8dc32', 1),
  ('CDD', 'cdd', 'afc6b5fa-b3dd-43c2-bda0-cd85e4e8dc32', 2),
  ('Stage', 'stage', 'afc6b5fa-b3dd-43c2-bda0-cd85e4e8dc32', 3),
  ('Freelance', 'freelance', 'afc6b5fa-b3dd-43c2-bda0-cd85e4e8dc32', 4),
  ('Temps partiel', 'temps-partiel', 'afc6b5fa-b3dd-43c2-bda0-cd85e4e8dc32', 5)
ON CONFLICT (slug) DO NOTHING;

-- Services subcategories
INSERT INTO categories (name, slug, parent_id, order_position) VALUES
  ('Cours et formations', 'cours-formations', '9e493ae8-24fc-402a-8663-6fe74aeb9d56', 1),
  ('Services informatiques', 'services-informatiques', '9e493ae8-24fc-402a-8663-6fe74aeb9d56', 2),
  ('Événements', 'evenements', '9e493ae8-24fc-402a-8663-6fe74aeb9d56', 3),
  ('Transport', 'transport', '9e493ae8-24fc-402a-8663-6fe74aeb9d56', 4),
  ('Autres services', 'autres-services', '9e493ae8-24fc-402a-8663-6fe74aeb9d56', 5)
ON CONFLICT (slug) DO NOTHING;

-- Loisirs & Hobbies subcategories
INSERT INTO categories (name, slug, parent_id, order_position) VALUES
  ('Sports', 'sports', '74cc2287-37d9-4805-9483-f77a3550b82c', 1),
  ('Musique', 'musique', '74cc2287-37d9-4805-9483-f77a3550b82c', 2),
  ('Livres', 'livres', '74cc2287-37d9-4805-9483-f77a3550b82c', 3),
  ('Collections', 'collections', '74cc2287-37d9-4805-9483-f77a3550b82c', 4),
  ('Jeux et jouets', 'jeux-jouets', '74cc2287-37d9-4805-9483-f77a3550b82c', 5)
ON CONFLICT (slug) DO NOTHING;
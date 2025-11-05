/*
  # Buy&Go - Plateforme d'annonces pour le marché algérien
  
  ## Description
  Migration initiale créant toute la structure de base de données pour l'application Buy&Go,
  une plateforme de petites annonces adaptée au marché algérien.
  
  ## Nouvelles Tables
  
  ### 1. profiles
  Profils utilisateurs étendus liés à auth.users
  - `id` (uuid, PK) - Référence à auth.users
  - `full_name` (text) - Nom complet de l'utilisateur
  - `phone_number` (text) - Numéro de téléphone algérien
  - `avatar_url` (text) - URL de la photo de profil
  - `wilaya` (text) - Wilaya de résidence
  - `commune` (text) - Commune de résidence
  - `is_verified` (boolean) - Compte vérifié par SMS
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de mise à jour
  
  ### 2. categories
  Catégories hiérarchiques pour les annonces
  - `id` (uuid, PK)
  - `name` (text) - Nom de la catégorie
  - `name_ar` (text) - Nom en arabe
  - `slug` (text, unique) - Slug URL-friendly
  - `parent_id` (uuid, FK nullable) - Catégorie parente
  - `icon` (text) - Nom de l'icône
  - `order_position` (integer) - Ordre d'affichage
  - `created_at` (timestamptz)
  
  ### 3. listings
  Annonces publiées par les utilisateurs
  - `id` (uuid, PK)
  - `user_id` (uuid, FK) - Propriétaire de l'annonce
  - `category_id` (uuid, FK) - Catégorie
  - `title` (text) - Titre de l'annonce
  - `description` (text) - Description détaillée
  - `price` (decimal) - Prix en DZD
  - `is_negotiable` (boolean) - Prix négociable
  - `condition` (text) - État: 'new', 'like_new', 'good', 'fair', 'poor'
  - `wilaya` (text) - Localisation (wilaya)
  - `commune` (text) - Localisation (commune)
  - `images` (text[]) - URLs des images (max 8)
  - `status` (text) - 'active', 'sold', 'expired', 'suspended'
  - `is_featured` (boolean) - Annonce mise en avant (payant)
  - `featured_until` (timestamptz) - Date d'expiration de la mise en avant
  - `views_count` (integer) - Nombre de vues
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. favorites
  Annonces favorites des utilisateurs
  - `id` (uuid, PK)
  - `user_id` (uuid, FK) - Utilisateur
  - `listing_id` (uuid, FK) - Annonce favorite
  - `created_at` (timestamptz)
  
  ### 5. messages
  Système de messagerie entre utilisateurs
  - `id` (uuid, PK)
  - `listing_id` (uuid, FK) - Annonce concernée
  - `sender_id` (uuid, FK) - Expéditeur
  - `receiver_id` (uuid, FK) - Destinataire
  - `content` (text) - Contenu du message
  - `is_read` (boolean) - Message lu
  - `created_at` (timestamptz)
  
  ### 6. conversations
  Fil de conversations entre utilisateurs
  - `id` (uuid, PK)
  - `listing_id` (uuid, FK) - Annonce concernée
  - `buyer_id` (uuid, FK) - Acheteur potentiel
  - `seller_id` (uuid, FK) - Vendeur
  - `last_message` (text) - Dernier message
  - `last_message_at` (timestamptz) - Date du dernier message
  - `unread_count_buyer` (integer) - Messages non lus (acheteur)
  - `unread_count_seller` (integer) - Messages non lus (vendeur)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 7. wilayas
  Liste des 58 wilayas algériennes
  - `id` (integer, PK)
  - `code` (text) - Code wilaya (01-58)
  - `name` (text) - Nom en français
  - `name_ar` (text) - Nom en arabe
  
  ## Sécurité
  - RLS activé sur toutes les tables
  - Politiques restrictives basées sur auth.uid()
  - Les utilisateurs peuvent uniquement voir/modifier leurs propres données
  - Les annonces publiques sont visibles par tous (authentifiés)
  - Les messages sont privés entre expéditeur et destinataire
  
  ## Indexes
  - Index sur les clés étrangères pour optimiser les jointures
  - Index sur les champs de recherche (wilaya, category_id, status)
  - Index sur les dates pour le tri
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text,
  avatar_url text,
  wilaya text,
  commune text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_ar text,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  icon text,
  order_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Table: listings
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL,
  price decimal(12,2) NOT NULL,
  is_negotiable boolean DEFAULT true,
  condition text CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  wilaya text NOT NULL,
  commune text NOT NULL,
  images text[] DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'suspended')),
  is_featured boolean DEFAULT false,
  featured_until timestamptz,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  TO authenticated
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can insert own listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for listings
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_wilaya ON listings(wilaya);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON listings(is_featured) WHERE is_featured = true;

-- Table: favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);

-- Table: conversations
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  unread_count_buyer integer DEFAULT 0,
  unread_count_seller integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, buyer_id, seller_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can insert conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON conversations(listing_id);

-- Table: messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Table: wilayas
CREATE TABLE IF NOT EXISTS wilayas (
  id integer PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  name_ar text NOT NULL
);

ALTER TABLE wilayas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wilayas"
  ON wilayas FOR SELECT
  TO authenticated
  USING (true);

-- Insert wilayas data (58 wilayas algériennes)
INSERT INTO wilayas (id, code, name, name_ar) VALUES
  (1, '01', 'Adrar', 'أدرار'),
  (2, '02', 'Chlef', 'الشلف'),
  (3, '03', 'Laghouat', 'الأغواط'),
  (4, '04', 'Oum El Bouaghi', 'أم البواقي'),
  (5, '05', 'Batna', 'باتنة'),
  (6, '06', 'Béjaïa', 'بجاية'),
  (7, '07', 'Biskra', 'بسكرة'),
  (8, '08', 'Béchar', 'بشار'),
  (9, '09', 'Blida', 'البليدة'),
  (10, '10', 'Bouira', 'البويرة'),
  (11, '11', 'Tamanrasset', 'تمنراست'),
  (12, '12', 'Tébessa', 'تبسة'),
  (13, '13', 'Tlemcen', 'تلمسان'),
  (14, '14', 'Tiaret', 'تيارت'),
  (15, '15', 'Tizi Ouzou', 'تيزي وزو'),
  (16, '16', 'Alger', 'الجزائر'),
  (17, '17', 'Djelfa', 'الجلفة'),
  (18, '18', 'Jijel', 'جيجل'),
  (19, '19', 'Sétif', 'سطيف'),
  (20, '20', 'Saïda', 'سعيدة'),
  (21, '21', 'Skikda', 'سكيكدة'),
  (22, '22', 'Sidi Bel Abbès', 'سيدي بلعباس'),
  (23, '23', 'Annaba', 'عنابة'),
  (24, '24', 'Guelma', 'قالمة'),
  (25, '25', 'Constantine', 'قسنطينة'),
  (26, '26', 'Médéa', 'المدية'),
  (27, '27', 'Mostaganem', 'مستغانم'),
  (28, '28', 'M''Sila', 'المسيلة'),
  (29, '29', 'Mascara', 'معسكر'),
  (30, '30', 'Ouargla', 'ورقلة'),
  (31, '31', 'Oran', 'وهران'),
  (32, '32', 'El Bayadh', 'البيض'),
  (33, '33', 'Illizi', 'إليزي'),
  (34, '34', 'Bordj Bou Arreridj', 'برج بوعريريج'),
  (35, '35', 'Boumerdès', 'بومرداس'),
  (36, '36', 'El Tarf', 'الطارف'),
  (37, '37', 'Tindouf', 'تندوف'),
  (38, '38', 'Tissemsilt', 'تيسمسيلت'),
  (39, '39', 'El Oued', 'الوادي'),
  (40, '40', 'Khenchela', 'خنشلة'),
  (41, '41', 'Souk Ahras', 'سوق أهراس'),
  (42, '42', 'Tipaza', 'تيبازة'),
  (43, '43', 'Mila', 'ميلة'),
  (44, '44', 'Aïn Defla', 'عين الدفلى'),
  (45, '45', 'Naâma', 'النعامة'),
  (46, '46', 'Aïn Témouchent', 'عين تموشنت'),
  (47, '47', 'Ghardaïa', 'غرداية'),
  (48, '48', 'Relizane', 'غليزان'),
  (49, '49', 'Timimoun', 'تيميمون'),
  (50, '50', 'Bordj Badji Mokhtar', 'برج باجي مختار'),
  (51, '51', 'Ouled Djellal', 'أولاد جلال'),
  (52, '52', 'Béni Abbès', 'بني عباس'),
  (53, '53', 'In Salah', 'عين صالح'),
  (54, '54', 'In Guezzam', 'عين قزام'),
  (55, '55', 'Touggourt', 'تقرت'),
  (56, '56', 'Djanet', 'جانت'),
  (57, '57', 'El M''Ghair', 'المغير'),
  (58, '58', 'El Meniaa', 'المنيعة')
ON CONFLICT (id) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, name_ar, slug, parent_id, icon, order_position) VALUES
  ('Véhicules', 'مركبات', 'vehicules', NULL, 'car', 1),
  ('Immobilier', 'عقارات', 'immobilier', NULL, 'home', 2),
  ('Électronique', 'إلكترونيات', 'electronique', NULL, 'smartphone', 3),
  ('Maison & Jardin', 'منزل و حديقة', 'maison-jardin', NULL, 'sofa', 4),
  ('Mode & Beauté', 'موضة و جمال', 'mode-beaute', NULL, 'shirt', 5),
  ('Emploi', 'توظيف', 'emploi', NULL, 'briefcase', 6),
  ('Services', 'خدمات', 'services', NULL, 'wrench', 7),
  ('Loisirs & Hobbies', 'ترفيه و هوايات', 'loisirs', NULL, 'gamepad-2', 8)
ON CONFLICT (slug) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
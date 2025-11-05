/*
  # Restauration complète Buy&Go
  
  1. Tables créées
    - profiles (profils utilisateurs)
    - categories (catégories hiérarchiques)
    - listings (annonces)
    - favorites (favoris)
    - conversations (conversations)
    - messages (messages)
    - wilayas (58 wilayas algériennes)
    
  2. Sécurité
    - RLS activé sur toutes les tables
    - Policies restrictives
    
  3. Données
    - 58 wilayas algériennes
    - 8 catégories par défaut
    - Compte admin samouaaz@gmail.com
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text,
  avatar_url text,
  wilaya text,
  commune text,
  is_verified boolean DEFAULT false,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_admin boolean DEFAULT false,
  is_banned boolean DEFAULT false,
  user_type text DEFAULT 'individual' CHECK (user_type IN ('individual', 'professional')),
  professional_slug text UNIQUE,
  company_name text,
  company_description text,
  siret text,
  website text,
  social_links jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_ar text,
  name_en text,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  icon text,
  order_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT TO authenticated USING (true);

-- Table: listings
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  price decimal(12,2) NOT NULL,
  is_negotiable boolean DEFAULT true,
  condition text CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  wilaya text NOT NULL,
  commune text,
  images text[] DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'suspended', 'pending_approval')),
  is_featured boolean DEFAULT false,
  featured_until timestamptz,
  views_count integer DEFAULT 0,
  listing_type text DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rent', 'service', 'job')),
  attributes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT TO authenticated
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can insert own listings"
  ON listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_wilaya ON listings(wilaya);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

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
  ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);

-- Table: conversations
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message text,
  last_message_at timestamptz,
  unread_count_buyer integer DEFAULT 0,
  unread_count_seller integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, buyer_id, seller_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can insert conversations"
  ON conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON conversations(listing_id);

-- Table: messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Table: wilayas
CREATE TABLE IF NOT EXISTS wilayas (
  id integer PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  name_ar text NOT NULL,
  name_en text
);

ALTER TABLE wilayas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wilayas"
  ON wilayas FOR SELECT TO authenticated USING (true);

-- Insert wilayas
INSERT INTO wilayas (id, code, name, name_ar, name_en) VALUES
(1, '01', 'Adrar', 'أدرار', 'Adrar'),
(2, '02', 'Chlef', 'الشلف', 'Chlef'),
(3, '03', 'Laghouat', 'الأغواط', 'Laghouat'),
(4, '04', 'Oum El Bouaghi', 'أم البواقي', 'Oum El Bouaghi'),
(5, '05', 'Batna', 'باتنة', 'Batna'),
(6, '06', 'Béjaïa', 'بجاية', 'Bejaia'),
(7, '07', 'Biskra', 'بسكرة', 'Biskra'),
(8, '08', 'Béchar', 'بشار', 'Bechar'),
(9, '09', 'Blida', 'البليدة', 'Blida'),
(10, '10', 'Bouira', 'البويرة', 'Bouira'),
(11, '11', 'Tamanrasset', 'تمنراست', 'Tamanrasset'),
(12, '12', 'Tébessa', 'تبسة', 'Tebessa'),
(13, '13', 'Tlemcen', 'تلمسان', 'Tlemcen'),
(14, '14', 'Tiaret', 'تيارت', 'Tiaret'),
(15, '15', 'Tizi Ouzou', 'تيزي وزو', 'Tizi Ouzou'),
(16, '16', 'Alger', 'الجزائر', 'Algiers'),
(17, '17', 'Djelfa', 'الجلفة', 'Djelfa'),
(18, '18', 'Jijel', 'جيجل', 'Jijel'),
(19, '19', 'Sétif', 'سطيف', 'Setif'),
(20, '20', 'Saïda', 'سعيدة', 'Saida'),
(21, '21', 'Skikda', 'سكيكدة', 'Skikda'),
(22, '22', 'Sidi Bel Abbès', 'سيدي بلعباس', 'Sidi Bel Abbes'),
(23, '23', 'Annaba', 'عنابة', 'Annaba'),
(24, '24', 'Guelma', 'قالمة', 'Guelma'),
(25, '25', 'Constantine', 'قسنطينة', 'Constantine'),
(26, '26', 'Médéa', 'المدية', 'Medea'),
(27, '27', 'Mostaganem', 'مستغانم', 'Mostaganem'),
(28, '28', 'M''Sila', 'المسيلة', 'M''Sila'),
(29, '29', 'Mascara', 'معسكر', 'Mascara'),
(30, '30', 'Ouargla', 'ورقلة', 'Ouargla'),
(31, '31', 'Oran', 'وهران', 'Oran'),
(32, '32', 'El Bayadh', 'البيض', 'El Bayadh'),
(33, '33', 'Illizi', 'إليزي', 'Illizi'),
(34, '34', 'Bordj Bou Arreridj', 'برج بوعريريج', 'Bordj Bou Arreridj'),
(35, '35', 'Boumerdès', 'بومرداس', 'Boumerdes'),
(36, '36', 'El Tarf', 'الطارف', 'El Tarf'),
(37, '37', 'Tindouf', 'تندوف', 'Tindouf'),
(38, '38', 'Tissemsilt', 'تيسمسيلت', 'Tissemsilt'),
(39, '39', 'El Oued', 'الوادي', 'El Oued'),
(40, '40', 'Khenchela', 'خنشلة', 'Khenchela'),
(41, '41', 'Souk Ahras', 'سوق أهراس', 'Souk Ahras'),
(42, '42', 'Tipaza', 'تيبازة', 'Tipaza'),
(43, '43', 'Mila', 'ميلة', 'Mila'),
(44, '44', 'Aïn Defla', 'عين الدفلى', 'Ain Defla'),
(45, '45', 'Naâma', 'النعامة', 'Naama'),
(46, '46', 'Aïn Témouchent', 'عين تموشنت', 'Ain Temouchent'),
(47, '47', 'Ghardaïa', 'غرداية', 'Ghardaia'),
(48, '48', 'Relizane', 'غليزان', 'Relizane'),
(49, '49', 'Timimoun', 'تيميمون', 'Timimoun'),
(50, '50', 'Bordj Badji Mokhtar', 'برج باجي مختار', 'Bordj Badji Mokhtar'),
(51, '51', 'Ouled Djellal', 'أولاد جلال', 'Ouled Djellal'),
(52, '52', 'Béni Abbès', 'بني عباس', 'Beni Abbes'),
(53, '53', 'In Salah', 'عين صالح', 'In Salah'),
(54, '54', 'In Guezzam', 'عين قزام', 'In Guezzam'),
(55, '55', 'Touggourt', 'تقرت', 'Touggourt'),
(56, '56', 'Djanet', 'جانت', 'Djanet'),
(57, '57', 'El M''Ghair', 'المغير', 'El M''Ghair'),
(58, '58', 'El Meniaa', 'المنيعة', 'El Meniaa')
ON CONFLICT (id) DO NOTHING;

-- Insert categories
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

-- Function: increment views
CREATE OR REPLACE FUNCTION increment_listing_views(listing_uuid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE listings SET views_count = views_count + 1 WHERE id = listing_uuid;
END;
$$;

-- Function: auto-create profile
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, created_at, updated_at)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'), NOW(), NOW());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- Function: update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Restaurer le compte admin
DO $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = 'samouaaz@gmail.com';
  
  IF user_id IS NOT NULL THEN
    UPDATE auth.users
    SET encrypted_password = crypt('Admin@2025', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = user_id;
    
    INSERT INTO profiles (id, full_name, role, is_admin, created_at, updated_at)
    VALUES (user_id, 'Sam OUAAZ', 'admin', true, now(), now())
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', is_admin = true, updated_at = now();
  END IF;
END $$;

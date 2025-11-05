/*
  # Système de Panier et Commandes

  ## Description
  Ce système permet aux utilisateurs d'ajouter des produits (listings) à leur panier,
  de passer des commandes avec plusieurs méthodes de paiement, et de suivre l'état
  des commandes jusqu'à la livraison.

  ## Nouvelles Tables

  ### 1. `cart_items` - Articles dans le panier
  - `id` (uuid, primary key)
  - `user_id` (uuid, référence profiles) - Propriétaire du panier
  - `listing_id` (uuid, référence listings) - Produit ajouté
  - `quantity` (integer) - Quantité (default: 1)
  - `added_at` (timestamptz) - Date d'ajout
  
  ### 2. `orders` - Commandes passées
  - `id` (uuid, primary key)
  - `order_number` (text, unique) - Numéro de commande (ex: ORD-20251019-XXXXX)
  - `buyer_id` (uuid, référence profiles) - Acheteur
  - `seller_id` (uuid, référence profiles) - Vendeur
  - `status` (enum) - Statut: pending, confirmed, paid, shipped, delivered, cancelled
  - `payment_method` (enum) - Méthode: card, bank_transfer, reservation
  - `payment_status` (enum) - Statut paiement: pending, paid, refunded
  - `total_amount` (numeric) - Montant total
  - `delivery_address` (jsonb) - Adresse de livraison
  - `notes` (text) - Notes client
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. `order_items` - Articles de la commande
  - `id` (uuid, primary key)
  - `order_id` (uuid, référence orders)
  - `listing_id` (uuid, référence listings)
  - `quantity` (integer)
  - `unit_price` (numeric) - Prix unitaire au moment de la commande
  - `total_price` (numeric) - Prix total = quantity * unit_price

  ### 4. `payments` - Historique des paiements
  - `id` (uuid, primary key)
  - `order_id` (uuid, référence orders)
  - `amount` (numeric)
  - `method` (text) - card, bank_transfer, etc.
  - `status` (enum) - pending, completed, failed
  - `transaction_reference` (text) - Référence externe
  - `paid_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Sécurité (RLS)
  - Users can only see and manage their own cart items
  - Users can see orders where they are buyer or seller
  - Payment information restricted to order participants

  ## Notes Importantes
  - Les réservations (payment_method = 'reservation') ne débitent le client qu'à la livraison
  - Le statut payment_status reste 'pending' jusqu'à la livraison pour les réservations
  - Possibilité d'acheter des produits particuliers ET professionnels
*/

-- Enum types pour les statuts
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
    CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
    CREATE TYPE payment_method_enum AS ENUM ('card', 'bank_transfer', 'reservation');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'refunded');
  END IF;
END $$;

-- Table: cart_items (Panier)
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, listing_id)
);

-- Table: orders (Commandes)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status order_status_enum NOT NULL DEFAULT 'pending',
  payment_method payment_method_enum NOT NULL,
  payment_status payment_status_enum NOT NULL DEFAULT 'pending',
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
  delivery_address jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: order_items (Articles de commande)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(10, 2) NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Table: payments (Historique paiements)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  method text NOT NULL,
  status payment_status_enum NOT NULL DEFAULT 'pending',
  transaction_reference text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_listing_id ON cart_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Function: Générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  order_num text;
  date_part text;
  random_part text;
BEGIN
  date_part := to_char(now(), 'YYYYMMDD');
  random_part := upper(substring(md5(random()::text) from 1 for 8));
  order_num := 'ORD-' || date_part || '-' || random_part;
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function: Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at sur orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies: cart_items
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies: orders
CREATE POLICY "Users can view orders as buyer or seller"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers and sellers can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Policies: order_items
CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "Buyers can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- Policies: payments
CREATE POLICY "Users can view payments for their orders"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "System can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT, INSERT ON order_items TO authenticated;
GRANT SELECT, INSERT ON payments TO authenticated;
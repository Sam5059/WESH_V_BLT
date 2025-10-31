/*
  # Amélioration du système de panier et commandes v2
  
  ## Objectifs
  1. Ajouter un lien conversation_id entre commandes et conversations
  2. Améliorer les statuts de commande pour mieux suivre le workflow
  3. Ajouter des champs pour le paiement progressif (acompte + solde)
  4. Créer des triggers pour auto-créer conversations lors d'une commande
  5. Améliorer les politiques RLS pour vendeurs et acheteurs
*/

-- Ajouter les nouvelles colonnes à la table orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES conversations(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS remaining_amount numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_paid_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS full_payment_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_confirmed_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_confirmed_at timestamptz;

-- Ajouter un index pour la recherche par conversation
CREATE INDEX IF NOT EXISTS idx_orders_conversation_id ON orders(conversation_id);

-- Fonction pour auto-créer une conversation lors d'une commande
CREATE OR REPLACE FUNCTION create_conversation_for_order()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation_id uuid;
  v_listing_id uuid;
BEGIN
  -- Récupérer un listing_id depuis order_items (si déjà créés)
  SELECT listing_id INTO v_listing_id
  FROM order_items
  WHERE order_id = NEW.id
  LIMIT 1;
  
  -- Si on a un listing_id, créer/récupérer la conversation
  IF NEW.conversation_id IS NULL THEN
    -- Vérifier si une conversation existe déjà entre acheteur et vendeur
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE (user_a_id = NEW.buyer_id AND user_b_id = NEW.seller_id)
       OR (user_a_id = NEW.seller_id AND user_b_id = NEW.buyer_id)
    LIMIT 1;
    
    -- Si pas de conversation, en créer une
    IF v_conversation_id IS NULL THEN
      INSERT INTO conversations (user_a_id, user_b_id, listing_id, last_message_at)
      VALUES (NEW.buyer_id, NEW.seller_id, v_listing_id, NOW())
      RETURNING id INTO v_conversation_id;
    END IF;
    
    -- Mettre à jour la commande
    NEW.conversation_id := v_conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour auto-créer conversation
DROP TRIGGER IF EXISTS trigger_create_conversation_for_order ON orders;
CREATE TRIGGER trigger_create_conversation_for_order
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_for_order();

-- Fonction pour calculer deposit_amount et remaining_amount
CREATE OR REPLACE FUNCTION calculate_order_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est une réservation (30% d'acompte)
  IF NEW.payment_method = 'reservation' THEN
    NEW.deposit_amount := ROUND(NEW.total_amount * 0.30, 2);
    NEW.remaining_amount := NEW.total_amount - NEW.deposit_amount;
  ELSE
    -- Paiement complet
    NEW.deposit_amount := NEW.total_amount;
    NEW.remaining_amount := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer les montants
DROP TRIGGER IF EXISTS trigger_calculate_order_amounts ON orders;
CREATE TRIGGER trigger_calculate_order_amounts
  BEFORE INSERT OR UPDATE OF total_amount, payment_method ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_order_amounts();

-- Améliorer la fonction de génération de numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  v_year text;
  v_month text;
  v_sequence int;
  v_order_number text;
BEGIN
  v_year := TO_CHAR(NOW(), 'YY');
  v_month := TO_CHAR(NOW(), 'MM');
  
  -- Compter les commandes du mois en cours
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequence
  FROM orders
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW());
  
  -- Format: CMD-YYMM-0001
  v_order_number := 'CMD-' || v_year || v_month || '-' || LPAD(v_sequence::text, 4, '0');
  
  RETURN v_order_number;
END;
$$ LANGUAGE plpgsql;

-- Améliorer les messages pour inclure un type
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text';
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

-- Fonction pour envoyer un message de notification automatique
CREATE OR REPLACE FUNCTION send_order_notification(
  p_order_id uuid,
  p_message text,
  p_sender_id uuid DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_conversation_id uuid;
  v_system_sender uuid;
BEGIN
  -- Récupérer la conversation_id de la commande
  SELECT conversation_id INTO v_conversation_id
  FROM orders
  WHERE id = p_order_id;
  
  IF v_conversation_id IS NULL THEN
    RAISE EXCEPTION 'No conversation found for order %', p_order_id;
  END IF;
  
  -- Si pas de sender spécifié, utiliser le buyer
  IF p_sender_id IS NULL THEN
    SELECT buyer_id INTO v_system_sender
    FROM orders
    WHERE id = p_order_id;
  ELSE
    v_system_sender := p_sender_id;
  END IF;
  
  -- Insérer le message
  INSERT INTO messages (conversation_id, sender_id, content, message_type)
  VALUES (v_conversation_id, v_system_sender, p_message, 'system');
  
  -- Mettre à jour last_message_at
  UPDATE conversations
  SET last_message_at = NOW()
  WHERE id = v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION send_order_notification TO authenticated;
GRANT EXECUTE ON FUNCTION generate_order_number TO authenticated;

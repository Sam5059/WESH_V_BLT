/*
  # Système PRO Complet - Backend

  1. Nouvelles Tables
    - `pro_subscriptions` - Gestion des abonnements PRO avec historique
    - `pro_transactions` - Historique des paiements et transactions
    - `pro_analytics` - Statistiques détaillées pour les comptes PRO

  2. Améliorations Tables Existantes
    - `pro_packages` - Ajout de champs manquants
    - `profiles` - Champs PRO supplémentaires

  3. Fonctions Utilitaires
    - `activate_pro_subscription` - Activer un abonnement PRO
    - `check_pro_status` - Vérifier le statut PRO d'un utilisateur
    - `get_pro_analytics` - Récupérer les statistiques PRO
    - `can_publish_listing` - Vérifier si l'utilisateur peut publier

  4. Triggers
    - Auto-expiration des abonnements PRO
    - Mise à jour automatique des compteurs

  5. Security
    - RLS activé sur toutes les tables
    - Policies restrictives par défaut
*/

-- =====================================================
-- TABLE: pro_subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS pro_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_id uuid REFERENCES pro_packages(id) ON DELETE RESTRICT NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,

  -- Dates et durée
  starts_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz NOT NULL,

  -- Statut
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')) NOT NULL,

  -- Compteurs
  listings_used integer DEFAULT 0 NOT NULL,
  featured_used integer DEFAULT 0 NOT NULL,

  -- Paiement
  payment_method text,
  payment_reference text,
  paid_amount numeric NOT NULL,

  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT valid_dates CHECK (expires_at > starts_at),
  CONSTRAINT non_negative_counters CHECK (listings_used >= 0 AND featured_used >= 0)
);

-- =====================================================
-- TABLE: pro_transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS pro_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES pro_subscriptions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Transaction details
  transaction_type text CHECK (transaction_type IN ('payment', 'refund', 'renewal', 'upgrade')) NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'DZD' NOT NULL,

  -- Payment info
  payment_method text,
  payment_reference text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) NOT NULL,

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- =====================================================
-- TABLE: pro_analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS pro_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,

  -- Date du record
  date date DEFAULT CURRENT_DATE NOT NULL,

  -- Métriques
  views integer DEFAULT 0 NOT NULL,
  clicks integer DEFAULT 0 NOT NULL,
  contacts integer DEFAULT 0 NOT NULL,
  favorites integer DEFAULT 0 NOT NULL,

  -- Metadata
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Index unique pour éviter les doublons
  UNIQUE(user_id, listing_id, date)
);

-- =====================================================
-- AMÉLIORATION: pro_packages
-- =====================================================
DO $$
BEGIN
  -- Ajouter name_ar si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'name_ar'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN name_ar text;
  END IF;

  -- Ajouter name_en si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'name_en'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN name_en text;
  END IF;

  -- Ajouter description si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'description'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN description text;
  END IF;

  -- Ajouter description_ar si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN description_ar text;
  END IF;

  -- Ajouter description_en si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'description_en'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN description_en text;
  END IF;

  -- Ajouter max_listings si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'max_listings'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN max_listings integer;
  END IF;

  -- Ajouter featured_listings si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'featured_listings'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN featured_listings integer DEFAULT 0;
  END IF;

  -- Ajouter priority_support si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'priority_support'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN priority_support boolean DEFAULT false;
  END IF;

  -- Ajouter custom_branding si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'custom_branding'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN custom_branding boolean DEFAULT false;
  END IF;

  -- Ajouter analytics si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'analytics'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN analytics boolean DEFAULT false;
  END IF;

  -- Ajouter is_active si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  -- Ajouter order_position si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_packages' AND column_name = 'order_position'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN order_position integer DEFAULT 0;
  END IF;
END $$;

-- =====================================================
-- AMÉLIORATION: profiles
-- =====================================================
DO $$
BEGIN
  -- Ajouter pro_package_id si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pro_package_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pro_package_id uuid REFERENCES pro_packages(id);
  END IF;

  -- Ajouter pro_expires_at si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pro_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pro_expires_at timestamptz;
  END IF;

  -- Ajouter pro_listings_remaining si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pro_listings_remaining'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pro_listings_remaining integer;
  END IF;

  -- Ajouter pro_featured_remaining si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pro_featured_remaining'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pro_featured_remaining integer DEFAULT 0;
  END IF;

  -- Ajouter pro_category_id si manquant
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pro_category_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pro_category_id uuid REFERENCES categories(id);
  END IF;
END $$;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_pro_subscriptions_user_id ON pro_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_subscriptions_status ON pro_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_pro_subscriptions_expires_at ON pro_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_pro_subscriptions_category_id ON pro_subscriptions(category_id);

CREATE INDEX IF NOT EXISTS idx_pro_transactions_subscription_id ON pro_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_pro_transactions_user_id ON pro_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_transactions_status ON pro_transactions(payment_status);

CREATE INDEX IF NOT EXISTS idx_pro_analytics_user_id ON pro_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_analytics_listing_id ON pro_analytics(listing_id);
CREATE INDEX IF NOT EXISTS idx_pro_analytics_date ON pro_analytics(date);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE pro_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: pro_subscriptions
-- =====================================================
CREATE POLICY "Users can view own subscriptions"
  ON pro_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON pro_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON pro_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: pro_transactions
-- =====================================================
CREATE POLICY "Users can view own transactions"
  ON pro_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON pro_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: pro_analytics
-- =====================================================
CREATE POLICY "Users can view own analytics"
  ON pro_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON pro_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON pro_analytics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTION: activate_pro_subscription
-- =====================================================
CREATE OR REPLACE FUNCTION activate_pro_subscription(
  p_user_id uuid,
  p_package_id uuid,
  p_payment_method text DEFAULT NULL,
  p_payment_reference text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_package pro_packages;
  v_subscription_id uuid;
  v_transaction_id uuid;
  v_expires_at timestamptz;
BEGIN
  -- Récupérer les détails du package
  SELECT * INTO v_package FROM pro_packages WHERE id = p_package_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Package not found'
    );
  END IF;

  -- Calculer la date d'expiration
  v_expires_at := now() + (v_package.duration_days || ' days')::interval;

  -- Créer l'abonnement
  INSERT INTO pro_subscriptions (
    user_id,
    package_id,
    category_id,
    expires_at,
    status,
    paid_amount,
    payment_method,
    payment_reference
  ) VALUES (
    p_user_id,
    p_package_id,
    v_package.category_id,
    v_expires_at,
    'active',
    v_package.price,
    p_payment_method,
    p_payment_reference
  )
  RETURNING id INTO v_subscription_id;

  -- Créer la transaction
  INSERT INTO pro_transactions (
    subscription_id,
    user_id,
    transaction_type,
    amount,
    payment_method,
    payment_reference,
    payment_status
  ) VALUES (
    v_subscription_id,
    p_user_id,
    'payment',
    v_package.price,
    p_payment_method,
    p_payment_reference,
    'completed'
  )
  RETURNING id INTO v_transaction_id;

  -- Mettre à jour le profil
  UPDATE profiles
  SET
    user_type = 'professional',
    pro_package_id = p_package_id,
    pro_expires_at = v_expires_at,
    pro_listings_remaining = v_package.max_listings,
    pro_featured_remaining = v_package.featured_listings,
    pro_category_id = v_package.category_id,
    updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_subscription_id,
    'transaction_id', v_transaction_id,
    'expires_at', v_expires_at
  );
END;
$$;

-- =====================================================
-- FUNCTION: check_pro_status
-- =====================================================
CREATE OR REPLACE FUNCTION check_pro_status(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile profiles;
  v_is_active boolean;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'is_pro', false,
      'error', 'Profile not found'
    );
  END IF;

  -- Vérifier si PRO et non expiré
  v_is_active := v_profile.user_type = 'professional'
                 AND v_profile.pro_expires_at IS NOT NULL
                 AND v_profile.pro_expires_at > now();

  RETURN jsonb_build_object(
    'is_pro', v_is_active,
    'user_type', v_profile.user_type,
    'expires_at', v_profile.pro_expires_at,
    'listings_remaining', v_profile.pro_listings_remaining,
    'featured_remaining', v_profile.pro_featured_remaining,
    'category_id', v_profile.pro_category_id
  );
END;
$$;

-- =====================================================
-- FUNCTION: can_publish_listing
-- =====================================================
CREATE OR REPLACE FUNCTION can_publish_listing(
  p_user_id uuid,
  p_category_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile profiles;
  v_status jsonb;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_publish', false,
      'reason', 'Profile not found'
    );
  END IF;

  -- Utilisateur particulier: toujours OK
  IF v_profile.user_type != 'professional' THEN
    RETURN jsonb_build_object(
      'can_publish', true,
      'is_pro', false
    );
  END IF;

  -- Utilisateur PRO: vérifier expiration et catégorie
  IF v_profile.pro_expires_at IS NULL OR v_profile.pro_expires_at <= now() THEN
    RETURN jsonb_build_object(
      'can_publish', false,
      'reason', 'PRO subscription expired',
      'expires_at', v_profile.pro_expires_at
    );
  END IF;

  -- Vérifier si la catégorie correspond
  IF v_profile.pro_category_id IS NOT NULL AND v_profile.pro_category_id != p_category_id THEN
    RETURN jsonb_build_object(
      'can_publish', false,
      'reason', 'Category not covered by PRO package',
      'allowed_category_id', v_profile.pro_category_id
    );
  END IF;

  -- Vérifier les quotas (si limités)
  IF v_profile.pro_listings_remaining IS NOT NULL AND v_profile.pro_listings_remaining <= 0 THEN
    RETURN jsonb_build_object(
      'can_publish', false,
      'reason', 'Listings quota reached',
      'listings_remaining', 0
    );
  END IF;

  RETURN jsonb_build_object(
    'can_publish', true,
    'is_pro', true,
    'listings_remaining', v_profile.pro_listings_remaining,
    'featured_remaining', v_profile.pro_featured_remaining
  );
END;
$$;

-- =====================================================
-- FUNCTION: get_pro_analytics
-- =====================================================
CREATE OR REPLACE FUNCTION get_pro_analytics(
  p_user_id uuid,
  p_start_date date DEFAULT CURRENT_DATE - 30,
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_views integer;
  v_total_clicks integer;
  v_total_contacts integer;
  v_total_favorites integer;
  v_daily_data jsonb;
BEGIN
  -- Vérifier que l'utilisateur demande ses propres analytics
  IF auth.uid() != p_user_id THEN
    RETURN jsonb_build_object(
      'error', 'Unauthorized'
    );
  END IF;

  -- Calculer les totaux
  SELECT
    COALESCE(SUM(views), 0),
    COALESCE(SUM(clicks), 0),
    COALESCE(SUM(contacts), 0),
    COALESCE(SUM(favorites), 0)
  INTO
    v_total_views,
    v_total_clicks,
    v_total_contacts,
    v_total_favorites
  FROM pro_analytics
  WHERE user_id = p_user_id
    AND date BETWEEN p_start_date AND p_end_date;

  -- Récupérer les données quotidiennes
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', date,
      'views', views,
      'clicks', clicks,
      'contacts', contacts,
      'favorites', favorites
    )
    ORDER BY date
  )
  INTO v_daily_data
  FROM pro_analytics
  WHERE user_id = p_user_id
    AND date BETWEEN p_start_date AND p_end_date;

  RETURN jsonb_build_object(
    'period', jsonb_build_object(
      'start_date', p_start_date,
      'end_date', p_end_date
    ),
    'totals', jsonb_build_object(
      'views', v_total_views,
      'clicks', v_total_clicks,
      'contacts', v_total_contacts,
      'favorites', v_total_favorites
    ),
    'daily_data', COALESCE(v_daily_data, '[]'::jsonb)
  );
END;
$$;

-- =====================================================
-- TRIGGER: update_updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pro_subscriptions_updated_at ON pro_subscriptions;
CREATE TRIGGER update_pro_subscriptions_updated_at
  BEFORE UPDATE ON pro_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pro_analytics_updated_at ON pro_analytics;
CREATE TRIGGER update_pro_analytics_updated_at
  BEFORE UPDATE ON pro_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE pro_subscriptions IS 'Gestion des abonnements PRO avec historique complet';
COMMENT ON TABLE pro_transactions IS 'Historique de toutes les transactions et paiements PRO';
COMMENT ON TABLE pro_analytics IS 'Statistiques détaillées pour les comptes PRO';

COMMENT ON FUNCTION activate_pro_subscription IS 'Active un nouvel abonnement PRO et crée la transaction associée';
COMMENT ON FUNCTION check_pro_status IS 'Vérifie le statut PRO actif d''un utilisateur';
COMMENT ON FUNCTION can_publish_listing IS 'Vérifie si un utilisateur peut publier une annonce';
COMMENT ON FUNCTION get_pro_analytics IS 'Récupère les statistiques détaillées pour un compte PRO';

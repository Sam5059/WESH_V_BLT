export interface Profile {
  id: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  wilaya?: string;
  commune?: string;
  is_verified: boolean;
  user_type: 'individual' | 'professional';
  has_active_pro_package?: boolean;
  pro_package_expires_at?: string;
  pro_package_type?: 'basic' | 'standard' | 'premium';
  role?: 'user' | 'admin' | 'moderator';
  is_banned?: boolean;
  banned_reason?: string;
  banned_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  slug: string;
  parent_id?: string;
  icon?: string;
  order_position: number;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  is_negotiable: boolean;
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  listing_type: 'sale' | 'purchase' | 'rent';
  wilaya: string;
  commune: string;
  images: string[];
  status: 'active' | 'sold' | 'expired' | 'suspended';
  is_featured: boolean;
  featured_until?: string;
  views_count: number;
  attributes: Record<string, any>;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  categories?: Category;
}

export interface VehicleAttributes {
  marque?: string;
  modele?: string;
  annee?: number;
  kilometrage?: number;
  carburant?: 'Essence' | 'Diesel' | 'Électrique' | 'Hybride' | 'GPL';
  boite?: 'Manuelle' | 'Automatique';
  puissance?: string;
  couleur?: string;
}

export interface ImmobilierAttributes {
  surface?: number;
  chambres?: number;
  sdb?: number;
  etage?: number;
  type?: 'Appartement' | 'Maison' | 'Villa' | 'Studio' | 'Duplex';
  meuble?: boolean;
}

export interface ElectroniqueAttributes {
  marque?: string;
  modele?: string;
  stockage?: string;
  ram?: string;
  etat_batterie?: string;
  garantie?: boolean;
}

export interface ModeAttributes {
  taille?: string;
  couleur?: string;
  matiere?: string;
  marque?: string;
}

export interface EmploiAttributes {
  contrat?: string;
  experience?: string;
  secteur?: string;
  niveau_etude?: string;
  salaire_min?: number;
  salaire_max?: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listings?: Listing;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message?: string;
  last_message_at: string;
  unread_count_buyer: number;
  unread_count_seller: number;
  created_at: string;
  updated_at: string;
  listings?: Listing;
  buyer?: Profile;
  seller?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Wilaya {
  id: number;
  code: string;
  name: string;
  name_ar: string;
  name_en?: string;
}

export interface Brand {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  category_type: string;
  created_at: string;
}

export interface Model {
  id: string;
  brand_id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  created_at: string;
}

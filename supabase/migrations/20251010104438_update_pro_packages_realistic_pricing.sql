/*
  # Mise à jour des forfaits PRO avec prix réalistes en DZD
  
  1. Modifications
    - Suppression des anciens forfaits
    - Création de 3 nouveaux forfaits basés sur les standards du marché
    - Prix convertis en DZD (taux ~270 DZD/USD)
    
  2. Nouveaux Forfaits
    - **Pack Mensuel Illimité** (69.99 USD → 18,900 DZD)
      - Annonces illimitées avec auto-refresh
      
    - **Pack 5 Annonces** (54.99 USD → 14,850 DZD)
      - 5 annonces sur 3 mois
      
    - **Pack 20 Annonces** (174.99 USD → 47,250 DZD)
      - 20 annonces sur 1 mois avec analytics
*/

-- Supprimer les anciens forfaits
DELETE FROM pro_packages;

-- Pack 1: Mensuel Illimité (Most Popular - comme l'original)
INSERT INTO pro_packages (
  name, 
  name_ar, 
  name_en,
  description,
  description_ar,
  description_en,
  price,
  duration_days,
  max_listings,
  featured_listings,
  priority_support,
  custom_branding,
  analytics,
  is_active,
  order_position
) VALUES 
(
  'Pack Mensuel Illimité',
  'باقة شهرية غير محدودة',
  'Monthly Unlimited Plan',
  'Annonces illimitées avec rafraîchissement automatique et gestion d''inventaire',
  'منشورات غير محدودة مع تحديث تلقائي وإدارة المخزون',
  'Unlimited listings with auto-refresh and inventory management',
  18900.00,
  30,
  NULL,
  10,
  true,
  true,
  true,
  true,
  1
);

-- Pack 2: 5 Annonces (Économique)
INSERT INTO pro_packages (
  name, 
  name_ar, 
  name_en,
  description,
  description_ar,
  description_en,
  price,
  duration_days,
  max_listings,
  featured_listings,
  priority_support,
  custom_branding,
  analytics,
  is_active,
  order_position
) VALUES 
(
  'Pack 5 Annonces',
  'باقة 5 إعلانات',
  '5 Ads Pack',
  '5 annonces valables 3 mois - Idéal pour particuliers',
  '5 إعلانات صالحة لمدة 3 أشهر - مثالي للأفراد',
  '5 ads valid for 3 months - Perfect for individuals',
  14850.00,
  90,
  5,
  2,
  false,
  false,
  false,
  true,
  2
);

-- Pack 3: 20 Annonces (Pour vendeurs actifs)
INSERT INTO pro_packages (
  name, 
  name_ar, 
  name_en,
  description,
  description_ar,
  description_en,
  price,
  duration_days,
  max_listings,
  featured_listings,
  priority_support,
  custom_branding,
  analytics,
  is_active,
  order_position
) VALUES 
(
  'Pack 20 Annonces',
  'باقة 20 إعلان',
  '20 Ads Pack',
  '20 annonces sur 1 mois avec support prioritaire et analytics',
  '20 إعلان خلال شهر واحد مع دعم ذو أولوية وتحليلات',
  '20 ads over 1 month with priority support and analytics',
  47250.00,
  30,
  20,
  5,
  true,
  false,
  true,
  true,
  3
);

export type PurchaseType = 'cart' | 'reservation' | 'contact';

const RESERVATION_CATEGORIES = [
  'vehicules',
  'immobilier',
  'location-immobiliere',
  'location-vacances',
  'location-vehicules',
  'location-equipements',
  'services',
  'emploi-services',
  'entreprises-vendre',
  'materiel-professionnel'
];

const CART_CATEGORIES = [
  'electronique',
  'mode-beaute',
  'maison-jardin',
  'animaux',
  'bebe-enfants',
  'loisirs-divertissement'
];

export function getListingPurchaseType(
  categorySlug: string,
  parentCategorySlug?: string | null
): PurchaseType {
  const slugToCheck = parentCategorySlug || categorySlug;

  if (RESERVATION_CATEGORIES.includes(slugToCheck)) {
    return 'reservation';
  }

  if (CART_CATEGORIES.includes(slugToCheck)) {
    return 'cart';
  }

  return 'contact';
}

export function canAddToCart(
  categorySlug: string,
  parentCategorySlug?: string | null
): boolean {
  return getListingPurchaseType(categorySlug, parentCategorySlug) === 'cart';
}

export function requiresReservation(
  categorySlug: string,
  parentCategorySlug?: string | null
): boolean {
  return getListingPurchaseType(categorySlug, parentCategorySlug) === 'reservation';
}

export function getPurchaseButtonText(
  purchaseType: PurchaseType,
  language: 'fr' | 'en' | 'ar' = 'fr'
): string {
  const texts = {
    cart: {
      fr: 'Ajouter au panier',
      en: 'Add to cart',
      ar: 'أضف إلى السلة'
    },
    reservation: {
      fr: 'Réserver',
      en: 'Reserve',
      ar: 'احجز'
    },
    contact: {
      fr: 'Contacter',
      en: 'Contact',
      ar: 'اتصل'
    }
  };

  return texts[purchaseType][language];
}

export function getPurchaseButtonIcon(purchaseType: PurchaseType): string {
  const icons = {
    cart: '🛒',
    reservation: '📅',
    contact: '💬'
  };

  return icons[purchaseType];
}

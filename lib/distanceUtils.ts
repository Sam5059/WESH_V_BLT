import { supabase } from './supabase';

interface CommuneCoordinates {
  latitude: number;
  longitude: number;
}

// Cache pour les coordonnées des communes
const communeCoordinatesCache: Map<string, CommuneCoordinates | null> = new Map();

/**
 * Calcule la distance entre deux points GPS en utilisant la formule de Haversine
 * @param lat1 Latitude du point 1
 * @param lon1 Longitude du point 1
 * @param lat2 Latitude du point 2
 * @param lon2 Longitude du point 2
 * @returns Distance en kilomètres
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Récupère les coordonnées GPS d'une commune depuis la base de données
 * @param communeName Nom de la commune
 * @returns Coordonnées GPS ou null si non trouvées
 */
export async function getCommuneCoordinates(
  communeName: string
): Promise<CommuneCoordinates | null> {
  if (!communeName) return null;

  // Vérifier le cache
  const cached = communeCoordinatesCache.get(communeName.toLowerCase());
  if (cached !== undefined) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from('communes')
      .select('latitude, longitude')
      .ilike('name', communeName)
      .single();

    if (error || !data || !data.latitude || !data.longitude) {
      communeCoordinatesCache.set(communeName.toLowerCase(), null);
      return null;
    }

    const coords: CommuneCoordinates = {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    };

    communeCoordinatesCache.set(communeName.toLowerCase(), coords);
    return coords;
  } catch (error) {
    console.error('Error fetching commune coordinates:', error);
    communeCoordinatesCache.set(communeName.toLowerCase(), null);
    return null;
  }
}

/**
 * Calcule la distance entre deux communes
 * @param commune1 Nom de la première commune
 * @param commune2 Nom de la deuxième commune
 * @returns Distance en kilomètres ou null si impossible à calculer
 */
export async function calculateCommuneDistance(
  commune1: string,
  commune2: string
): Promise<number | null> {
  if (!commune1 || !commune2) return null;

  const [coords1, coords2] = await Promise.all([
    getCommuneCoordinates(commune1),
    getCommuneCoordinates(commune2),
  ]);

  if (!coords1 || !coords2) return null;

  return calculateDistanceKm(
    coords1.latitude,
    coords1.longitude,
    coords2.latitude,
    coords2.longitude
  );
}

/**
 * Enrichit une liste d'annonces avec les distances par rapport à une commune de référence
 * @param listings Liste des annonces
 * @param userCommune Commune de l'utilisateur
 * @returns Annonces enrichies avec la propriété distance
 */
export async function enrichListingsWithDistance<T extends { commune?: string }>(
  listings: T[],
  userCommune: string | null | undefined
): Promise<Array<T & { distance?: number | null }>> {
  if (!userCommune || !listings.length) {
    return listings.map((listing) => ({ ...listing, distance: null }));
  }

  // Récupérer les coordonnées de la commune de l'utilisateur
  const userCoords = await getCommuneCoordinates(userCommune);
  if (!userCoords) {
    return listings.map((listing) => ({ ...listing, distance: null }));
  }

  // Calculer la distance pour chaque annonce
  const enrichedListings = await Promise.all(
    listings.map(async (listing) => {
      if (!listing.commune) {
        return { ...listing, distance: null };
      }

      const listingCoords = await getCommuneCoordinates(listing.commune);
      if (!listingCoords) {
        return { ...listing, distance: null };
      }

      const distance = calculateDistanceKm(
        userCoords.latitude,
        userCoords.longitude,
        listingCoords.latitude,
        listingCoords.longitude
      );

      return { ...listing, distance };
    })
  );

  return enrichedListings;
}

/**
 * Formate la distance pour l'affichage
 * @param distance Distance en kilomètres
 * @param language Langue ('fr', 'en', 'ar')
 * @returns Distance formatée
 */
export function formatDistance(
  distance: number | null | undefined,
  language: 'fr' | 'en' | 'ar' = 'fr'
): string | null {
  if (distance === null || distance === undefined) return null;

  if (distance < 1) {
    return language === 'ar'
      ? '< ١ كم'
      : language === 'en'
        ? '< 1 km'
        : '< 1 km';
  }

  if (distance < 10) {
    const formatted = distance.toFixed(1);
    return language === 'ar' ? `${formatted} كم` : `${formatted} km`;
  }

  const rounded = Math.round(distance);
  return language === 'ar' ? `${rounded} كم` : `${rounded} km`;
}

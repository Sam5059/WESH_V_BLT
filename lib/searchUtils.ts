/**
 * Utilitaires de Recherche
 *
 * Fonctions réutilisables pour effectuer des recherches d'annonces
 * avec scoring de pertinence et filtres avancés.
 */

import { supabase } from './supabase';
import { Listing } from '@/types/database';

export interface SearchFilters {
  searchTerm?: string;
  categoryId?: string;
  subcategoryId?: string;
  wilaya?: string;
  commune?: string;
  minPrice?: number;
  maxPrice?: number;
  listingType?: 'sale' | 'purchase' | 'rent';
  brandId?: string;
  modelId?: string;
}

export interface SearchResult extends Listing {
  relevance?: number;
}

/**
 * Recherche intelligente d'annonces avec scoring de pertinence
 *
 * @param filters - Filtres de recherche
 * @returns Liste d'annonces triées par pertinence
 */
export async function searchListings(filters: SearchFilters): Promise<SearchResult[]> {
  console.log('[searchUtils] Starting search with filters:', filters);

  // Si un terme de recherche est présent, utiliser la fonction RPC améliorée
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const listingTypeMap: { [key: string]: string } = {
      'sale': 'sell',
      'purchase': 'offer',
      'rent': 'rent'
    };

    const { data, error } = await supabase.rpc('search_listings', {
      search_term: filters.searchTerm.trim(),
      category_filter: filters.categoryId || null,
      subcategory_filter: filters.subcategoryId || null,
      wilaya_filter: filters.wilaya || null,
      commune_filter: filters.commune || null,
      min_price_filter: filters.minPrice || null,
      max_price_filter: filters.maxPrice || null,
      listing_type_filter: filters.listingType ? listingTypeMap[filters.listingType] : null
    });

    if (error) {
      console.error('[searchUtils] Error:', error);
      throw error;
    }

    console.log('[searchUtils] Found', data?.length || 0, 'results');
    return data || [];
  }

  // Sinon, utiliser la recherche standard avec filtres
  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active');

  // Appliquer les filtres
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters.wilaya) {
    query = query.eq('wilaya', filters.wilaya);
  }

  if (filters.commune) {
    query = query.eq('commune', filters.commune);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters.listingType) {
    const listingTypeMap: { [key: string]: string } = {
      'sale': 'sell',
      'purchase': 'offer',
      'rent': 'rent'
    };
    query = query.eq('listing_type', listingTypeMap[filters.listingType]);
  }

  if (filters.brandId) {
    query = query.eq('attributes->>brand_id', filters.brandId);
  }

  if (filters.modelId) {
    query = query.eq('attributes->>model_id', filters.modelId);
  }

  // Trier par date de création (plus récent en premier)
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('[searchUtils] Error:', error);
    throw error;
  }

  console.log('[searchUtils] Found', data?.length || 0, 'results');
  return data || [];
}

/**
 * Recherche rapide par terme uniquement (pour autocomplete, suggestions)
 *
 * @param searchTerm - Terme de recherche
 * @param limit - Nombre maximum de résultats (défaut: 10)
 * @returns Liste d'annonces limitée
 */
export async function quickSearch(searchTerm: string, limit: number = 10): Promise<SearchResult[]> {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return [];
  }

  const { data, error } = await supabase.rpc('search_listings', {
    search_term: searchTerm.trim(),
    category_filter: null,
    subcategory_filter: null,
    wilaya_filter: null,
    commune_filter: null,
    min_price_filter: null,
    max_price_filter: null,
    listing_type_filter: null
  });

  if (error) {
    console.error('[searchUtils] Quick search error:', error);
    return [];
  }

  return (data || []).slice(0, limit);
}

/**
 * Recherche par catégorie avec terme optionnel
 *
 * @param categoryId - ID de la catégorie
 * @param searchTerm - Terme de recherche optionnel
 * @returns Liste d'annonces de la catégorie
 */
export async function searchByCategory(
  categoryId: string,
  searchTerm?: string
): Promise<SearchResult[]> {
  return searchListings({
    categoryId,
    searchTerm
  });
}

/**
 * Recherche par localisation avec terme optionnel
 *
 * @param wilaya - Wilaya
 * @param searchTerm - Terme de recherche optionnel
 * @param commune - Commune optionnelle
 * @returns Liste d'annonces de la localisation
 */
export async function searchByLocation(
  wilaya: string,
  searchTerm?: string,
  commune?: string
): Promise<SearchResult[]> {
  return searchListings({
    wilaya,
    commune,
    searchTerm
  });
}

/**
 * Recherche par fourchette de prix
 *
 * @param minPrice - Prix minimum
 * @param maxPrice - Prix maximum
 * @param searchTerm - Terme de recherche optionnel
 * @returns Liste d'annonces dans la fourchette de prix
 */
export async function searchByPriceRange(
  minPrice: number,
  maxPrice: number,
  searchTerm?: string
): Promise<SearchResult[]> {
  return searchListings({
    minPrice,
    maxPrice,
    searchTerm
  });
}

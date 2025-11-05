import { supabase } from './supabase';

export interface SaveSearchParams {
  userId: string;
  searchQuery: string;
  categoryId?: string | null;
  filters?: any;
  resultsCount?: number;
}

export async function saveSearchHistory({
  userId,
  searchQuery,
  categoryId,
  filters = {},
  resultsCount = 0,
}: SaveSearchParams) {
  if (!userId || !searchQuery.trim()) return;

  try {
    const { error } = await supabase.from('search_history').insert({
      user_id: userId,
      search_query: searchQuery.trim(),
      category_id: categoryId || null,
      filters: filters || {},
      results_count: resultsCount,
    });

    if (error) {
      console.error('Error saving search history:', error);
    }
  } catch (error) {
    console.error('Error saving search history:', error);
  }
}

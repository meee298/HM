
import { Movie, Episode } from './types';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration using the "LOGIN" project details
const SUPABASE_URL = 'https://qhzhufmsabzevxsemhmq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Z-SXj2vOxDulgnwmSB7hgQ_aeWUL7JB';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const GENRES = [
  'أكشن', 'دراما', 'كوميديا', 'رعب', 'خيال علمي', 'رومانسي', 'وثائقي', 
  'عائلي', 'غموض', 'أنيمي', 'جريمة', 'تاريخي', 'حرب', 'كوري', 'تركي', 
  'فانتازيا', 'مغامرة', 'مدرسي', 'شبابي'
];

/**
 * MOVIE & USER SERVICE - Connected to Supabase
 */
export const MovieService = {
  // Content management
  async getAll(): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('addedAt', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Movie | undefined> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return data;
  },

  async save(movie: Movie): Promise<void> {
    const { error } = await supabase.from('movies').upsert({
        ...movie,
        genre: movie.genre || [],
        episodes: movie.episodes || [],
        cast: movie.cast || [],
        additionalServers: movie.additionalServers || []
    });
    if (error) throw new Error(error.message);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('movies').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // User Data Management (Watchlist)
  async getWatchlist(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('watchlist')
      .eq('id', user.id)
      .single();

    if (error || !data) return [];
    return data.watchlist || [];
  },

  async getWatchlistMovies(): Promise<Movie[]> {
    const ids = await this.getWatchlist();
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .in('id', ids);

    if (error) return [];
    return data || [];
  },

  async toggleWatchlist(movieId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');

    const currentList = await this.getWatchlist();
    const isInList = currentList.includes(movieId);
    
    const newList = isInList 
      ? currentList.filter(id => id !== movieId)
      : [...currentList, movieId];

    const { error } = await supabase
      .from('profiles')
      .update({ watchlist: newList, updatedAt: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw new Error(error.message);
    return !isInList; 
  }
};

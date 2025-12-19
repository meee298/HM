
export type AgeRating = 'All' | '13+' | '18+';

export interface Episode {
  id: string;
  season: number;
  number: number;
  title: string;
  embedCode: string;
  additionalServers?: string[];
}

export interface Movie {
  id: string;
  type: 'movie' | 'series';
  title: string;
  description: string;
  embedCode: string;
  iframeSrc?: string;
  thumbnailUrl: string;
  backdropUrl: string;
  rating: AgeRating;
  genre: string[];
  year: number;
  releaseDate?: string;
  duration: string;
  director: string;
  cast: string[];
  views: number;
  addedAt: string;
  isFeatured: boolean;
  isTrending: boolean;
  quality: 'HD' | 'FHD' | '4K' | 'CAM';
  hasAdultContent?: boolean;
  totalSeasons?: number;
  totalEpisodes?: number;
  episodes?: Episode[];
  additionalServers?: string[];
  tmdbId?: string; // New field to store TMDB ID in database
}

export interface CarouselSection {
  title: string;
  filter: (movie: Movie) => boolean;
  type: 'grid' | 'scroll' | 'hero';
}

export interface UserPreferences {
  watchlist: string[];
  isAgeVerified: boolean;
  parentalPin?: string;
}

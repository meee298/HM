
export type AgeRating = 'All' | '13+' | '18+';

export interface Episode {
  id: string;
  season: number;
  number: number;
  title: string;
  embedCode: string;
  additionalServers?: string[]; // Server 2, Server 3, etc.
}

export interface Movie {
  id: string;
  type: 'movie' | 'series'; // New field to distinguish content
  title: string; // English
  description: string; // Arabic
  embedCode: string; // Main embed or Trailer for series
  iframeSrc?: string; // Extracted source
  thumbnailUrl: string; // Vertical Poster
  backdropUrl: string; // Horizontal Backdrop
  rating: AgeRating;
  genre: string[];
  year: number;
  duration: string;
  director: string;
  cast: string[];
  views: number;
  addedAt: string;
  isFeatured: boolean;
  quality: 'HD' | 'FHD' | '4K' | 'CAM';
  episodes?: Episode[]; // Optional list for series
  additionalServers?: string[]; // Server 2, Server 3, etc.
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
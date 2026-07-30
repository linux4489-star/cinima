export type Genre = 
  | 'All'
  | 'Action'
  | 'Sci-Fi'
  | 'Drama'
  | 'Comedy'
  | 'Horror'
  | 'Romance'
  | 'Thriller'
  | 'Animation'
  | 'Adventure'
  | 'Documentary';

export interface Review {
  id: string;
  userName: string;
  userEmail: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: Genre;
  releaseYear: number;
  duration: string; // e.g. "2h 15m"
  durationSeconds?: number;
  rating: number; // 1 to 10 scale or 1 to 5
  contentRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'TV-MA';
  director: string;
  cast: string[];
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string;
  trailerUrl?: string;
  tags: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  uploadedBy: string; // Email address, e.g. "linux4489@gmail.com"
  createdAt: string;
  viewsCount: number;
}

export interface UserSession {
  email: string;
  isAdmin: boolean;
  name: string;
}

export interface WatchProgress {
  movieId: string;
  currentTime: number;
  duration: number;
  lastWatched: string;
}

export type SortOption = 'latest' | 'rating' | 'popular' | 'title';

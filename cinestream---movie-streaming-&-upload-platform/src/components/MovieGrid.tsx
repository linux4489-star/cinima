import React from 'react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { Film, AlertCircle } from 'lucide-react';

interface MovieGridProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  watchlist: string[];
  onToggleWatchlist: (movieId: string) => void;
  currentUserEmail: string;
  onDeleteMovie?: (movieId: string) => void;
  onEditMovie?: (movie: Movie) => void;
  watchProgressMap?: Record<string, number>;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  title,
  subtitle,
  movies,
  onPlay,
  onOpenDetails,
  watchlist,
  onToggleWatchlist,
  currentUserEmail,
  onDeleteMovie,
  onEditMovie,
  watchProgressMap = {},
}) => {
  if (movies.length === 0) {
    return (
      <div className="py-12 px-4 text-center bg-slate-900/40 border border-slate-800/60 rounded-2xl my-6">
        <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-300">No movies found in this category</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Try adjusting your search terms or selecting another genre.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4 my-8">
      {/* Category Header */}
      <div className="flex items-end justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide font-serif flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-sans font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
              {movies.length} {movies.length === 1 ? 'title' : 'titles'}
            </span>
          </h2>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onPlay={onPlay}
            onOpenDetails={onOpenDetails}
            isInWatchlist={watchlist.includes(movie.id)}
            onToggleWatchlist={onToggleWatchlist}
            currentUserEmail={currentUserEmail}
            onDeleteMovie={onDeleteMovie}
            onEditMovie={onEditMovie}
            watchProgress={watchProgressMap[movie.id]}
          />
        ))}
      </div>
    </section>
  );
};

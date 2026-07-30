import React from 'react';
import { Play, Star, Plus, Check, ShieldCheck, Trash2, Edit, Eye } from 'lucide-react';
import { Movie } from '../types';
import { ADMIN_EMAIL } from '../data/initialMovies';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movieId: string) => void;
  currentUserEmail: string;
  onDeleteMovie?: (movieId: string) => void;
  onEditMovie?: (movie: Movie) => void;
  watchProgress?: number; // percent 0 to 100
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlay,
  onOpenDetails,
  isInWatchlist,
  onToggleWatchlist,
  currentUserEmail,
  onDeleteMovie,
  onEditMovie,
  watchProgress,
}) => {
  const isAdmin = currentUserEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <div className="group relative bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-slate-700 transition-all duration-300 flex flex-col transform hover:-translate-y-1">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden cursor-pointer" onClick={() => onOpenDetails(movie)}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="bg-slate-950/80 backdrop-blur-md text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1 shadow">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {movie.rating}
          </span>

          <span className="bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-700/60 uppercase">
            {movie.contentRating}
          </span>
        </div>

        {/* Watch Progress Bar if exists */}
        {watchProgress !== undefined && watchProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-950/80">
            <div
              className="h-full bg-red-600 transition-all"
              style={{ width: `${Math.min(100, watchProgress)}%` }}
            />
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(movie);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white stroke-none" />
                <span>Watch Now</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchlist(movie.id);
                }}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isInWatchlist
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
              {movie.description}
            </p>
          </div>
        </div>
      </div>

      {/* Info Card Footer */}
      <div className="p-3.5 flex flex-col justify-between flex-1 space-y-1.5 bg-slate-900">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onOpenDetails(movie)}
              className="text-sm font-bold text-white truncate hover:text-red-400 transition cursor-pointer"
              title={movie.title}
            >
              {movie.title}
            </h3>

            {/* Official / Verified Badging */}
            {movie.uploadedBy === ADMIN_EMAIL && (
              <span
                className="shrink-0 text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded font-medium"
                title="Official Authorized Release"
              >
                Verified Studio
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
            <span className="text-red-400 font-medium">{movie.genre}</span>
            <span>•</span>
            <span>{movie.releaseYear}</span>
            <span>•</span>
            <span>{movie.duration}</span>
          </div>
        </div>

        {/* Management Toolbar */}
        {isAdmin && (onDeleteMovie || onEditMovie) ? (
          <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Eye className="w-3 h-3" /> {movie.viewsCount || 0} views
            </span>
            <div className="flex items-center gap-1.5">
              {onEditMovie && (
                <button
                  onClick={() => onEditMovie(movie)}
                  className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition cursor-pointer"
                  title="Edit Video"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              )}
              {onDeleteMovie && (
                <button
                  onClick={() => {
                    if (confirm(`Delete "${movie.title}" from catalog?`)) {
                      onDeleteMovie(movie.id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition cursor-pointer"
                  title="Delete Video"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {movie.viewsCount || 0} customer views
            </span>
            <span className="text-emerald-400 font-medium">Ready to Stream</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { X, Bookmark, Play, Trash2, Clock, Film } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistMovies: Movie[];
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  watchlistIds: string[];
  onToggleWatchlist: (movieId: string) => void;
  currentUserEmail: string;
}

export const WatchlistModal: React.FC<WatchlistModalProps> = ({
  isOpen,
  onClose,
  watchlistMovies,
  onPlay,
  onOpenDetails,
  watchlistIds,
  onToggleWatchlist,
  currentUserEmail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-serif">My Saved Watchlist</h2>
              <p className="text-xs text-slate-400">
                {watchlistMovies.length} {watchlistMovies.length === 1 ? 'movie' : 'movies'} saved for later
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {watchlistMovies.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Film className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">Your Watchlist is Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the catalog and click the "+" icon on any movie poster to bookmark it here for easy access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchlistMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlay={(m) => {
                    onClose();
                    onPlay(m);
                  }}
                  onOpenDetails={(m) => {
                    onClose();
                    onOpenDetails(m);
                  }}
                  isInWatchlist={true}
                  onToggleWatchlist={onToggleWatchlist}
                  currentUserEmail={currentUserEmail}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Play, Plus, Check, Star, Info, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Movie } from '../types';

interface HeroBannerProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movieId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movie,
  onPlay,
  onOpenDetails,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  const [isMuted, setIsMuted] = useState(true);

  if (!movie) return null;

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden bg-slate-950">
      {/* Backdrop Image with gradient overlays */}
      <div className="absolute inset-0">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center scale-105 filter brightness-90 animate-fade-in"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-16 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Badge & Tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="bg-red-600 text-white px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-md shadow-red-950/50">
              <Sparkles className="w-3 h-3" /> Featured Premiere
            </span>
            <span className="bg-slate-900/80 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" /> {movie.rating} / 10
            </span>
            <span className="bg-slate-900/80 text-slate-300 border border-slate-700/80 px-2 py-0.5 rounded-md">
              {movie.contentRating}
            </span>
            <span className="text-slate-300 font-medium">{movie.releaseYear}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300 font-medium">{movie.duration}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-xl font-serif">
            {movie.title}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed drop-shadow">
            {movie.description}
          </p>

          {/* Director & Cast */}
          <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1">
            <span>
              <strong className="text-slate-300">Director:</strong> {movie.director}
            </span>
            <span>
              <strong className="text-slate-300">Cast:</strong> {movie.cast.slice(0, 3).join(', ')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onPlay(movie)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition duration-200 transform hover:scale-105 shadow-xl shadow-red-950/60 cursor-pointer text-sm"
            >
              <Play className="w-5 h-5 fill-white stroke-none" />
              <span>Watch Movie Now</span>
            </button>

            <button
              onClick={() => onOpenDetails(movie)}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-white font-semibold px-5 py-3 rounded-xl transition border border-slate-700 hover:border-slate-500 cursor-pointer text-sm"
            >
              <Info className="w-5 h-5 text-red-400" />
              <span>More Info</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(movie.id)}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                isInWatchlist
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
              title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

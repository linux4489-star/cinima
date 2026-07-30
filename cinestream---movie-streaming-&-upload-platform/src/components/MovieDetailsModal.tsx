import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Plus,
  Check,
  Star,
  Film,
  User,
  ShieldCheck,
  MessageSquare,
  Send,
  Trash2,
  Edit,
  Sparkles,
  Tag
} from 'lucide-react';
import { Movie, Review } from '../types';
import { ADMIN_EMAIL } from '../data/initialMovies';
import { getMovieReviews, addMovieReview } from '../lib/storage';

interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlay: (movie: Movie) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (movieId: string) => void;
  currentUserEmail: string;
  onDeleteMovie?: (movieId: string) => void;
  onEditMovie?: (movie: Movie) => void;
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onPlay,
  isInWatchlist,
  onToggleWatchlist,
  currentUserEmail,
  onDeleteMovie,
  onEditMovie,
  allMovies,
  onSelectMovie,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');

  const isAdmin = currentUserEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    if (movie) {
      setReviews(getMovieReviews(movie.id));
    }
  }, [movie]);

  if (!movie) return null;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added = addMovieReview(movie.id, {
      userName: userName.trim() || currentUserEmail.split('@')[0],
      userEmail: currentUserEmail,
      rating: newRating,
      comment: newComment.trim(),
    });

    setReviews(added);
    setNewComment('');
  };

  const relatedMovies = allMovies
    .filter((m) => m.genre === movie.genre && m.id !== movie.id)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Backdrop */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden shrink-0 bg-slate-950">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-950/80 hover:bg-red-600 text-white transition border border-slate-700 hover:border-red-500 cursor-pointer shadow-lg z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Banner Meta */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="bg-red-600 text-white px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                  {movie.genre}
                </span>
                <span className="bg-slate-950/80 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {movie.rating} / 10
                </span>
                <span className="bg-slate-950/80 text-slate-300 border border-slate-700/80 px-2 py-0.5 rounded-md">
                  {movie.contentRating}
                </span>
                <span className="text-slate-300">{movie.releaseYear}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">{movie.duration}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white font-serif tracking-tight drop-shadow-md">
                {movie.title}
              </h1>
            </div>

            {/* Play Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onPlay(movie);
                }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition duration-200 transform hover:scale-105 shadow-xl shadow-red-950/60 cursor-pointer text-sm"
              >
                <Play className="w-4 h-4 fill-white stroke-none" />
                <span>Watch Movie</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(movie.id)}
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  isInWatchlist
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-slate-950/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Main info row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Synopsis
                </h3>
                <p className="text-slate-200 leading-relaxed text-sm sm:text-base">
                  {movie.description}
                </p>
              </div>

              {/* Tags */}
              {movie.tags && movie.tags.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 text-slate-300 border border-slate-700/60 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3 text-red-400" /> #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Side Cast/Crew Box */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Director
                </span>
                <span className="text-white font-medium text-sm">{movie.director}</span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Cast
                </span>
                <span className="text-slate-300 text-xs leading-normal block mt-0.5">
                  {movie.cast.join(', ')}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Uploaded By
                </span>
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {movie.uploadedBy === ADMIN_EMAIL ? 'Official Administrator' : 'Verified Publisher'}
                </span>
              </div>

              {/* Management Actions in Modal */}
              {isAdmin && (onEditMovie || onDeleteMovie) && (
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  {onEditMovie && (
                    <button
                      onClick={() => {
                        onClose();
                        onEditMovie(movie);
                      }}
                      className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Movie
                    </button>
                  )}
                  {onDeleteMovie && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${movie.title}"?`)) {
                          onDeleteMovie(movie.id);
                          onClose();
                        }
                      }}
                      className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/60 rounded-lg text-xs transition cursor-pointer"
                      title="Delete Movie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Movies */}
          {relatedMovies.length > 0 && (
            <div className="border-t border-slate-800/80 pt-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                More in {movie.genre}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedMovies.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMovie(m)}
                    className="group bg-slate-950 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-slate-600 transition p-2 flex items-center gap-2.5"
                  >
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-10 h-14 object-cover rounded shadow"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate group-hover:text-red-400 transition">
                        {m.title}
                      </div>
                      <div className="text-[11px] text-amber-400">★ {m.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Reviews Section */}
          <div className="border-t border-slate-800/80 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-400" /> Audience Reviews ({reviews.length})
              </h3>
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleAddReview} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Your Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-0.5 text-amber-400 hover:scale-125 transition cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Share your thoughts about this movie..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No reviews posted yet. Be the first to leave a review!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {rev.userName}
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 leading-normal">{rev.comment}</p>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

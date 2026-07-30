import React, { useState, useEffect } from 'react';
import { Genre, Movie, SortOption } from './types';
import { ADMIN_EMAIL, INITIAL_MOVIES } from './data/initialMovies';
import {
  getStoredMovies,
  getWatchlist,
  toggleWatchlist,
  getCurrentUserEmail,
  setCurrentUserEmail,
  deleteMovie,
  deleteAllDemoMovies,
  clearAllMovies,
  resetToDemoMovies,
  getWatchProgress,
} from './lib/storage';

import { AdminBanner } from './components/AdminBanner';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { MovieGrid } from './components/MovieGrid';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { UploadModal } from './components/UploadModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { WatchlistModal } from './components/WatchlistModal';
import { Footer } from './components/Footer';

import { Film, Filter, SlidersHorizontal, Sparkles, AlertCircle, ShieldCheck, Upload } from 'lucide-react';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeGenre, setActiveGenre] = useState<Genre>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [currentUserEmail, setCurrentUserEmailState] = useState(ADMIN_EMAIL);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchProgressMap, setWatchProgressMap] = useState<Record<string, number>>({});

  // Modals
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [detailsMovie, setDetailsMovie] = useState<Movie | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);

  // Load initial state
  useEffect(() => {
    const loadedMovies = getStoredMovies();
    setMovies(loadedMovies);
    setWatchlist(getWatchlist());
    setCurrentUserEmailState(getCurrentUserEmail());

    // Load watch progress percentages
    const rawProgress = getWatchProgress();
    const percentMap: Record<string, number> = {};
    Object.values(rawProgress).forEach((p) => {
      if (p.duration > 0) {
        percentMap[p.movieId] = (p.currentTime / p.duration) * 100;
      }
    });
    setWatchProgressMap(percentMap);
  }, []);

  const handleUserLogin = (email: string) => {
    setCurrentUserEmail(email);
    setCurrentUserEmailState(email);
  };

  const handleToggleWatchlist = (movieId: string) => {
    const updated = toggleWatchlist(movieId);
    setWatchlist(updated);
  };

  const handleDeleteMovie = (movieId: string) => {
    const res = deleteMovie(movieId, currentUserEmail);
    if (res.success) {
      const refreshed = getStoredMovies();
      setMovies(refreshed);
    } else {
      alert(res.error || 'Delete failed');
    }
  };

  const handleDeleteDemoMovies = () => {
    const res = deleteAllDemoMovies(currentUserEmail);
    if (res.success) {
      const refreshed = getStoredMovies();
      setMovies(refreshed);
    } else {
      alert(res.error || 'Failed to delete demo movies');
    }
  };

  const handleClearAllMovies = () => {
    const res = clearAllMovies(currentUserEmail);
    if (res.success) {
      const refreshed = getStoredMovies();
      setMovies(refreshed);
    } else {
      alert(res.error || 'Failed to clear catalog');
    }
  };

  const handleResetDemoMovies = () => {
    const res = resetToDemoMovies(currentUserEmail);
    if (res.success) {
      const refreshed = getStoredMovies();
      setMovies(refreshed);
    } else {
      alert(res.error || 'Failed to reset demo movies');
    }
  };

  const handleMovieAddedOrEdited = (movie: Movie) => {
    const refreshed = getStoredMovies();
    setMovies(refreshed);
  };

  // Filter movies
  let filteredMovies = movies.filter((m) => {
    const matchesGenre = activeGenre === 'All' || m.genre === activeGenre;
    const matchesSearch =
      !searchQuery.trim() ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.cast.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesGenre && matchesSearch;
  });

  // Sort movies
  filteredMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'popular') {
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const featuredMovie = movies.find((m) => m.isFeatured) || movies[0];
  const adminUploadedMovies = movies.filter((m) => m.uploadedBy === ADMIN_EMAIL);
  const trendingMovies = movies.filter((m) => m.isTrending);
  const watchlistMovies = movies.filter((m) => watchlist.includes(m.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white antialiased">
      {/* Top Admin Permission Banner */}
      <AdminBanner
        currentUserEmail={currentUserEmail}
        onOpenUpload={() => {
          setEditingMovie(null);
          setIsUploadOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onDeleteDemoMovies={handleDeleteDemoMovies}
        onClearAllMovies={handleClearAllMovies}
        onResetDemoMovies={handleResetDemoMovies}
        hasDemoMovies={movies.some((m) => INITIAL_MOVIES.some((im) => im.id === m.id))}
      />

      {/* Main Sticky Header */}
      <Header
        activeGenre={activeGenre}
        onSelectGenre={(g) => setActiveGenre(g)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        movies={movies}
        onSelectMovie={(m) => setDetailsMovie(m)}
        watchlistCount={watchlist.length}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        onOpenUpload={() => {
          setEditingMovie(null);
          setIsUploadOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        currentUserEmail={currentUserEmail}
        onGoHome={() => {
          setActiveGenre('All');
          setSearchQuery('');
        }}
      />

      {/* Hero Banner (Only show when not actively filtering by search) */}
      {!searchQuery && activeGenre === 'All' && featuredMovie && (
        <HeroBanner
          movie={featuredMovie}
          onPlay={(m) => setPlayingMovie(m)}
          onOpenDetails={(m) => setDetailsMovie(m)}
          isInWatchlist={watchlist.includes(featuredMovie.id)}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pt-6 space-y-8">
        {/* Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-red-500" />
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : activeGenre === 'All'
                ? 'All Cinema Titles'
                : `${activeGenre} Movies`}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredMovies.length} movies available for instant streaming
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
              >
                <option value="latest" className="bg-slate-900">Recently Added</option>
                <option value="rating" className="bg-slate-900">Highest Rated</option>
                <option value="popular" className="bg-slate-900">Most Viewed</option>
                <option value="title" className="bg-slate-900">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty Catalog State when no videos exist */}
        {movies.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 space-y-6 max-w-2xl mx-auto my-8 shadow-2xl">
            <div className="w-20 h-20 bg-red-950/80 border border-red-700/60 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-xl shadow-red-950/50">
              <Upload className="w-10 h-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">No Videos in Catalog</h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                All default sample videos have been removed. Upload your videos from your device gallery or video links to begin watching!
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMovie(null);
                setIsUploadOpen(true);
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition cursor-pointer inline-flex items-center gap-2.5 shadow-xl shadow-red-950/60"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Video Now</span>
            </button>
          </div>
        ) : searchQuery || activeGenre !== 'All' ? (
          <MovieGrid
            title={activeGenre !== 'All' ? `${activeGenre} Collection` : 'Search Catalog'}
            subtitle="Select any movie to begin instant streaming"
            movies={filteredMovies}
            onPlay={(m) => setPlayingMovie(m)}
            onOpenDetails={(m) => setDetailsMovie(m)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            currentUserEmail={currentUserEmail}
            onDeleteMovie={handleDeleteMovie}
            onEditMovie={(m) => {
              setEditingMovie(m);
              setIsUploadOpen(true);
            }}
            watchProgressMap={watchProgressMap}
          />
        ) : (
          /* Default Category Sections */
          <div className="space-y-12">
            {/* Uploaded Gallery Videos Section */}
            <MovieGrid
              title="Uploaded Video Gallery"
              subtitle="All user and gallery uploaded videos ready for customer playback"
              movies={filteredMovies}
              onPlay={(m) => setPlayingMovie(m)}
              onOpenDetails={(m) => setDetailsMovie(m)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              currentUserEmail={currentUserEmail}
              onDeleteMovie={handleDeleteMovie}
              onEditMovie={(m) => {
                setEditingMovie(m);
                setIsUploadOpen(true);
              }}
              watchProgressMap={watchProgressMap}
            />

            {/* Trending Now */}
            {trendingMovies.length > 0 && trendingMovies.length !== filteredMovies.length && (
              <MovieGrid
                title="Trending Now"
                subtitle="Popular videos being watched across the platform"
                movies={trendingMovies}
                onPlay={(m) => setPlayingMovie(m)}
                onOpenDetails={(m) => setDetailsMovie(m)}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                currentUserEmail={currentUserEmail}
                onDeleteMovie={handleDeleteMovie}
                onEditMovie={(m) => {
                  setEditingMovie(m);
                  setIsUploadOpen(true);
                }}
                watchProgressMap={watchProgressMap}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenUpload={() => {
          setEditingMovie(null);
          setIsUploadOpen(true);
        }}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal movie={playingMovie} onClose={() => setPlayingMovie(null)} />

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={detailsMovie}
        onClose={() => setDetailsMovie(null)}
        onPlay={(m) => setPlayingMovie(m)}
        isInWatchlist={detailsMovie ? watchlist.includes(detailsMovie.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
        currentUserEmail={currentUserEmail}
        onDeleteMovie={handleDeleteMovie}
        onEditMovie={(m) => {
          setEditingMovie(m);
          setIsUploadOpen(true);
        }}
        allMovies={movies}
        onSelectMovie={(m) => setDetailsMovie(m)}
      />

      {/* Movie Upload Studio Modal (Restricted to linux4489@gmail.com) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setEditingMovie(null);
        }}
        currentUserEmail={currentUserEmail}
        onMovieAdded={handleMovieAddedOrEdited}
        onOpenAuth={() => setIsAuthOpen(true)}
        editingMovie={editingMovie}
      />

      {/* User Auth / Switch Role Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUserEmail={currentUserEmail}
        onLogin={handleUserLogin}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Full Platform Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        movies={movies}
        currentUserEmail={currentUserEmail}
        onOpenUpload={(movieToEdit) => {
          setEditingMovie(movieToEdit || null);
          setIsUploadOpen(true);
        }}
        onDeleteMovie={handleDeleteMovie}
        onDeleteDemoMovies={handleDeleteDemoMovies}
        onClearAllMovies={handleClearAllMovies}
        onResetDemoMovies={handleResetDemoMovies}
      />

      {/* Watchlist Drawer/Modal */}
      <WatchlistModal
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlistMovies={watchlistMovies}
        onPlay={(m) => setPlayingMovie(m)}
        onOpenDetails={(m) => setDetailsMovie(m)}
        watchlistIds={watchlist}
        onToggleWatchlist={handleToggleWatchlist}
        currentUserEmail={currentUserEmail}
      />
    </div>
  );
}

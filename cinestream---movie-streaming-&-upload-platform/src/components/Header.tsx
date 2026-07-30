import React, { useState, useRef, useEffect } from 'react';
import { Film, Search, Bookmark, Upload, User, Shield, ChevronDown, Sparkles, X } from 'lucide-react';
import { Genre, Movie } from '../types';
import { ADMIN_EMAIL } from '../data/initialMovies';

interface HeaderProps {
  activeGenre: Genre;
  onSelectGenre: (genre: Genre) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  watchlistCount: number;
  onOpenWatchlist: () => void;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
  onOpenAdminPanel?: () => void;
  currentUserEmail: string;
  onGoHome: () => void;
}

const GENRES: Genre[] = [
  'All',
  'Action',
  'Sci-Fi',
  'Drama',
  'Comedy',
  'Horror',
  'Romance',
  'Thriller',
  'Animation',
  'Adventure',
  'Documentary',
];

export const Header: React.FC<HeaderProps> = ({
  activeGenre,
  onSelectGenre,
  searchQuery,
  onSearchChange,
  movies,
  onSelectMovie,
  watchlistCount,
  onOpenWatchlist,
  onOpenUpload,
  onOpenAuth,
  onOpenAdminPanel,
  currentUserEmail,
  onGoHome,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showGenreMenu, setShowGenreMenu] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUserEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter movies for search autocomplete
  const searchResults = searchQuery.trim()
    ? movies.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.cast.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl py-3'
          : 'bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <button
              onClick={onGoHome}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-amber-600 flex items-center justify-center shadow-lg shadow-red-900/40 group-hover:scale-105 transition duration-300">
                <Film className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-black tracking-wider text-white font-serif uppercase">
                  Cine<span className="text-red-500">Stream</span>
                </span>
                <span className="block text-[10px] text-slate-400 -mt-1 tracking-widest font-mono uppercase">
                  Cinema Vault
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button
                onClick={onGoHome}
                className="text-slate-200 hover:text-white transition cursor-pointer"
              >
                Home
              </button>

              {/* Genre Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowGenreMenu(!showGenreMenu)}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition cursor-pointer py-1"
                >
                  <span>Genre: <strong className="text-red-400">{activeGenre}</strong></span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showGenreMenu && (
                  <div
                    className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-xl"
                    onMouseLeave={() => setShowGenreMenu(false)}
                  >
                    {GENRES.map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          onSelectGenre(g);
                          setShowGenreMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                          activeGenre === g
                            ? 'bg-red-600/20 text-red-400 border-l-2 border-red-500 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={onOpenWatchlist}
                className="text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>My Watchlist</span>
                {watchlistCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {watchlistCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <div
                className={`flex items-center bg-slate-900/90 border transition-all rounded-full px-3 py-1.5 ${
                  searchFocused
                    ? 'border-red-500 ring-2 ring-red-500/20 w-64 md:w-80 shadow-lg'
                    : 'border-slate-800 hover:border-slate-700 w-44 md:w-60'
                }`}
              >
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search movies, cast, genre..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2 w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {searchFocused && searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-800/80 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-red-400" /> Matches
                  </div>
                  {searchResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectMovie(m);
                        onSearchChange('');
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-800/80 transition flex items-center gap-3 border-b border-slate-800/40 last:border-0 cursor-pointer"
                    >
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="w-9 h-12 object-cover rounded shadow-md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate">{m.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-red-400">{m.genre}</span>
                          <span>•</span>
                          <span>{m.releaseYear}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">★ {m.rating}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Catalog Management Button */}
            {isAdmin && onOpenAdminPanel && (
              <button
                onClick={onOpenAdminPanel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-700/80 text-emerald-400 hover:bg-emerald-900 transition cursor-pointer shadow-md"
                title="Manage Catalog & Videos"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Manage Catalog</span>
              </button>
            )}

            {/* Upload Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shadow-md bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-900/30"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Video</span>
            </button>

            {/* Auth / Account Profile Badge */}
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-2 p-1.5 rounded-full border transition cursor-pointer ${
                isAdmin
                  ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-400 hover:bg-emerald-900/60'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              title={isAdmin ? 'Administrator Session' : 'Viewer Account'}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isAdmin ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-white'
                }`}
              >
                {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Genre Row */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar pt-3 border-t border-slate-800/40 mt-3 text-xs">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => onSelectGenre(g)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                activeGenre === g
                  ? 'bg-red-600 text-white font-medium'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

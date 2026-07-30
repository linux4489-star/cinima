import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Film,
  Eye,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Movie } from '../types';
import { ADMIN_EMAIL } from '../data/initialMovies';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  currentUserEmail: string;
  onOpenUpload: (movieToEdit?: Movie) => void;
  onDeleteMovie: (movieId: string) => void;
  onDeleteDemoMovies: () => void;
  onClearAllMovies?: () => void;
  onResetDemoMovies: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  movies,
  currentUserEmail,
  onOpenUpload,
  onDeleteMovie,
  onDeleteDemoMovies,
  onClearAllMovies,
  onResetDemoMovies,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'demo'>('all');

  if (!isOpen) return null;

  const isAdmin = currentUserEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'admin') {
      return matchesSearch && m.uploadedBy === ADMIN_EMAIL;
    }
    if (filterType === 'demo') {
      return matchesSearch && m.id.startsWith('movie-');
    }
    return matchesSearch;
  });

  const totalViews = movies.reduce((sum, m) => sum + (m.viewsCount || 0), 0);
  const adminUploadedCount = movies.filter((m) => m.uploadedBy === ADMIN_EMAIL).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Platform Admin Panel
                </h2>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Unlocked Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage movie releases, uploads, and catalog content
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <>
            {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Total Catalog
                  </span>
                  <div className="text-2xl font-black text-white">{movies.length}</div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Film className="w-3 h-3 text-red-400" /> Active Movies
                  </span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Admin Uploads
                  </span>
                  <div className="text-2xl font-black text-emerald-400">{adminUploadedCount}</div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Authorized
                  </span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Total Views
                  </span>
                  <div className="text-2xl font-black text-amber-400">
                    {totalViews.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-amber-400" /> Streams Watched
                  </span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Admin Status
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-200 truncate pt-1">
                    Owner Active
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Super Administrator
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/90 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUpload();
                    }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Upload New Movie
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Delete all default demo videos from catalog?')) {
                        onDeleteDemoMovies();
                      }
                    }}
                    className="flex items-center gap-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-semibold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    Delete All Demo Videos
                  </button>

                  {onClearAllMovies && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete ALL videos and completely clear the catalog?')) {
                          onClearAllMovies();
                        }
                      }}
                      className="flex items-center gap-1.5 bg-red-900/80 hover:bg-red-800 border border-red-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                      Delete All Videos
                    </button>
                  )}

                  <button
                    onClick={onResetDemoMovies}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    Restore Demo Videos
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Filter admin movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 w-full sm:w-48"
                />
              </div>

              {/* Movie List Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Movie Catalog Management ({filteredMovies.length})
                </h3>

                {filteredMovies.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/50 border border-slate-800/80 rounded-2xl text-slate-500 text-xs">
                    No movies found matching filter.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredMovies.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={m.posterUrl}
                            alt={m.title}
                            className="w-12 h-16 object-cover rounded-lg border border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{m.title}</h4>
                              <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                                {m.genre}
                              </span>
                              {m.uploadedBy === ADMIN_EMAIL && (
                                <span className="text-[9px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1 max-w-md mt-0.5">
                              {m.description}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" /> {m.releaseYear}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-slate-400" /> {m.viewsCount || 0} views
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onClose();
                              onOpenUpload(m);
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center gap-1 text-xs"
                            title="Edit Movie Details"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete "${m.title}" from catalog?`)) {
                                onDeleteMovie(m.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/80 transition cursor-pointer flex items-center gap-1 text-xs"
                            title="Delete Movie"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldCheck, Eye, Upload, Lock, Trash2, RefreshCw } from 'lucide-react';
import { ADMIN_EMAIL } from '../data/initialMovies';

interface AdminBannerProps {
  currentUserEmail: string;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
  onOpenAdminPanel?: () => void;
  onDeleteDemoMovies?: () => void;
  onClearAllMovies?: () => void;
  onResetDemoMovies?: () => void;
  hasDemoMovies?: boolean;
}

export const AdminBanner: React.FC<AdminBannerProps> = ({
  currentUserEmail,
  onOpenUpload,
  onOpenAuth,
  onOpenAdminPanel,
  onDeleteDemoMovies,
  onClearAllMovies,
  onResetDemoMovies,
  hasDemoMovies = true,
}) => {
  const isAdmin = currentUserEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 text-xs py-2 px-4 md:px-8 text-slate-300 flex flex-wrap items-center justify-between gap-2 z-20 relative">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-0.5 rounded-full border ${
          isAdmin
            ? 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60'
            : 'text-amber-400 bg-amber-950/70 border-amber-800/60'
        }`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          {isAdmin ? 'Admin Studio Active' : 'Customer Viewing Mode'}
        </span>

        <span className="hidden sm:inline text-slate-300">
          {isAdmin
            ? 'Admin Mode Active. You can upload, edit, and manage all videos.'
            : 'All videos in the gallery are available for customer playback.'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isAdmin && onClearAllMovies && (
          <button
            onClick={() => {
              if (confirm('Delete all videos and clear the catalog?')) {
                onClearAllMovies();
              }
            }}
            className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/70 font-medium px-2.5 py-1 rounded-md transition shadow-sm text-xs cursor-pointer"
            title="Delete all videos from catalog"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            Delete All Videos
          </button>
        )}

        {isAdmin && onOpenAdminPanel && (
          <button
            onClick={onOpenAdminPanel}
            className="flex items-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 font-semibold px-3 py-1 rounded-md transition text-xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Admin Panel
          </button>
        )}

        {isAdmin ? (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1 rounded-md transition shadow-sm text-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Video
          </button>
        ) : (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-3 py-1 rounded-md transition border border-slate-700 text-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-red-400" />
            Upload Video (Admin Only)
          </button>
        )}

        <button
          onClick={onOpenAuth}
          className="text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-2 transition cursor-pointer ml-1"
        >
          {isAdmin ? 'Admin Session' : 'Admin Login'}
        </button>
      </div>
    </div>
  );
};

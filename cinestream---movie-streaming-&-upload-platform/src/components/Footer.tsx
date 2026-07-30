import React from 'react';
import { Film, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { ADMIN_EMAIL } from '../data/initialMovies';

interface FooterProps {
  onOpenAuth: () => void;
  onOpenUpload: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth, onOpenUpload }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20 text-xs">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white tracking-wider font-serif uppercase">
                Cine<span className="text-red-500">Stream</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md text-xs">
              Cinema-grade web application with full streaming and watch access across the catalog.
              Movie uploads are restricted strictly to authorized{' '}
              <strong className="text-emerald-400 font-medium">Platform Administrator</strong>.
            </p>
          </div>

          {/* Policy & Permissions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Access Control
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Full Video Streaming: Enabled
              </li>
              <li className="flex items-center gap-1.5 text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Upload: Authorized Administrator Only
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={onOpenAuth}
                className="text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
              >
                Switch Account / Admin Login
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Management
            </h4>
            <button
              onClick={onOpenUpload}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium transition block w-full text-left cursor-pointer"
            >
              Upload Center
            </button>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 CineStream Cinema Vault. All viewing rights enabled.</p>
          <p className="flex items-center gap-1">
            Designed for high performance movie streaming & catalog management.
          </p>
        </div>
      </div>
    </footer>
  );
};

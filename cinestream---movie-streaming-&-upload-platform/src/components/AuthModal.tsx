import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { ADMIN_EMAIL } from '../data/initialMovies';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
  onLogin: (email: string) => void;
  onOpenAdminPanel?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  onLogin,
  onOpenAdminPanel,
}) => {
  const [adminInputEmail, setAdminInputEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const typed = adminInputEmail.trim().toLowerCase();
    if (!typed) {
      setErrorMessage('Please enter the Owner Admin email address.');
      return;
    }

    if (typed === ADMIN_EMAIL.toLowerCase()) {
      onLogin(ADMIN_EMAIL);
      onClose();
      if (onOpenAdminPanel) {
        onOpenAdminPanel();
      }
    } else {
      setErrorMessage('Access Denied: Invalid Owner Admin Email.');
    }
  };

  const isCurrentAdmin = currentUserEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Owner Admin Portal</h2>
              <p className="text-[11px] text-slate-400">Owner authentication required</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Status */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
            Current Status:
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">
              {isCurrentAdmin ? 'Owner Administrator Unlocked' : 'Standard Session'}
            </span>
            {isCurrentAdmin && (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin Unlocked
              </span>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Admin Login Section */}
        <div className="space-y-3">
          <form onSubmit={handleAdminAuthSubmit} className="p-4 bg-gradient-to-br from-emerald-950/70 to-slate-950 border border-emerald-800/60 rounded-2xl space-y-3">
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              Enter your authorized Owner Admin email address to unlock and open the Platform Admin Panel.
            </p>

            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter Owner Admin Email"
                value={adminInputEmail}
                onChange={(e) => setAdminInputEmail(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-800/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
              />

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Admin Panel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

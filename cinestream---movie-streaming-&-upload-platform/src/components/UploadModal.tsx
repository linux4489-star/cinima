import React, { useState } from 'react';
import {
  X,
  Upload,
  ShieldCheck,
  Lock,
  Sparkles,
  Film,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  FileVideo,
  Wand2,
  HelpCircle,
  Video
} from 'lucide-react';
import { Movie, Genre } from '../types';
import { ADMIN_EMAIL } from '../data/initialMovies';
import { addMovie, saveVideoFile, updateMovie } from '../lib/storage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
  onMovieAdded: (movie: Movie) => void;
  onOpenAuth: () => void;
  editingMovie?: Movie | null;
}

const GENRES: Genre[] = [
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

const VIDEO_PRESETS = [
  { name: 'Tears of Steel (Sci-Fi 4K)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
  { name: 'Sintel Fantasy Dragon (1080p)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
  { name: 'Big Buck Bunny (Family Animated)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
  { name: 'Cosmos Laundromat (Surreal)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
  { name: 'Elephant\'s Dream (Cyberpunk)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
];

const POSTER_PRESETS = [
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  onMovieAdded,
  onOpenAuth,
  editingMovie,
}) => {
  const [adminEmailInput, setAdminEmailInput] = useState(currentUserEmail || '');
  const isVerifiedAdmin = adminEmailInput.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [title, setTitle] = useState(editingMovie?.title || '');
  const [description, setDescription] = useState(editingMovie?.description || '');
  const [genre, setGenre] = useState<Genre>(editingMovie?.genre || 'Action');
  const [releaseYear, setReleaseYear] = useState<number>(editingMovie?.releaseYear || 2025);
  const [duration, setDuration] = useState(editingMovie?.duration || '1h 45m');
  const [rating, setRating] = useState<number>(editingMovie?.rating || 8.8);
  const [contentRating, setContentRating] = useState<'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'TV-MA'>(
    editingMovie?.contentRating || 'PG-13'
  );
  const [director, setDirector] = useState(editingMovie?.director || '');
  const [cast, setCast] = useState(editingMovie?.cast ? editingMovie.cast.join(', ') : '');
  const [tags, setTags] = useState(editingMovie?.tags ? editingMovie.tags.join(', ') : '');

  // Media Inputs
  const [videoUrl, setVideoUrl] = useState(editingMovie?.videoUrl || VIDEO_PRESETS[0].url);
  const [posterUrl, setPosterUrl] = useState(editingMovie?.posterUrl || POSTER_PRESETS[0]);
  const [backdropUrl, setBackdropUrl] = useState(editingMovie?.backdropUrl || POSTER_PRESETS[0]);

  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedPosterFile, setSelectedPosterFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Handle Gemini AI Details Auto-Fill
  const handleAiAutoFill = async () => {
    if (!title.trim()) {
      setErrorMessage('Please enter a movie title first to auto-fill metadata.');
      return;
    }

    setIsAiGenerating(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/ai/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre }),
      });

      const data = await res.json();
      if (data.description) setDescription(data.description);
      if (data.director) setDirector(data.director);
      if (data.cast) setCast(Array.isArray(data.cast) ? data.cast.join(', ') : data.cast);
      if (data.releaseYear) setReleaseYear(data.releaseYear);
      if (data.duration) setDuration(data.duration);
      if (data.rating) setRating(data.rating);
      if (data.contentRating) setContentRating(data.contentRating);
      if (data.tags) setTags(Array.isArray(data.tags) ? data.tags.join(', ') : data.tags);

      setSuccessMessage('✨ AI successfully generated synopsis, cast, and metadata!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('AI generation error:', err);
      setErrorMessage('Failed to connect to AI metadata generator.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isVerifiedAdmin) {
      setErrorMessage('Upload blocked! Please enter authorized Admin Email to authorize video upload.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Movie title and description are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newMovieId = editingMovie?.id || `movie-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      let finalVideoUrl = videoUrl;
      let finalPosterUrl = posterUrl;

      // Handle Video File Upload if provided - save with exact movie ID
      if (selectedVideoFile) {
        finalVideoUrl = await saveVideoFile(newMovieId, selectedVideoFile);
      }

      // Handle Poster File Upload if provided
      if (selectedPosterFile) {
        finalPosterUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(selectedPosterFile);
        });
      }

      const moviePayload = {
        id: newMovieId,
        title: title.trim(),
        description: description.trim(),
        genre,
        releaseYear: Number(releaseYear),
        duration: duration.trim() || '1h 30m',
        rating: Number(rating),
        contentRating,
        director: director.trim() || 'Publisher',
        cast: cast ? cast.split(',').map((c) => c.trim()).filter(Boolean) : ['Featured Actor'],
        posterUrl: finalPosterUrl,
        backdropUrl: backdropUrl || finalPosterUrl,
        videoUrl: finalVideoUrl,
        trailerUrl: finalVideoUrl,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [genre],
        isFeatured: true,
        isTrending: true,
        uploadedBy: ADMIN_EMAIL,
      };

      if (editingMovie) {
        const res = updateMovie(editingMovie.id, moviePayload, adminEmailInput);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to update movie');
        } else {
          setSuccessMessage('Movie successfully updated in catalog!');
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        const res = addMovie(moviePayload, adminEmailInput);
        if (!res.success) {
          setErrorMessage(res.error || 'Upload rejected');
        } else if (res.movie) {
          onMovieAdded(res.movie);
          setSuccessMessage(`🎬 Video "${res.movie.title}" successfully published to catalog!`);
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during video processing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-serif flex items-center gap-2">
                {editingMovie ? 'Edit Video Details' : 'Upload Gallery Video Studio'}
              </h2>
              <p className="text-xs text-slate-400">
                Upload video files directly from device gallery or select online stream sources.
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

        {/* Video Upload Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Admin ID Type Requirement Section */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className={`w-4 h-4 ${isVerifiedAdmin ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span>Admin Authorization Email *</span>
                </label>
                {isVerifiedAdmin ? (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Unlocked Admin
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-full">
                    Required to Upload
                  </span>
                )}
              </div>
              <input
                type="email"
                required
                placeholder="Enter Admin Email address to authorize video upload"
                value={adminEmailInput}
                onChange={(e) => {
                  setAdminEmailInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none font-mono text-xs ${
                  isVerifiedAdmin ? 'border-emerald-600 focus:border-emerald-500' : 'border-amber-600/70 focus:border-amber-500'
                }`}
              />
              {!isVerifiedAdmin && (
                <p className="text-[11px] text-amber-400 flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  Please enter authorized Admin Email address above to unlock publishing.
                </p>
              )}
            </div>

            {/* Title & AI Auto-Fill */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200">Movie Title *</label>
                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={isAiGenerating}
                  className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  title="Uses Gemini AI to generate synopsis, cast, and rating"
                >
                  <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                  {isAiGenerating ? 'Generating Details...' : 'AI Auto-Fill Details'}
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Cyberpunk Horizon, Dark Nebula"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-200">Synopsis / Plot Summary *</label>
              <textarea
                required
                rows={3}
                placeholder="Write an engaging plot overview..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 text-xs"
              />
            </div>

            {/* Grid 1: Genre, Year, Duration, Rating, Content Rating */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as Genre)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Release Year</label>
                <input
                  type="number"
                  min="1950"
                  max="2030"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 1h 45m"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Rating (1-10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Director & Cast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Director</label>
                <input
                  type="text"
                  placeholder="e.g. Christopher Nolan"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Main Cast (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Christian Bale, Anne Hathaway"
                  value={cast}
                  onChange={(e) => setCast(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Video File / URL Section */}
            <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-500" /> Movie Video Source (Gallery & Device Videos)
                </label>
                <span className="text-[10px] text-slate-400">MP4, WebM, MOV, MKV, 3GP</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 block font-medium">
                  Option A: Select & Upload Video File from Device / Gallery
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setSelectedVideoFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer bg-slate-900 rounded-xl border border-slate-800 p-1"
                />
                {selectedVideoFile && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-300 text-[11px] flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Gallery Video Selected: <strong>{selectedVideoFile.name}</strong> (
                      {(selectedVideoFile.size / (1024 * 1024)).toFixed(1)} MB) - Ready to play for viewers!
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-medium">Option B: Video Stream URL or Preset</label>
                <input
                  type="text"
                  placeholder="https://.../movie.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Quick Samples:</span>
                  {VIDEO_PRESETS.map((vp) => (
                    <button
                      type="button"
                      key={vp.name}
                      onClick={() => setVideoUrl(vp.url)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition cursor-pointer ${
                        videoUrl === vp.url
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {vp.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Poster Image Section */}
            <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-3">
              <label className="font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-500" /> Poster Artwork
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-medium">Upload Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedPosterFile(e.target.files?.[0] || null)}
                    className="w-full text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200 cursor-pointer bg-slate-900 rounded-xl border border-slate-800 p-1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-medium">Or Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Poster Presets preview */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                <span className="text-[10px] text-slate-500 shrink-0">Sample Covers:</span>
                {POSTER_PRESETS.map((pUrl, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setPosterUrl(pUrl);
                      setBackdropUrl(pUrl);
                    }}
                    className={`shrink-0 w-10 h-12 rounded border overflow-hidden cursor-pointer ${
                      posterUrl === pUrl ? 'ring-2 ring-red-500' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={pUrl} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="Sci-Fi, Cyberpunk, Dystopia, Action"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Submit Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xl transition cursor-pointer disabled:opacity-50 ${
                  isVerifiedAdmin
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-950/60'
                    : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-950/40'
                }`}
              >
                <Upload className="w-4 h-4" />
                {isSubmitting
                  ? 'Processing & Publishing...'
                  : !isVerifiedAdmin
                  ? 'Enter Admin Email to Publish'
                  : editingMovie
                  ? 'Save Movie Changes'
                  : 'Publish Movie to Customers'}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

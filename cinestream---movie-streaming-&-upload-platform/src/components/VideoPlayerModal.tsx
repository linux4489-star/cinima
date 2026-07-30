import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Film,
  AlertTriangle,
  RefreshCw,
  Tv,
  Upload
} from 'lucide-react';
import { Movie } from '../types';
import { INITIAL_MOVIES, ADMIN_EMAIL } from '../data/initialMovies';
import { saveWatchProgress, getWatchProgress, incrementViews, getVideoUrl, saveVideoFile, DEFAULT_SAMPLE_VIDEO } from '../lib/storage';

interface VideoPlayerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

const MIRROR_STREAMS = [
  { name: 'HD Stream 1 (High-Speed CDN)', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
  { name: 'HD Stream 2 (W3C Cinema)', url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4' },
  { name: 'HD Stream 3 (MDN Stream)', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { name: 'HD Stream 4 (Primary Cloud)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
  { name: 'HD Stream 5 (Secondary Cloud)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
];

const HIGH_AVAILABILITY_STREAMS = MIRROR_STREAMS.map((s) => s.url);

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ movie, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && movie) {
      setHasError(false);
      setIsLoading(true);
      const url = await saveVideoFile(movie.id, file);
      setActiveVideoUrl(url);
    }
  };

  // Load and resolve video URL asynchronously
  useEffect(() => {
    if (!movie) return;

    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    // Record view count
    incrementViews(movie.id);

    // Retrieve from IndexedDB or safe fallback
    getVideoUrl(movie.id, movie.videoUrl)
      .then((url) => {
        if (isMounted) {
          setActiveVideoUrl(url);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setActiveVideoUrl(DEFAULT_SAMPLE_VIDEO);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [movie]);

  // Attempt play safely when activeVideoUrl changes or is ready
  useEffect(() => {
    if (activeVideoUrl && videoRef.current) {
      videoRef.current.load();

      // Fallback timer: ensure loading indicator turns off after 1.5s max so mobile users see Play button
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasError(false);
            setIsLoading(false);
          })
          .catch((err) => {
            console.info('Autoplay prevented or waiting for user interaction:', err?.name || err);
            setIsPlaying(false);
            setIsLoading(false);
            if (err?.name !== 'NotAllowedError' && err?.name !== 'AbortError') {
              // Only flag error for genuine stream failures
            }
          });
      }

      return () => clearTimeout(timer);
    }
  }, [activeVideoUrl]);

  // Restore watch position once video duration/metadata is loaded
  useEffect(() => {
    if (movie && activeVideoUrl && videoRef.current) {
      const allProgress = getWatchProgress();
      const saved = allProgress[movie.id];
      if (saved && saved.currentTime > 5) {
        videoRef.current.currentTime = saved.currentTime;
      }
    }
  }, [movie, activeVideoUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!movie) return;
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'ArrowRight') seekRelative(10);
      if (e.key === 'ArrowLeft') seekRelative(-10);
      if (e.key === 'm') toggleMute();
      if (e.key === 'f') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movie, isPlaying, isMuted, isFullscreen, activeVideoUrl]);

  if (!movie) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        setHasError(false);
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setHasError(false);
            })
            .catch((err) => {
              console.warn('Playback error or gesture requirement:', err);
              setIsPlaying(false);
              if (err?.name !== 'NotAllowedError' && err?.name !== 'AbortError') {
                handleVideoError();
              }
            });
        }
      }
    }
  };

  const handleVideoError = () => {
    console.warn('Video stream load failed for URL:', activeVideoUrl);

    // Attempt to reload from IndexedDB first
    getVideoUrl(movie.id, movie.videoUrl).then((freshUrl) => {
      if (freshUrl && freshUrl !== activeVideoUrl) {
        setActiveVideoUrl(freshUrl);
        setHasError(false);
        setIsLoading(true);
      } else {
        setHasError(true);
        setIsPlaying(false);
        setIsLoading(false);
      }
    });
  };

  const switchStream = (newUrl: string) => {
    setHasError(false);
    setIsLoading(true);
    setActiveVideoUrl(newUrl);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      setCurrentTime(cur);
      setDuration(dur);

      if (dur > 0 && Math.floor(cur) % 5 === 0) {
        saveWatchProgress({
          movieId: movie.id,
          currentTime: cur,
          duration: dur,
          lastWatched: new Date().toISOString(),
        });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const seekRelative = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds)
      );
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const next = !isMuted;
      setIsMuted(next);
      videoRef.current.muted = next;
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const h = Math.floor(m / 60);
    const remainingM = m % 60;
    if (h > 0) {
      return `${h}:${remainingM < 10 ? '0' : ''}${remainingM}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      {/* Top Overlay Header */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide truncate max-w-md">
              {movie.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="text-red-400 font-semibold">{movie.genre}</span>
              <span>•</span>
              <span>{movie.releaseYear}</span>
              <span>•</span>
              <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">
                {movie.contentRating}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-red-600 text-white transition border border-slate-700 hover:border-red-500 cursor-pointer shadow-lg"
          title="Close Player (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Video Display Area */}
      <div className="relative flex-1 bg-black flex items-center justify-center group overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Loading Movie Stream...</p>
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-950 border border-red-600/60 flex items-center justify-center text-red-400 shadow-xl">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-lg font-bold text-white">Playback Error</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The specified video stream could not be loaded or is blocked by browser media policies.
                Please select an alternative streaming mirror below:
              </p>
            </div>

            {/* Stream Retry & Gallery Select Buttons */}
            <div className="flex flex-col items-center gap-3 pt-2 max-w-lg w-full">
              <button
                onClick={async () => {
                  setHasError(false);
                  setIsLoading(true);
                  const fresh = await getVideoUrl(movie.id, movie.videoUrl);
                  setActiveVideoUrl(fresh);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Uploaded Gallery Video</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50"
              >
                <Upload className="w-4 h-4" />
                <span>Select / Pick Video File from Gallery</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleGalleryFileSelect}
                className="hidden"
              />

              <button
                onClick={() => switchStream(DEFAULT_SAMPLE_VIDEO)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
              >
                <Tv className="w-4 h-4 text-red-400" />
                <span>Stream High-Speed Backup Sample</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="mt-4 text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Exit Player
            </button>
          </div>
        ) : (
          activeVideoUrl && (
            <video
              ref={videoRef}
              key={activeVideoUrl}
              src={activeVideoUrl}
              poster={movie.backdropUrl || movie.posterUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onError={handleVideoError}
              onLoadedMetadata={() => {
                setIsLoading(false);
                setHasError(false);
              }}
              onLoadedData={() => {
                setIsLoading(false);
                setHasError(false);
              }}
              onCanPlay={() => {
                setIsLoading(false);
                setHasError(false);
              }}
              onPlay={() => {
                setIsPlaying(true);
                setIsLoading(false);
                setHasError(false);
              }}
              onPlaying={() => {
                setIsPlaying(true);
                setIsLoading(false);
                setHasError(false);
              }}
              onPause={() => {
                setIsPlaying(false);
              }}
              onWaiting={() => {
                setIsLoading(true);
              }}
              onClick={togglePlay}
              playsInline
              controls={false}
              className="w-full h-full object-contain max-h-screen cursor-pointer"
            />
          )
        )}

        {/* Center Big Play Button overlay */}
        {!isPlaying && !hasError && (
          <button
            onClick={togglePlay}
            className="absolute p-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white shadow-2xl backdrop-blur-md transform transition hover:scale-110 cursor-pointer z-20"
          >
            <Play className="w-10 h-10 fill-white ml-1 stroke-none" />
          </button>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-3 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Progress Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-300 min-w-[45px]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600 hover:h-2.5 transition-all"
          />
          <span className="text-xs font-mono text-slate-400 min-w-[45px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Control Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={hasError}
              className="p-2.5 rounded-full bg-slate-800/80 hover:bg-red-600 text-white transition cursor-pointer disabled:opacity-50"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white stroke-none ml-0.5" />}
            </button>

            <button
              onClick={() => seekRelative(-10)}
              className="p-2 hover:text-white text-slate-400 transition cursor-pointer"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => seekRelative(10)}
              className="p-2 hover:text-white text-slate-400 transition cursor-pointer"
              title="Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={toggleMute}
                className="p-2 hover:text-white text-slate-300 transition cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-24 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-red-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Stream Mirror Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-[11px]">
              <span className="text-slate-500 px-1 font-mono">Stream:</span>
              {MIRROR_STREAMS.slice(0, 3).map((ms, idx) => (
                <button
                  key={idx}
                  onClick={() => switchStream(ms.url)}
                  className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                    activeVideoUrl === ms.url ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  #{idx + 1}
                </button>
              ))}
            </div>

            {/* Speed Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                    playbackSpeed === s
                      ? 'bg-red-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:text-white text-slate-300 transition cursor-pointer"
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Movie, Review, WatchProgress } from '../types';
import { INITIAL_MOVIES, ADMIN_EMAIL } from '../data/initialMovies';

const MOVIES_STORAGE_KEY = 'cinestream_movies_v1';
const WATCHLIST_STORAGE_KEY = 'cinestream_watchlist_v1';
const REVIEWS_STORAGE_KEY = 'cinestream_reviews_v1';
const WATCH_PROGRESS_KEY = 'cinestream_watch_progress_v1';
const CURRENT_USER_KEY = 'cinestream_current_user_v1';

// Initialize IndexedDB & In-Memory cache for storing heavy video blobs
const DB_NAME = 'CineStreamVideoDB';
const DB_VERSION = 1;
const STORE_NAME = 'video_blobs';

const inMemoryVideoMap = new Map<string, Blob>();
const activeObjectUrlMap = new Map<string, string>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveVideoFile(id: string, file: File): Promise<string> {
  // Store in memory cache for immediate instant access
  inMemoryVideoMap.set(id, file);

  // Revoke old object URL if any
  if (activeObjectUrlMap.has(id)) {
    try {
      URL.revokeObjectURL(activeObjectUrlMap.get(id)!);
    } catch {
      // ignore
    }
  }

  const objectUrl = URL.createObjectURL(file);
  activeObjectUrlMap.set(id, objectUrl);

  try {
    const db = await openDB();
    const arrayBuffer = await file.arrayBuffer();
    const record = {
      buffer: arrayBuffer,
      type: file.type || 'video/mp4',
      name: file.name,
      size: file.size,
      updatedAt: Date.now(),
    };
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(record, id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to save video ArrayBuffer to IndexedDB, attempting raw file storage fallback:', err);
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(file, id);
    } catch {
      // ignore
    }
  }

  // Return pointer URL for localStorage
  return objectUrl;
}

export const DEFAULT_SAMPLE_VIDEO = 'https://vjs.zencdn.net/v/oceans.mp4';

export async function getVideoUrl(id: string, fallbackUrl: string): Promise<string> {
  // 1. Check if we already have an active stable Object URL for this video ID
  if (activeObjectUrlMap.has(id)) {
    const cachedUrl = activeObjectUrlMap.get(id);
    if (cachedUrl) return cachedUrl;
  }

  // 2. Check in-memory blob cache
  if (inMemoryVideoMap.has(id)) {
    const cachedBlob = inMemoryVideoMap.get(id);
    if (cachedBlob && cachedBlob.size > 0) {
      try {
        const url = URL.createObjectURL(cachedBlob);
        activeObjectUrlMap.set(id, url);
        return url;
      } catch {
        // Fall through
      }
    }
  }

  // 3. Check if fallbackUrl is a persistent Data URL (from gallery upload)
  if (fallbackUrl && fallbackUrl.startsWith('data:')) {
    return fallbackUrl;
  }

  // 4. Retrieve from IndexedDB store
  try {
    const db = await openDB();
    const storedRecord = await new Promise<any>((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });

    if (storedRecord) {
      let blob: Blob | null = null;
      if (storedRecord instanceof Blob || storedRecord instanceof File) {
        blob = storedRecord;
      } else if (storedRecord && typeof storedRecord === 'object' && storedRecord.buffer) {
        blob = new Blob([storedRecord.buffer], { type: storedRecord.type || 'video/mp4' });
      } else if (storedRecord instanceof ArrayBuffer) {
        blob = new Blob([storedRecord], { type: 'video/mp4' });
      }

      if (blob && blob.size > 0) {
        inMemoryVideoMap.set(id, blob);
        const url = URL.createObjectURL(blob);
        activeObjectUrlMap.set(id, url);
        return url;
      }
    }
  } catch (err) {
    console.warn('Error reading video from IndexedDB:', err);
  }

  // 5. Return valid direct network URLs or active blob URLs
  if (fallbackUrl && (fallbackUrl.startsWith('http://') || fallbackUrl.startsWith('https://') || fallbackUrl.startsWith('blob:'))) {
    return fallbackUrl;
  }

  return fallbackUrl || DEFAULT_SAMPLE_VIDEO;
}

// Movies CRUD
export function getStoredMovies(): Movie[] {
  try {
    const data = localStorage.getItem(MOVIES_STORAGE_KEY);
    if (data === null) {
      localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(data) as Movie[];
    if (!Array.isArray(parsed)) return [];

    // Filter out old demo movies (movie-1 through movie-8) so only user uploaded videos remain
    const userOnlyMovies = parsed.filter(m => !/^movie-[1-8]$/.test(m.id));
    if (userOnlyMovies.length !== parsed.length) {
      saveMovies(userOnlyMovies);
    }
    return userOnlyMovies;
  } catch (err) {
    console.error('Error loading movies from storage:', err);
    return [];
  }
}

export function saveMovies(movies: Movie[]): void {
  try {
    localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(movies));
  } catch (err) {
    console.warn('Storage quota exceeded, stripping heavy data URLs for localStorage fallback:', err);
    try {
      const cleaned = movies.map((m) => ({
        ...m,
        videoUrl: m.videoUrl?.startsWith('data:') ? `indexeddb://${m.id}` : m.videoUrl,
        posterUrl: m.posterUrl && m.posterUrl.length > 100000 ? '' : m.posterUrl,
      }));
      localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(cleaned));
    } catch (e) {
      console.error('Fatal localStorage error:', e);
    }
  }
}

export function addMovie(newMovie: Omit<Movie, 'createdAt' | 'viewsCount'> & { id?: string }, userEmail?: string): { success: boolean; movie?: Movie; error?: string } {
  const email = (userEmail || '').trim().toLowerCase();
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return { success: false, error: 'Upload restricted to Owner Admin. Customers can stream and watch all videos.' };
  }

  const existingMovies = getStoredMovies();
  const created: Movie = {
    ...newMovie,
    id: newMovie.id || `movie-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
    viewsCount: 0,
    uploadedBy: ADMIN_EMAIL
  };

  const updated = [created, ...existingMovies];
  saveMovies(updated);
  return { success: true, movie: created };
}

export function deleteMovie(movieId: string, userEmail?: string): { success: boolean; error?: string } {
  const email = (userEmail || '').trim().toLowerCase();
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return { success: false, error: 'Deletion restricted to Owner Admin.' };
  }
  const existing = getStoredMovies();
  const updated = existing.filter(m => m.id !== movieId);
  saveMovies(updated);
  return { success: true };
}

export function deleteAllDemoMovies(userEmail?: string): { success: boolean; error?: string } {
  const email = (userEmail || '').trim().toLowerCase();
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return { success: false, error: 'Action restricted to Owner Admin.' };
  }
  const existing = getStoredMovies();
  const demoIds = new Set(INITIAL_MOVIES.map(m => m.id));
  const updated = existing.filter(m => !demoIds.has(m.id));
  saveMovies(updated);
  return { success: true };
}

export function clearAllMovies(userEmail?: string): { success: boolean; error?: string } {
  const email = (userEmail || '').trim().toLowerCase();
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return { success: false, error: 'Action restricted to Owner Admin.' };
  }
  saveMovies([]);
  return { success: true };
}

export function resetToDemoMovies(userEmail?: string): { success: boolean; error?: string } {
  const email = (userEmail || '').trim().toLowerCase();
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return { success: false, error: 'Action restricted to Owner Admin.' };
  }
  saveMovies(INITIAL_MOVIES);
  return { success: true };
}

export function updateMovie(movieId: string, updates: Partial<Movie>, userEmail?: string): { success: boolean; error?: string } {
  const email = (userEmail || '').trim().toLowerCase();
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    return { success: false, error: 'Editing restricted to Owner Admin.' };
  }
  const existing = getStoredMovies();
  const updated = existing.map(m => m.id === movieId ? { ...m, ...updates } : m);
  saveMovies(updated);
  return { success: true };
}

export function incrementViews(movieId: string): void {
  const existing = getStoredMovies();
  const updated = existing.map(m => m.id === movieId ? { ...m, viewsCount: m.viewsCount + 1 } : m);
  saveMovies(updated);
}

// Watchlist
export function getWatchlist(): string[] {
  try {
    const data = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleWatchlist(movieId: string): string[] {
  const list = getWatchlist();
  const exists = list.includes(movieId);
  const updated = exists ? list.filter(id => id !== movieId) : [...list, movieId];
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update watchlist', e);
  }
  return updated;
}

// Watch Progress / History
export function getWatchProgress(): Record<string, WatchProgress> {
  try {
    const data = localStorage.getItem(WATCH_PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveWatchProgress(progress: WatchProgress): void {
  try {
    const current = getWatchProgress();
    current[progress.movieId] = progress;
    localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
}

// Reviews
export function getMovieReviews(movieId: string): Review[] {
  try {
    const data = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const allReviews: Record<string, Review[]> = data ? JSON.parse(data) : {};
    return allReviews[movieId] || [];
  } catch {
    return [];
  }
}

export function addMovieReview(movieId: string, review: Omit<Review, 'id' | 'createdAt'>): Review[] {
  try {
    const data = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const allReviews: Record<string, Review[]> = data ? JSON.parse(data) : {};
    const movieReviews = allReviews[movieId] || [];
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    allReviews[movieId] = [newRev, ...movieReviews];
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(allReviews));
    return allReviews[movieId];
  } catch {
    return [];
  }
}

// User Session
export function getCurrentUserEmail(): string {
  return localStorage.getItem(CURRENT_USER_KEY) || ADMIN_EMAIL;
}

export function setCurrentUserEmail(email: string): void {
  localStorage.setItem(CURRENT_USER_KEY, email);
}

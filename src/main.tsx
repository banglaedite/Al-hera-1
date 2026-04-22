import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// --- Smart API Cache Wrapper to reduce Firestore reads ---
const originalFetch = window.fetch;
const fetchCache = new Map<string, {data: any, timestamp: number}>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes TTL

declare global {
  interface Window {
    clearAppCache: () => void;
  }
}
window.clearAppCache = () => fetchCache.clear();

const IGNORE_CACHE = [
  '/api/admin/pending-counts',
  '/api/admin/device-history'
];

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const urlStr = typeof input === 'string' 
    ? input 
    : (input instanceof URL ? input.toString() : (input instanceof Request ? input.url : ""));
  const method = init?.method || (input instanceof Request ? input.method : 'GET');

  if (urlStr.includes('/api/')) {
    if (method === 'GET') {
      const isIgnored = IGNORE_CACHE.some(prefix => urlStr.includes(prefix));
      
      if (!isIgnored) {
        const cached = fetchCache.get(urlStr);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
          return {
            ok: true,
            status: 200,
            json: async () => cached.data,
            text: async () => JSON.stringify(cached.data),
            clone: function() { return this; }
          } as unknown as Response;
        }
  
        const response = await originalFetch(input, init);
        if (response.ok) {
          const cloned = response.clone();
          try {
            const data = await cloned.json();
            fetchCache.set(urlStr, { data, timestamp: Date.now() });
          } catch(e) {
            // Ignore parse errors
          }
        }
        return response;
      }
    } else {
      // It's a mutation (POST, PUT, DELETE) to an /api/ endpoint.
      // We explicitly clear the cache to ensure the UI updates with fresh data afterwards.
      fetchCache.clear();
    }
  }

  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    configurable: true,
    writable: true
  });
} catch (e) {
  console.warn("Could not redefine window.fetch", e);
  // Fallback: we cannot override fetch.
}
// --------------------------------------------------------

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

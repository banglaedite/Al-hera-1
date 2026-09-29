import { Component, StrictMode, type ReactNode } from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// --- Smart API Cache Wrapper & Safe JSON Parser to prevent '<!doctype' JSON crash ---
const originalFetch = window.fetch;
const originalResponseJson = Response.prototype.json;

// Safely intercept Response.prototype.json so that any non-JSON or HTML response (like 404/500/SPA fallback)
// does not crash with "Unexpected token '<', '<!doctype '... is not valid JSON"
Response.prototype.json = async function() {
  try {
    const contentType = this.headers && typeof this.headers.get === 'function' ? this.headers.get('content-type') : '';
    if (contentType && contentType.includes('text/html')) {
      console.warn("Response has text/html content-type, returning safe fallback object.");
      return {};
    }
    const text = await this.text();
    if (!text || !text.trim()) {
      return {};
    }
    const trimmed = text.trim();
    if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype')) {
      console.warn("API response was HTML instead of JSON. Prevented syntax error:", trimmed.slice(0, 80));
      return {};
    }
    return JSON.parse(text);
  } catch (err) {
    console.warn("JSON parse error avoided:", err);
    return {};
  }
};

declare global {
  interface Window {
    clearAppCache?: () => void;
  }
}
window.clearAppCache = () => {
  try {
    sessionStorage.clear();
    localStorage.removeItem("siteSettings");
  } catch (e) {}
};

// Resilient fetch wrapper with automatic timeout to prevent infinite hangs
const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const urlStr = typeof input === 'string' 
    ? input 
    : (input instanceof URL ? input.toString() : (input instanceof Request ? input.url : ""));

  // Add a 12-second safety timeout so API calls never hang indefinitely
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let signal = controller.signal;
  if (init?.signal) {
    const callerSignal = init.signal;
    if (callerSignal.aborted) {
      controller.abort();
    } else {
      callerSignal.addEventListener('abort', () => controller.abort());
    }
  }

  const mergedInit: RequestInit = { ...init, signal };

  try {
    const response = await originalFetch(input, mergedInit);
    clearTimeout(timeoutId);
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);

    // If site-settings network request failed or timed out, gracefully return cached fallback as a REAL Response
    if (urlStr.includes('/api/site-settings')) {
      let cachedData: any = null;
      try {
        const cached = localStorage.getItem("siteSettings");
        if (cached) cachedData = JSON.parse(cached);
      } catch (e) {}

      const fallback = cachedData || {
        id: "1",
        title: "আল-হেরা মাদ্রাসা মধুপুর",
        description: "জেনারেল এবং মাদ্রাসার সমন্বয়ে আপনার সন্তান হয়ে উঠবে সকল বিষয়ে দক্ষ ও অভিজ্ঞ ।",
        hero_image: "https://i.postimg.cc/3r0cV1jx/MUSLIMBONGO-PC-Ver.jpg",
        contact_phone: "+880 1725-003651",
        whatsapp_number: "01725003651",
        facebook_url: "https://www.facebook.com/share/1Abk8iHagA/",
        announcement: "আদর্শ ছাত্র গড়ার নির্ভরযোগ্য প্রতিষ্ঠান",
        logo_url: "https://i.postimg.cc/jSZykhDB/IMG-20260330-WA0001.png"
      };

      return new Response(JSON.stringify(fallback), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Fallback': 'true'
        }
      });
    }

    throw err;
  }
};

try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    configurable: true,
    writable: true
  });
} catch (e) {
  console.warn("Could not redefine window.fetch", e);
}
// --------------------------------------------------------

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends (Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Application error caught by boundary:", error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem("siteSettings");
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      }
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#064e3b', color: '#ffffff', fontFamily: 'system-ui, sans-serif', padding: '20px', textAlign: 'center' }}>
          <div style={{ background: '#042f24', border: '1px solid #059669', borderRadius: '24px', padding: '32px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>
              ✓
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px', color: '#ffffff' }}>আল-হেরা মাদরাসা অ্যাপস</h2>
            <p style={{ fontSize: '14px', color: '#a7f3d0', margin: '0 0 24px', lineHeight: '1.5' }}>
              অ্যাপটি চালু হতে সাময়িক বিলম্ব হচ্ছে। নিচের বাটনে চাপ দিয়ে পুনরায় রিফ্রেশ করুন।
            </p>
            <button
              onClick={this.handleReload}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: '#10b981', color: '#022c22', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)' }}
            >
              অ্যাপস ওপেন করুন / রিফ্রেশ
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

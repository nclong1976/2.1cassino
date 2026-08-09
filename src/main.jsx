import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Safely handle fetch property override if needed by third party scripts
if (typeof window !== 'undefined') {
  try {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch') || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), 'fetch');
    if (desc && !desc.set && desc.configurable) {
      let currentFetch = window.fetch;
      Object.defineProperty(window, 'fetch', {
        get: () => currentFetch,
        set: (fn) => { currentFetch = fn; },
        configurable: true,
        enumerable: true,
      });
    }
  } catch {
    /* ignore */
  }

  // Suppress harmless Base44 404 SDK error logs in dev environment when backend endpoints are missing
  const origError = console.error;
  console.error = function (...args) {
    const msg = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    if (msg.includes('[Base44 SDK Error]') || msg.includes('App not found')) {
      return;
    }
    origError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)


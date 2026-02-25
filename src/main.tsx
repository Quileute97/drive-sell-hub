import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
// @ts-ignore
import '@fontsource/inter'

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Initialize Web Vitals monitoring after app mounts
if (typeof window !== 'undefined') {
  import('./lib/webVitals').then(({ initWebVitals }) => {
    initWebVitals();
  });
}

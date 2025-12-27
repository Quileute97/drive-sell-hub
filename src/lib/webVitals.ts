import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

type MetricHandler = (metric: {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
}) => void;

const reportWebVitals = (onPerfEntry?: MetricHandler) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

// Log to console in development, can be extended to send to analytics
export const initWebVitals = () => {
  if (typeof window !== 'undefined') {
    reportWebVitals((metric) => {
      // Log metrics in development
      if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: Math.round(metric.value),
          rating: metric.rating,
        });
      }
      
      // Send to analytics endpoint (can be customized)
      // Example: send to Google Analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        });
      }
    });
  }
};

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default reportWebVitals;

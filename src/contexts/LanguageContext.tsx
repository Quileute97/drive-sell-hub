import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  SupportedLanguage,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  LanguageMeta,
  isValidLanguage,
  normalizeLanguage,
} from '@/lib/i18n/languages';
import { TRANSLATIONS, Translations } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  langMeta: LanguageMeta;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (path: string, fallback?: string) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'preferred_language';

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  try {
    // 1. URL search param
    const searchParams = new URLSearchParams(window.location.search);
    const langParam = searchParams.get('lang');
    if (langParam && isValidLanguage(langParam)) {
      return normalizeLanguage(langParam);
    }

    // 2. LocalStorage preference
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidLanguage(stored)) {
      return normalizeLanguage(stored);
    }
  } catch {
    // Fallback on any error
  }

  return DEFAULT_LANGUAGE;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (!isValidLanguage(newLang)) return;
    setLanguageState(newLang);

    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;

      // Update URL search param if not default, or remove if default (vi)
      const url = new URL(window.location.href);
      if (newLang === DEFAULT_LANGUAGE) {
        url.searchParams.delete('lang');
      } else {
        url.searchParams.set('lang', newLang);
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Safe fallback
    }
  }, []);

  // Sync html lang attribute on mount and language change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Listen to popstate / external url changes
  useEffect(() => {
    const handleUrlChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const langParam = searchParams.get('lang');
      if (langParam && isValidLanguage(langParam) && langParam !== language) {
        setLanguageState(normalizeLanguage(langParam));
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [language]);

  const translations = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE], [language]);
  const langMeta = useMemo(() => SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE], [language]);

  // Nested translation helper: t("nav.home") or t("seo.siteTitle")
  const t = useCallback(
    (path: string, fallback?: string): string => {
      const parts = path.split('.');
      let current: unknown = translations;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          // Fallback to default (Vietnamese)
          let defaultCurrent: unknown = TRANSLATIONS[DEFAULT_LANGUAGE];
          for (const dPart of parts) {
            if (defaultCurrent && typeof defaultCurrent === 'object' && dPart in defaultCurrent) {
              defaultCurrent = (defaultCurrent as Record<string, unknown>)[dPart];
            } else {
              defaultCurrent = undefined;
              break;
            }
          }
          if (typeof defaultCurrent === 'string') return defaultCurrent;
          return fallback || path;
        }
      }

      if (typeof current === 'string') {
        return current;
      }

      return fallback || path;
    },
    [translations],
  );

  const value = useMemo(
    () => ({
      language,
      langMeta,
      setLanguage,
      t,
      translations,
    }),
    [language, langMeta, setLanguage, t, translations],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return fallback context if used outside provider (e.g. static tests)
    return {
      language: DEFAULT_LANGUAGE,
      langMeta: SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE],
      setLanguage: () => {},
      t: (path: string, fallback?: string) => fallback || path,
      translations: TRANSLATIONS[DEFAULT_LANGUAGE],
    };
  }
  return context;
}

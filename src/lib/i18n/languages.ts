export type SupportedLanguage = 'vi' | 'en' | 'zh' | 'es';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  locale: string;       // BCP 47 (e.g. vi-VN, en-US, zh-CN, es-ES)
  ogLocale: string;     // OpenGraph format (e.g. vi_VN, en_US, zh_CN, es_ES)
  isDefault?: boolean;
}

export const DEFAULT_LANGUAGE: SupportedLanguage = 'vi';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageMeta> = {
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    locale: 'vi-VN',
    ogLocale: 'vi_VN',
    isDefault: true,
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    locale: 'en-US',
    ogLocale: 'en_US',
  },
  zh: {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '中文 (简体)',
    flag: '🇨🇳',
    locale: 'zh-CN',
    ogLocale: 'zh_CN',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    locale: 'es-ES',
    ogLocale: 'es_ES',
  },
};

export const LANGUAGE_LIST = Object.values(SUPPORTED_LANGUAGES);

export function isValidLanguage(code: string | null | undefined): code is SupportedLanguage {
  if (!code) return false;
  return Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, code.toLowerCase());
}

export function normalizeLanguage(code: string | null | undefined): SupportedLanguage {
  if (!code) return DEFAULT_LANGUAGE;
  const clean = code.trim().toLowerCase().split(/[-_]/)[0];
  if (isValidLanguage(clean)) return clean;
  return DEFAULT_LANGUAGE;
}

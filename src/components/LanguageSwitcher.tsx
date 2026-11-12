import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_LIST, SupportedLanguage } from '@/lib/i18n/languages';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer' | 'compact';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { language, langMeta, setLanguage } = useLanguage();

  if (variant === 'footer') {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {LANGUAGE_LIST.map((lang) => {
          const isActive = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              aria-pressed={isActive}
              onClick={() => setLanguage(lang.code)}
              className={`inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-primary bg-primary text-primary-foreground hover:bg-primary-hover'
                  : 'border-border-strong bg-surface text-foreground hover:bg-button-hover'
              }`}
              title={`${lang.name} (${lang.nativeName})`}
              aria-label={`Switch language to ${lang.name}`}
            >
              <span>{lang.flag}</span>
              <span className="truncate">{lang.nativeName}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className={`h-10 px-3 text-sm font-medium flex items-center gap-1.5 rounded-xl ${className}`}
          aria-label="Select language"
        >
          <span className="text-base leading-none">{langMeta.flag}</span>
          <span className="hidden sm:inline font-medium uppercase tracking-wider">{langMeta.code}</span>
          <Globe className="h-3.5 w-3.5 opacity-60 ml-0.5 hidden md:inline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-1 shadow-[var(--shadow-popover)] rounded-xl border border-border bg-surface">
        {LANGUAGE_LIST.map((lang) => {
          const isSelected = lang.code === language;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{lang.flag}</span>
                <div className="flex flex-col">
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">{lang.name}</span>
                </div>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

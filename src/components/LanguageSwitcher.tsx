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
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {LANGUAGE_LIST.map((lang) => {
          const isActive = lang.code === language;
          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
              }`}
              title={`${lang.name} (${lang.nativeName})`}
              aria-label={`Switch language to ${lang.name}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
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
          variant="ghost"
          size="sm"
          className={`h-9 px-2.5 sm:px-3 text-xs font-medium flex items-center gap-1.5 rounded-lg border border-border/60 hover:bg-accent hover:text-accent-foreground ${className}`}
          aria-label="Select language"
        >
          <span className="text-base leading-none">{langMeta.flag}</span>
          <span className="hidden sm:inline font-medium uppercase tracking-wider">{langMeta.code}</span>
          <Globe className="h-3.5 w-3.5 opacity-60 ml-0.5 hidden md:inline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-1 shadow-lg rounded-xl border border-border/80">
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

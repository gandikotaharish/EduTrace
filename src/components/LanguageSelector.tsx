import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { LOCALE_NAMES, type SupportedLocale } from '@/ai/translation-engine/types';
import { SUPPORTED_LOCALES } from '@/ai/translation-engine/types';
import { setStoredLocale } from '@/i18n';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t('language')}>
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {SUPPORTED_LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => setStoredLocale(locale)}
            className={i18n.language === locale ? 'bg-accent' : ''}
          >
            {LOCALE_NAMES[locale as SupportedLocale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

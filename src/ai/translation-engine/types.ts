export type SupportedLocale =
  | 'en'
  | 'hi'
  | 'te'
  | 'ta'
  | 'kn'
  | 'bn'
  | 'mr';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'hi', 'te', 'ta', 'kn', 'bn', 'mr'];

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  hi: 'हिंदी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  bn: 'বাংলা',
  mr: 'मराठी',
};

export interface TranslatedConcept {
  name: string;
  description?: string;
  explanation: string;
  locale: SupportedLocale;
  simplified?: boolean;
}

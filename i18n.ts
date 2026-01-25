import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// 1. Define locales as a readonly constant
const locales = ['en', 'mn', 'de'] as const;

// 2. Extract the type (e.g., 'en' | 'mn' | 'de')
type Locale = (typeof locales)[number];

// 3. Define a type guard for validation
const isValidLocale = (locale: string): locale is Locale => {
  return locales.includes(locale as Locale);
};

export default getRequestConfig(async ({ locale }) => {
  // 4. Validate that locale is defined and valid
  if (!locale || !isValidLocale(locale)) {
    notFound();
  }

  return {
    // Pass locale back to satisfy the interface
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'mn', 'de'] as const;
type Locale = (typeof locales)[number];

const isValidLocale = (locale: string): locale is Locale => {
  return locales.includes(locale as Locale);
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  // console.log('[i18n/request] resolved locale:', locale);

  if (!locale || !isValidLocale(locale)) {
    // console.log('[i18n/request] Invalid or missing locale, calling notFound()');
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
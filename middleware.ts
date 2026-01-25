import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'mn', 'de'],

  // Used when no locale matches
  defaultLocale: 'mn'
});

const isAdminRoute = createRouteMatcher([
  '/:locale/admin(.*)',
  '/admin(.*)'
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/:locale',
  '/(mn|en|de)/sign-in(.*)',
  '/(mn|en|de)/sign-up(.*)',
  '/(mn|en|de)/join',
  '/(mn|en|de)/about',
  '/(mn|en|de)/aupair(.*)',
  '/(mn|en|de)/events(.*)',
  '/(mn|en|de)/lessons(.*)',
  '/(mn|en|de)/news(.*)',
  '/(mn|en|de)/contact',
  '/(mn|en|de)/booking',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/join',
  '/about',
  '/aupair(.*)',
  '/events(.*)',
  '/lessons(.*)',
  '/news(.*)',
  '/contact',
  '/booking',
  '/api/events(.*)',
  '/api/lessons(.*)',
  '/api/news(.*)',
  '/api/opportunities(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Handle Admin Route Protection
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;

    if (metadata?.role !== 'admin') {
      // Redirect unauthorized users to home with default locale if needed
      // Actually, next-intl will handle locale redirection if we just go to /
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // 2. Protect non-public routes
  if (!isPublicRoute(req) && !isAdminRoute(req)) {
    await auth.protect();
  }

  // 3. Apply I18n Middleware
  return intlMiddleware(req);
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\.(?:html?|css|js(?:on)?|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

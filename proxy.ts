import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
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
  // Admin route protection - check for admin role
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();

    const metadata = sessionClaims?.metadata as { role?: string } | undefined;

    if (metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Protect all non-public routes
  if (!isPublicRoute(req) && !isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
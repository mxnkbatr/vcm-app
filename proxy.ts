import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { requireNextAuthSecret } from "@/lib/env";

const intlMiddleware = createMiddleware({
    locales: ['en', 'mn', 'de'],
    defaultLocale: 'mn',
    localePrefix: 'always',
    localeDetection: false
});

const publicPaths = [
    '/',
    '/sign-in',
    '/sign-up',
    '/register',
    '/join',
    '/about',
    '/news',
    '/lessons',
    '/events',
    '/contact',
    '/booking',
    '/shop',
    '/programs',
    '/complete-profile',
    '/cart',
];

function isPublicRoute(pathname: string): boolean {
    // API auth routes are always public
    if (pathname.startsWith('/api/auth')) return true;

    // Public API routes
    const publicApis = ['/api/events', '/api/news', '/api/livekit', '/api/shopping', '/api/lessons', '/api/posts', '/api/purchases', '/api/banners'];
    if (publicApis.some(api => pathname.startsWith(api))) return true;

    // Remove locale prefix for path matching
    const pathWithoutLocale = pathname.replace(/^\/(en|mn|de)/, '') || '/';

    // Өргөдлийн маягт — нэвтэрсэн хэрэглэгчид л (programs/* бусад нь public хэвээр)
    if (pathWithoutLocale === '/programs/apply' || pathWithoutLocale.startsWith('/programs/apply/')) {
        return false;
    }

    // Check public paths
    return publicPaths.some(p => {
        if (p === '/') return pathWithoutLocale === '/';
        return pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/');
    });
}

export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    // console.log('[Middleware] Processing URL:', req.url);

    // Skip static files
    if (pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // API routes — check auth but skip intl
    if (pathname.startsWith('/api')) {
        if (isPublicRoute(pathname)) {
            return NextResponse.next();
        }

        // Check NextAuth token for protected API routes
        const token = await getToken({ req, secret: requireNextAuthSecret() });
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        return NextResponse.next();
    }

    // Non-API routes — check auth for protected pages, then run intl
    const localeMatch = pathname.match(/^\/(en|mn|de)/);
    const locale = localeMatch ? localeMatch[1] : 'mn';

    if (!isPublicRoute(pathname)) {
        const token = await getToken({ req, secret: requireNextAuthSecret() });
        if (!token) {
            const signInUrl = new URL(`/${locale}/sign-in`, req.url);
            signInUrl.searchParams.set('callbackUrl', req.url);
            return NextResponse.redirect(signInUrl);
        }

        // Onboarding guard: if authenticated but profile is incomplete, redirect to complete-profile
        const profileComplete = (token as any)?.profileComplete;
        const pathWithoutLocale = pathname.replace(/^\/(en|mn|de)/, '') || '/';
        const allowed = [
          '/complete-profile',
          '/sign-out',
        ];
        const isAllowed = allowed.some(p => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/'));
        if (profileComplete === false && !isAllowed) {
          return NextResponse.redirect(new URL(`/${locale}/complete-profile`, req.url));
        }
    }

    // Run i18n middleware
    return intlMiddleware(req);
}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};

import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';

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
    '/privacy',
    '/news',
    '/lessons',
    '/events',
    '/contact',
    '/shop',
    '/programs',
    '/complete-profile',
    '/cart',
];

function isPublicRoute(pathname: string): boolean {
    if (pathname.startsWith('/api/auth')) return true;

    const publicApis = ['/api/events', '/api/news', '/api/livekit', '/api/shopping', '/api/lessons', '/api/posts', '/api/purchases', '/api/banners', '/api/programs'];
    if (publicApis.some(api => pathname.startsWith(api))) return true;

    const pathWithoutLocale = pathname.replace(/^\/(en|mn|de)/, '') || '/';

    if (pathWithoutLocale === '/programs/apply' || pathWithoutLocale.startsWith('/programs/apply/')) {
        return false;
    }

    return publicPaths.some(p => {
        if (p === '/') return pathWithoutLocale === '/';
        return pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/');
    });
}

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next();
    }

    const { supabaseResponse, user } = await updateSession(req);

    if (pathname.startsWith('/api')) {
        if (isPublicRoute(pathname)) {
            return supabaseResponse;
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return supabaseResponse;
    }

    const localeMatch = pathname.match(/^\/(en|mn|de)/);
    const locale = localeMatch ? localeMatch[1] : 'mn';

    if (!isPublicRoute(pathname)) {
        if (!user) {
            const signInUrl = new URL(`/${locale}/sign-in`, req.url);
            signInUrl.searchParams.set('callbackUrl', req.url);
            return NextResponse.redirect(signInUrl);
        }

        const profileComplete = user.user_metadata?.profile_complete;
        const pathWithoutLocale = pathname.replace(/^\/(en|mn|de)/, '') || '/';
        const allowed = ['/complete-profile', '/sign-out'];
        const isAllowed = allowed.some(p => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/'));
        if (profileComplete === false && !isAllowed) {
            return NextResponse.redirect(new URL(`/${locale}/complete-profile`, req.url));
        }
    }

    const intlResponse = intlMiddleware(req);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        intlResponse.cookies.set(cookie.name, cookie.value);
    });
    return intlResponse;
}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};

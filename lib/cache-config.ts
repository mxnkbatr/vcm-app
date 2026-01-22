// Cache configuration for consistent caching across the app

export const CACHE_TAGS = {
    users: (id?: string) => (id ? `user-${id}` : 'users'),
    lessons: (id?: string) => (id ? `lesson-${id}` : 'lessons'),
    events: (id?: string) => (id ? `event-${id}` : 'events'),
    bookings: (userId?: string) => (userId ? `bookings-${userId}` : 'bookings'),
    news: (id?: string) => (id ? `news-${id}` : 'news'),
    opportunities: (id?: string) => (id ? `opportunity-${id}` : 'opportunities'),
    applications: (userId?: string) => (userId ? `applications-${userId}` : 'applications'),
} as const;

export const CACHE_TIMES = {
    static: 3600, // 1 hour - for rarely changing data
    dynamic: 60,  // 1 minute - for frequently updated data
    user: 30,     // 30 seconds - for user-specific data
    realtime: 0,  // No cache - for real-time data
} as const;

// Helper to create cache control headers
export function createCacheHeaders(maxAge: number, staleWhileRevalidate = maxAge * 2) {
    return {
        'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    };
}

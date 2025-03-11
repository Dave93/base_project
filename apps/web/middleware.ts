// frontend/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { localEdenClient } from "./lib/eden";

// Create the intl middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const sessionKey = request.cookies.get("session")?.value;

    // Check if the path is a login route (with or without locale)
    const isLoginRoute = pathname === '/login' ||
        pathname.match(/^\/(de|en)\/login$/) !== null;

    // Skip auth check for login pages but apply intl
    if (isLoginRoute) {
        return intlMiddleware(request);
    }

    // Check if the request is for a dashboard route (with or without locale)
    const isDashboardRoute = pathname.startsWith('/dashboard') ||
        pathname.match(/^\/(de|en)\/dashboard/) !== null;

    // Handle authentication for dashboard routes
    if (isDashboardRoute) {
        if (!sessionKey) {
            // Redirect to the login page with the current locale if present
            const locale = ['de', 'en'].includes(pathname.split('/')[1])
                ? `/${pathname.split('/')[1]}`
                : '';
            return NextResponse.redirect(new URL(`${locale}/login`, request.url));
        }

        // Verify session with backend
        const { status } = await localEdenClient.api.v1.users.me.get({
            headers: {
                Cookie: `session=${sessionKey}`,
            },
        });

        if (status !== 200) {
            const locale = ['de', 'en'].includes(pathname.split('/')[1])
                ? `/${pathname.split('/')[1]}`
                : '';
            return NextResponse.redirect(new URL(`${locale}/login`, request.url));
        }
    }

    // Apply intl middleware to all matched routes
    return intlMiddleware(request);
}

export const config = {
    matcher: [
        // Dashboard routes with and without locale
        '/dashboard/:path*',
        '/(de|en)/dashboard/:path*',
        // Login routes with and without locale
        '/login',
        '/(de|en)/login',
        // Other internationalized routes
        '/',
        '/(de|en)/:path*'
    ],
};
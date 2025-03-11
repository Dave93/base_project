// frontend/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { localEdenClient } from "./lib/eden";
import { permissions } from "@auth-apps/db";

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

// Combined middleware
export async function middleware(request: NextRequest) {
    // First, handle the authentication check
    const sessionKey = request.cookies.get("session")?.value;
    const isLoginRoute = request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname.match(/^\/(de|en)\/login$/) !== null;
    const isForbiddenRoute = request.nextUrl.pathname === '/forbidden' ||
        request.nextUrl.pathname.match(/^\/(de|en)\/forbidden$/) !== null;

    // Skip auth check for login page and forbidden page
    if (isLoginRoute || isForbiddenRoute) {
        return intlMiddleware(request);
    }

    // If no session, redirect to login
    if (!sessionKey) {
        // Redirect to the login page with the current locale if present
        const locale = ['de', 'en'].includes(request.nextUrl.pathname.split('/')[1])
            ? `/${request.nextUrl.pathname.split('/')[1]}`
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
        // Redirect to the login page with the current locale if present
        const locale = ['de', 'en'].includes(request.nextUrl.pathname.split('/')[1])
            ? `/${request.nextUrl.pathname.split('/')[1]}`
            : '';
        return NextResponse.redirect(new URL(`${locale}/login`, request.url));
    }

    const { status: permissionsStatus, data: permissionsData } = await localEdenClient.api.v1.users.permissions.get({
        headers: {
            Cookie: `session=${sessionKey}`,
        },
    });

    if (permissionsStatus !== 200) {
        // Redirect to the login page with the current locale if present
        const locale = ['de', 'en'].includes(request.nextUrl.pathname.split('/')[1])
            ? `/${request.nextUrl.pathname.split('/')[1]}`
            : '';
        return NextResponse.redirect(new URL(`${locale}/login`, request.url));
    } else if (permissionsData && !permissionsData.permissions.includes("dashboard.access")) {
        // Redirect to the forbidden page with the current locale if present
        const locale = ['de', 'en'].includes(request.nextUrl.pathname.split('/')[1])
            ? `/${request.nextUrl.pathname.split('/')[1]}`
            : '';
        return NextResponse.redirect(new URL(`${locale}/forbidden`, request.url));
    }

    // If authenticated, apply the intl middleware
    return intlMiddleware(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Include internationalized paths
         */
        '/((?!api|_next/static|_next/image|favicon\\.ico).*)',
        '/',
        '/(de|en)/:path*'
    ],
};
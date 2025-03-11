// frontend/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { localEdenClient } from "./lib/eden";

export async function middleware(request: NextRequest) {
    const sessionKey = request.cookies.get("session")?.value;

    if (!sessionKey) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify session with backend
    const {
        status
    } = await localEdenClient.api.v1.users.me.get({
        headers: {
            Cookie: `session=${sessionKey}`,
        },
    });

    if (status !== 200) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
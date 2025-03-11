import Elysia from "elysia";
import { redis } from "./db";
import { db } from "./db";
import { CacheService } from "./services/cache";

const ctx = new Elysia({
    name: "@app/ctx"
})
    .decorate("db", db)
    .decorate("redis", redis)
    .decorate("cacheService", new CacheService(redis, db))
    .macro({
        useAuth(enabled: boolean = true) {
            if (!enabled) return {
                resolve() {
                    return {
                        user: null
                    };
                }
            };

            return {
                beforeHandle: async ({ cookie, error, cacheService }) => {
                    const token = cookie.session.value;
                    const refreshToken = cookie.refreshToken.value;

                    if (!token && !refreshToken) {
                        throw error(403, "Unauthorized");
                    }

                    // Check if session exists in Redis
                    let session = await redis.get(`${process.env.PROJECT_PREFIX}:session:${token}`);
                    if (!session) {
                        const refreshSession = await redis.get(`${process.env.PROJECT_PREFIX}:session:${refreshToken}`);
                        if (!refreshSession) {
                            throw error(403, "Invalid session");
                        }
                        session = refreshSession;

                        const refreshSessionData = JSON.parse(refreshSession) as unknown as {
                            id: string;
                            email: string;
                            name: string | null;
                            role: {
                                id: string;
                                name: string;
                                code: string;
                                permissions: string[];
                            } | null;
                        }

                        const newSessionData = await cacheService.setUserSession(refreshSessionData, refreshToken);

                        cookie.session.value = newSessionData.accessToken;
                        cookie.refreshToken.value = newSessionData.refreshToken;
                    }

                    // Parse session data
                    try {
                        const sessionData = JSON.parse(session) as unknown as {
                            id: string;
                            email: string;
                            name: string | null;
                            role: {
                                id: string;
                                name: string;
                                code: string;
                                permissions: string[];
                            } | null;
                        };
                    } catch (err) {
                        throw error(500, "Invalid session data");
                    }
                },
                resolve: async ({ cookie }) => {
                    const token = cookie.session.value;
                    if (!token) {
                        return {
                            user: null
                        };
                    }

                    const session = await redis.get(`${process.env.PROJECT_PREFIX}:session:${token}`);
                    if (!session) {
                        return {
                            user: null
                        };
                    }

                    const sessionData = JSON.parse(session) as unknown as {
                        id: string;
                        email: string;
                        name: string | null;
                        role: {
                            id: string;
                            name: string;
                            code: string;
                            permissions: string[];
                        } | null;
                    };

                    return {
                        user: sessionData
                    };
                }
            };
        },
    })
    .as("global")

export default ctx;

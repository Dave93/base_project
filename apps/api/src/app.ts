import cookie from "@elysiajs/cookie";
import cors from "@elysiajs/cors";
import { Elysia } from "elysia";

const app = new Elysia()
    // Add middleware
    .use(cors())
    .use(cookie())
    // Add health check endpoint
    .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))

export type App = typeof app;
export default app;
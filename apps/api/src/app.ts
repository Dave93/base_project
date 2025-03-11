import cookie from "@elysiajs/cookie";
import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { v1Controller } from "./controllers/v1";
import { userController } from "./controllers/v1/users/controller";
const app = new Elysia()
    // Add middleware
    .use(cors())
    .use(cookie())
    .use(v1Controller)
    // Add health check endpoint
    .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
    ;

export type App = typeof app;
export default app;
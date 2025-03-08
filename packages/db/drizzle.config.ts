import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";
export default defineConfig({
    schema: "./src/schema.ts",
    out: "./src/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url:
            process.env.DATABASE_URL ||
            "postgres://postgres:postgres@localhost:5432/auth_apps",
    },
}) satisfies Config; 
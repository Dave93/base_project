import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Database connection string from environment variable
const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/auth_apps";

// Create postgres connection
const client = postgres(connectionString, {
    max: 10, // Max number of connections
});

// Create drizzle database instance
export const db = drizzle(client, { schema });

// Export schema for use in other packages
export * from "./schema"; 
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "../index";

// This will run migrations on the database, creating tables if they don't exist
async function main() {
    console.log("Running migrations...");

    try {
        await migrate(db, { migrationsFolder: "./src/migrations" });
        console.log("Migrations complete!");
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }

    process.exit(0);
}

main(); 
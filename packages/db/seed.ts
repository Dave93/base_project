#!/usr/bin/env bun

import { db, users, NewUser, roles, permissions, role_permissions } from "./src";
import { input, confirm, password, select } from "@inquirer/prompts";
import chalk from "chalk";
import { nanoid } from "nanoid";
import ora from "ora";
import figlet from "figlet";
import { eq } from "drizzle-orm";

/**
 * User Registration CLI Tool
 * 
 * A step-by-step CLI tool to create new users in the database
 * with proper password hashing and validation.
 */

// Display welcome banner
console.log(
    chalk.cyan(
        figlet.textSync("User Creator", {
            font: "Standard",
            horizontalLayout: "default",
            verticalLayout: "default",
        })
    )
);
console.log(chalk.yellow("✨ Interactive user creation tool ✨\n"));

async function main() {
    try {

        await checkIfAdminUserExists();

        // Step 1: Collect user information
        const userData = await collectUserData();

        // Step 2: Confirm user creation
        const shouldCreate = await confirm({
            message: "Do you want to create this user?",
            default: true,
        });

        if (!shouldCreate) {
            console.log(chalk.yellow("User creation cancelled."));
            process.exit(0);
        }

        // Step 3: Create the user
        await createUser(userData);

    } catch (error) {
        console.error(chalk.red("Error during user creation:"), error);
        process.exit(1);
    } finally {
        // Ensure the process exits
        process.exit(0);
    }
}

async function checkIfAdminUserExists() {
    const adminRole = await db.select().from(roles).where(eq(roles.code, "admin")).limit(1);
    if (adminRole.length > 0) {
        const adminUser = await db.select().from(users).where(eq(users.role_id, adminRole[0].id)).limit(1);
        if (adminUser.length > 0) {
            console.error(chalk.red("Admin user already exists."));
            process.exit(0);
        }
    }

    return false;
}

async function collectUserData(): Promise<Omit<NewUser, "id" | "createdAt" | "updatedAt">> {
    console.log(chalk.blue("Please provide the following information:"));

    // Get email with validation
    const email = await input({
        message: "Email address:",
        validate: (value: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) return "Email is required";
            if (!emailRegex.test(value)) return "Please enter a valid email address";
            return true;
        },
    });

    // Get name
    const name = await input({
        message: "Full name:",
        validate: (value: string) => {
            if (!value) return "Name is required";
            return true;
        },
    });

    // Get password with confirmation
    const userPassword = await password({
        message: "Password:",
        mask: true,
        validate: (value: string) => {
            if (!value) return "Password is required";
            if (value.length < 8) return "Password must be at least 8 characters long";
            return true;
        },
    });

    const confirmPassword = await password({
        message: "Confirm password:",
        mask: true,
        validate: (value: string) => {
            if (value !== userPassword) return "Passwords do not match";
            return true;
        },
    });

    // Hash the password
    const hashedPassword = await Bun.password.hash(userPassword);

    return {
        email,
        name,
        password: hashedPassword,
        // role_id: null, // Optional: Add role selection here if needed
    };
}

async function createUser(userData: Omit<NewUser, "id" | "createdAt" | "updatedAt">) {
    const spinner = ora("Creating user...").start();

    try {

        const permissionsList = [
            {
                name: "Permissions List",
                code: "permissions.list"
            },
            {
                name: "Roles List",
                code: "roles.list"
            },
            {
                name: "Users List",
                code: "users.list"
            },
            {
                name: "Permissions Edit",
                code: "permissions.edit"
            },
            {
                name: "Roles Edit",
                code: "roles.edit"
            },
            {
                name: "Users Edit",
                code: "users.edit"
            },
            {
                name: "Dashboard Access",
                code: "dashboard.access"
            }
        ];

        const newPermissions = await db.insert(permissions).values(permissionsList).onConflictDoNothing().returning({ id: permissions.id });

        const adminRole = await db.insert(roles).values({
            name: "Admin",
            code: "admin",
            description: "Admin role",
            active: true
        }).onConflictDoNothing().returning({ id: roles.id });

        const adminRolePermissions = await db.insert(role_permissions).values(newPermissions.map(permission => ({
            role_id: adminRole[0].id,
            permission_id: permission.id
        }))).onConflictDoNothing();

        userData.role_id = adminRole[0].id;
        // Insert the user into the database
        const [newUser] = await db.insert(users).values(userData).returning();

        spinner.succeed(chalk.green("User created successfully!"));

        // Display the created user information (excluding password)
        console.log("\n" + chalk.bgBlue(" USER DETAILS "));
        console.log(chalk.blue("ID:"), chalk.white(newUser.id));
        console.log(chalk.blue("Email:"), chalk.white(newUser.email));
        console.log(chalk.blue("Name:"), chalk.white(newUser.name || "Not provided"));
        console.log(chalk.blue("Created at:"), chalk.white(newUser.createdAt?.toLocaleString() || "Unknown"));

    } catch (error: any) {
        spinner.fail(chalk.red("Failed to create user"));

        if (error.message.includes("unique constraint")) {
            console.error(chalk.red("A user with this email already exists."));
        } else {
            console.error(chalk.red("Database error:"), error.message);
        }

        process.exit(1);
    }
}

// Run the main function
main().catch((error) => {
    console.error(chalk.red("Unhandled error:"), error);
    process.exit(1);
});

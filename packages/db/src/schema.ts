import { pgTable, text, timestamp, uuid, primaryKey, boolean } from "drizzle-orm/pg-core";

export const permissions = pgTable("permissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    code: text("code").notNull()
});

export const roles = pgTable("roles", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    active: boolean("active").default(true),
});

export const role_permissions = pgTable("role_permissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    role_id: uuid("role_id").references(() => roles.id).notNull(),
    permission_id: uuid("permission_id").references(() => permissions.id).notNull(),
});

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    name: text("name"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    role_id: uuid("role_id").references(() => roles.id),
});


export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export type RolePermission = typeof role_permissions.$inferSelect;
export type NewRolePermission = typeof role_permissions.$inferInsert;
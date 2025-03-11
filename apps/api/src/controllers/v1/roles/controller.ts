import { roles, role_permissions, permissions } from "@auth-apps/db";
import { eq, sql, and } from "../../../../../../packages/db/src/orm";
import ctx from "../../../context";
import Elysia, { error, t } from "elysia";

export const rolesController = new Elysia({
    name: "@app/roles",
    prefix: "/roles",
    detail: {
        tags: ["Roles"],
        summary: "Get all roles",
        description: "Get all roles"
    }
})
    .use(ctx)
    .get('/', async ({
        user,
        error,
        db,
        query: {
            page,
            limit
        }
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        // Convert page and limit to numbers
        const pageNum = Number(page);
        const limitNum = Number(limit);

        // Calculate offset
        const offset = (pageNum - 1) * limitNum;

        const [totalCountResult, rolesList] = await Promise.all([
            db.select({
                count: sql`count(*)`
            }).from(roles),
            db.select().from(roles).limit(limitNum).offset(offset)
        ]);

        const totalCount = Number(totalCountResult[0].count);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);

        return {
            roles: rolesList,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages
            }
        };
    }, {
        query: t.Object({
            page: t.Optional(t.Numeric({ default: 1 })),
            limit: t.Optional(t.Numeric({ default: 10 }))
        }),
        permission: "roles.list"
    })
    .get('/:id', async ({
        user,
        error,
        db,
        params: {
            id
        }
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        const role = await db.select().from(roles).where(eq(roles.id, id));

        return {
            role: role[0]
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        permission: "roles.list"
    })
    .post('/', async ({
        user,
        error,
        db,
        body
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        const { name, code, description, active } = body;

        const role = await db.insert(roles).values({
            name,
            code,
            description,
            active
        });

        return {
            role: role[0]
        };
    }, {
        body: t.Object({
            name: t.String(),
            code: t.String(),
            description: t.Optional(t.String()),
            active: t.Optional(t.Boolean({ default: true }))
        }),
        permission: "roles.edit"
    })
    .put('/:id', async ({
        user,
        error,
        db,
        params: {
            id
        },
        body
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        const { name, code, description, active } = body;

        const role = await db.update(roles).set({
            name,
            code,
            description,
            active
        }).where(eq(roles.id, id));

        return {
            role: role[0]
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            name: t.String(),
            code: t.String(),
            description: t.Optional(t.String()),
            active: t.Optional(t.Boolean())
        }),
        permission: "roles.edit"
    })
    .delete('/:id', async ({
        user,
        error,
        db,
        params: {
            id
        }
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        await db.delete(roles).where(eq(roles.id, id));

        return {
            message: "Role deleted successfully"
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        permission: "roles.edit"
    })
    .get('/:id/permissions', async ({
        user,
        error,
        db,
        params: {
            id
        }
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        const rolePermissions = await db
            .select({
                id: role_permissions.id,
                permission_id: role_permissions.permission_id,
                permission: {
                    id: permissions.id,
                    name: permissions.name,
                    code: permissions.code
                }
            })
            .from(role_permissions)
            .leftJoin(permissions, eq(role_permissions.permission_id, permissions.id))
            .where(eq(role_permissions.role_id, id));

        return {
            permissions: rolePermissions
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        permission: "roles.list"
    })
    .post('/:id/permissions', async ({
        user,
        error,
        db,
        params: {
            id
        },
        body: {
            permission_id
        }
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        // Check if the role exists
        const role = await db.select().from(roles).where(eq(roles.id, id));
        if (role.length === 0) {
            return error(404, "Role not found");
        }

        // Check if the permission exists
        const permission = await db.select().from(permissions).where(eq(permissions.id, permission_id));
        if (permission.length === 0) {
            return error(404, "Permission not found");
        }

        // Check if the role already has this permission
        const existingRolePermission = await db
            .select()
            .from(role_permissions)
            .where(
                and(
                    eq(role_permissions.role_id, id),
                    eq(role_permissions.permission_id, permission_id)
                )
            );

        if (existingRolePermission.length > 0) {
            return error(400, "Role already has this permission");
        }

        // Add the permission to the role
        const rolePermission = await db.insert(role_permissions).values({
            role_id: id,
            permission_id
        });

        return {
            message: "Permission added to role successfully",
            role_permission: rolePermission[0]
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            permission_id: t.String()
        }),
        permission: "roles.edit"
    })
    .delete('/:id/permissions/:permission_id', async ({
        user,
        error,
        db,
        params: {
            id,
            permission_id
        }
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        // Check if the role-permission association exists
        const rolePermission = await db
            .select()
            .from(role_permissions)
            .where(
                and(
                    eq(role_permissions.role_id, id),
                    eq(role_permissions.permission_id, permission_id)
                )
            );

        if (rolePermission.length === 0) {
            return error(404, "Role does not have this permission");
        }

        // Remove the permission from the role
        await db
            .delete(role_permissions)
            .where(
                and(
                    eq(role_permissions.role_id, id),
                    eq(role_permissions.permission_id, permission_id)
                )
            );

        return {
            message: "Permission removed from role successfully"
        };
    }, {
        params: t.Object({
            id: t.String(),
            permission_id: t.String()
        }),
        permission: "roles.edit"
    });

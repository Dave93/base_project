import { permissions } from "@auth-apps/db";
import { eq, sql } from "../../../../../../packages/db/src/orm";
import ctx from "../../../context";
import Elysia, { error, t } from "elysia";

export const permissionsController = new Elysia({
    name: "@app/permissions",
    prefix: "/permissions",
    detail: {
        tags: ["Permissions"],
        summary: "Get all permissions",
        description: "Get all permissions"
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

        const [totalCountResult, permissionsList] = await Promise.all([
            db.select({
                count: sql`count(*)`
            }).from(permissions),
            db.select().from(permissions).limit(limitNum).offset(offset)
        ]);

        const totalCount = Number(totalCountResult[0].count);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);

        return {
            permissions: permissionsList,
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
        permission: "permissions.list"
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

        const permission = await db.select().from(permissions).where(eq(permissions.id, id));

        return {
            permission: permission[0]
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        permission: "permissions.list"
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

        const { name, code } = body;

        const permission = await db.insert(permissions).values({
            name,
            code
        });

        return {
            permission: permission[0]
        };
    }, {
        body: t.Object({
            name: t.String(),
            code: t.String()
        }),
        permission: "permissions.edit"
    })
    .put('/:id', async ({
        user,
        error,
        db,
        params: {
            id
        },
        body: {
            name, code
        }
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }


        const permission = await db.update(permissions).set({
            name,
            code
        }).where(eq(permissions.id, id));

        return {
            permission: permission[0]
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            name: t.String(),
            code: t.String()
        }),
        permission: "permissions.edit"
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

        await db.delete(permissions).where(eq(permissions.id, id));

        return {
            message: "Permission deleted successfully"
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        permission: "permissions.edit"
    });
import ctx from "../../../context";
import { users } from "@auth-apps/db";
import { eq, sql } from "@auth-apps/db/src/orm";
import { Elysia, t } from "elysia";

export const userController = new Elysia({
    name: "@api/v1/users",
    prefix: "/users"
})
    .use(ctx)
    .post("/login", async ({
        body: {
            email,
            password
        },
        db,
        error,
        cacheService,
        cookie
    }) => {

        const user = await db.select({
            id: users.id,
            email: users.email,
            password: users.password,
            role_id: users.role_id,
            name: users.name
        })
            .from(users)
            .where(eq(users.email, email));

        if (user.length === 0) {
            return error(401, "Invalid credentials");
        }

        const hash = await Bun.password.hash(password);
        console.log(user[0].password, hash);
        console.log('hash', hash);
        const isMatch = await Bun.password.verify(password, hash);
        console.log('isMatch', isMatch);
        if (!isMatch) {
            return error(401, "Invalid credentials");
        }

        const sessionUser: {
            id: string;
            email: string;
            name: string | null;
            role: {
                id: string;
                name: string;
                code: string;
                permissions: string[];
            } | null;
        } = {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            role: null
        };

        if (user[0].role_id) {
            const role = await cacheService.getRole(user[0].role_id);
            sessionUser.role = role;
        }

        const { password: _, id, ...userWithoutPassword } = user[0];

        const { accessToken, refreshToken } = await cacheService.setUserSession(sessionUser);

        cookie.session.value = accessToken;
        cookie.refreshToken.value = refreshToken;

        return {
            user: userWithoutPassword
        };
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String()
        })
    })
    .post("/logout", async ({
        cookie,
        cacheService,
        error
    }) => {

        if (cookie.session.value && cookie.refreshToken.value) {
            await cacheService.clearUserSession(cookie.session.value, cookie.refreshToken.value);
        }

        delete cookie.session.value;
        delete cookie.refreshToken.value;

        return {
            message: "Logged out successfully"
        };
    }, {
        useAuth: true
    })
    .get("/me", async ({
        user,
        error
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        const { role: _, id, ...userWithoutPassword } = user;

        return {
            ...userWithoutPassword,
            role_id: user.role?.id ?? null
        };
    }, {
        useAuth: true
    })
    .get('/permissions', async ({
        user,
        error
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        return {
            permissions: user.role?.permissions ?? []
        };
    }, {
        useAuth: true
    })
    // Get all users with pagination
    .get('/', async ({
        user,
        error,
        db,
        query: { page = 1, pageSize = 10 }
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        const offset = (page - 1) * pageSize;
        
        // Get total count using SQL count function
        const countResult = await db.select({ count: sql`count(*)` }).from(users);
        const total = Number(countResult[0].count);
        
        // Get users for current page
        const usersList = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role_id: users.role_id,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
        })
            .from(users)
            .limit(pageSize)
            .offset(offset)
            .orderBy(users.createdAt);
        
        return {
            users: usersList,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    }, {
        query: t.Object({
            page: t.Optional(t.Numeric()),
            pageSize: t.Optional(t.Numeric())
        }),
        permission: "users.list"
    })
    // Get a single user by ID
    .get('/:id', async ({
        user,
        error,
        db,
        params: { id }
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        const userData = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role_id: users.role_id,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
        })
            .from(users)
            .where(eq(users.id, id));

        if (userData.length === 0) {
            return error(404, "User not found");
        }

        return {
            user: userData[0]
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        permission: "users.list"
    })
    // Create a new user
    .post('/', async ({
        user,
        error,
        db,
        body
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        const { email, password, name, role_id } = body;

        // Check if email already exists
        const existingUser = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.email, email));

        if (existingUser.length > 0) {
            return error(400, "Email already in use");
        }

        // Hash password
        const hashedPassword = await Bun.password.hash(password);

        // Create user
        const newUser = await db.insert(users).values({
            email,
            password: hashedPassword,
            name,
            role_id
        }).returning({
            id: users.id,
            email: users.email,
            name: users.name,
            role_id: users.role_id,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
        });

        return {
            user: newUser[0]
        };
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String(),
            name: t.Optional(t.String()),
            role_id: t.Optional(t.String())
        }),
        permission: "users.edit"
    })
    // Update a user
    .put('/:id', async ({
        user,
        error,
        db,
        params: { id },
        body
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        // Check if user exists
        const existingUser = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.id, id));

        if (existingUser.length === 0) {
            return error(404, "User not found");
        }

        const updateData: any = {};
        
        // Only update fields that are provided
        if (body.email !== undefined) updateData.email = body.email;
        if (body.name !== undefined) updateData.name = body.name;
        if (body.role_id !== undefined) updateData.role_id = body.role_id;
        
        // If password is provided, hash it
        if (body.password) {
            updateData.password = await Bun.password.hash(body.password);
        }

        // Update user
        const updatedUser = await db.update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role_id: users.role_id,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt
            });

        return {
            user: updatedUser[0]
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            email: t.Optional(t.String()),
            password: t.Optional(t.String()),
            name: t.Optional(t.String()),
            role_id: t.Optional(t.String())
        }),
        permission: "users.edit"
    })
    // Delete a user
    .delete('/:id', async ({
        user,
        error,
        db,
        params: { id }
    }) => {
        if (!user) {
            return error(401, "Unauthorized");
        }

        // Check if user exists
        const existingUser = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.id, id));

        if (existingUser.length === 0) {
            return error(404, "User not found");
        }

        // Delete user
        await db.delete(users).where(eq(users.id, id));

        return {
            success: true
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        permission: "users.edit"
    });
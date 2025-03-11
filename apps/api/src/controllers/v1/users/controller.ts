import ctx from "../../../context";
import { users } from "@auth-apps/db";
import { eq } from "@auth-apps/db/src/orm";
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
            // role_id: users.role_id,
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

        // if (user[0].role_id) {
        //     const role = await cacheService.getRole(user[0].role_id);
        //     sessionUser.role = role;
        // }

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
    });

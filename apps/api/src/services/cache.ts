import { Redis } from "ioredis";
import { Database } from "../../../../packages/db/src/index";
import { roles, role_permissions, permissions } from "../../../../packages/db/src/schema.js";
import { eq, inArray } from "../../../../packages/db/src/orm";
import ms from "ms";
import { randomUUIDv7 } from "bun";

export class CacheService {
    constructor(private readonly redis: Redis, private readonly db: Database) {
        this.cacheRoles();
        this.cachePermissions();
    }


    async cacheRoles() {
        const rolesList = await this.db.select().from(roles).where(eq(roles.active, true));
        const rolesPermissions = await this.db.select({
            role_id: role_permissions.role_id,
            permission_id: role_permissions.permission_id,
            permission_code: permissions.code
        })
            .from(role_permissions)
            .leftJoin(permissions, eq(role_permissions.permission_id, permissions.id))
            .where(inArray(role_permissions.role_id, rolesList.map(role => role.id)));

        // Group permissions by role_id
        const rolesPermissionsMap = new Map<string, string[]>();

        rolesPermissions.forEach(rolePermission => {
            if (!rolesPermissionsMap.has(rolePermission.role_id)) {
                rolesPermissionsMap.set(rolePermission.role_id, []);
            }

            const permissions = rolesPermissionsMap.get(rolePermission.role_id);
            permissions?.push(rolePermission.permission_code!);
            rolesPermissionsMap.set(rolePermission.role_id, permissions || []);
        });

        // Store each role with its permissions in Redis
        for (const role of rolesList) {
            const permissions = rolesPermissionsMap.get(role.id) || [];

            // Create a role object with role and permissions data
            const roleData = {
                id: role.id,
                name: role.name,
                code: role.code,
                active: role.active,
                permissions
            };

            // Store in Redis using HSET
            await this.redis.hset(`role:${role.id}`, roleData);
        }
    }


    async cachePermissions() {
        const permissionsList = await this.db.select().from(permissions);
        await this.redis.set("permissions", JSON.stringify(permissionsList));
    }

    async getRole(roleId: string) {
        const role = await this.redis.hgetall(`role:${roleId}`) as unknown as {
            id: string;
            name: string;
            code: string;
            permissions: string[];
        };

        return role;
    }

    async getPermission(permissionId: string) {
        const permission = await this.redis.hgetall(`permission:${permissionId}`);
        return permission;
    }

    async setUserSession(userData: {
        id: string;
        email: string;
        name: string | null;
        role: {
            id: string;
            name: string;
            code: string;
            permissions: string[];
        } | null;
    }, oldRefreshToken: string | null = null) {
        const accessToken = randomUUIDv7();
        const refreshToken = randomUUIDv7();
        await this.redis.set(`${process.env.PROJECT_PREFIX}:session:${accessToken}`, JSON.stringify(userData), "PX", ms("2 days"));

        if (oldRefreshToken) {
            await this.redis.del(`${process.env.PROJECT_PREFIX}:session:${oldRefreshToken}`);
        }

        await this.redis.set(`${process.env.PROJECT_PREFIX}:session:${refreshToken}`, JSON.stringify(userData), "PX", ms("7 days"));

        return {
            accessToken,
            refreshToken
        };
    }

    async clearUserSession(accessToken: string, refreshToken: string) {
        await this.redis.del(`${process.env.PROJECT_PREFIX}:session:${accessToken}`);
        await this.redis.del(`${process.env.PROJECT_PREFIX}:session:${refreshToken}`);
    }
}

import { Elysia } from "elysia";
import { userController } from "./users/controller";
import { permissionsController } from "./permissions/controller";
import { rolesController } from "./roles/controller";

export const v1Controller = new Elysia({
    name: "@api/v1",
    prefix: "/api/v1"
})
    .use(userController)
    .use(permissionsController)
    .use(rolesController);
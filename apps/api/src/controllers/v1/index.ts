import { Elysia } from "elysia";
import { userController } from "./users/controller";

export const v1Controller = new Elysia({
    name: "@api/v1",
    prefix: "/api/v1"
})
    .use(userController);

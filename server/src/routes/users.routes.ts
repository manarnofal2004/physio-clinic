import { Router } from "express";
import {
  createUser,
  getUser,
  listUsers,
  updateUserAccess,
  updateUserStatus,
} from "../controllers/users.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";
import {
  createUserBody,
  listUsersQuery,
  updateAccessBody,
  updateStatusBody,
} from "../validators/users.validators.js";

// Accounts are managed by the admin only.
export const usersRouter = Router();

usersRouter.use(authenticate, authorize("admin"));

usersRouter.get("/", validate({ query: listUsersQuery }), listUsers);
usersRouter.post("/", validate({ body: createUserBody }), createUser);
usersRouter.get("/:id", validate({ params: idParams }), getUser);
usersRouter.put(
  "/:id/access",
  validate({ params: idParams, body: updateAccessBody }),
  updateUserAccess,
);
usersRouter.patch(
  "/:id/status",
  validate({ params: idParams, body: updateStatusBody }),
  updateUserStatus,
);

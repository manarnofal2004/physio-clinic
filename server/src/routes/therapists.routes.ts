import { Router } from "express";
import {
  createTherapist,
  getTherapist,
  listTherapists,
  updateTherapist,
} from "../controllers/therapists.controller.js";
import { authenticate, authorize, requirePrivilege } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";
import { listTherapistsQuery, therapistBody } from "../validators/therapists.validators.js";

// GET /therapists/free comes with the slot scheduling service (task 5.2).
export const therapistsRouter = Router();

therapistsRouter.use(authenticate);

therapistsRouter.get(
  "/",
  requirePrivilege("reservations.view"),
  validate({ query: listTherapistsQuery }),
  listTherapists,
);
therapistsRouter.post("/", authorize("admin"), validate({ body: therapistBody }), createTherapist);
therapistsRouter.get(
  "/:id",
  requirePrivilege("reservations.view"),
  validate({ params: idParams }),
  getTherapist,
);
therapistsRouter.put(
  "/:id",
  authorize("admin"),
  validate({ params: idParams, body: therapistBody }),
  updateTherapist,
);

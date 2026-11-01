import { Router } from "express";
import {
  createTherapist,
  getTherapist,
  listFreeTherapists,
  listTherapists,
  updateTherapist,
} from "../controllers/therapists.controller.js";
import { authenticate, authorize, requirePrivilege } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";
import { freeTherapistsQuery } from "../validators/reservations.validators.js";
import { listTherapistsQuery, therapistBody } from "../validators/therapists.validators.js";

export const therapistsRouter = Router();

therapistsRouter.use(authenticate);

// Before "/:id" so "free" is not read as an id.
therapistsRouter.get(
  "/free",
  requirePrivilege("reservations.manage"),
  validate({ query: freeTherapistsQuery }),
  listFreeTherapists,
);

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

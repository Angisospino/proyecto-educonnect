
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  authorizeRoles,
  PERMISOS,
} from "../middlewares/rbac.middleware.js";
import notificacionController from "../controllers/notificacion.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorizeRoles(...PERMISOS.USUARIOS),
  notificacionController.listar
);

export default router;

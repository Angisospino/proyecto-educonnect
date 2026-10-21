
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles, PERMISOS } from "../middlewares/rbac.middleware.js";
import comunicadoController from "../controllers/comunicado.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles(...PERMISOS.COMUNICADOS.CREAR),
  comunicadoController.crear
);

router.get(
  "/",
  authorizeRoles(...PERMISOS.COMUNICADOS.LEER),
  comunicadoController.listar
);

router.put(
  "/:id",
  authorizeRoles(...PERMISOS.COMUNICADOS.ACTUALIZAR),
  comunicadoController.actualizar
);

router.delete(
  "/:id",
  authorizeRoles(...PERMISOS.COMUNICADOS.ELIMINAR),
  comunicadoController.eliminar
);

export default router;


// Instancia ya armada con la estrategia de correo (el export por defecto
// de services/notificacion.service.js es la fábrica, no el servicio).
import { notificacionService } from "../notifications/index.js";

const ESTADOS_VALIDOS = ["PENDIENTE", "ENVIADA", "FALLIDA"];

function validarPaginacion(valor, predeterminado, campo) {
  if (valor === undefined) return predeterminado;

  if (
    typeof valor !== "string" ||
    valor.trim() === "" ||
    !/^\d+$/.test(valor)
  ) {
    const error = new Error(`${campo} debe ser un entero positivo.`);
    error.statusCode = 400;
    throw error;
  }

  const numero = Number(valor);

  if (!Number.isSafeInteger(numero) || numero < 1) {
    const error = new Error(`${campo} debe ser un entero positivo.`);
    error.statusCode = 400;
    throw error;
  }

  if (campo === "pageSize" && numero > 100) {
    const error = new Error("pageSize no puede superar 100.");
    error.statusCode = 400;
    throw error;
  }

  return numero;
}

const notificacionController = {
  async listar(req, res, next) {
    try {
      const page = validarPaginacion(req.query.page, 1, "page");
      const pageSize = validarPaginacion(
        req.query.pageSize,
        20,
        "pageSize"
      );

      const { estado } = req.query;

      if (
        estado !== undefined &&
        (typeof estado !== "string" ||
          !ESTADOS_VALIDOS.includes(estado))
      ) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "El estado de la notificación no es válido.",
        });
      }

      const resultado = await notificacionService.listar({
        estado,
        page,
        pageSize,
      });

      // Lista blanca: nunca se devuelve el correo del usuario.
      const notificaciones = resultado.notificaciones.map(
        ({
          id,
          usuarioId,
          comunicadoId,
          canal,
          estado,
          fechaEnvio,
        }) => ({
          id,
          usuarioId,
          comunicadoId,
          canal,
          estado,
          fechaEnvio,
        })
      );

      return res.status(200).json({
        success: true,
        data: {
          notificaciones,
          total: resultado.total,
          page,
          pageSize,
        },
        error: null,
      });
    } catch (error) {
      return next(error);
    }
  },

  async reintentar(req, res, next) {
    try {
      const { reintentadas, enviadas, fallidas } =
        await notificacionService.reintentarFallidas();

      return res.status(200).json({
        success: true,
        data: { reintentadas, enviadas, fallidas },
        error: null,
      });
    } catch (error) {
      return next(error);
    }
  },
};

export default notificacionController;


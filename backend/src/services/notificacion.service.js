
import notificacionRepository from "../repositories/notificacion.repository.js";

const TAMANO_LOTE = 10;

const crearError = (mensaje, statusCode = 400) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
};

const obtenerNombreAutor = (comunicado) => {
  if (typeof comunicado.autor === "string") {
    return comunicado.autor.trim();
  }

  if (
    comunicado.autor &&
    typeof comunicado.autor === "object"
  ) {
    return [
      comunicado.autor.nombre,
      comunicado.autor.apellido,
    ].filter(Boolean).join(" ");
  }

  return "";
};

const construirContenido = (comunicado) => {
  const nombreAutor = obtenerNombreAutor(comunicado);

  return [
    comunicado.contenido,
    "",
    `Publicado por: ${nombreAutor || "Institución educativa"}`,
  ].join("\n");
};

/**
 * Fábrica del servicio.
 *
 * @param {object} estrategia
 * @param {object} opciones
 * @param {boolean} opciones.simulacion
 */
export const crearNotificacionService = (
  estrategia,
  { simulacion = false } = {}
) => {
  if (
    !estrategia ||
    typeof estrategia.enviar !== "function"
  ) {
    throw crearError(
      "La estrategia debe implementar enviar().",
      500
    );
  }

  /**
   * Procesa una notificación ya registrada.
   *
   * El error de envío no se propaga si se logra
   * registrar el estado FALLIDA.
   */
  const procesarEnvio = async ({
    notificacionId,
    email,
    asunto,
    contenido,
  }) => {
    try {
      await estrategia.enviar(
        email,
        asunto,
        contenido
      );

      // El transporte simulado no entrega correos.
      if (simulacion) {
        console.info(
          `[NOTIFICACIONES] Simulación completada: ${notificacionId}`
        );

        return "PENDIENTE";
      }

      await notificacionRepository.marcarEnviada(
        notificacionId
      );

      return "ENVIADA";
    } catch (error) {
      console.error(
        `[NOTIFICACIONES] Falló el envío ${notificacionId}:`,
        error.message
      );

      try {
        await notificacionRepository.marcarFallida(
          notificacionId
        );
      } catch (errorBD) {
        // No ocultar un error de persistencia.
        console.error(
          `[NOTIFICACIONES] No se pudo marcar FALLIDA ${notificacionId}:`,
          errorBD.message
        );

        throw errorBD;
      }

      return "FALLIDA";
    }
  };

  /**
   * Publica notificaciones de un comunicado.
   *
   * @param {object} comunicado
   * @param {Array<{id: number, email: string}>} destinatarios
   */
  const notificarComunicado = async (
    comunicado,
    destinatarios
  ) => {
    if (
      !comunicado?.id ||
      !comunicado?.titulo ||
      !comunicado?.contenido
    ) {
      throw crearError(
        "Los datos del comunicado están incompletos."
      );
    }

    if (!Array.isArray(destinatarios)) {
      throw crearError(
        "Los destinatarios deben ser un arreglo."
      );
    }

    const resumen = {
      total: destinatarios.length,
      enviadas: 0,
      fallidas: 0,
      pendientes: 0,
    };

    const asunto = comunicado.titulo;
    const contenido = construirContenido(comunicado);

    for (
      let inicio = 0;
      inicio < destinatarios.length;
      inicio += TAMANO_LOTE
    ) {
      const lote = destinatarios.slice(
        inicio,
        inicio + TAMANO_LOTE
      );

      for (const destinatario of lote) {
        let notificacion;

        try {
          notificacion =
            await notificacionRepository.crear({
              usuarioId: destinatario.id,
              comunicadoId: comunicado.id,
            });

          const estado = await procesarEnvio({
            notificacionId: notificacion.id,
            email: destinatario.email,
            asunto,
            contenido,
          });

          if (estado === "ENVIADA") {
            resumen.enviadas++;
          } else if (estado === "FALLIDA") {
            resumen.fallidas++;
          } else {
            resumen.pendientes++;
          }
        } catch (error) {
          console.error(
            "[NOTIFICACIONES] Error al procesar destinatario:",
            {
              usuarioId: destinatario.id,
              notificacionId: notificacion?.id,
              mensaje: error.message,
            }
          );

          // Si falló la creación, no existe registro
          // que pueda marcarse como FALLIDA.
          resumen.fallidas++;
        }
      }
    }

    return resumen;
  };

  /**
   * Reintenta las notificaciones FALLIDA.
   *
   * @returns {Promise<{
   *   reintentadas: number,
   *   enviadas: number,
   *   fallidas: number
   * }>}
   */
  const reintentarFallidas = async () => {
    const notificaciones =
      await notificacionRepository.listarFallidas();

    const resumen = {
      reintentadas: 0,
      enviadas: 0,
      fallidas: 0,
    };

    for (
      let inicio = 0;
      inicio < notificaciones.length;
      inicio += TAMANO_LOTE
    ) {
      const lote = notificaciones.slice(
        inicio,
        inicio + TAMANO_LOTE
      );

      for (const notificacion of lote) {
        const usuario = notificacion.usuario;
        const comunicado = notificacion.comunicado;

        // No enviar a usuarios inactivos ni
        // reconstruir mensajes inexistentes.
        if (
          usuario?.estado !== "ACTIVO" ||
          !usuario?.email ||
          !comunicado
        ) {
          resumen.fallidas++;
          continue;
        }

        resumen.reintentadas++;

        try {
          const estado = await procesarEnvio({
            notificacionId: notificacion.id,
            email: usuario.email,
            asunto: comunicado.titulo,
            contenido: construirContenido(comunicado),
          });

          if (estado === "ENVIADA") {
            resumen.enviadas++;
          } else if (estado === "FALLIDA") {
            resumen.fallidas++;
          }
        } catch (error) {
          console.error(
            "[NOTIFICACIONES] Error en reintento:",
            {
              notificacionId: notificacion.id,
              mensaje: error.message,
            }
          );

          resumen.fallidas++;
        }
      }
    }

    return resumen;
  };

  const listar = async (filtros = {}) => {
    return notificacionRepository.listar(filtros);
  };

  return {
    notificarComunicado,
    reintentarFallidas,
    listar,
  };
};

export default crearNotificacionService;

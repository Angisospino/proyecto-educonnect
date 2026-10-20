
/**
 * Servicio de notificaciones (RF-009).
 *
 * OJO: el export por defecto de este archivo es la FABRICA
 * (`crearNotificacionService`), no el servicio listo para usar.
 * Los consumidores (controladores, otros servicios) deben importar
 * la instancia ya armada con la estrategia de correo:
 *
 *   import { notificacionService } from "../notifications/index.js";
 *
 * Esta fabrica se exporta para poder inyectar una estrategia falsa
 * en las pruebas.
 */
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
 * Procesa los elementos en lotes de TAMANO_LOTE: dentro de un lote las
 * tareas corren en paralelo y los lotes se ejecutan uno tras otro, de
 * modo que nunca hay mas de TAMANO_LOTE envios simultaneos.
 * Promise.allSettled garantiza que un fallo no detenga al resto.
 *
 * @param {Array} elementos
 * @param {(elemento: unknown) => Promise<unknown>} tarea
 * @returns {Promise<PromiseSettledResult<unknown>[]>}
 */
const procesarPorLotes = async (elementos, tarea) => {
  const resultados = [];

  for (
    let inicio = 0;
    inicio < elementos.length;
    inicio += TAMANO_LOTE
  ) {
    const lote = elementos.slice(
      inicio,
      inicio + TAMANO_LOTE
    );

    resultados.push(
      ...(await Promise.allSettled(lote.map(tarea)))
    );
  }

  return resultados;
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
   *
   * Si el correo SÍ salió pero no se pudo registrar ENVIADA en la base
   * de datos, la fila NO se marca FALLIDA (el siguiente reintento
   * reenviaría un correo duplicado): se registra el error y la fila
   * queda como está.
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

    // El transporte simulado no entrega correos: la fila queda PENDIENTE.
    if (simulacion) {
      console.info(
        `[NOTIFICACIONES] Simulación completada: ${notificacionId}`
      );

      return "PENDIENTE";
    }

    try {
      await notificacionRepository.marcarEnviada(
        notificacionId
      );
    } catch (errorBD) {
      // El correo ya salió: no marcar FALLIDA para evitar duplicados.
      console.error(
        `[NOTIFICACIONES] El correo ${notificacionId} se envió pero no se pudo registrar ENVIADA:`,
        errorBD.message
      );
    }

    return "ENVIADA";
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

    const resultados = await procesarPorLotes(
      destinatarios,
      async (destinatario) => {
        const notificacion =
          await notificacionRepository.crear({
            usuarioId: destinatario.id,
            comunicadoId: comunicado.id,
          });

        try {
          return await procesarEnvio({
            notificacionId: notificacion.id,
            email: destinatario.email,
            asunto,
            contenido,
          });
        } catch (error) {
          error.notificacionId = notificacion.id;
          throw error;
        }
      }
    );

    resultados.forEach((resultado, indice) => {
      if (resultado.status === "fulfilled") {
        if (resultado.value === "ENVIADA") {
          resumen.enviadas++;
        } else if (resultado.value === "FALLIDA") {
          resumen.fallidas++;
        } else {
          resumen.pendientes++;
        }

        return;
      }

      console.error(
        "[NOTIFICACIONES] Error al procesar destinatario:",
        {
          usuarioId: destinatarios[indice]?.id,
          notificacionId: resultado.reason?.notificacionId,
          mensaje: resultado.reason?.message,
        }
      );

      // Si falló la creación, no existe registro
      // que pueda marcarse como FALLIDA.
      resumen.fallidas++;
    });

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

    const resultados = await procesarPorLotes(
      notificaciones,
      async (notificacion) => {
        const usuario = notificacion.usuario;
        const comunicado = notificacion.comunicado;

        // No enviar a usuarios inactivos ni
        // reconstruir mensajes inexistentes.
        if (
          usuario?.estado !== "ACTIVO" ||
          !usuario?.email ||
          !comunicado
        ) {
          return "OMITIDA";
        }

        return procesarEnvio({
          notificacionId: notificacion.id,
          email: usuario.email,
          asunto: comunicado.titulo,
          contenido: construirContenido(comunicado),
        });
      }
    );

    resultados.forEach((resultado, indice) => {
      if (resultado.status === "rejected") {
        console.error(
          "[NOTIFICACIONES] Error en reintento:",
          {
            notificacionId: notificaciones[indice].id,
            mensaje: resultado.reason?.message,
          }
        );

        resumen.reintentadas++;
        resumen.fallidas++;
        return;
      }

      if (resultado.value === "OMITIDA") {
        resumen.fallidas++;
        return;
      }

      resumen.reintentadas++;

      if (resultado.value === "ENVIADA") {
        resumen.enviadas++;
      } else if (resultado.value === "FALLIDA") {
        resumen.fallidas++;
      }
    });

    return resumen;
  };

  /**
   * Lista notificaciones paginadas, sin datos personales (sin correos).
   * El controlador valida estado, page y pageSize antes de llamar aqui.
   *
   * @param {object} filtros
   * @param {string} [filtros.estado]
   * @param {number} [filtros.page=1]
   * @param {number} [filtros.pageSize=20]
   * @returns {Promise<{ notificaciones: object[], total: number }>}
   */
  const listar = async ({
    estado,
    page = 1,
    pageSize = 20,
  } = {}) => {
    const [notificaciones, total] = await Promise.all([
      notificacionRepository.listar({
        estado,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      notificacionRepository.contar({ estado }),
    ]);

    return { notificaciones, total };
  };

  return {
    notificarComunicado,
    reintentarFallidas,
    listar,
  };
};

export default crearNotificacionService;

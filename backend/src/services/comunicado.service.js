
import comunicadoRepository from "../repositories/comunicado.repository.js";
import usuarioRepository from "../repositories/usuario.repository.js";
import { notificacionService } from "../notifications/index.js";

export function crearError(mensaje, statusCode) {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
}

const ID_MAXIMO = 2147483647;

function aNumero(valor, campo = "id") {
  if (
    Array.isArray(valor) ||
    typeof valor === "boolean" ||
    valor === null ||
    valor === undefined ||
    (typeof valor === "string" && valor.trim() === "") ||
    !["number", "string"].includes(typeof valor)
  ) {
    throw crearError(`El campo ${campo} no es válido.`, 400);
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    throw crearError(`El campo ${campo} no es válido.`, 400);
  }

  return numero;
}

function validarId(valor, campo = "id") {
  const id = aNumero(valor, campo);

  if (
    !Number.isInteger(id) ||
    id < 1 ||
    id > ID_MAXIMO
  ) {
    throw crearError(
      `El campo ${campo} debe ser un entero entre 1 y ${ID_MAXIMO}.`,
      400
    );
  }

  return id;
}

function validarTexto(valor, campo, maximo) {
  if (typeof valor !== "string") {
    throw crearError(
      `El campo ${campo} debe ser un texto válido.`,
      400
    );
  }

  const texto = valor.trim();

  if (!texto) {
    throw crearError(
      `El campo ${campo} no puede estar vacío.`,
      400
    );
  }

  if (texto.length > maximo) {
    throw crearError(
      `El campo ${campo} no puede superar ${maximo} caracteres.`,
      400
    );
  }

  return texto;
}

function validarDatosComunicado(datos) {
  if (
    datos === null ||
    typeof datos !== "object" ||
    Array.isArray(datos)
  ) {
    throw crearError("Los datos del comunicado no son válidos.", 400);
  }

  return {
    titulo: validarTexto(datos.titulo, "titulo", 150),
    contenido: validarTexto(datos.contenido, "contenido", 5000),
  };
}

function validarUsuario(usuario) {
  if (
    usuario === null ||
    typeof usuario !== "object" ||
    Array.isArray(usuario)
  ) {
    throw crearError("El usuario autenticado no es válido.", 400);
  }

  return validarId(usuario.id, "usuario.id");
}

function validarPaginacion(valor, campo, predeterminado) {
  const numero =
    valor === undefined ? predeterminado : aNumero(valor, campo);

  if (!Number.isInteger(numero) || numero < 1) {
    throw crearError(
      `El campo ${campo} debe ser un entero positivo.`,
      400
    );
  }

  if (campo === "pageSize" && numero > 100) {
    throw crearError("pageSize no puede superar 100.", 400);
  }

  return numero;
}

/**
 * Notifica por correo un comunicado recién publicado a todos los
 * usuarios activos, excepto a su autor.
 *
 * Es "dispara y olvida": no se espera su resultado y cualquier fallo
 * (obtener destinatarios o enviar) solo se registra en el log, de modo
 * que publicar nunca falla ni se demora por el correo.
 */
function notificarPublicacion(comunicado, autorId) {
  Promise.resolve()
    .then(async () => {
      const destinatarios =
        await usuarioRepository.listarDestinatariosActivos();

      return notificacionService.notificarComunicado(
        comunicado,
        destinatarios.filter((destinatario) => destinatario.id !== autorId)
      );
    })
    .catch((error) => {
      console.error(
        `[COMUNICADOS] No se pudo notificar el comunicado ${comunicado.id}:`,
        error.message
      );
    });
}

async function buscarComunicadoEditable(id, usuarioId) {
  const comunicado = await comunicadoRepository.buscarPorId(id);

  if (!comunicado || comunicado.estado === "ELIMINADO") {
    throw crearError("El comunicado no existe.", 404);
  }

  // El DDS §7.3 permite al directivo gestionar sus comunicados propios.
  // El administrador solo tiene permiso de lectura.
  const autorId = validarId(
    comunicado.autor?.id,
    "comunicado.autor.id"
  );

  if (autorId !== usuarioId) {
    throw crearError(
      "No tienes permiso para modificar este comunicado.",
      403
    );
  }

  return comunicado;
}

const comunicadoService = {
  async publicarComunicado(datos, usuario) {
    const autorId = validarUsuario(usuario);
    const { titulo, contenido } = validarDatosComunicado(datos);

    const comunicado = await comunicadoRepository.crear({
      autorId,
      titulo,
      contenido,
    });

    // Solo al publicar: editar o eliminar no genera notificaciones.
    notificarPublicacion(comunicado, autorId);

    return comunicado;
  },

  async editarComunicado(id, datos, usuario) {
    const comunicadoId = validarId(id);
    const usuarioId = validarUsuario(usuario);

    await buscarComunicadoEditable(comunicadoId, usuarioId);

    const { titulo, contenido } = validarDatosComunicado(datos);

    return comunicadoRepository.actualizar(comunicadoId, {
      titulo,
      contenido,
    });
  },

  async eliminarComunicado(id, usuario) {
    const comunicadoId = validarId(id);
    const usuarioId = validarUsuario(usuario);

    await buscarComunicadoEditable(comunicadoId, usuarioId);

    const eliminado = await comunicadoRepository.marcarEliminado(
      comunicadoId
    );

    return { id: eliminado.id };
  },

  async listarComunicados({ page, pageSize } = {}) {
    const pagina = validarPaginacion(page, "page", 1);
    const tamanoPagina = validarPaginacion(
      pageSize,
      "pageSize",
      20
    );

    const skip = (pagina - 1) * tamanoPagina;

    const [comunicados, total] = await Promise.all([
      comunicadoRepository.listarVisibles({
        skip,
        take: tamanoPagina,
      }),
      comunicadoRepository.contarVisibles(),
    ]);

    return {
      comunicados,
      total,
      page: pagina,
      pageSize: tamanoPagina,
    };
  },
};

export default comunicadoService;

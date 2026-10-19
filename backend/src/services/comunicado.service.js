
import prisma from "../config/prisma.js";
import usuarioRepository from "../repositories/usuario.repository.js";
import notificacionService from "./notificacion.service.js";

/* ==========================================
   FUNCIONES AUXILIARES
   ========================================== */

const crearError = (mensaje, statusCode = 400) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
};

const validarId = (id) => {
  const texto = String(id);

  if (!/^[1-9]\d*$/.test(texto)) {
    throw crearError("El ID no es válido.");
  }

  const numero = Number(texto);

  if (!Number.isSafeInteger(numero)) {
    throw crearError("El ID no es válido.");
  }

  return numero;
};

const validarTexto = (valor, campo) => {
  if (typeof valor !== "string" || !valor.trim()) {
    throw crearError(`${campo} es obligatorio.`);
  }

  return valor.trim();
};

/* ==========================================
   PUBLICAR COMUNICADO
   ========================================== */

/**
 * Publica un comunicado institucional.
 *
 * @param {Object} data
 * @param {string} data.titulo
 * @param {string} data.contenido
 * @param {number} autorId
 */
export const publicarComunicado = async (
  data,
  autorId
) => {
  const idAutor = validarId(autorId);

  const titulo = validarTexto(
    data?.titulo,
    "El título"
  );

  const contenido = validarTexto(
    data?.contenido,
    "El contenido"
  );

  // Comprobar que el autor existe y está activo.
  const autor = await prisma.usuario.findUnique({
    where: { id: idAutor },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      rol: true,
      estado: true,
    },
  });

  if (!autor || autor.estado !== "ACTIVO") {
    throw crearError(
      "El usuario no está autorizado para publicar.",
      403
    );
  }

  // Ajustar si las reglas del proyecto permiten
  // publicar a otros roles.
  const rolesPermitidos = [
    "DOCENTE",
    "DIRECTIVO",
  ];

  if (!rolesPermitidos.includes(autor.rol)) {
    throw crearError(
      "No tienes permisos para publicar comunicados.",
      403
    );
  }

  // Guardar primero el comunicado.
  const comunicado = await prisma.comunicado.create({
    data: {
      titulo,
      contenido,
      autorId: idAutor,
    },
  });

  const nombreAutor =
    `${autor.nombre} ${autor.apellido}`.trim();

  // Solo información del comunicado y su autor.
  const comunicadoNotificable = {
    id: comunicado.id,
    titulo: comunicado.titulo,
    contenido: comunicado.contenido,
    autor: nombreAutor,
  };

  // No bloquear la publicación mientras se
  // consultan destinatarios y envían correos.
  void Promise.resolve()
    .then(async () => {
      const usuariosActivos =
        await usuarioRepository.listarDestinatariosActivos();

      const destinatarios = usuariosActivos.filter(
        (usuario) => usuario.id !== idAutor
      );

      if (destinatarios.length === 0) {
        return;
      }

      await notificacionService.notificarComunicado(
        comunicadoNotificable,
        destinatarios
      );
    })
    .catch((error) => {
      console.error(
        "[COMUNICADOS] Error al procesar notificaciones:",
        {
          comunicadoId: comunicado.id,
          mensaje: error.message,
        }
      );
    });

  return comunicado;
};

/* ==========================================
   LISTAR COMUNICADOS
   ========================================== */

export const listarComunicados = async () => {
  return prisma.comunicado.findMany({
    select: {
      id: true,
      titulo: true,
      contenido: true,
      autorId: true,
    },
    orderBy: {
      id: "desc",
    },
  });
};

/* ==========================================
   OBTENER COMUNICADO POR ID
   ========================================== */

export const obtenerComunicadoPorId = async (id) => {
  const comunicadoId = validarId(id);

  const comunicado = await prisma.comunicado.findUnique({
    where: {
      id: comunicadoId,
    },
  });

  if (!comunicado) {
    throw crearError(
      "Comunicado no encontrado.",
      404
    );
  }

  return comunicado;
};

/* ==========================================
   ACTUALIZAR COMUNICADO
   ========================================== */

export const actualizarComunicado = async (
  id,
  data,
  usuario
) => {
  const comunicadoId = validarId(id);

  const comunicado =
    await obtenerComunicadoPorId(comunicadoId);

  const esAutor =
    comunicado.autorId === Number(usuario?.id);

  const esAdministrador =
    usuario?.rol === "ADMINISTRADOR";

  if (!esAutor && !esAdministrador) {
    throw crearError(
      "No tienes permisos para editar este comunicado.",
      403
    );
  }

  const datosActualizar = {};

  if (data?.titulo !== undefined) {
    datosActualizar.titulo = validarTexto(
      data.titulo,
      "El título"
    );
  }

  if (data?.contenido !== undefined) {
    datosActualizar.contenido = validarTexto(
      data.contenido,
      "El contenido"
    );
  }

  if (Object.keys(datosActualizar).length === 0) {
    throw crearError(
      "No se proporcionaron datos para actualizar."
    );
  }

  return prisma.comunicado.update({
    where: {
      id: comunicadoId,
    },
    data: datosActualizar,
  });
};

/* ==========================================
   ELIMINAR COMUNICADO
   ========================================== */

export const eliminarComunicado = async (
  id,
  usuario
) => {
  const comunicadoId = validarId(id);

  const comunicado =
    await obtenerComunicadoPorId(comunicadoId);

  const esAutor =
    comunicado.autorId === Number(usuario?.id);

  const esAdministrador =
    usuario?.rol === "ADMINISTRADOR";

  if (!esAutor && !esAdministrador) {
    throw crearError(
      "No tienes permisos para eliminar este comunicado.",
      403
    );
  }

  return prisma.comunicado.delete({
    where: {
      id: comunicadoId,
    },
  });
};

/* ==========================================
   EXPORTACIÓN
   ========================================== */

const comunicadoService = {
  publicarComunicado,
  listarComunicados,
  obtenerComunicadoPorId,
  actualizarComunicado,
  eliminarComunicado,
};

export default comunicadoService;

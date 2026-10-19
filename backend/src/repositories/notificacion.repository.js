
import prisma from "../config/prisma.js";

const selectNotificacion = {
  id: true,
  usuarioId: true,
  comunicadoId: true,
  canal: true,
  estado: true,
  fechaEnvio: true,
};

const crear = async ({ usuarioId, comunicadoId }) => {
  return prisma.notificacion.create({
    data: {
      usuarioId: Number(usuarioId),
      comunicadoId: comunicadoId == null
        ? null
        : Number(comunicadoId),
      estado: "PENDIENTE",
    },
    select: selectNotificacion,
  });
};

const marcarEnviada = async (id) => {
  return prisma.notificacion.update({
    where: { id: Number(id) },
    data: {
      estado: "ENVIADA",
      fechaEnvio: new Date(),
    },
    select: selectNotificacion,
  });
};

const marcarFallida = async (id) => {
  return prisma.notificacion.update({
    where: { id: Number(id) },
    data: {
      estado: "FALLIDA",
      fechaEnvio: null,
    },
    select: selectNotificacion,
  });
};

/**
 * Uso interno del servicio de reintentos.
 * Nunca devolver directamente este resultado
 * desde un controlador HTTP.
 */
const listarFallidas = async () => {
  return prisma.notificacion.findMany({
    where: {
      estado: "FALLIDA",
      canal: "EMAIL",
    },
    select: {
      ...selectNotificacion,
      usuario: {
        select: {
          email: true,
          estado: true,
        },
      },
      comunicado: {
        select: {
          titulo: true,
          contenido: true,
          autor: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
};

const listar = async ({
  estado,
  skip = 0,
  take = 20,
} = {}) => {
  return prisma.notificacion.findMany({
    where: estado ? { estado } : {},
    skip,
    take,
    select: selectNotificacion,
    orderBy: {
      id: "desc",
    },
  });
};

export default {
  crear,
  marcarEnviada,
  marcarFallida,
  listarFallidas,
  listar,
};

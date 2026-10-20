
import prisma from "../config/prisma.js";

export const seleccionComunicado = {
  id: true,
  titulo: true,
  contenido: true,
  fechaPublicacion: true,
  estado: true,
  autor: {
    select: {
      id: true,
      nombre: true,
      apellido: true,
    },
  },
};

const comunicadoRepository = {
  async crear({ autorId, titulo, contenido }) {
    return prisma.comunicado.create({
      data: {
        autorId,
        titulo,
        contenido,
      },
      select: seleccionComunicado,
    });
  },

  async listarVisibles({ skip, take }) {
    return prisma.comunicado.findMany({
      where: {
        estado: {
          not: "ELIMINADO",
        },
      },
      orderBy: {
        fechaPublicacion: "desc",
      },
      skip,
      take,
      select: seleccionComunicado,
    });
  },

  async contarVisibles() {
    return prisma.comunicado.count({
      where: {
        estado: {
          not: "ELIMINADO",
        },
      },
    });
  },

  async buscarPorId(id) {
    return prisma.comunicado.findUnique({
      where: {
        id: Number(id),
      },
      select: seleccionComunicado,
    });
  },

  async actualizar(id, { titulo, contenido }) {
    return prisma.comunicado.update({
      where: {
        id: Number(id),
      },
      data: {
        titulo,
        contenido,
        estado: "EDITADO",
      },
      select: seleccionComunicado,
    });
  },

  async marcarEliminado(id) {
    return prisma.comunicado.update({
      where: {
        id: Number(id),
      },
      data: {
        estado: "ELIMINADO",
      },
      select: seleccionComunicado,
    });
  },
};

export default comunicadoRepository;

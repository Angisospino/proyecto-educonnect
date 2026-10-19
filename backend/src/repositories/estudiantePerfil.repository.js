import prisma from '../config/prisma.js';

/**
 * Busca el perfil de estudiante asociado a un usuario.
 *
 * Nota.estudianteId referencia EstudiantePerfil.id, que es
 * distinto de Usuario.id. Este repository resuelve ese mapeo.
 *
 * @param {number} usuarioId - ID del usuario (tabla Usuario).
 * @returns {Promise<Object|null>} Perfil de estudiante encontrado o null.
 */
const buscarPorUsuarioId = async (usuarioId) => {
  return prisma.estudiantePerfil.findUnique({
    where: {
      usuarioId,
    },
  });
};

export default {
  buscarPorUsuarioId,
};

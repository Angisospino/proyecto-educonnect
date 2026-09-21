import notaRepository from "../repositories/nota.repository.js";

/* ==========================================
   UTILIDADES
   ========================================== */

const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const validarId = (id) => {
    const notaId = Number(id);

    if (!Number.isInteger(notaId) || notaId <= 0) {
        throw createError("El identificador de la nota no es válido.", 400);
    }

    return notaId;
};

const validarValor = (valor) => {
    const nota = Number(valor);

    if (!Number.isFinite(nota) || nota < 0 || nota > 5) {
        throw createError("La nota debe estar entre 0.0 y 5.0.", 400);
    }

    return nota;
};

/* ==========================================
   REGISTRAR NOTA
   ========================================== */

const registrarNota = async (datos) => {
    const valor = validarValor(datos?.valor);

    const datosNota = {
        ...datos,
        valor,
    };

    return notaRepository.crear(datosNota);
};

/* ==========================================
   CONSULTAR NOTAS
   ========================================== */

const consultarNotas = async (usuario, filtros = {}) => {
    let estudianteId = filtros.estudianteId;
    const periodo = filtros.periodo;

    /*
     * Auto-escopado:
     * un estudiante solo puede consultar sus propias notas.
     */
    if (usuario.rol === "ESTUDIANTE") {
        estudianteId = usuario.id;
    }

    if (estudianteId !== undefined) {
        estudianteId = Number(estudianteId);

        if (!Number.isInteger(estudianteId) || estudianteId <= 0) {
            throw createError(
                "El identificador del estudiante no es válido.",
                400,
            );
        }
    }

    return notaRepository.buscarPorEstudiante(
        estudianteId,
        periodo,
    );
};

/* ==========================================
   ACTUALIZAR NOTA
   ========================================== */

const actualizarNota = async (id, datos) => {
    const notaId = validarId(id);

    /* ========================================
       VERIFICAR QUE LA NOTA EXISTA
       ======================================== */

    const notaExistente = await notaRepository.buscarPorId(notaId);

    if (!notaExistente) {
        throw createError("Nota no encontrada.", 404);
    }

    /* ========================================
       VALIDAR VALOR
       ======================================== */

    const datosActualizados = {
        ...datos,
    };

    if (datos?.valor !== undefined) {
        datosActualizados.valor = validarValor(datos.valor);
    }

    /* ========================================
       ACTUALIZAR NOTA
       ======================================== */

    return notaRepository.actualizar(
        notaId,
        datosActualizados,
    );
};

/* ==========================================
   EXPORTAR SERVICIO
   ========================================== */

const notaService = {
    registrarNota,
    consultarNotas,
    actualizarNota,
};

export default notaService;
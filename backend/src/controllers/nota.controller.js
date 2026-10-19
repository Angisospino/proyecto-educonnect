import notaService from "../services/nota.service.js";

/* ==========================================
   CREAR NOTA
   ========================================== */

const crearNota = async (req, res, next) => {
    try {
        const nota = await notaService.registrarNota(
            req.body,
            req.usuario,
        );

        return res.status(201).json({
            success: true,
            data: nota,
            error: null,
        });
    } catch (error) {
        next(error);
    }
};

/* ==========================================
   OBTENER NOTAS
   ========================================== */

const obtenerNotas = async (req, res, next) => {
    try {
        const { notas, paginacion } = await notaService.consultarNotas(
            req.usuario,
            req.query,
        );

        // data sigue siendo siempre un arreglo. Solo si la consulta se
        // paginó se agrega meta junto a data (compatibilidad con el
        // frontend actual, que lee el arreglo completo).
        return res.status(200).json({
            success: true,
            data: notas,
            ...(paginacion && { meta: paginacion }),
            error: null,
        });
    } catch (error) {
        next(error);
    }
};

/* ==========================================
   ACTUALIZAR NOTA
   ========================================== */

const actualizarNota = async (req, res, next) => {
    try {
        const nota = await notaService.actualizarNota(
            req.params.id,
            req.body,
            req.usuario,
        );

        return res.status(200).json({
            success: true,
            data: nota,
            error: null,
        });
    } catch (error) {
        next(error);
    }
};

/* ==========================================
   EXPORTAR CONTROLADOR
   ========================================== */

const notaController = {
    crearNota,
    obtenerNotas,
    actualizarNota,
};

export default notaController;
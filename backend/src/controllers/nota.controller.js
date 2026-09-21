import notaService from "../services/nota.service.js";

/* ==========================================
   CREAR NOTA
   ========================================== */

const crearNota = async (req, res, next) => {
    try {
        const nota = await notaService.registrarNota(req.body);

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
        const notas = await notaService.consultarNotas(
            req.usuario,
            req.query,
        );

        return res.status(200).json({
            success: true,
            data: notas,
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
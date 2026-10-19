import padreService from "../services/padre.service.js";

/* ==========================================
   OBTENER MIS HIJOS
   ========================================== */

const obtenerMisHijos = async (req, res, next) => {
    try {
        const hijos = await padreService.listarMisHijos(req.usuario);

        return res.status(200).json({
            success: true,
            data: hijos,
            error: null,
        });
    } catch (error) {
        next(error);
    }
};

/* ==========================================
   EXPORTAR CONTROLADOR
   ========================================== */

const padreController = {
    obtenerMisHijos,
};

export default padreController;

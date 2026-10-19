import catalogoService from "../services/catalogo.service.js";

/* ==========================================
   OBTENER CURSOS
   ========================================== */

const obtenerCursos = async (req, res, next) => {
    try {
        const cursos = await catalogoService.listarCursos();

        return res.status(200).json({
            success: true,
            data: cursos,
            error: null,
        });
    } catch (error) {
        next(error);
    }
};

/* ==========================================
   OBTENER ASIGNATURAS
   ========================================== */

const obtenerAsignaturas = async (req, res, next) => {
    try {
        const asignaturas = await catalogoService.listarAsignaturas();

        return res.status(200).json({
            success: true,
            data: asignaturas,
            error: null,
        });
    } catch (error) {
        next(error);
    }
};

/* ==========================================
   OBTENER ESTUDIANTES DE UN CURSO
   ========================================== */

const obtenerEstudiantesDeCurso = async (req, res, next) => {
    try {
        const estudiantes = await catalogoService.listarEstudiantesDeCurso(
            req.params.id,
        );

        return res.status(200).json({
            success: true,
            data: estudiantes,
            error: null,
        });
    } catch (error) {
        next(error);
    }
};

/* ==========================================
   EXPORTAR CONTROLADOR
   ========================================== */

const catalogoController = {
    obtenerCursos,
    obtenerAsignaturas,
    obtenerEstudiantesDeCurso,
};

export default catalogoController;

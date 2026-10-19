import vinculoService from "../services/vinculo.service.js";

/* ==========================================
   LISTAR VÍNCULOS
   ========================================== */

const listarVinculos = async (req, res, next) => {
    try {
        const vinculos = await vinculoService.listarVinculos(req.query);

        return res.status(200).json({
            success: true,
            data: vinculos,
            error: null,
        });
    } catch (error) {
        next(error);
    }
};

/* ==========================================
   CREAR VÍNCULO
   ========================================== */

const crearVinculo = async (req, res, next) => {
    try {
        const vinculo = await vinculoService.crearVinculo(req.body);

        return res.status(201).json({
            success: true,
            data: vinculo,
            error: null,
        });
    } catch (error) {
        next(error);
    }
};

/* ==========================================
   ELIMINAR VÍNCULO
   ========================================== */

const eliminarVinculo = async (req, res, next) => {
    try {
        const eliminado = await vinculoService.eliminarVinculo(req.params.id);

        return res.status(200).json({
            success: true,
            data: eliminado,
            error: null,
        });
    } catch (error) {
        next(error);
    }
};

/* ==========================================
   EXPORTAR CONTROLADOR
   ========================================== */

const vinculoController = {
    listarVinculos,
    crearVinculo,
    eliminarVinculo,
};

export default vinculoController;


import comunicadoService from "../services/comunicado.service.js";

const comunicadoController = {
  async crear(req, res, next) {
    try {
      const data = await comunicadoService.publicarComunicado(
        req.body,
        req.usuario
      );

      return res.status(201).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async listar(req, res, next) {
    try {
      const { page, pageSize } = req.query;

      const data = await comunicadoService.listarComunicados({
        page,
        pageSize,
      });

      return res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req, res, next) {
    try {
      const data = await comunicadoService.editarComunicado(
        req.params.id,
        req.body,
        req.usuario
      );

      return res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req, res, next) {
    try {
      const data = await comunicadoService.eliminarComunicado(
        req.params.id,
        req.usuario
      );

      return res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default comunicadoController;


import EmailNotificacionStrategy from "./EmailNotificacionStrategy.js";
import { crearNotificacionService } from "../services/notificacion.service.js";

// Estrategia predeterminada: correo electrónico.
const estrategiaEmail =
  new EmailNotificacionStrategy();

// La simulación es una propiedad del adaptador
// concreto, no del servicio genérico.
const notificacionService =
  crearNotificacionService(
    estrategiaEmail,
    {
      simulacion: estrategiaEmail.modoDesarrollo,
    }
  );

export {
  estrategiaEmail,
  notificacionService,
};

export default notificacionService;

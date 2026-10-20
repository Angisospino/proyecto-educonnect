
import nodemailer from "nodemailer";
import INotificacionStrategy from "./INotificacionStrategy.js";

// Tiempos maximos (ms) para hablar con el servidor SMTP. Sin ellos, un
// servidor colgado bloquearia el envio a cada destinatario durante minutos.
const SMTP_CONNECTION_TIMEOUT_MS = 10000;
const SMTP_GREETING_TIMEOUT_MS = 10000;
const SMTP_SOCKET_TIMEOUT_MS = 10000;

class EmailNotificacionStrategy extends INotificacionStrategy {
  constructor() {
    super();

    this.modoDesarrollo = !process.env.SMTP_HOST;

    if (this.modoDesarrollo) {
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });

      console.info(
        "[EMAIL] SMTP_HOST no configurado. " +
        "Modo simulación activado."
      );

      return;
    }

    const port = Number(process.env.SMTP_PORT);

    if (
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65535
    ) {
      throw new Error(
        "SMTP_PORT debe ser un puerto válido."
      );
    }

    if (
      !["true", "false"].includes(
        process.env.SMTP_SECURE
      )
    ) {
      throw new Error(
        "SMTP_SECURE debe ser true o false."
      );
    }

    const secure = process.env.SMTP_SECURE === "true";

    const {
      SMTP_HOST,
      SMTP_USER,
      SMTP_PASS,
      SMTP_FROM,
    } = process.env;

    const faltantes = Object.entries({
      SMTP_USER,
      SMTP_PASS,
      SMTP_FROM,
    })
      .filter(([, valor]) => !valor)
      .map(([nombre]) => nombre);

    if (faltantes.length > 0) {
      throw new Error(
        "Faltan variables de configuración SMTP: " +
        faltantes.join(", ") +
        "."
      );
    }

    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
      greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
      socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
    });
  }

  /**
   * Envía una notificación por correo.
   *
   * @param {string} destinatario
   * @param {string} asunto
   * @param {string} contenido
   * @returns {Promise<unknown>}
   */
  async enviar(destinatario, asunto, contenido) {
    if (
      typeof destinatario !== "string" ||
      !destinatario.trim()
    ) {
      throw new Error(
        "El destinatario es obligatorio."
      );
    }

    if (
      typeof asunto !== "string" ||
      !asunto.trim()
    ) {
      throw new Error(
        "El asunto es obligatorio."
      );
    }

    if (
      typeof contenido !== "string" ||
      !contenido.trim()
    ) {
      throw new Error(
        "El contenido es obligatorio."
      );
    }

    const from = this.modoDesarrollo
      ? "EduConnect BR <no-reply@localhost.invalid>"
      : process.env.SMTP_FROM;

    try {
      const resultado = await this.transporter.sendMail({
        from,
        to: destinatario.trim(),
        subject: asunto.trim(),
        text: contenido.trim(),
      });

      if (this.modoDesarrollo) {
        // No se registra el cuerpo: es el texto de un comunicado y el
        // destinatario es un dato personal; solo lo minimo para depurar.
        console.info(
          "[EMAIL SIMULADO] Mensaje generado.",
          { destinatario: destinatario.trim(), asunto: asunto.trim() }
        );
      }

      return resultado;
    } catch (error) {
      console.error(
        "[EMAIL] Error al procesar el envío:",
        error.message
      );

      // El servicio llamador decide si registra
      // el estado FALLIDA en la base de datos.
      throw error;
    }
  }
}

export default EmailNotificacionStrategy;

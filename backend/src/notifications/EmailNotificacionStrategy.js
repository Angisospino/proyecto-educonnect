
import nodemailer from "nodemailer";
import INotificacionStrategy from "./INotificacionStrategy.js";

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

    if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      throw new Error(
        "Faltan variables de configuración SMTP."
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
        console.info(
          "[EMAIL SIMULADO] Mensaje generado:",
          resultado.message
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

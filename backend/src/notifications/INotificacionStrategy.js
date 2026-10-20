
/**
 * Clase base para las estrategias de notificación.
 *
 * Define el contrato que deben implementar
 * las estrategias de envío.
 */
class INotificacionStrategy {
  /**
   * Envía una notificación.
   *
   * @param {string} destinatario
   * @param {string} asunto
   * @param {string} contenido
   * @returns {Promise<unknown>}
   */
  async enviar(destinatario, asunto, contenido) {
    throw new Error("Método no implementado");
  }
}

export default INotificacionStrategy;

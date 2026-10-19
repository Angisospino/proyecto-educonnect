/**
 * Extrae un mensaje de error en texto plano de un error de Axios.
 *
 * El errorHandler del backend responde, en desarrollo,
 * { success, message, error: { name, code, stack } }. Por eso
 * solo se aceptan valores de tipo string: pintar un objeto
 * en JSX rompe React ("Objects are not valid as a React child").
 *
 * Prioridad: data.message > data.error > error.message > porDefecto.
 */
export const obtenerMensajeError = (error, porDefecto) => {
  const data = error?.response?.data;

  if (typeof data?.message === "string" && data.message) {
    return data.message;
  }

  if (typeof data?.error === "string" && data.error) {
    return data.error;
  }

  if (typeof error?.message === "string" && error.message) {
    return error.message;
  }

  return porDefecto;
};

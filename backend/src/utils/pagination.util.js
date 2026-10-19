// Valores por defecto y límites de la paginación opcional.
const PAGINA_POR_DEFECTO = 1;
const TAMANO_POR_DEFECTO = 20;
const TAMANO_MAXIMO = 100;

// Máximo valor de un INT de MySQL / Prisma: el desplazamiento (skip)
// nunca puede superarlo, o la consulta fallaría con un 500.
const INT_MAX = 2147483647;

const crearError = (mensaje, statusCode = 400) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
};

/**
 * Indica si la petición pidió paginación.
 *
 * La paginación es opcional (opt-in): solo se aplica cuando llega
 * `page` y/o `pageSize`. Sin ninguno de los dos, las consultas devuelven
 * todos los registros como antes. Un valor presente pero vacío
 * (`?page=`) cuenta como pedido y se rechaza en la validación.
 *
 * @param {Object} filtros - Filtros de la consulta (req.query).
 * @returns {boolean}
 */
export const hayPaginacion = (filtros = {}) =>
  filtros.page !== undefined || filtros.pageSize !== undefined;

/**
 * Convierte un valor a entero positivo o lanza un 400.
 *
 * Solo se aceptan números JS o textos formados únicamente por dígitos
 * (sin espacios ni signos). Se rechazan arreglos (`?page=1&page=2` llega
 * como arreglo en Express 5), objetos, booleanos, null y textos vacíos:
 * por eso no se usa String(valor), que convertiría ["5"] en "5".
 */
const validarEnteroPositivo = (valor, nombre) => {
  const esNumero = typeof valor === 'number';
  const esTextoNumerico = typeof valor === 'string' && /^\d+$/.test(valor);

  const numero = esNumero || esTextoNumerico ? Number(valor) : NaN;

  if (!Number.isSafeInteger(numero) || numero <= 0) {
    throw crearError(`${nombre} debe ser un entero positivo.`);
  }

  return numero;
};

/**
 * Valida y normaliza los parámetros de paginación.
 *
 * @param {Object} parametros
 * @param {*} [parametros.page] - Página (desde 1). Por defecto 1.
 * @param {*} [parametros.pageSize] - Registros por página. Por defecto 20, máximo 100.
 * @returns {{ page: number, pageSize: number, skip: number, take: number }}
 * @throws {Error} Con statusCode 400 si algún valor no es válido.
 */
export const validarPaginacion = ({ page, pageSize } = {}) => {
  const pagina =
    page === undefined
      ? PAGINA_POR_DEFECTO
      : validarEnteroPositivo(page, 'page');

  const tamano =
    pageSize === undefined
      ? TAMANO_POR_DEFECTO
      : validarEnteroPositivo(pageSize, 'pageSize');

  if (tamano > TAMANO_MAXIMO) {
    throw crearError(`pageSize no puede superar ${TAMANO_MAXIMO}.`);
  }

  const skip = (pagina - 1) * tamano;

  if (skip > INT_MAX) {
    throw crearError('page es demasiado grande.');
  }

  return {
    page: pagina,
    pageSize: tamano,
    skip,
    take: tamano,
  };
};

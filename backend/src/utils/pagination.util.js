
const validarEnteroPositivo = (valor, nombre) => {
  const texto = String(valor);

  if (!/^[1-9]\d*$/.test(texto)) {
    const error = new Error(
      `${nombre} debe ser un entero positivo.`
    );
    error.statusCode = 400;
    throw error;
  }

  const numero = Number(texto);

  if (!Number.isSafeInteger(numero)) {
    const error = new Error(
      `${nombre} debe ser un entero positivo válido.`
    );
    error.statusCode = 400;
    throw error;
  }

  return numero;
};

export const validarPaginacion = ({
  page = 1,
  pageSize = 20,
} = {}) => {
  const pagina = validarEnteroPositivo(page, "page");
  const tamano = validarEnteroPositivo(
    pageSize,
    "pageSize"
  );

  if (tamano > 100) {
    const error = new Error(
      "pageSize no puede superar 100."
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    page: pagina,
    pageSize: tamano,
    skip: (pagina - 1) * tamano,
    take: tamano,
  };
};

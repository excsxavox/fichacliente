/** Error de regla de negocio → HTTP 409 y cuerpo JSON estable para el cliente. */
export class BusinessRuleError extends Error {
  readonly statusCode = 409;
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "BusinessRuleError";
    this.code = code;
  }
}

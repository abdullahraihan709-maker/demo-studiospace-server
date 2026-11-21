/**
 * An error we deliberately show to the client.
 *
 * Anything that is not an ApiError becomes a generic 500, so internal details
 * (stack traces, Mongo internals, driver messages) never leak through the API.
 */
export class ApiError extends Error {
  constructor(statusCode, message, code = "REQUEST_FAILED", errors = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.status = statusCode;
    this.code = code;
    this.errors = errors;
    this.expose = statusCode < 500;
  }

  static badRequest(message, code = "BAD_REQUEST", errors = undefined) {
    return new ApiError(400, message, code, errors);
  }

  static validation(errors) {
    return new ApiError(400, "Some fields need your attention.", "VALIDATION_ERROR", errors);
  }

  static unauthorized(message = "Please log in to continue.", code = "UNAUTHENTICATED") {
    return new ApiError(401, message, code);
  }

  static forbidden(message = "You do not have access to this resource.", code = "FORBIDDEN") {
    return new ApiError(403, message, code);
  }

  static notFound(message = "We could not find what you were looking for.", code = "NOT_FOUND") {
    return new ApiError(404, message, code);
  }

  static conflict(message, code = "CONFLICT") {
    return new ApiError(409, message, code);
  }
}

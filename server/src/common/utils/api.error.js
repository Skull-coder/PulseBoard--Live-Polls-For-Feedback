class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request") {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notfound(message = "Not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  static unprocessableEntity(message = "Unprocessable entity") {
    return new ApiError(422, message);
  }

  static internalServerError(message = "Internal server error") {
    return new ApiError(500, message);
  }

  static tooManyRequests(message = "Too many requests") {
    return new ApiError(429, message);
  }
}

export default ApiError;

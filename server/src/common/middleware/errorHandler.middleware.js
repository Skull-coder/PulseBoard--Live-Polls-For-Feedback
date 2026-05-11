export function errorHandler(err, req, res, next) {
  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: {
        message: messages.join(", ")
      }
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: {
        message: "Invalid id format"
      }
    });
  }

  // Handle other errors
  const status = err.statusCode|| err.status || 500;
  const message = err.message || "Internal server error";
  return res.status(status).json({
    error: {
      message
    }
  });
}

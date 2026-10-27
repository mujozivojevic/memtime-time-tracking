import { ApiError } from "../errors/ApiError.js";

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed" && error.status === 400) {
    return res.status(400).json({
      error: "Invalid JSON body",
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  console.error("Unexpected error:", error);

  return res.status(500).json({
    error: "Unexpected error on the server",
  });
}

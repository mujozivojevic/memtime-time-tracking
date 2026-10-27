import { ApiError } from "../errors/ApiError.js";

export function validatePagination(req, res, next) {
  const rawLimit = req.query.limit ?? "10";
  const rawOffset = req.query.offset ?? "0";

  if (typeof rawLimit !== "string" || typeof rawOffset !== "string") {
    return next(new ApiError(400, "Limit and offset must be numbers"));
  }

  const limit = Number(rawLimit);
  const offset = Number(rawOffset);

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    return next(new ApiError(400, "Limit must be between 1 and 100"));
  }

  if (!Number.isSafeInteger(offset) || offset < 0) {
    return next(new ApiError(400, "Offset must be a non-negative integer"));
  }

  res.locals.pagination = { limit, offset };
  next();
}

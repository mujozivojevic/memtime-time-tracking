import { ApiError } from "../errors/ApiError.js";

const MAX_COMMENT_LENGTH = 500;

const timestampPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

function parseTimestamp(value, field) {
  if (typeof value !== "string" || !timestampPattern.test(value)) {
    throw new ApiError(
      400,
      `${field} must be an ISO timestamp with a time zone`,
    );
  }

  const timestamp = Date.parse(value);
  const date = value.slice(0, 10);

  if (
    Number.isNaN(timestamp) ||
    new Date(date).toISOString().slice(0, 10) !== date
  ) {
    throw new ApiError(400, `${field} must be a valid timestamp`);
  }

  return timestamp;
}

export function validateTimeEntryInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ApiError(400, "A JSON object is required");
  }

  const { taskId, comment, start, end } = input;

  if (!Number.isSafeInteger(taskId) || taskId < 1) {
    throw new ApiError(400, "Task ID must be a positive integer");
  }

  if (typeof comment !== "string" || !comment.trim()) {
    throw new ApiError(400, "Comment is required");
  }

  if (comment.trim().length > MAX_COMMENT_LENGTH) {
    throw new ApiError(
      400,
      `Comment must be at most ${MAX_COMMENT_LENGTH} characters`,
    );
  }

  const startTime = parseTimestamp(start, "Start");
  const endTime = parseTimestamp(end, "End");

  const currentYear = new Date().getUTCFullYear();
  if (new Date(startTime).getUTCFullYear() < currentYear) {
    throw new ApiError(400, `Start must be in ${currentYear} or later`);
  }

  if (endTime <= startTime) {
    throw new ApiError(400, "End must be after start");
  }

  if (endTime > Date.now()) {
    throw new ApiError(400, "End cannot be in the future");
  }

  return {
    taskId,
    comment: comment.trim(),
    start: new Date(startTime).toISOString(),
    end: new Date(endTime).toISOString(),
  };
}

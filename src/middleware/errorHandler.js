import { ApiError } from "../utils/ApiError.js";

/**
 * Every 404 goes through the same envelope as every other failure, so the
 * client never has to special-case Express's default HTML page.
 */
export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found.`, "ROUTE_NOT_FOUND"));
}

const MONGOOSE_FIELD_LABELS = {
  title: "title",
  category: "category",
  hourlyRate: "hourly rate",
  securityDeposit: "security deposit",
  maxCapacity: "capacity",
  location: "location",
  imageUrl: "cover image",
  overview: "overview",
  ownerEmail: "owner email",
  ownerName: "owner name",
  startAt: "start time",
  endAt: "end time",
  rating: "rating",
  comment: "comment",
};

function fromMongooseValidation(error) {
  const errors = Object.entries(error.errors ?? {}).map(([field, detail]) => ({
    field,
    message: detail.message,
  }));
  return new ApiError(400, "Some fields need your attention.", "VALIDATION_ERROR", errors);
}

function fromDuplicateKey(error) {
  const field = Object.keys(error.keyValue ?? {})[0];
  const label = MONGOOSE_FIELD_LABELS[field] ?? field ?? "value";
  return new ApiError(409, `That ${label} is already in use.`, "DUPLICATE_KEY", [
    { field: field ?? "unknown", message: `That ${label} is already in use.` },
  ]);
}

function normalize(error) {
  if (error instanceof ApiError) return error;

  // A ZodError that escaped validate() (e.g. parsed by hand inside a controller).
  if (error?.name === "ZodError") {
    const errors = (error.issues ?? []).map((issue) => ({
      field: issue.path.join(".") || "body",
      message: issue.message,
    }));
    return new ApiError(400, "Some fields need your attention.", "VALIDATION_ERROR", errors);
  }

  if (error?.name === "ValidationError" && error.errors) return fromMongooseValidation(error);

  if (error?.name === "CastError") {
    const field = error.path ?? "identifier";
    return new ApiError(400, `That ${field} is not valid.`, "INVALID_IDENTIFIER");
  }

  if (error?.code === 11000) return fromDuplicateKey(error);

  if (error?.type === "entity.too.large") {
    return new ApiError(413, "That request body is too large.", "PAYLOAD_TOO_LARGE");
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return new ApiError(400, "The request body is not valid JSON.", "INVALID_JSON");
  }

  return new ApiError(500, "Something went wrong on our side. Please try again.", "INTERNAL_ERROR");
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const normalized = normalize(err);

  if (normalized.statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} (${req.id ?? "no-request-id"})`, err);
  }

  const body = {
    success: false,
    message: normalized.message,
    code: normalized.code,
  };

  if (normalized.errors?.length) {
    body.errors = normalized.errors;
  }

  return res.status(normalized.statusCode).json(body);
}

export default errorHandler;

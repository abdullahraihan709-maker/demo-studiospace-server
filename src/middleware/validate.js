import { ApiError } from "../utils/ApiError.js";

/**
 * Validates req.body / req.params / req.query with a zod schema.
 *
 * Zod strips unknown keys by default, which is exactly the behaviour we want:
 * a client cannot smuggle ownerEmail, rating or featured into a studio payload.
 */
export function validate(schema, source = "body") {
  return function validateRequest(req, res, next) {
    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join(".") : source,
        message: issue.message,
      }));
      return next(ApiError.validation(errors));
    }

    // Express 5 exposes req.query through a getter, so the parsed copy lives
    // on req.validatedQuery instead of overwriting the original.
    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data;
    }

    return next();
  };
}

export default validate;

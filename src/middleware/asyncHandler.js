/**
 * Express 5 already forwards rejected promises, but keeping the wrapper makes
 * the intent explicit at every route and keeps the code safe if the dependency
 * is ever pinned back to Express 4.
 */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export default asyncHandler;

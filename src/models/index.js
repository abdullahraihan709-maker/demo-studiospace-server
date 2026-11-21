/**
 * Model barrel.
 *
 * Importing from here also guarantees every schema is registered before any
 * populate() call runs, which is the usual reason populate silently returns null.
 */
export { default as Studio, STUDIO_CATEGORIES } from "./Studio.js";
export { default as Booking, BOOKING_STATUSES } from "./Booking.js";
export { default as Review } from "./Review.js";

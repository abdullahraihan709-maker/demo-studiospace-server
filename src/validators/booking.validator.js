import { z } from "zod";
import { BOOKING_STATUSES } from "../models/Booking.js";
import { dateTimeString, objectIdString } from "./common.validator.js";

/**
 * The interval rules live here so an invalid range never reaches Mongoose.
 * The overlap check against other bookings is a database concern and stays in
 * the controller (Challenge 2).
 */
export const createBookingSchema = z
  .object({
    studioId: objectIdString,
    startAt: dateTimeString,
    endAt: dateTimeString,
    note: z.string().trim().max(500, "Notes cannot exceed 500 characters.").default(""),
  })
  .refine(
    (value) => {
      const start = Date.parse(value.startAt);
      const end = Date.parse(value.endAt);
      // If either date is unparseable, the field-level error already covers it.
      if (Number.isNaN(start) || Number.isNaN(end)) return true;
      return end > start;
    },
    { message: "End time must be after the start time.", path: ["endAt"] },
  );

export const updateBookingStatusSchema = z.object({
  status: z
    .string()
    .trim()
    .refine(
      (value) => BOOKING_STATUSES.includes(value),
      `Status must be one of: ${BOOKING_STATUSES.join(", ")}.`,
    ),
});

export const bookingIdParamsSchema = z.object({ id: objectIdString });

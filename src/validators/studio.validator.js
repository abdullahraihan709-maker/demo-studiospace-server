import { z } from "zod";
import { STUDIO_CATEGORIES } from "../models/Studio.js";
import { imageUrl } from "./common.validator.js";

const category = z
  .string()
  .trim()
  .refine(
    (value) => STUDIO_CATEGORIES.includes(value),
    `Choose one of: ${STUDIO_CATEGORIES.join(", ")}.`,
  );

const amenity = z
  .string()
  .trim()
  .min(2, "Amenity names need at least 2 characters.")
  .max(40, "Amenity names cannot exceed 40 characters.");

/**
 * ownerEmail, ownerName, ownerImage, rating, reviewCount and featured are
 * intentionally absent: zod strips them, so they can only be set by the server
 * from the verified token or by the seed script.
 */
export const createStudioSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(90, "Title cannot exceed 90 characters."),
  category,
  hourlyRate: z.coerce
    .number()
    .min(1, "Hourly rate must be at least 1.")
    .max(100000, "Hourly rate looks too high."),
  securityDeposit: z.coerce
    .number()
    .min(0, "Security deposit cannot be negative.")
    .max(100000, "Security deposit looks too high.")
    .default(0),
  maxCapacity: z.coerce
    .number()
    .int("Capacity must be a whole number.")
    .min(1, "Capacity must be at least 1 person.")
    .max(500, "Capacity cannot exceed 500 people."),
  location: z
    .string()
    .trim()
    .min(3, "Location needs at least 3 characters.")
    .max(120, "Location cannot exceed 120 characters."),
  imageUrl,
  gallery: z.array(imageUrl).max(6, "Add at most 6 gallery images.").default([]),
  amenities: z.array(amenity).max(12, "List at most 12 amenities.").default([]),
  overview: z
    .string()
    .trim()
    .min(80, "Overview needs at least 80 characters so guests know what to expect.")
    .max(2000, "Overview cannot exceed 2000 characters."),
});

/**
 * PATCH accepts any subset, but never an empty body.
 * .partial() keeps the defaults out of the way so unspecified fields stay as-is.
 */
export const updateStudioSchema = createStudioSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  });

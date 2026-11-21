import { z } from "zod";

/** 24 hex characters: the only shape a Mongo ObjectId can take. */
export const objectIdString = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid identifier.");

/**
 * Accepts absolute http(s) URLs only. The gallery must never contain
 * javascript: or data: URIs, which would be an XSS vector once rendered.
 */
export const imageUrl = z
  .string()
  .trim()
  .min(1, "An image URL is required.")
  .max(2048, "That image URL is too long.")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid image URL starting with http:// or https://.");

/** A route param of the shape /studios/:id */
export const idParamsSchema = z.object({ id: objectIdString });

/** Shared date-time parser for booking payloads. */
export const dateTimeString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Use a valid date and time.");

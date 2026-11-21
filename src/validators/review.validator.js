import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int("Rating must be a whole number.")
    .min(1, "Rating must be between 1 and 5.")
    .max(5, "Rating must be between 1 and 5."),
  comment: z
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters.")
    .max(600, "Comment cannot exceed 600 characters."),
});

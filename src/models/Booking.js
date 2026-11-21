import mongoose from "mongoose";

export const BOOKING_STATUSES = Object.freeze([
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
]);

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    studioId: {
      type: Schema.Types.ObjectId,
      ref: "Studio",
      required: [true, "A studio reference is required."],
    },
    // Snapshot fields: a booking must still read correctly if the listing is
    // edited or removed afterwards.
    studioTitle: {
      type: String,
      required: [true, "A studio title snapshot is required."],
      trim: true,
    },
    studioImage: {
      type: String,
      default: "",
      trim: true,
    },
    hourlyRate: {
      type: Number,
      required: [true, "The hourly rate at booking time is required."],
      min: [0, "Hourly rate cannot be negative."],
    },
    userEmail: {
      type: String,
      required: [true, "A booking email is required."],
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      required: [true, "A booking name is required."],
      trim: true,
    },
    startAt: {
      type: Date,
      required: [true, "A start time is required."],
    },
    endAt: {
      type: Date,
      required: [true, "An end time is required."],
    },
    hours: {
      type: Number,
      required: [true, "Booked hours are required."],
      min: [0.5, "The smallest bookable slot is 30 minutes."],
      max: [24, "A single booking cannot exceed 24 hours."],
    },
    totalPrice: {
      type: Number,
      required: [true, "A total price is required."],
      min: [0, "Total price cannot be negative."],
    },
    status: {
      type: String,
      enum: {
        values: [...BOOKING_STATUSES],
        message: "Unknown booking status.",
      },
      default: "Pending",
    },
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters."],
    },
  },
  { timestamps: true, versionKey: false },
);

/**
 * The overlap query in Challenge 2 reads exactly this shape.
 * { studioId, status, startAt, endAt } keeps it an index scan, not a collection scan.
 */
bookingSchema.index(
  { studioId: 1, status: 1, startAt: 1, endAt: 1 },
  { name: "bookings_slot_scan" },
);
bookingSchema.index({ userEmail: 1, createdAt: -1 }, { name: "bookings_by_user" });
bookingSchema.index({ createdAt: -1 }, { name: "bookings_by_newest" });

/**
 * Defence in depth: the controller validates the range with zod, but a bad
 * document should never be writable from a script either.
 */
bookingSchema.pre("validate", function ensureEndAfterStart() {
  if (this.startAt && this.endAt && this.endAt.getTime() <= this.startAt.getTime()) {
    this.invalidate("endAt", "End time must be after the start time.");
  }
});

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

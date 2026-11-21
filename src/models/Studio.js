import mongoose from "mongoose";

export const STUDIO_CATEGORIES = Object.freeze([
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
]);

const { Schema } = mongoose;

const studioSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "A studio title is required."],
      trim: true,
      minlength: [5, "Title must be at least 5 characters."],
      maxlength: [90, "Title cannot exceed 90 characters."],
    },
    category: {
      type: String,
      required: [true, "Choose a category."],
      enum: {
        values: [...STUDIO_CATEGORIES],
        message: "Choose one of the supported categories.",
      },
    },
    hourlyRate: {
      type: Number,
      required: [true, "An hourly rate is required."],
      min: [1, "Hourly rate must be at least 1."],
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, "Security deposit cannot be negative."],
    },
    maxCapacity: {
      type: Number,
      required: [true, "Maximum capacity is required."],
      min: [1, "Capacity must be at least 1 person."],
      max: [500, "Capacity cannot exceed 500 people."],
    },
    location: {
      type: String,
      required: [true, "A location is required."],
      trim: true,
      maxlength: [120, "Location cannot exceed 120 characters."],
    },
    imageUrl: {
      type: String,
      required: [true, "A cover image is required."],
      trim: true,
    },
    gallery: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    overview: {
      type: String,
      required: [true, "An overview is required."],
      trim: true,
      minlength: [80, "Overview must be at least 80 characters of real copy."],
      maxlength: [2000, "Overview cannot exceed 2000 characters."],
    },
    // Identity always comes from the verified token, never from the request body.
    ownerEmail: {
      type: String,
      required: [true, "An owner email is required."],
      lowercase: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, "An owner name is required."],
      trim: true,
      maxlength: [80, "Owner name cannot exceed 80 characters."],
    },
    ownerImage: {
      type: String,
      default: "",
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative."],
      max: [5, "Rating cannot exceed 5."],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative."],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

// Browse by category, newest first.
studioSchema.index({ category: 1, createdAt: -1 }, { name: "studios_by_category" });
// /my-listings and the owner lookup.
studioSchema.index({ ownerEmail: 1, createdAt: -1 }, { name: "studios_by_owner" });
// Default listing order and the home page's newest strip.
studioSchema.index({ createdAt: -1 }, { name: "studios_by_newest" });
// Featured section (six records) ordered by rating.
studioSchema.index({ featured: 1, rating: -1 }, { name: "studios_featured" });
// "Highest rated" sort.
studioSchema.index({ rating: -1, reviewCount: -1 }, { name: "studios_by_rating" });
// Full-text search across title, location and overview.
studioSchema.index(
  { title: "text", location: "text", overview: "text" },
  {
    name: "studios_search",
    weights: { title: 5, location: 2, overview: 1 },
    default_language: "english",
  },
);

export default mongoose.models.Studio || mongoose.model("Studio", studioSchema);

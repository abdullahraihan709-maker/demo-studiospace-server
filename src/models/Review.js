import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    studioId: {
      type: Schema.Types.ObjectId,
      ref: "Studio",
      required: [true, "A studio reference is required."],
    },
    userEmail: {
      type: String,
      required: [true, "A reviewer email is required."],
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      required: [true, "A reviewer name is required."],
      trim: true,
    },
    userImage: {
      type: String,
      default: "",
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "A rating is required."],
      min: [1, "Rating must be between 1 and 5."],
      max: [5, "Rating must be between 1 and 5."],
    },
    comment: {
      type: String,
      required: [true, "A comment is required."],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters."],
      maxlength: [600, "Comment cannot exceed 600 characters."],
    },
  },
  { timestamps: true, versionKey: false },
);

reviewSchema.index({ studioId: 1, createdAt: -1 }, { name: "reviews_by_studio" });
// One review per person per studio; the controller turns a duplicate into a 409.
reviewSchema.index({ studioId: 1, userEmail: 1 }, { name: "reviews_one_per_user", unique: true });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);

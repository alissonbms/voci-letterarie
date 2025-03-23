import { Schema, model } from "mongoose";

const reviewSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      requried: true,
    },
    bookTitle: {
      type: String,
      requried: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0.5,
      max: 5,
      validate: (v) => v % 0.5 === 0,
    },
    image: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      requried: true,
    },
  },
  {
    timestamps: true,
  },
);

const Review = model("Review", reviewSchema);

export default Review;

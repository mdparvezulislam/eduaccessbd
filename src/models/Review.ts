import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  imageUrl: string;
  name?: string; // Optional: Name of the reviewer
  rating: number; // Default 5
  isActive: boolean;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    imageUrl: { 
      type: String, 
      required: [true, "Image URL is required"] 
    },
    name: { 
      type: String, 
      trim: true,
      default: "Happy Customer"
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
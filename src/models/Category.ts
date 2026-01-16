import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string; // Icon or thumbnail for the category
  description?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String }, 
    description: { type: String },
  },
  { timestamps: true }
);

// Prevents model overwrite error in Next.js hot reloading
export const Category: Model<ICategory> = 
  mongoose.models?.Category || mongoose.model<ICategory>("Category", categorySchema);
import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Interface for VIP Plan
interface IVipPlan {
  isEnabled: boolean;
  price: number;
  regularPrice?: number;
  validityLabel: string;
  description?: string;
  accessLink?: string;
  accessNote?: string;
}

// 2. Main Product Interface
export interface IProductDocument extends Document {
  title: string;
  slug: string;
  thumbnail: string;
  gallery: string[];
  description: string;
  shortDescription?: string;
  features: string[];
  category: mongoose.Types.ObjectId;
  tags: string[];
  videoUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  salesCount: number;
  fileType: string;

  // VIP Pricing Structure
  pricing: {
    monthly: IVipPlan;
    yearly:  IVipPlan;
    lifetime: IVipPlan;
  };

  // Standard Pricing (For Normal Products)
  defaultPrice: number;
  salePrice: number;
  regularPrice: number;

  // ✅ STANDARD DELIVERY FIELDS (For Normal Products)
  accessLink?: string;
  accessNote?: string;
}

// 3. Schema Definition
const planSchema = new Schema(
  {
    isEnabled: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    regularPrice: { type: Number, default: 0 },
    validityLabel: { type: String, default: "" },
    description: { type: String, default: "" },
    accessLink: { type: String, select: false }, // Private
    accessNote: { type: String, select: false }, // Private
  },
  { _id: false }
);

const productSchema = new Schema<IProductDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    thumbnail: { type: String, required: true },
    gallery: [{ type: String }],
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 500 },
    features: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    salesCount: { type: Number, default: 0 },
    fileType: { type: String, default: "Subscription" },

    // VIP Pricing
    pricing: {
      monthly: { type: planSchema, default: () => ({ isEnabled: false }) },
      yearly: { type: planSchema, default: () => ({ isEnabled: false }) },
      lifetime: { type: planSchema, default: () => ({ isEnabled: false }) },
    },

    // Standard Pricing
    defaultPrice: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
    regularPrice: { type: Number, default: 0 },

    // ✅ STANDARD DELIVERY DATA (Hidden by default)
    accessLink: { type: String, select: false },
    accessNote: { type: String, select: false },
  },
  { timestamps: true }
);

export const Product: Model<IProductDocument> = 
  mongoose.models?.Product || mongoose.model<IProductDocument>("Product", productSchema);
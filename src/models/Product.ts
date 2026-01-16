import mongoose, { Schema, Document, Model } from "mongoose";

// ✅ 1. Helper Interface for a Plan (To avoid repetition)
interface IVipPlan {
  isEnabled: boolean;
  price: number;
  regularPrice?: number;
  validityLabel: string;
  description?: string; // ⚡ NEW: Public description for this plan
  accessLink?: string;
  accessNote?: string;
}

// ✅ 2. Main Product Document Interface
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
  
  isAvailable: boolean;
  isFeatured: boolean;
  salesCount: number;
  fileType: string;

  // ⚡ VIP Pricing (Updated with Description)
  pricing: {
    monthly: IVipPlan;
    yearly:  IVipPlan;
    lifetime: IVipPlan;
  };

  // Standard Pricing
  defaultPrice: number;
  salePrice: number;
  regularPrice: number;

  // Legacy secure fields
  accessLink?: string;
  accessNote?: string;
}

// ✅ 3. Schema Definition for a Plan
const planSchema = new Schema(
  {
    isEnabled: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    regularPrice: { type: Number, default: 0 },
    validityLabel: { type: String, default: "" },
    
    // ⚡ NEW: Description Field
    description: { type: String, default: "" }, 

    // Secure Fields
    accessLink: { type: String, select: false }, 
    accessNote: { type: String, select: false }, 
  },
  { _id: false }
);

// ✅ 4. Main Product Schema
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

    // ⚡ VIP Pricing Structure (Updated Defaults)
    pricing: {
      monthly: { 
        type: planSchema, 
        default: () => ({ isEnabled: false, price: 0, validityLabel: "1 Month", description: "" }) 
      },
      yearly: { 
        type: planSchema, 
        default: () => ({ isEnabled: false, price: 0, validityLabel: "1 Year", description: "" }) 
      },
      lifetime: { 
        type: planSchema, 
        default: () => ({ isEnabled: false, price: 0, validityLabel: "Lifetime", description: "" }) 
      },
    },

    // Standard Pricing
    defaultPrice: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
    regularPrice: { type: Number, default: 0 },

    // Legacy fields
    accessLink: { type: String, select: false },
    accessNote: { type: String, select: false },
  },
  { timestamps: true }
);

export const Product: Model<IProductDocument> = 
  mongoose.models?.Product || mongoose.model<IProductDocument>("Product", productSchema);
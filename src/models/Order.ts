import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for what the admin delivers
interface IDeliveredContent {
  accountEmail?: string;
  accountPassword?: string;
  accessNotes?: string;
  downloadLink?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  
  products: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    title: string;
    variant?: string; // e.g. "Monthly"
  }[];
  
  // Payment Proof (User Inputs)
  transactionId?: string; // User entered TrxID
  senderNumber?: string;  // User entered Bkash/Nagad number
  paymentMethod: string;  // "Bkash Personal", "Nagad", etc.
  
  amount: number;
  
  // Statuses
  paymentStatus: "unpaid" | "paid" | "failed"; // Admin controls this after verifying
  status: "pending" | "processing" | "completed" | "cancelled";

  // Delivery
  deliveredContent?: IDeliveredContent;
  
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    // Support Multiple Items in Order
    products: [{
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      title: { type: String },
      variant: { type: String }
    }],

    // Manual Payment Details
    transactionId: { type: String, trim: true },

    paymentMethod: { type: String, default: "Manual" },
    
    amount: { type: Number, required: true },

    // Default to unpaid/pending until Admin verifies TrxID
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid" 
    },

    status: { 
      type: String, 
      enum: ["pending", "processing", "completed", "cancelled"], 
      default: "pending" 
    },

    deliveredContent: {
      accountEmail: { type: String, default: "" },
      accountPassword: { type: String, default: "" },
      accessNotes: { type: String, default: "" },
      downloadLink: { type: String, default: "" },
    }
  },
  { timestamps: true }
);

export const Order: Model<IOrder> = 
  mongoose.models?.Order || mongoose.model<IOrder>("Order", orderSchema);
import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for what the admin/system delivers
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
    variant?: string; // e.g. "Monthly", "Yearly", "Account Access"
  }[];
  
  // Payment Proof (User Inputs)
  transactionId?: string; 
  senderNumber?: string;
  paymentMethod: string;  
  
  // Financials
  amount: number;         // Final paid amount
  discountAmount?: number; // How much was saved
  couponCode?: string;     // Which code was used
  
  // Statuses
  paymentStatus: "unpaid" | "paid" | "failed"; 
  status: "pending" | "processing" | "completed" | "cancelled";

  // Delivery
  deliveredContent?: IDeliveredContent;
  
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    products: [{
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // Snapshotted price at time of order
      title: { type: String },
      variant: { type: String } // ✅ Correctly defined to store "Monthly", "Account Access", etc.
    }],

    // Payment Details
    transactionId: { type: String, trim: true },
    senderNumber: { type: String, trim: true },
    paymentMethod: { type: String, default: "Manual" },
    
    // Financials
    amount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, trim: true },

    // Statuses
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

    // Delivery Content (For Auto-Approval or Admin Manual Entry)
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
import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for what the admin/system delivers
interface IDeliveredContent {
  accountEmail?: string;
  accountPassword?: string;
  accessNotes?: string;
  downloadLink?: string;
}

export interface IPaymentProofDoc {
  url: string;
  thumbnailUrl?: string;
  imageKitFileId?: string;
  originalName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: Date;
  uploadedBy?: "customer" | "admin";
  verificationStatus: "pending" | "verified" | "rejected" | "none";
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
}

export interface IPaymentProofHistoryDoc {
  url: string;
  thumbnailUrl?: string;
  imageKitFileId?: string;
  originalName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: Date;
  uploadedBy?: "customer" | "admin";
  verificationStatus: "pending" | "verified" | "rejected";
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
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
  
  // Enterprise Payment Proof Upload & Verification
  paymentProof?: IPaymentProofDoc;
  paymentProofHistory?: IPaymentProofHistoryDoc[];

  // Financials
  amount: number;         // Final paid amount
  discountAmount?: number; // How much was saved
  couponCode?: string;     // Which code was used
  
  // Statuses
  paymentStatus: "unpaid" | "paid" | "failed"; 
  status: "pending" | "processing" | "completed" | "cancelled" | "declined";

  // Delivery
  deliveredContent?: IDeliveredContent;
  
  createdAt: Date;
  updatedAt: Date;
}

const paymentProofSubSchema = new Schema(
  {
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    imageKitFileId: { type: String },
    originalName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: String, enum: ["customer", "admin"], default: "customer" },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "none"],
      default: "pending",
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: String },
    rejectionReason: { type: String },
    adminNotes: { type: String },
  },
  { _id: false }
);

const paymentProofHistorySubSchema = new Schema(
  {
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    imageKitFileId: { type: String },
    originalName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    uploadedAt: { type: Date, required: true },
    uploadedBy: { type: String, enum: ["customer", "admin"], default: "customer" },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      required: true,
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: String },
    rejectionReason: { type: String },
    adminNotes: { type: String },
  },
  { _id: false }
);

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

    // Enterprise Payment Proof
    paymentProof: { type: paymentProofSubSchema, default: null },
    paymentProofHistory: { type: [paymentProofHistorySubSchema], default: [] },
    
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
      enum: ["pending", "processing", "completed", "cancelled", "declined"], 
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

if (mongoose.models?.Order && !mongoose.models.Order.schema.path("paymentProof")) {
  delete (mongoose.models as any).Order;
}

export const Order: Model<IOrder> = 
  mongoose.models?.Order || mongoose.model<IOrder>("Order", orderSchema);
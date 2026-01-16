
export interface IdParams {
  params: Promise<{ id: string }>;
}
export interface SlugParams {
  params: Promise<{ slug: string }>;
}


// ==========================================
// 1. USER TYPE
// ==========================================
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "ADMIN";
  image?: string;
  createdAt?: string;
}

// ==========================================
// 2. CATEGORY TYPE
// ==========================================
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;       // URL of the category icon/image
  description?: string;
  createdAt?: string;   // ISO String from DB
  updatedAt?: string;
}

// export const SITE_URL = "http://localhost:3000";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
// ==========================================
// 3. PRODUCT TYPE
// ==========================================
// ✅ 1. Define Plan Details (VIP Structure)
export interface IPlanDetails {
  isEnabled: boolean;
  price: number;
  regularPrice?: number;
  description?: string;
  validityLabel: string; // e.g. "Monthly", "Lifetime"
  accessLink?: string;   // Optional (Not usually sent to frontend public view)
  accessNote?: string;
}

// ✅ 2. Define Category Interface
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

// ✅ 3. Main Product Interface for Frontend
export interface IProduct {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  gallery?: string[];
  description: string;
  shortDescription?: string;
  features?: string[];
  
  // Category can be an ID string OR a populated Object
  category:  ICategory; 
  tags?: string[];
  
  isAvailable: boolean;
  isFeatured: boolean;
  salesCount: number;
  fileType: string;

  // ⚡ VIP PRICING FIELDS
  pricing?: {
    monthly?: IPlanDetails;
    yearly?: IPlanDetails;
    lifetime?: IPlanDetails;
  };

  // ⚡ FALLBACK / STANDARD PRICING
  defaultPrice?: number; 
  salePrice: number;    // Kept for backward compatibility
  regularPrice: number; // Kept for backward compatibility

  createdAt?: string;
  updatedAt?: string;
}
// ==========================================
// 4. ORDER TYPE
// ==========================================

// The hidden secret data (Credential/File)
export interface IDeliveredContent {
  accountEmail?: string;
  accountPassword?: string;
  accessNotes?: string;
  downloadLink?: string;
}

export interface IOrder {
  _id: string;
  
  // Relations
  user: IUser | string;      // Populated User or ID
  product: IProduct | string; // Populated Product or ID
  
  // Payment Info
  transactionId: string;
  paymentMethod: string;
  amount: number;
  screenshot?: string;
  
  // State
  status: "pending" | "completed" | "cancelled" | "declined" | "processing";
  
  // Delivery (Only present if status is completed)
  deliveredContent?: IDeliveredContent;
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. HELPER TYPES (Optional)
// ==========================================

// Useful for API Responses that return a list
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};


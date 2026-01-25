import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  type: "update" | "alert" | "offer" | "info" | "popup"; // ✅ Added 'popup'
  isActive: boolean;
  link?: string;        // ✅ New: Where the button clicks to (e.g., /shop)
  imageUrl?: string;    // ✅ New: Custom image URL (optional)
  buttonText?: string;  // ✅ New: Custom text for the button
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { 
      type: String, 
      required: [true, "Title is required"],
      trim: true 
    },
    description: { 
      type: String, 
      required: [true, "Description is required"] 
    },
    type: {
      type: String,
      // ✅ Added 'popup' to the allowed list
      enum: ["update", "alert", "offer", "info", "popup"], 
      default: "info",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ✅ NEW FIELDS FOR CUSTOMIZATION
    link: {
      type: String,
      trim: true,
      default: "/shop" // Default fallback link
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "" // Optional: If empty, UI uses default logo
    },
    buttonText: {
      type: String,
      trim: true,
      default: "Explore Offer" // Default button text
    }
  },
  { 
    timestamps: true 
  }
);

// Prevent model recompilation in Next.js hot reload
export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", announcementSchema);
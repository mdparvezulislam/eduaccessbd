import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  type: "update" | "alert" | "offer" | "info";
  isActive: boolean;
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
      enum: ["update", "alert", "offer", "info"],
      default: "info",
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { 
    timestamps: true // Automatically manages createdAt and updatedAt
  }
);

// Prevent model recompilation in Next.js hot reload
export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", announcementSchema);
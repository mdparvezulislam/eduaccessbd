import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true, // Store emails in lowercase to avoid case-sensitivity issues
    trim: true 
  },
  
  phone: { 
    type: String, 
    unique: true, // ✅ Ensures no two users have the same phone number
    sparse: true, // ✅ Allows 'null' or missing phone numbers without duplicate errors
    trim: true 
  },
  
  password: { 
    type: String, 
    required: true, // Password is required for credential registration
    select: false   // 🔒 SECURITY: Never return password in queries by default
  }, 
  
  image: { type: String, default: "" },
  
  role: { 
    type: String, 
    default: "user", 
    enum: ["user", "ADMIN"] 
  },
}, { timestamps: true });

export const User = mongoose.models?.User || mongoose.model("User", userSchema);
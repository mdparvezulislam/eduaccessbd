import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Security: Must be logged in
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, password } = body;
    const userId = session.user.id;

    // 2. Basic Validation
    if (!name || !email) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
    }

    await connectToDatabase();

    // 3. Dynamic Duplicate Check
    // We construct the check array dynamically so we don't check for empty phone strings
    const duplicateChecks: any[] = [{ email }];
    
    if (phone) {
      duplicateChecks.push({ phone });
    }

    // ✅ FIX: Cast the query object 'as any' to resolve TypeScript overload error
    // Mongoose handles string -> ObjectId conversion automatically at runtime.
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } }, // Exclude current user
        { $or: duplicateChecks }  // Check email OR phone
      ]
    } as any);

    if (existingUser) {
      return NextResponse.json({ error: "Email or Phone already in use by another account" }, { status: 409 });
    }

    // 4. Prepare Update Data
    const updateData: any = {
      name,
      email,
    };
    
    // Only update phone if provided
    if (phone !== undefined) {
      updateData.phone = phone;
    }

    // 5. Handle Password Change (Only if provided and valid)
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // 6. Update Database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true,            // Return the updated document
        runValidators: true   // Validate against Schema (e.g. email format)
      }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully", 
      user: updatedUser 
    });

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    
    // Handle Mongoose Duplicate Key Error explicitly just in case
    if (error.code === 11000) {
       return NextResponse.json({ error: "This email or phone is already taken." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
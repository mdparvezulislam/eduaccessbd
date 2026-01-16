import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs"; // 1. Import bcryptjs

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    // Validate
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user exists (Email OR Phone)
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // =========================================================
    // 🔒 SECURITY FIX: HASHING
    // =========================================================
    const salt = await bcryptjs.genSalt(10); // Generate salt
    const hashedPassword = await bcryptjs.hash(password, salt); // Hash the password

    // Save user with the HASHED password
    await User.create({
      name,
      email,
      phone,
      password: hashedPassword, // NEVER save 'password' directly
      role: "user",
    });

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
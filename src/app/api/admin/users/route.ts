import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Security Check: Only Admins can view all users
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    // 2. Fetch Users (Exclude password field)
    const users = await User.find({})
      .select("-password") // 🔒 Security: Never send passwords
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, users }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
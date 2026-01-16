import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Helper type for params
type Params = {
  params: Promise<{ id: string }>;
};

// ==========================================
// PUT: Edit User (e.g., Change Role, Ban)
// ==========================================
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    // Prevent Admin from banning themselves
    if (id === session.user.id && body.role && body.role !== "ADMIN") {
       return NextResponse.json({ error: "You cannot demote yourself!" }, { status: 400 });
    }

    // Update User
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role // Admin can change roles (user <-> admin)
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ==========================================
// DELETE: Remove a User
// ==========================================
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    // Prevent Admin from deleting themselves
    if (id === session.user.id) {
       return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
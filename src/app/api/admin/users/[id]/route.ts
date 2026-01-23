import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ⚡ CONFIG: Phone numbers allowed to edit/delete users
const SUPER_ADMINS = ["01857887025", "01608257876"];

// Helper type for params
type Params = {
  params: Promise<{ id: string }>;
};

// ==========================================
// PUT: Edit User (Super Admin Only)
// ==========================================
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Basic Role Check
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    // 2. 🛡️ SUPER ADMIN CHECK
    // Fetch the current admin's details to verify their phone number securely
    const currentAdmin = await User.findById(session.user.id);
    
    if (!currentAdmin || !SUPER_ADMINS.includes(currentAdmin.phone)) {
      return NextResponse.json({ 
        error: "Restricted: Only specific Super Admins can edit user details." 
      }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Prevent Admin from banning/demoting themselves
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
        role: body.role 
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
// DELETE: Remove a User (Super Admin Only)
// ==========================================
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Basic Role Check
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    // 2. 🛡️ SUPER ADMIN CHECK
    // Fetch the current admin's details to verify their phone number securely
    const currentAdmin = await User.findById(session.user.id);

    if (!currentAdmin || !SUPER_ADMINS.includes(currentAdmin.phone)) {
      return NextResponse.json({ 
        error: "Restricted: Only specific Super Admins can delete users." 
      }, { status: 403 });
    }

    const { id } = await params;

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
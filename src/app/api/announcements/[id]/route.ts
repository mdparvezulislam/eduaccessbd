import { connectToDatabase } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

interface IdParams {
  params: Promise<{ id: string }>;
}

// ==================================================================
// PUT: Update Announcement (Admin Only)
// ==================================================================
export async function PUT(req: NextRequest, { params }: IdParams) {
  try {
    // 1. 🔒 Admin Check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Destructure allowed fields to prevent pollution
    const { 
      title, 
      description, 
      type, 
      isActive,
      link,        // ✅ New Popup Field
      imageUrl,    // ✅ New Popup Field
      buttonText   // ✅ New Popup Field
    } = body;

    await connectToDatabase();

    // 2. Update
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { 
        title,
        description,
        type,
        isActive,
        link,
        imageUrl,
        buttonText
      },
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Updated successfully", 
      data: updatedAnnouncement 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ==================================================================
// DELETE: Delete Announcement (Admin Only)
// ==================================================================
export async function DELETE(req: NextRequest, { params }: IdParams) {
  try {
    // 1. 🔒 Admin Check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    await connectToDatabase();

    // 2. Delete
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Deleted successfully" 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
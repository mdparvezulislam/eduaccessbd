import { connectToDatabase } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ==================================================================
// GET: Fetch All Active Announcements (Public)
// ==================================================================
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Fetch only active ones, sorted by newest first
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

// ==================================================================
// POST: Create New Announcement (Admin Only)
// ==================================================================
export async function POST(req: NextRequest) {
  try {
    // 1. 🔒 Admin Security Check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, type } = body;

    // 2. Validation
    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    await connectToDatabase();

    // 3. Create
    const newAnnouncement = await Announcement.create({
      title,
      description,
      type: type || "info",
      isActive: true,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Announcement created successfully", 
      data: newAnnouncement 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create" }, { status: 500 });
  }
}
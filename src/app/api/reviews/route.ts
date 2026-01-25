import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/Review";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: Fetch Reviews (Public = Active Only, Admin = All)
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    let query: any = { isActive: true };
    if (session?.user?.role === "ADMIN") query = {}; // Admin sees hidden ones too

    const reviews = await Review.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    return NextResponse.json({ success: false, reviews: [] });
  }
}

// POST: Add Review (Admin Only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    await connectToDatabase();
    const newReview = await Review.create(body);

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
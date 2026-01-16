import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ==========================
// GET → Fetch All Categories
// ==========================
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Fetch all categories sorted by newest first
    const categories = await Category.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// ==========================
// POST → Create New Category (Admin Only)
// ==========================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Security Check
    // if (!session || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Admins only" }, { status: 403 });
    // }

    const body = await req.json();

    // 2. Validation
    if (!body.name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    await connectToDatabase();

    // 3. Auto-Generate Slug if missing
    const slug = body.slug 
      ? body.slug.toLowerCase().replace(/\s+/g, "-") 
      : body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

    // 4. Check for duplicates
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json({ error: "Category with this slug already exists" }, { status: 400 });
    }

    // 5. Create
    const newCategory = await Category.create({
      name: body.name,
      slug: slug,
      image: body.image || "",
      description: body.description || ""
    });

    return NextResponse.json(
      { success: true, message: "Category created", category: newCategory },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
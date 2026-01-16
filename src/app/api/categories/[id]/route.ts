import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { IdParams } from "@/types/index";
import { NextRequest, NextResponse } from "next/server";

// ==========================
// GET → Fetch Single Category
// ==========================
export async function GET(req: NextRequest, { params }: IdParams) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

// ==========================
// PUT → Update Category (Admin Only)
// ==========================
export async function PUT(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    // If updating slug, check uniqueness
    if (body.slug) {
       body.slug = body.slug.toLowerCase().replace(/\s+/g, "-");
       const existing = await Category.findOne({ slug: body.slug, _id: { $ne: id } });
       if (existing) {
         return NextResponse.json({ error: "Slug already in use" }, { status: 400 });
       }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    revalidatePath("/admin/categories");
    
    return NextResponse.json(
      { success: true, message: "Category updated", category: updatedCategory },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ==========================
// DELETE → Delete Category (Admin Only)
// ==========================
export async function DELETE(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    // Optional: Check if products exist in this category before deleting
    // const productsInCat = await Product.countDocuments({ category: id });
    // if (productsInCat > 0) return NextResponse.json({ error: "Category is not empty" }, { status: 400 });

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    revalidatePath("/admin/categories");

    return NextResponse.json(
      { success: true, message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
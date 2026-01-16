
//  product by category slug

import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category"; 
import { NextRequest, NextResponse } from "next/server";

// ==================================================================
// GET → Fetch Products by Category Slug
// ==================================================================
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    
    if (!categorySlug) {
      return NextResponse.json({ error: "Category slug is required" }, { status: 400 });
    }

    // Ensure Category model is loaded
    await Category.find();
    
    // Find the category by slug
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Fetch products in the specified category
    const products = await Product.find({ category: category._id, isAvailable: true })
      .populate("category", "name slug") 
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
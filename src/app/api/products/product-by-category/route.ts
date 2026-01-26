import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const excludeId = searchParams.get("excludeId");
    
    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // ✅ DB Optimization: Filter by Category AND Exclude current product immediately
    // Limit to 4 items for better performance
    const products = await Product.find({ 
      category: categoryId, 
     
      _id: { $ne: excludeId } // Exclude current product
    })
    .select("title slug thumbnail salePrice defaultPrice regularPrice") // Select only needed fields
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
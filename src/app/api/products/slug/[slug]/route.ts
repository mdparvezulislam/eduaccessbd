import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category"; // Needed for population
import { NextRequest, NextResponse } from "next/server";

type SlugParams = {
  params: Promise<{ slug: string }>;
};

// ==========================
// GET → Fetch Public Product by Slug + Related Products
// ==========================
export async function GET(req: NextRequest, { params }: SlugParams) {
  try {
    const { slug } = await params; // Next.js 16: params is a Promise
    await connectToDatabase();

    // 1. Fetch the Main Product
    // We filter by 'isAvailable: true' because hidden products shouldn't be public
    const product = await Product.findOne({ slug, isAvailable: true })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. Bonus: Fetch Related Products (Same Category)
    // Find 4 products with same category, excluding the current one
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id }, // Exclude current product
      isAvailable: true,
    })
      .select("title slug thumbnail price salePrice regularPrice") // Select minimal fields
      .limit(4)
      .lean();

    // 3. Increment View Count (Optional - Good for 'Popularity' logic later)
    // We don't await this because we don't want to slow down the response
    Product.updateOne({ _id: product._id }, { $inc: { popularityScore: 1 } }).exec();

    return NextResponse.json(
      { success: true, product, relatedProducts },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
}
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ==================================================================
// GET → Fetch All Products (Public Store)
// ==================================================================
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const isFeatured = searchParams.get("featured");
    const searchQuery = searchParams.get("search"); 
    
    let query: any = { isAvailable: true };

    // 1. Filter by Category
    if (categorySlug && categorySlug !== "all") {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      } else {
        return NextResponse.json({ success: true, products: [] }, { status: 200 });
      }
    }

    // 2. Filter by Featured
    if (isFeatured === "true") {
      query.isFeatured = true;
    }

    // 3. Search
    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }

    // 4. Fetch Data
    // (Mongoose automatically hides 'select: false' fields like accessLink)
    const products = await Product.find(query)
      .populate("category", "name slug") 
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, products }, { status: 200 });

  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// ==================================================================
// POST → Create New Product (Admin Only)
// ==================================================================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // ✅ Security Check
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    await connectToDatabase();

    // 1. Validation
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // 2. Slug Generation
    let slug = body.slug;
    if (!slug) {
      slug = body.title.toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    // 3. Check Duplicate
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    // 4. ⚡ Helper to Clean Plan Data
    // Ensures numbers are numbers and strings are strings
    const parsePlan = (plan: any) => ({
      isEnabled: Boolean(plan?.isEnabled),
      price: Number(plan?.price) || 0,
      regularPrice: Number(plan?.regularPrice) || 0,
      validityLabel: plan?.validityLabel || "",
      description: plan?.description || "", // ✅ New Description Field
      accessLink: plan?.accessLink || "",
      accessNote: plan?.accessNote || ""
    });

    // 5. Create Product
    const newProduct = await Product.create({
      title: body.title,
      slug: slug,
      
      description: body.description,
      shortDescription: body.shortDescription || "",
      
      // Standard / Fallback Pricing
      defaultPrice: Number(body.defaultPrice) || 0,
      videoUrl: body.videoUrl || "",
      salePrice: Number(body.salePrice) || 0,
      regularPrice: Number(body.regularPrice) || 0,
      
      thumbnail: body.thumbnail,
      gallery: body.gallery || [],
      
      category: body.category,
      tags: body.tags || [],
      features: body.features || [],
      
      isAvailable: body.isAvailable ?? true,
      isFeatured: body.isFeatured ?? false,
      fileType: body.fileType || "Subscription",
      
      salesCount: 0,

      // ⚡ VIP Pricing Structure (Parsed)
      pricing: {
        monthly: parsePlan(body.pricing?.monthly),
        yearly: parsePlan(body.pricing?.yearly),
        lifetime: parsePlan(body.pricing?.lifetime),
      },

      // ✅ Standard Product Delivery (Root Level)
      accessLink: body.accessLink || "", 
      accessNote: body.accessNote || ""
    });

    return NextResponse.json(
      { success: true, message: "Product created successfully", product: newProduct }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
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
    const searchQuery = searchParams.get("search"); // Optional search
    
    let query: any = { isAvailable: true };

    // 1. Filter by Category Slug
    if (categorySlug && categorySlug !== "all") {
      // Find category ID first because Product stores ObjectId
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      } else {
        // If category doesn't exist, return empty
        return NextResponse.json({ success: true, products: [] }, { status: 200 });
      }
    }

    // 2. Filter by Featured
    if (isFeatured === "true") {
      query.isFeatured = true;
    }

    // 3. Optional: Search by Title
    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }

    // 4. Fetch Data
    // Note: Mongoose automatically hides fields marked { select: false } in Schema
    // like 'accessLink' inside the pricing objects.
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
    
    // ✅ Security: Admin Only
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    await connectToDatabase();

    // 1. Basic Validation
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // 2. Auto-Generate Slug if missing
    let slug = body.slug;
    if (!slug) {
      slug = body.title.toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    // 3. Duplicate Slug Check
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json({ error: "Slug already exists. Please modify it." }, { status: 400 });
    }

    // 4. Create Product with VIP Pricing Structure
    const newProduct = await Product.create({
      title: body.title,
      slug: slug,
      
      description: body.description,
      shortDescription: body.shortDescription || "",
      
      // ✅ Fallback / Legacy Pricing
      defaultPrice: Number(body.defaultPrice) || 0,
      salePrice: Number(body.salePrice) || 0,
      regularPrice: Number(body.regularPrice) || 0,
      
      thumbnail: body.thumbnail,
      gallery: body.gallery || [],
      
      category: body.category, // Assumes ID is sent
      tags: body.tags || [],
      features: body.features || [],
      
      isAvailable: body.isAvailable ?? true,
      isFeatured: body.isFeatured ?? false,
      fileType: body.fileType || "Subscription",
      
      salesCount: 0,

      // ⚡ NEW: VIP Pricing Structure
      // The secure fields inside 'pricing' (accessLink) are 
      // automatically handled by Mongoose (saved but hidden on GET)
      pricing: body.pricing || {
        monthly: { isEnabled: false },
        yearly: { isEnabled: false },
        lifetime: { isEnabled: false }
      },

      // Legacy Secure Fields (Optional Backup)
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
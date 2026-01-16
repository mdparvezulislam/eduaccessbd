import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { IdParams } from "@/types/index"; 
import { NextRequest, NextResponse } from "next/server";

// ==================================================================
// GET → Fetch Single Product
// ⚡ SMART SECURITY: Reveal ALL secure fields (Root & VIP) if Admin
// ==================================================================
export async function GET(req: NextRequest, { params }: IdParams) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    let query: any = Product.findById(id).populate("category");

    // 🔓 If Admin: Unlock the secure fields for editing
    if (isAdmin) {
      // 1. Reveal Root Secure Fields (Legacy)
      query = query.select("+accessLink +accessNote");
      
      // 2. Reveal VIP Plan Secure Fields (Monthly/Yearly/Lifetime)
      query = query.select(
        "+pricing.monthly.accessLink +pricing.monthly.accessNote " +
        "+pricing.yearly.accessLink +pricing.yearly.accessNote " +
        "+pricing.lifetime.accessLink +pricing.lifetime.accessNote"
      );
    }

    const product = await query.lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("Fetch Product Error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// ==================================================================
// PUT → Update Product (Admin Only)
// ==================================================================
export async function PUT(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    // ⚡ Prep Payload: Ensure numbers are actually numbers
    // This prevents string "500" from causing issues in math operations later
    const updateData = {
      ...body,
      defaultPrice: Number(body.defaultPrice) || 0,
      salePrice: Number(body.salePrice) || 0,
      regularPrice: Number(body.regularPrice) || 0,
      // The 'pricing' object is nested, so we pass it as-is. 
      // Mongoose handles the sub-document updates automatically via $set.
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Product updated successfully", product: updatedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ==================================================================
// DELETE → Delete Product (Admin Only)
// ==================================================================
export async function DELETE(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
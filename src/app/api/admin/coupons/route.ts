import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ==============================================================================
// GET: Fetch All Coupons
// ==============================================================================
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ==============================================================================
// POST: Create Coupon (Fixed Type Error)
// ==============================================================================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, discountType, discountAmount, expirationDate, usageLimit } = body;

    if (!code || !discountType || !discountAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    // Check Duplicate
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    // ⚡ FIX: Use 'new Coupon' + 'save()' instead of 'Coupon.create'
    // This resolves the TypeScript overload error.
    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountAmount: Number(discountAmount),
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: true
    });

    await newCoupon.save();

    return NextResponse.json({ success: true, coupon: newCoupon }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
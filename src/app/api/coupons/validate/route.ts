import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    
    if (!code) {
      return NextResponse.json({ valid: false, message: "Code required" }, { status: 400 });
    }

    await connectToDatabase();

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Invalid coupon code" }, { status: 404 });
    }

    // Check Expiration
    if (coupon.expirationDate && new Date() > new Date(coupon.expirationDate)) {
      return NextResponse.json({ valid: false, message: "Coupon expired" }, { status: 400 });
    }

    // Check Usage Limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, message: "Coupon usage limit reached" }, { status: 400 });
    }

    return NextResponse.json({ 
      valid: true, 
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount
      } 
    });

  } catch (error) {
    return NextResponse.json({ valid: false, message: "Server error" }, { status: 500 });
  }
}
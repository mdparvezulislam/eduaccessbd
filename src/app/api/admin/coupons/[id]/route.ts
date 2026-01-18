import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// PUT: Update Coupon
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      {
        ...body,
        code: body.code.toUpperCase(), // Ensure uppercase
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
      },
      { new: true }
    );

    if (!updatedCoupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    return NextResponse.json({ success: true, coupon: updatedCoupon });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove Coupon
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Coupon deleted" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
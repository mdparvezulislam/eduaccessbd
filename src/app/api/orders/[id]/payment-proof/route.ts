import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

interface IdParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { paymentProof } = body;

    if (!paymentProof || !paymentProof.url || typeof paymentProof.url !== "string") {
      return NextResponse.json({ error: "Invalid payment proof screenshot data" }, { status: 400 });
    }

    // Validate size & MIME type
    if (paymentProof.fileSize && paymentProof.fileSize > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (paymentProof.mimeType && !allowedMimes.includes(paymentProof.mimeType.toLowerCase())) {
      return NextResponse.json({ error: "Invalid file format. Only PNG, JPG, JPEG, and WEBP allowed." }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Permission check: Owner or Admin
    const isOwner = order.user.toString() === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You do not own this order" }, { status: 403 });
    }

    // If already verified, prevent customer re-upload
    if (order.paymentProof?.verificationStatus === "verified" && !isAdmin) {
      return NextResponse.json({ error: "Payment proof has already been verified and locked." }, { status: 400 });
    }

    // Move existing paymentProof to history if present
    const updatedHistory = order.paymentProofHistory ? [...order.paymentProofHistory] : [];
    if (order.paymentProof && order.paymentProof.url) {
      updatedHistory.push({
        url: order.paymentProof.url,
        thumbnailUrl: order.paymentProof.thumbnailUrl,
        imageKitFileId: order.paymentProof.imageKitFileId,
        originalName: order.paymentProof.originalName,
        fileSize: order.paymentProof.fileSize,
        mimeType: order.paymentProof.mimeType,
        uploadedAt: order.paymentProof.uploadedAt || new Date(),
        uploadedBy: (order.paymentProof.uploadedBy as any) || "customer",
        verificationStatus: (order.paymentProof.verificationStatus as any) === "none" ? "pending" : (order.paymentProof.verificationStatus as any) || "pending",
        verifiedAt: order.paymentProof.verifiedAt,
        verifiedBy: order.paymentProof.verifiedBy,
        rejectionReason: order.paymentProof.rejectionReason,
        adminNotes: order.paymentProof.adminNotes,
      });
    }

    const newProof = {
      url: paymentProof.url,
      thumbnailUrl: paymentProof.thumbnailUrl || paymentProof.url,
      imageKitFileId: paymentProof.imageKitFileId || "",
      originalName: paymentProof.originalName || "payment-proof.png",
      fileSize: paymentProof.fileSize || 0,
      mimeType: paymentProof.mimeType || "image/png",
      uploadedAt: new Date(),
      uploadedBy: isAdmin ? "admin" : "customer",
      verificationStatus: "pending",
    };

    order.paymentProof = newProof as any;
    order.paymentProofHistory = updatedHistory as any;
    
    // Reset order status to pending if it was declined/cancelled
    if (order.status === "declined" || order.status === "cancelled") {
      order.status = "pending";
    }

    await order.save();

    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/orders");

    return NextResponse.json({
      success: true,
      message: "Payment proof uploaded successfully",
      order,
    });
  } catch (error: any) {
    console.error("❌ Error uploading payment proof:", error);
    return NextResponse.json({ error: error.message || "Failed to save payment proof" }, { status: 500 });
  }
}

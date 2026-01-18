import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ==============================================================================
// 1. TYPE DEFINITIONS & HELPERS
// ==============================================================================

type PlanType = "monthly" | "yearly" | "lifetime";

interface IVipPlan {
  isEnabled: boolean;
  price: number;
  accessLink?: string;
  accessNote?: string;
}

interface IProductDocument {
  _id: string;
  title: string;
  defaultPrice: number;
  salePrice: number;
  accessLink?: string;
  accessNote?: string;
  pricing?: {
    monthly: IVipPlan;
    yearly: IVipPlan;
    lifetime: IVipPlan;
  };
}

interface ICartItem {
  productId: string;
  quantity: number;
  validity?: string;
}

// Type Guard Helper to ensure validity is a known plan type
function isPlanType(key: string | undefined): key is PlanType {
  return ["monthly", "yearly", "lifetime"].includes(key as string);
}

// ==============================================================================
// POST: Create New Order
// ==============================================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contact, payment, items, couponCode } = body;

    // 1. Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    await connectToDatabase();

    // ---------------------------------------------------------
    // 2. SERVER-SIDE PRICE CALCULATION
    // ---------------------------------------------------------
    let subTotal = 0;
    const orderProducts = [];
    
    let combinedDownloadLinks = "";
    let combinedAccessNotes = "";

    for (const item of items as ICartItem[]) {
      
      // ⚡ CRITICAL FIX: Sanitize ID to prevent "Cast to ObjectId" errors
      // If frontend sends "696d...-monthly", we strip it to "696d..."
      const cleanId = String(item.productId).split("-")[0];

      const dbProduct = (await Product.findById(cleanId)
        .select("+accessLink +accessNote +pricing")
        .lean()) as unknown as IProductDocument | null;
      
      if (dbProduct) {
        let price = dbProduct.defaultPrice;
        let deliveryLink = "";
        let deliveryNote = "";
        let variantLabel = "Standard";

        // Determine Price & Content based on Plan
        if (isPlanType(item.validity) && dbProduct.pricing && dbProduct.pricing[item.validity]?.isEnabled) {
          const plan = dbProduct.pricing[item.validity];
          price = plan.price;
          deliveryLink = plan.accessLink || "";
          deliveryNote = plan.accessNote || "";
          variantLabel = item.validity;
        } else {
          // Standard Product Logic
          price = dbProduct.salePrice > 0 ? dbProduct.salePrice : dbProduct.defaultPrice;
          deliveryLink = dbProduct.accessLink || "";
          deliveryNote = dbProduct.accessNote || "";
        }
        
        subTotal += price * item.quantity;

        // Collect Delivery Info (Only used if Auto-Approved)
        if (deliveryLink) combinedDownloadLinks += `[${dbProduct.title} - ${variantLabel}]: ${deliveryLink}\n`;
        if (deliveryNote) combinedAccessNotes += `[${dbProduct.title} - ${variantLabel}]: ${deliveryNote}\n\n`;

        orderProducts.push({
          product: dbProduct._id,
          quantity: item.quantity,
          price: price, 
          title: dbProduct.title,
          variant: variantLabel
        });
      }
    }

    if (orderProducts.length === 0) {
      return NextResponse.json({ error: "Invalid products" }, { status: 400 });
    }

    // ---------------------------------------------------------
    // 3. COUPON SYSTEM
    // ---------------------------------------------------------
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      
      if (coupon) {
        const now = new Date();
        const isExpired = coupon.expirationDate && now > new Date(coupon.expirationDate);
        const isLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

        if (!isExpired && !isLimitReached) {
           if (coupon.discountType === "percentage") {
             discount = Math.round((subTotal * coupon.discountAmount) / 100);
           } else {
             discount = coupon.discountAmount;
           }
           await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
        }
      }
    }

    const finalAmount = Math.max(0, subTotal - discount);

    // ---------------------------------------------------------
    // 4. PAYMENT VALIDATION (If Not Free)
    // ---------------------------------------------------------
    if (finalAmount > 0) {
      if (!payment?.transactionId || !payment?.senderNumber) {
        return NextResponse.json({ error: "Payment details missing" }, { status: 400 });
      }
    }

    // ---------------------------------------------------------
    // 5. USER HANDLING
    // ---------------------------------------------------------
    let userId;
    let isNewUser = false;

    const existingUser = await User.findOne({
      $or: [
        { email: contact.email }, 
        { phone: contact.phone }
      ]
    });

    if (existingUser) {
      userId = existingUser._id;
      if (!existingUser.phone && contact.phone) {
        await User.findByIdAndUpdate(userId, { phone: contact.phone });
      }
    } else {
      const hashedPassword = await bcrypt.hash(contact.email, 10); 
      const newUser = await User.create({
        name: contact.name,
        email: contact.email,
        phone: contact.phone, 
        password: hashedPassword, 
        role: "user"
      });
      userId = newUser._id;
      isNewUser = true;
    }

    // ---------------------------------------------------------
    // 6. FINALIZE STATUS (Auto-Approve Logic)
    // ---------------------------------------------------------
    let orderStatus = "pending";
    let paymentStatus = "unpaid";
    let deliveredContent = undefined;

    if (finalAmount === 0) {
      orderStatus = "completed";
      paymentStatus = "paid";
      deliveredContent = {
        accountEmail: contact.email,
        accountPassword: "See Access Notes",
        downloadLink: combinedDownloadLinks.trim(),
        accessNotes: combinedAccessNotes.trim() || "Free Access Granted."
      };
    }

    // ---------------------------------------------------------
    // 7. SAVE ORDER
    // ---------------------------------------------------------
    const newOrder = new Order({
      user: userId,
      products: orderProducts,
      
      paymentMethod: finalAmount === 0 ? "Free / Coupon" : payment.method,
      transactionId: finalAmount === 0 ? `FREE-${Date.now()}` : payment.transactionId,
      senderNumber: finalAmount === 0 ? "" : payment.senderNumber,
      
      amount: finalAmount,
      discountAmount: discount,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      
      status: orderStatus, 
      paymentStatus: paymentStatus,
      deliveredContent: deliveredContent
    });

    await newOrder.save();

    return NextResponse.json({ 
      success: true, 
      orderId: newOrder._id, 
      isNewUser: isNewUser,
      isAutoApproved: finalAmount === 0
    });

  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ error: error.message || "Order creation failed" }, { status: 500 });
  }
}

// ==============================================================================
// GET: Fetch Orders (Secure & Role-Based)
// ==============================================================================
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
       
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let query: any = {};
    if (session.user.role !== "ADMIN") {
      query = { user: session.user.id };
    }

    const orders = await Order.find(query)
      .populate({ path: "user", select: "name email phone", model: User })
      .populate({ path: "products.product", select: "title thumbnail slug pricing videoUrl", model: Product })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error: any) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
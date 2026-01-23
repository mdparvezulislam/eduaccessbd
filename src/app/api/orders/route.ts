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

// ✅ NEW: Account Access Interface
interface IAccountAccess {
  isEnabled: boolean;
  price: number;
  accountEmail?: string;
  accountPassword?: string;
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
  // ✅ Added Account Access Field
  accountAccess?: IAccountAccess;
}

interface ICartItem {
  productId: string;
  quantity: number;
  // This field comes from frontend as 'variant' or 'validity'
  variant?: string; 
  validity?: string;
}

// Type Guard Helper to ensure validity is a known VIP plan type
function isVipPlan(key: string | undefined): key is PlanType {
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
    
    // For auto-delivery if free
    let combinedDownloadLinks = "";
    let combinedAccessNotes = "";

    for (const item of items as ICartItem[]) {
      
      // ⚡ CRITICAL FIX: Sanitize ID to prevent "Cast to ObjectId" errors
      // If frontend sends "696d...-monthly", we strip it to "696d..."
      const cleanId = String(item.productId).split("-")[0];

      // Fetch Product (including hidden accountAccess price/enabled status)
      const dbProduct = (await Product.findById(cleanId)
        .select("+accessLink +accessNote +pricing +accountAccess")
        .lean()) as unknown as IProductDocument | null;
      
      if (dbProduct) {
        let price = dbProduct.defaultPrice;
        let variantLabel = "Standard";
        
        // Use 'variant' from payload (which maps to validity/plan label)
        // Normalize checking by lowercasing
        const requestedVariant = (item.variant || item.validity || "Standard").trim(); 
        const variantKey = requestedVariant.toLowerCase();

        // 🟢 LOGIC 1: Account Access
        if (variantKey.includes("account") && dbProduct.accountAccess?.isEnabled) {
           price = dbProduct.accountAccess.price;
           variantLabel = "Account Access";
           // Note: Credentials are usually NOT delivered in the response or auto-note here for security,
           // unless it's a 0 cost item. We handle delivery in the PUT route or below for free items.
        }
        // 🟢 LOGIC 2: VIP Plans (Monthly/Yearly/Lifetime)
        else if (isVipPlan(variantKey) && dbProduct.pricing && dbProduct.pricing[variantKey as PlanType]?.isEnabled) {
          const plan = dbProduct.pricing[variantKey as PlanType];
          price = plan.price;
          variantLabel = requestedVariant; // Keep original casing (e.g. "Monthly")
          
          if (plan.accessLink) combinedDownloadLinks += `[${dbProduct.title}]: ${plan.accessLink}\n`;
          if (plan.accessNote) combinedAccessNotes += `[${dbProduct.title}]: ${plan.accessNote}\n`;
        } 
        // 🟢 LOGIC 3: Standard Product
        else {
          price = dbProduct.salePrice > 0 ? dbProduct.salePrice : dbProduct.defaultPrice;
          
          if (dbProduct.accessLink) combinedDownloadLinks += `[${dbProduct.title}]: ${dbProduct.accessLink}\n`;
          if (dbProduct.accessNote) combinedAccessNotes += `[${dbProduct.title}]: ${dbProduct.accessNote}\n`;
        }
        
        // Calculate Line Total
        subTotal += price * item.quantity;

        orderProducts.push({
          product: dbProduct._id,
          quantity: item.quantity,
          price: price, // Server-verified price
          title: dbProduct.title,
          variant: variantLabel // ✅ Saved to DB so Admin knows what to deliver
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
      if (!payment?.transactionId) {
        return NextResponse.json({ error: "Transaction ID missing" }, { status: 400 });
      }
      // Note: We relaxed senderNumber check as it might be N/A or optional in new flow
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
    // 6. FINALIZE STATUS (Auto-Approve Logic for Free Orders)
    // ---------------------------------------------------------
    let orderStatus = "pending";
    let paymentStatus = "unpaid";
    let deliveredContent = undefined;

    if (finalAmount === 0) {
      orderStatus = "completed";
      paymentStatus = "paid";
      deliveredContent = {
        accountEmail: contact.email, // Or specific account info if logic permits
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
      senderNumber: finalAmount === 0 ? "" : (payment.senderNumber || "N/A"),
      
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
// GET: Fetch Orders (Secure, Role-Based & Paginated)
// ==============================================================================
export async function GET(req: NextRequest) {
  try {
    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 2. Parse Pagination Params
    // Default to Page 1, 10 items per page if not specified
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10"))); // Max limit 50 for safety
    const skip = (page - 1) * limit;

    // 3. Search Query (Optional: Filter by transaction ID if passed)
    const search = searchParams.get("search") || "";

    // 4. Build Database Query
    let query: any = {};

    // Role Security: Admins see all, Users see their own
    if (session.user.role !== "ADMIN") {
      query.user = session.user.id;
    }

    // Add Search Logic (If search term exists)
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { "deliveredContent.accountEmail": { $regex: search, $options: "i" } } // Search by delivered email too
      ];
    }

    // 5. Execute Queries in Parallel (Faster)
    // We need 'total' for the UI pagination numbers, and 'orders' for the table
    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .populate({ path: "user", select: "name email phone", model: User })
        .populate({ path: "products.product", select: "title thumbnail slug pricing", model: Product })
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)              // Skip previous pages
        .limit(limit)            // Fetch only this page size
        .lean(),                 // Convert to plain JS object (Performance)
      
      Order.countDocuments(query) // Get total count for pagination math
    ]);

    // 6. Calculate Metadata
    const totalPages = Math.ceil(totalOrders / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({ 
      success: true, 
      orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage,
        hasPrevPage
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
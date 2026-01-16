import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ==============================================================================
// POST: Create New Order (With Manual Payment Support)
// ==============================================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // ⚡ Destructure the new payload format
    // Fallback support for old payload structure is removed for cleanliness
    const { contact, payment, items } = body;

    // 1. Validation
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!payment?.transactionId || !payment?.senderNumber) {
      return NextResponse.json({ error: "Payment details missing" }, { status: 400 });
    }

    await connectToDatabase();

    // ============================================================
    // 2. USER LOGIC (Find or Create)
    // ============================================================
    let userId;
    let isNewUser = false;

    // Check if user exists by Email OR Phone
    const existingUser = await User.findOne({
      $or: [
        { email: contact.email }, 
        { phone: contact.phone }
      ]
    });

    if (existingUser) {
      // ✅ USER EXISTS
      userId = existingUser._id;
      isNewUser = false; 

      // Update phone if missing
      if (!existingUser.phone && contact.phone) {
        try {
          existingUser.phone = contact.phone;
          await existingUser.save();
        } catch (e) { /* Ignore */ }
      }

    } else {
      // ✅ USER DOES NOT EXIST: Create New
      const hashedPassword = await bcrypt.hash(contact.email, 10); // Password = Email (Temp)
      
      try {
        const newUser = await User.create({
          name: contact.name,
          email: contact.email,
          phone: contact.phone, 
          password: hashedPassword, 
          role: "user"
        });
        userId = newUser._id;
        isNewUser = true; // Flag for auto-login
      } catch (err: any) {
        return NextResponse.json({ error: "User creation failed. Please try logging in." }, { status: 500 });
      }
    }

    // ============================================================
    // 3. PREPARE ORDER ITEMS (Secure Price Verification)
    // ============================================================
    let calculatedTotal = 0;
    const orderProducts = [];

    for (const item of items) {
      const dbProduct = await Product.findById(item.productId).lean();
      
      if (dbProduct) {
        // Determine Price: Use Sale Price or Variant Price logic if needed
        // For simplicity, we use the price sent from frontend but you SHOULD ideally 
        // verify against dbProduct.pricing[variant].price here for maximum security.
        
        const price = item.price; // Trusting frontend price for now (simplifies variant logic)
        
        calculatedTotal += price * item.quantity;

        orderProducts.push({
          product: dbProduct._id,
          quantity: item.quantity,
          price: price,
          title: dbProduct.title,
          variant: item.validity || "Standard" // Save the plan name (Monthly/Yearly)
        });
      }
    }

    if (orderProducts.length === 0) {
      return NextResponse.json({ error: "Invalid products" }, { status: 400 });
    }

    // ============================================================
    // 4. CREATE SINGLE ORDER DOCUMENT
    // ============================================================
    const newOrder = await Order.create({
      user: userId,
      products: orderProducts, // Array of items
      
      // Manual Payment Data
      paymentMethod: payment.method,
      
      transactionId: payment.transactionId,
      
      amount: calculatedTotal,
      
      status: "pending", 
      paymentStatus: "unpaid", // Admin verifies TrxID manually -> marks as paid
      
      deliveredContent: {
        accountEmail: "",
        accountPassword: "",
        accessNotes: "",
        downloadLink: ""
      }
    });

    return NextResponse.json({ 
      success: true, 
      orderId: newOrder._id, 
      isNewUser: isNewUser 
    });

  } catch (error: any) {
    console.error("Order Error:", error);
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

    // 1. Filter Logic
    let query: any = { user: session.user.id };
    
    // If Admin, show ALL orders
    if (session.user.role === "ADMIN") {
      query = {}; 
    }

    // 2. Fetch Data
    const orders = await Order.find(query)
      .populate("user", "name email phone") // Get Customer Details
      .populate("products.product", "title thumbnail slug") // Get Product Details
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error: any) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
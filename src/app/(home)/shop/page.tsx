import ShopClient from "@/components/home/ShopClient";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export default async function ProductsPage() {
  let products = [];
  let categories = [];

  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const [rawProducts, rawCategories] = await Promise.all([
        Product.find({ isAvailable: true })
          .populate("category", "name slug")
          .sort({ createdAt: -1 })
          .lean(),
        Category.find({}).sort({ name: 1 }).lean(),
      ]);

      products = JSON.parse(JSON.stringify(rawProducts || []));
      categories = JSON.parse(JSON.stringify(rawCategories || []));
    }
  } catch (error) {
    console.error("Error fetching shop data from database:", error);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ShopClient products={products} categories={categories} />
    </div>
  );
}
import ProductListClient from "@/components/admin/products/ProductListClient";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";

export default async function ProductListPage() {
  let products = [];

  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const rawProducts = await Product.find({})
        .populate("category", "name slug")
        .sort({ title: 1 })
        .lean();
      products = JSON.parse(JSON.stringify(rawProducts || []));
    }
  } catch (error) {
    console.error("Failed to fetch products for admin list from database:", error);
  }

  return (
    <div className="flex flex-col flex-1 w-full max-w-full gap-4 p-4 md:p-6 bg-black text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-gray-400">Manage your course catalog (A-Z Sorted)</p>
        </div>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <ProductListClient initialData={products} />
      </div>
    </div>
  );
}
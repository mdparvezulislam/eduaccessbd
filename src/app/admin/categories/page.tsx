import CategoryListClient from "@/components/admin/categories/CategoryListClient";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";

export default async function CategoryListPage() {
  let categories = [];

  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const rawCategories = await Category.find({}).sort({ name: 1 }).lean();
      categories = JSON.parse(JSON.stringify(rawCategories || []));
    }
  } catch (error) {
    console.error("Error fetching categories data from database:", error);
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
      </div>
      <CategoryListClient initialData={categories} />
    </div>
  );
}
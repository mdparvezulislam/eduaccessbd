import CategoryListClient from "@/components/admin/categories/CategoryListClient";
import { SITE_URL } from "@/types";

export default async function CategoryListPage() {
  // 1. Initialize default empty state to prevent undefined errors
  let categories = [];

  try {
    // 2. Fetch data safely
    const res = await fetch(`${SITE_URL}/api/categories`, {
      // Using next: { revalidate } automatically enables caching (ISR)
      next: { revalidate: 60 },
    });

    // 3. Check if response is OK before parsing JSON
    if (res.ok) {
      const data = await res.json();
      categories = data?.categories || [];
    } else {
      console.error("Failed to fetch categories. Status:", res.status);
    }
  } catch (error) {
    // 4. Catch network errors to prevent build crashes
    console.error("Error fetching categories data:", error);
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
      </div>
      
      {/* Pass data directly to the Client Component. 
        If the API fails, it safely passes an empty array [], 
        allowing CategoryListClient to show an "Empty State" or data table correctly. 
      */}
      <CategoryListClient initialData={categories} />
    </div>
  );
}
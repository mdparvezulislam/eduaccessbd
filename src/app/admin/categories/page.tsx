
import CategoryListClient from "@/components/admin/categories/CategoryListClient";
import { SITE_URL } from "@/types";


export default async function CategoryListPage() {

const res = await fetch(`${SITE_URL}/api/categories`, {
    cache: "force-cache",next:{
      revalidate: 60
    }
  });
  const categories = await res.json();



  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
      </div>
      <CategoryListClient initialData={categories?.categories} />
    </div>
  );
}
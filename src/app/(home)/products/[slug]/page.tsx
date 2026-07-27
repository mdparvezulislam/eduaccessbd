import { notFound } from "next/navigation";
import ProductList from "@/components/home/ProductList";
import CategorySection from "@/components/CategorySLider";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://eduaccessbd.store";

// Generate Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    if (!process.env.MONGODB_URI) return { title: "Products" };
    await connectToDatabase();
    const category: any = await Category.findOne({ slug }).lean();
    if (!category) {
      return {
        title: "Category Not Found",
        description: "The requested category does not exist.",
      };
    }

    const categoryName = category.name || "Products";

    return {
      title: `${categoryName} | Edu Access BD`,
      description: `Explore our collection of ${categoryName.toLowerCase()} at Edu Access BD.`,
      openGraph: {
        title: `${categoryName} | Edu Access BD`,
        description: `Explore our collection of ${categoryName.toLowerCase()} at Edu Access BD.`,
        url: `${SITE_URL}/products/${slug}`,
        siteName: "Edu Access BD",
        images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
      },
    };
  } catch {
    return { title: "Products" };
  }
}

// 2. The Server Page Component
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let products: any[] = [];
  let categories: any[] = [];

  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const category: any = await Category.findOne({ slug }).lean();
      if (!category) {
        return notFound();
      }

      const [rawProducts, rawCategories] = await Promise.all([
        Product.find({ category: category._id, isAvailable: true })
          .populate("category", "name slug")
          .sort({ createdAt: -1 })
          .lean(),
        Category.find({}).sort({ name: 1 }).lean(),
      ]);

      products = JSON.parse(JSON.stringify(rawProducts || []));
      categories = JSON.parse(JSON.stringify(rawCategories || []));
    }
  } catch (error) {
    console.error("Error fetching category products:", error);
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <CategorySection categories={categories} />
      <ProductList products={products} />
    </div>
  );
}
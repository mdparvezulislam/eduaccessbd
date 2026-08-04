import CategorySection from "@/components/CategorySLider";
import HeroSection from "@/components/HeroSlider";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import ProductList from "@/components/home/ProductList";
import HowToBuySection from "@/components/HowToBuySection";
import ReviewSlider from "@/components/ReviewSlider";
import { IProduct } from "@/types";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  // Initialize default empty states to prevent undefined errors
  let products: IProduct[] = [];
  let categories: any[] = [];

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
    console.error("Error fetching homepage data from database:", error);
  }

  // Safely filter data
  const featuredProducts = products.filter(
    (product: IProduct) => product.isFeatured === true
  );

  const popularProducts = products.slice(32, 50); 

  return (
    <div>
      <HeroSection />
      
      {/* Only render categories if they exist */}
      {categories.length > 0 && <CategorySection categories={categories} />}

      {/* Featured Courses */}
      {featuredProducts.length > 0 && (
        <FeaturedCourses products={featuredProducts} />
      )}

      <HowToBuySection />

      {/* Popular Courses Header */}
      <div className="flex items-center justify-between mb-6 md:mb-10">
        <div className="flex sm:ml-28 ml-2 items-center gap-2">
          <div className="h-8 w-1 bg-green-500 rounded-full"></div>
          <h2 className="text-xl md:text-3xl font-bold tracking-wide text-white">
            Popular Courses
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:flex items-center text-sm font-medium text-gray-400 hover:text-green-400 transition-colors"
        >
          View All <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* Product Lists */}
      {products.length > 0 ? (
        <ProductList products={products} />
      ) : (
        <div className="text-center text-gray-400 py-10">
          No products found at the moment. Please check back later.
        </div>
      )}

      {popularProducts.length > 0 && (
        <FeaturedCourses products={popularProducts} />
      )}

      <ReviewSlider />
    </div>
  );
}
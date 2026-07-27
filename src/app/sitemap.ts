import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';

// ⚡ PRODUCTION URL (Update this!)
const BASE_URL = 'https://eduaccessbd.store'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: any[] = [];
  let categories: any[] = [];

  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      products = await Product.find({}).select('slug updatedAt').lean();
      categories = await Category.find({}).select('slug').lean();
    } catch (error) {
      console.warn("Sitemap: Skipped database routes generation during build (no active DB connection).");
    }
  }

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/shop',
    '/products',
    '/community',
    '/contact',
    '/auth/login',
    '/auth/register',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Product Routes
  const productRoutes = products.map((product: any) => ({
    url: `${BASE_URL}/product/${product.slug}`,
    lastModified: new Date(product.updatedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // 3. Dynamic Category Routes
  const categoryRoutes = categories.map((cat: any) => ({
    url: `${BASE_URL}/products/${cat.slug}`, // Maps to your filtered products page
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 4. Combine All
  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
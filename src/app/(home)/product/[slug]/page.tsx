import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://eduaccessbd.store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getProduct(slug: string) {
  try {
    if (!process.env.MONGODB_URI) return null;
    await connectToDatabase();
    const rawProduct = await Product.findOne({ slug, isAvailable: true })
      .populate("category", "name slug")
      .lean();
    return rawProduct ? JSON.parse(JSON.stringify(rawProduct)) : null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// 1. Dynamic SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.title} | ProAccess Shop`,
    description: product.shortDescription || (product.description ? product.description.substring(0, 160) : ""),
    openGraph: {
      images: [product.thumbnail],
      title: product.title,
      description: product.shortDescription || (product.description ? product.description.substring(0, 160) : ""),
      url: `${SITE_URL}/product/${slug}`,
      siteName: "Edu Access BD",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.shortDescription || (product.description ? product.description.substring(0, 160) : ""),
      images: [product.thumbnail],
    },
  };
}

// 2. The Server Page
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return notFound();
  }

  return <ProductDetailsClient product={product} />;
}
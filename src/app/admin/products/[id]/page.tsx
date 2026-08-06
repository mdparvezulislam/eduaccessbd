"use client";

import { use, useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import ProductForm, { ProductFormInitialData } from "@/components/admin/products/ProductForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<ProductFormInitialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (!res.ok || !data.product) {
          throw new Error(data.error || "Product not found");
        }

        setProduct(data.product);
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-xs font-mono text-gray-400">Loading Product Configuration...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4 p-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-base font-bold text-red-400">{error || "Product Not Found"}</p>
        <Button 
          variant="outline" 
          onClick={() => router.push("/admin/products")} 
          className="border-white/10 text-gray-300 hover:text-white"
        >
          Back to Products List
        </Button>
      </div>
    );
  }

  return <ProductForm initialData={product} isEditMode={true} />;
}
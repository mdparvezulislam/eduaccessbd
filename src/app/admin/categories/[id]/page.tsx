"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Layers, UploadCloud } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/Fileupload";

// Next.js 16 Params
export default function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/categories/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error("Category not found");
        
        const cat = data.category;
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || ""
        });
        setImage(cat.image || "");
      } catch (error) {
        toast.error("Failed to load category");
        router.push("/admin/categories");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) return toast.error("Category Name is required");

    setSaving(true);
    try {
      const payload = { ...formData, image };

      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success("Category Updated Successfully!");
      router.push("/admin/categories");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary"/></div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="w-full max-w-2xl mx-auto pb-20"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Category</h1>
            <p className="text-sm text-muted-foreground">Updating: {formData.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
           <Button onClick={handleSubmit} disabled={saving} className="min-w-[120px]">
             {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
             Update
           </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-muted-foreground"/> Category Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Name <span className="text-red-500">*</span></Label>
            <Input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
            />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input 
              name="slug" 
              value={formData.slug} 
              onChange={handleChange} 
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
            />
          </div>

          <div className="space-y-3 pt-2">
             <Label className="flex items-center gap-2"><UploadCloud className="w-4 h-4"/> Category Icon / Image</Label>
             <div className="p-1 border rounded-xl bg-muted/20">
                <FileUpload 
                  initialImages={image ? [image] : []}
                  onChange={(urls) => setImage(urls[0] || "")} 
                />
             </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
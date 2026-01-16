"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Save, LayoutGrid, Loader2, 
  X, Lock, Link as LinkIcon, 
  Crown, Calendar, Sparkles, Wand2,
  CheckCircle2, FileText, Tag, Image as ImageIcon,
  CreditCard, Package
} from "lucide-react";

// --- Components ---
import FileUpload from "@/components/Fileupload"; 
import RichTextEditor from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Interfaces ---
interface ICategory { _id: string; name: string; }

// ⚡ VIP Plan Structure
interface IPlanState {
  isEnabled: boolean;
  price: string | number;
  regularPrice: string | number;
  validityLabel: string;
  description: string;
  accessLink: string;
  accessNote: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  
  // Automation States
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true); 

  // Form Fields
  const [thumbnail, setThumbnail] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([""]); 
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // ⚡ VIP PRICING STATE
  const [pricing, setPricing] = useState<{
    monthly: IPlanState;
    yearly: IPlanState;
    lifetime: IPlanState;
  }>({
    monthly: { isEnabled: false, price: "", regularPrice: "", validityLabel: "1 Month", description: "", accessLink: "", accessNote: "" },
    yearly: { isEnabled: false, price: "", regularPrice: "", validityLabel: "1 Year", description: "", accessLink: "", accessNote: "" },
    lifetime: { isEnabled: false, price: "", regularPrice: "", validityLabel: "Lifetime", description: "", accessLink: "", accessNote: "" },
  });

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    categoryId: "",
    fileType: "Subscription",
    isAvailable: true,
    isFeatured: false,
    defaultPrice: "",      
    salePrice: "",        
    regularPrice: "",
    // ✅ Standard Delivery
    accessLink: "",
    accessNote: ""
  });

  // --- Fetch Data ---
  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Fetch Categories
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        setCategories(catData.categories || []);

        // 2. Fetch Product
        const prodRes = await fetch(`/api/products/${id}`);
        const prodJson = await prodRes.json();
        
        if (!prodRes.ok || !prodJson.product) throw new Error("Product not found");

        const p = prodJson.product;

        // 3. Map Basic Data
        setFormData({
            title: p.title || "",
            slug: p.slug || "",
            shortDescription: p.shortDescription || "",
            description: p.description || "",
            categoryId: (p.category && typeof p.category === 'object') ? p.category._id : (p.category || ""),
            fileType: p.fileType || "Subscription",
            isAvailable: p.isAvailable ?? true,
            isFeatured: p.isFeatured ?? false,
            defaultPrice: String(p.defaultPrice || 0),
            salePrice: String(p.salePrice || 0),
            regularPrice: String(p.regularPrice || 0),
            // Map Standard Delivery (if available from API)
            accessLink: p.accessLink || "",
            accessNote: p.accessNote || ""
        });

        // 4. Map Complex Fields
        setThumbnail(p.thumbnail || "");
        setGallery(p.gallery || []);
        setFeatures(p.features && p.features.length > 0 ? p.features : [""]);
        setTags(p.tags || []);

        // ⚡ 5. Map VIP Pricing
        if (p.pricing) {
          setPricing({
            monthly: { ...pricing.monthly, ...p.pricing.monthly },
            yearly: { ...pricing.yearly, ...p.pricing.yearly },
            lifetime: { ...pricing.lifetime, ...p.pricing.lifetime },
          });
        }

      } catch (e) {
        toast.error("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };

    if (id) initData();
  }, [id]);

  // --- Logic Helpers ---

  const getDiscount = (reg: string | number, sale: string | number) => {
    const r = Number(reg);
    const s = Number(sale);
    if (!r || !s || r <= s) return 0;
    return Math.round(((r - s) / r) * 100);
  };

  const handleImagePick = useCallback(async (): Promise<string | null> => {
    const url = prompt("Enter image URL");
    return url ? url : null;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const regenerateSlug = () => {
    const newSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData(prev => ({ ...prev, slug: newSlug }));
    setSlugManuallyEdited(false);
    toast.info("Slug regenerated");
  };

  // ⚡ Update VIP Plan State
  const updatePlan = (plan: "monthly" | "yearly" | "lifetime", field: keyof IPlanState, value: any) => {
    setPricing(prev => ({
      ...prev,
      [plan]: { ...prev[plan], [field]: value }
    }));
  };

  // Tags & Features Logic
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  
  const addFeature = () => setFeatures([...features, ""]);
  
  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput("");
      }
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) setTags(tags.slice(0, -1));
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (!formData.title) return toast.error("Title required");
    
    setSaving(true);
    try {
      const payload = {
        ...formData,
        defaultPrice: Number(formData.defaultPrice) || 0,
        salePrice: Number(formData.salePrice) || 0,
        regularPrice: Number(formData.regularPrice) || 0,
        
        thumbnail,
        gallery,
        tags,
        features: features.filter(f => f.trim() !== ""),
        category: formData.categoryId,
        
        // ⚡ VIP Pricing Object
        pricing: {
          monthly: { ...pricing.monthly, price: Number(pricing.monthly.price), regularPrice: Number(pricing.monthly.regularPrice) },
          yearly: { ...pricing.yearly, price: Number(pricing.yearly.price), regularPrice: Number(pricing.yearly.regularPrice) },
          lifetime: { ...pricing.lifetime, price: Number(pricing.lifetime.price), regularPrice: Number(pricing.lifetime.regularPrice) },
        },

        // ✅ Standard Delivery
        accessLink: formData.accessLink,
        accessNote: formData.accessNote,
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success("Product Updated Successfully");
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Render Plan Helper ---
  const renderPlanInputs = (planKey: "monthly" | "yearly" | "lifetime", label: string, Icon: any) => {
    const plan = pricing[planKey];
    const discount = getDiscount(plan.regularPrice, plan.price);

    return (
      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
        {/* Enable Switch */}
        <div className="flex items-center justify-between bg-secondary/20 p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full ${plan.isEnabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
               <Icon className="w-4 h-4" />
            </div>
            <div>
              <Label className="text-sm font-bold cursor-pointer" htmlFor={`${planKey}-enable`}>Enable {label} Plan</Label>
            </div>
          </div>
          <Switch 
            id={`${planKey}-enable`}
            checked={plan.isEnabled} 
            onCheckedChange={(c) => updatePlan(planKey, "isEnabled", c)} 
          />
        </div>

        {plan.isEnabled && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Selling Price</Label>
                <div className="relative">
                   <span className="absolute left-3 top-2 font-bold text-gray-500 text-xs">৳</span>
                   <Input 
                      type="number" 
                      value={plan.price} 
                      onChange={(e) => updatePlan(planKey, "price", e.target.value)} 
                      className="pl-7 h-9 font-bold text-green-600 border-green-200"
                   />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Regular Price</Label>
                <div className="relative">
                   <span className="absolute left-3 top-2 font-bold text-gray-400 text-xs">৳</span>
                   <Input 
                      type="number" 
                      value={plan.regularPrice} 
                      onChange={(e) => updatePlan(planKey, "regularPrice", e.target.value)} 
                      className="pl-7 h-9 text-gray-500"
                   />
                </div>
                {discount > 0 && <span className="text-[10px] text-green-600 font-bold flex items-center gap-1"><Sparkles className="w-3 h-3"/> {discount}% OFF</span>}
              </div>
            </div>

            {/* Validity Label */}
            <div className="space-y-1.5">
               <Label className="text-xs">Validity Label</Label>
               <Input 
                  value={plan.validityLabel} 
                  onChange={(e) => updatePlan(planKey, "validityLabel", e.target.value)}
                  placeholder={`e.g. ${label}`}
                  className="h-9 text-sm"
               />
            </div>

            {/* ✅ Rich Text Description */}
            <div className="space-y-1.5">
                <Label className="text-xs">Plan Description</Label>
                <div className="border rounded-md overflow-hidden min-h-[120px] bg-white">
                  <RichTextEditor 
                    onPickImage={handleImagePick}
                    value={plan.description || ""} 
                    onChange={(val) => updatePlan(planKey, "description", val)}
                  />
                </div>
            </div>

            <Separator className="my-2" />

            {/* Secure Delivery Section */}
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-3">
               <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                 <Lock className="w-3.5 h-3.5" /> Secure Delivery ({label})
               </h4>
               <div className="space-y-1.5">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <Input 
                       value={plan.accessLink || ""}
                       onChange={(e) => updatePlan(planKey, "accessLink", e.target.value)}
                       className="pl-8 bg-white h-9 text-xs"
                       placeholder="Access Link..."
                    />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <Textarea 
                     value={plan.accessNote || ""}
                     onChange={(e) => updatePlan(planKey, "accessNote", e.target.value)}
                     className="bg-white min-h-[60px] text-xs resize-none"
                     placeholder="Notes / Credentials..."
                  />
               </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary w-10 h-10"/>
      <p className="text-muted-foreground animate-pulse text-sm">Loading Product...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="w-full pb-20 max-w-7xl mx-auto px-4 sm:px-6"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b -mx-6 px-6 py-3 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="text-lg font-bold leading-tight">Edit Product</h1>
            <p className="text-[10px] text-muted-foreground">Updating: {formData.title}</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving} size="sm" className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>} Update
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Core Info */}
          <Card className="shadow-sm">
            <CardHeader className="py-4 px-5 border-b bg-secondary/5">
              <CardTitle className="flex items-center gap-2 text-base"><LayoutGrid className="w-4 h-4"/> Core Info</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Product Title</Label>
                <Input name="title" value={formData.title} onChange={handleChange} className="font-medium"/>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Slug</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center relative">
                      <span className="absolute left-3 text-muted-foreground text-xs">/</span>
                      <Input name="slug" value={formData.slug} onChange={(e) => {setSlugManuallyEdited(true); setFormData({...formData, slug: e.target.value})}} className="pl-5 text-sm" />
                    </div>
                    <Button variant="outline" size="icon" onClick={regenerateSlug} className="shrink-0 h-9 w-9"><Wand2 className="w-4 h-4"/></Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                   <Label className="text-xs font-bold">Category</Label>
                   <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({...prev, categoryId: v}))}>
                     <SelectTrigger className="text-sm"><SelectValue/></SelectTrigger>
                     <SelectContent>
                       {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Description</Label>
                <div className="border rounded-md overflow-hidden min-h-[250px]">
                  <RichTextEditor onPickImage={handleImagePick} value={formData.description} onChange={(val) => setFormData(p => ({...p, description: val}))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ⚡ VIP PRICING MANAGER */}
          <Card className="border-blue-200 bg-blue-50/10 shadow-sm">
            <CardHeader className="py-3 px-5 bg-blue-100/30 border-b border-blue-100">
               <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-blue-600"/>
                  <h3 className="text-sm font-bold text-blue-900">VIP Pricing Plans</h3>
               </div>
            </CardHeader>
            <CardContent className="p-5">
               <Tabs defaultValue="monthly" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 bg-blue-100/50 h-9">
                    <TabsTrigger value="monthly" className="text-xs font-bold data-[state=active]:bg-white">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly" className="text-xs font-bold data-[state=active]:bg-white">Yearly</TabsTrigger>
                    <TabsTrigger value="lifetime" className="text-xs font-bold data-[state=active]:bg-white">Lifetime</TabsTrigger>
                  </TabsList>
                  
                  <div className="bg-white border rounded-xl p-4 shadow-sm">
                    <TabsContent value="monthly" className="mt-0">{renderPlanInputs("monthly", "Monthly", Calendar)}</TabsContent>
                    <TabsContent value="yearly" className="mt-0">{renderPlanInputs("yearly", "Yearly", Calendar)}</TabsContent>
                    <TabsContent value="lifetime" className="mt-0">{renderPlanInputs("lifetime", "Lifetime", Crown)}</TabsContent>
                  </div>
               </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Org */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-secondary/5"><CardTitle className="text-sm">Organization</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Available</Label>
                <Switch checked={formData.isAvailable} onCheckedChange={(c) => setFormData(prev => ({...prev, isAvailable: c}))} className="scale-75"/>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Featured</Label>
                <Switch checked={formData.isFeatured} onCheckedChange={(c) => setFormData(prev => ({...prev, isFeatured: c}))} className="scale-75"/>
              </div>
            </CardContent>
          </Card>

          {/* Standard Product Settings */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-secondary/5">
              <CardTitle className="text-sm flex items-center gap-2"><Package className="w-4 h-4"/> Standard Product</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
               
               <div className="space-y-1.5">
                  <Label className="text-xs">Starting Price</Label>
                  <Input type="number" value={formData.defaultPrice} onChange={(e) => setFormData(p => ({...p, defaultPrice: e.target.value}))} placeholder="0" className="h-9"/>
               </div>

               {/* ✅ STANDARD DELIVERY FIELDS */}
               <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                     <Lock className="w-3 h-3 text-gray-500"/>
                     <span className="text-xs font-bold text-gray-600">Standard Delivery</span>
                  </div>
                  <Input 
                     placeholder="Access Link" 
                     value={formData.accessLink} 
                     onChange={(e) => setFormData(p => ({...p, accessLink: e.target.value}))}
                     className="bg-white h-8 text-xs"
                  />
                  <Textarea 
                     placeholder="Notes / Credentials" 
                     value={formData.accessNote} 
                     onChange={(e) => setFormData(p => ({...p, accessNote: e.target.value}))}
                     className="bg-white min-h-[50px] text-xs resize-none"
                  />
               </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-secondary/5"><CardTitle className="text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Thumbnail</CardTitle></CardHeader>
            <CardContent className="p-4">
               <FileUpload initialImages={thumbnail ? [thumbnail] : []} onChange={(u) => setThumbnail(u[0] || "")} />
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-secondary/5"><CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4"/> Features</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
               {features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                     <Input value={f} onChange={(e) => handleFeatureChange(i, e.target.value)} className="h-8 text-xs" />
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeFeature(i)}><X className="w-3 h-3"/></Button>
                  </div>
               ))}
               <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={addFeature}>Add Feature</Button>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-secondary/5"><CardTitle className="text-sm flex items-center gap-2"><Tag className="w-4 h-4"/> Tags</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 mb-2 min-h-[36px] border p-2 rounded-md bg-secondary/10">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-0.5 gap-1 text-[10px] h-5">
                    {tag} <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)}/>
                  </Badge>
                ))}
                <input 
                  className="flex-1 bg-transparent border-none outline-none text-xs min-w-[50px]" 
                  placeholder={tags.length===0?"Type...":""} 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)} 
                  onKeyDown={handleTagKeyDown} 
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </motion.div>
  );
}
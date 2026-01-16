"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Save, LayoutGrid, Loader2, UploadCloud, 
  X, DollarSign, Lock, Link as LinkIcon, 
  Clock, Wand2, Sparkles, Crown, Calendar, CheckCircle2, AlertCircle,
  FileText
} from "lucide-react";

// --- Components ---
import FileUpload from "@/components/Fileupload"; 
import RichTextEditor from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Interfaces ---
interface ICategory { _id: string; name: string; }

// ⚡ VIP Plan Structure State
interface IPlanState {
  isEnabled: boolean;
  price: string;
  regularPrice: string;
  validityLabel: string;
  description: string; // ✅ Rich Text Description
  accessLink: string;
  accessNote: string;
}

export default function CreateProduct() {
  const router = useRouter();

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  
  // Automation States
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

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

  // Basic Info
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
  });

  // Load Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (e) {
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  // --- Helpers & Automation ---
  const handleImagePick = useCallback(async (): Promise<string | null> => {
    const url = prompt("Enter image URL");
    return url ? url : null;
  }, []);

  // 1. Calculate Discount %
  const getDiscount = (reg: string, sale: string) => {
    const r = Number(reg);
    const s = Number(sale);
    if (!r || !s || r <= s) return 0;
    return Math.round(((r - s) / r) * 100);
  };

  // 2. Handle Text Change & Auto-Slug
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === "title" && !slugManuallyEdited) {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      }
      return newData;
    });
  };

  const regenerateSlug = () => {
    const newSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData(prev => ({ ...prev, slug: newSlug }));
    setSlugManuallyEdited(false);
    toast.info("Slug regenerated");
  };

  // 3. Handle VIP Plan Changes
  const updatePlan = (plan: "monthly" | "yearly" | "lifetime", field: keyof IPlanState, value: any) => {
    setPricing(prev => ({
      ...prev,
      [plan]: { ...prev[plan], [field]: value }
    }));
  };

  // 4. Submit
  const handleSubmit = async () => {
    if (!formData.title) return toast.error("Title is required");
    if (!thumbnail) return toast.error("Thumbnail is required");

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
          monthly: {
            ...pricing.monthly,
            price: Number(pricing.monthly.price),
            regularPrice: Number(pricing.monthly.regularPrice),
          },
          yearly: {
            ...pricing.yearly,
            price: Number(pricing.yearly.price),
            regularPrice: Number(pricing.yearly.regularPrice),
          },
          lifetime: {
            ...pricing.lifetime,
            price: Number(pricing.lifetime.price),
            regularPrice: Number(pricing.lifetime.regularPrice),
          },
        }
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create product");

      toast.success("Product Created Successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Render Helpers
  const renderPlanInputs = (planKey: "monthly" | "yearly" | "lifetime", label: string, Icon: any) => {
    const plan = pricing[planKey];
    const discount = getDiscount(plan.regularPrice, plan.price);

    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Enable Switch */}
        <div className="flex items-center justify-between bg-secondary/20 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${plan.isEnabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
               <Icon className="w-5 h-5" />
            </div>
            <div>
              <Label className="text-base font-bold cursor-pointer" htmlFor={`${planKey}-enable`}>Enable {label} Plan</Label>
              <p className="text-xs text-muted-foreground">Activate this duration for customers</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Selling Price</Label>
                <div className="relative">
                   <span className="absolute left-3 top-2.5 font-bold text-gray-500">৳</span>
                   <Input 
                      type="number" 
                      placeholder="0"
                      value={plan.price} 
                      onChange={(e) => updatePlan(planKey, "price", e.target.value)} 
                      className="pl-8 font-bold text-green-600 border-green-200 focus:ring-green-500"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Regular Price (MRP)</Label>
                <div className="relative">
                   <span className="absolute left-3 top-2.5 font-bold text-gray-400">৳</span>
                   <Input 
                      type="number" 
                      placeholder="0"
                      value={plan.regularPrice} 
                      onChange={(e) => updatePlan(planKey, "regularPrice", e.target.value)} 
                      className="pl-8 text-gray-500"
                   />
                </div>
                {discount > 0 && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Sparkles className="w-3 h-3"/> {discount}% Discount Applied</span>}
              </div>
            </div>

            {/* Validity & Description Row */}
            <div className="space-y-4">
               <div className="space-y-2">
                  <Label>Validity Label (Display Name)</Label>
                  <Input 
                     value={plan.validityLabel} 
                     onChange={(e) => updatePlan(planKey, "validityLabel", e.target.value)}
                     placeholder={`e.g. ${label}`}
                  />
               </div>

               {/* ✅ NEW: Rich Text Editor for Plan Description */}
               <div className="space-y-2">
                  <Label>Plan Description</Label>
                  <div className="border rounded-md overflow-hidden min-h-[180px] bg-white">
                    <RichTextEditor 
                      onPickImage={handleImagePick}
                      value={plan.description || ""} // Handle potentially undefined initially
                      onChange={(val) => updatePlan(planKey, "description", val)}
                    />
                  </div>
               </div>
            </div>

            <Separator className="my-4" />

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
               <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                 <Lock className="w-4 h-4" /> Secure Delivery for {label}
               </h4>
               <div className="space-y-2">
                  <Label className="text-xs uppercase text-blue-600/80 font-bold">Access Link</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input 
                       placeholder="https://drive.google.com/..."
                       value={plan.accessLink}
                       onChange={(e) => updatePlan(planKey, "accessLink", e.target.value)}
                       className="pl-9 bg-white"
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-xs uppercase text-blue-600/80 font-bold">Credentials / Note</Label>
                  <Textarea 
                     placeholder="Username: user1..."
                     value={plan.accessNote}
                     onChange={(e) => updatePlan(planKey, "accessNote", e.target.value)}
                     className="bg-white min-h-[80px]"
                  />
               </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8"/></div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="w-full pb-20 max-w-7xl mx-auto px-4 sm:px-6"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b -mx-6 px-6 py-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold">Create Product</h1>
            <p className="text-xs text-muted-foreground">Add new item with VIP pricing</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>} Save
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Basic Details */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><LayoutGrid className="w-5 h-5"/> Core Info</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Product Title <span className="text-red-500">*</span></Label>
                <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Masterclass 2024" className="text-lg font-medium"/>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Slug (Auto)</Label>
                   <div className="flex gap-2">
                      <Input name="slug" value={formData.slug} onChange={(e) => {setSlugManuallyEdited(true); setFormData({...formData, slug: e.target.value})}} />
                      <Button variant="outline" size="icon" onClick={regenerateSlug}><Wand2 className="w-4 h-4"/></Button>
                   </div>
                </div>
                <div className="space-y-2">
                   <Label>Category</Label>
                   <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({...prev, categoryId: v}))}>
                     <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                     <SelectContent>
                       {categories.map(cat => <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                </div>
              </div>
              
              {/* Main Product Description */}
              <div className="space-y-2">
                <Label>Main Description</Label>
                <div className="border rounded-md overflow-hidden min-h-[300px]">
                  <RichTextEditor 
                  onPickImage={handleImagePick}
                  value={formData.description} 
                  onChange={(val) => setFormData(p => ({...p, description: val}))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ⚡ VIP PRICING MANAGER */}
          <Card className="border-blue-200 bg-blue-50/10 shadow-md">
            <CardHeader className="bg-blue-100/30 pb-4 border-b border-blue-100">
               <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-blue-900"><Crown className="w-5 h-5 text-blue-600"/> VIP Pricing & Delivery</CardTitle>
                    <CardDescription>Manage Monthly, Yearly, and Lifetime access details independently.</CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="pt-6">
               <Tabs defaultValue="monthly" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-blue-100/50">
                    <TabsTrigger value="monthly" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 font-bold">
                       Monthly {pricing.monthly.isEnabled && <div className="ml-2 w-2 h-2 rounded-full bg-green-500"/>}
                    </TabsTrigger>
                    <TabsTrigger value="yearly" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 font-bold">
                       Yearly {pricing.yearly.isEnabled && <div className="ml-2 w-2 h-2 rounded-full bg-green-500"/>}
                    </TabsTrigger>
                    <TabsTrigger value="lifetime" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 font-bold">
                       Lifetime {pricing.lifetime.isEnabled && <div className="ml-2 w-2 h-2 rounded-full bg-green-500"/>}
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <TabsContent value="monthly">
                       {renderPlanInputs("monthly", "Monthly", Calendar)}
                    </TabsContent>
                    <TabsContent value="yearly">
                       {renderPlanInputs("yearly", "Yearly", Calendar)}
                    </TabsContent>
                    <TabsContent value="lifetime">
                       {renderPlanInputs("lifetime", "Lifetime", Crown)}
                    </TabsContent>
                  </div>
               </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Fallback Pricing */}
           <Card>
              <CardHeader><CardTitle className="text-base">Default Display Price</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label>Starting Price (Shown on Cards)</Label>
                    <Input type="number" value={formData.defaultPrice} onChange={(e) => setFormData(p => ({...p, defaultPrice: e.target.value}))} placeholder="0" />
                    <p className="text-[10px] text-muted-foreground">Used for sorting & list view ("Starts at...")</p>
                 </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                    <Label>Availability</Label>
                    <Switch checked={formData.isAvailable} onCheckedChange={c => setFormData(p => ({...p, isAvailable: c}))} />
                 </div>
                 <div className="flex items-center justify-between">
                    <Label>Featured Product</Label>
                    <Switch checked={formData.isFeatured} onCheckedChange={c => setFormData(p => ({...p, isFeatured: c}))} />
                 </div>
              </CardContent>
           </Card>

           {/* Media */}
           <Card>
              <CardHeader><CardTitle className="text-base">Thumbnail</CardTitle></CardHeader>
              <CardContent>
                 <FileUpload initialImages={thumbnail ? [thumbnail] : []} onChange={(u) => setThumbnail(u[0] || "")} />
              </CardContent>
           </Card>

           {/* Features */}
           <Card>
              <CardHeader><CardTitle className="text-base">Features List</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                 {features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                       <Input value={f} onChange={(e) => {
                          const n = [...features]; n[i] = e.target.value; setFeatures(n);
                       }} className="h-8 text-sm" />
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}><X className="w-4 h-4"/></Button>
                    </div>
                 ))}
                 <Button variant="outline" size="sm" className="w-full" onClick={() => setFeatures([...features, ""])}>Add Feature</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </motion.div>
  );
}
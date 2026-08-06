"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ArrowLeft, Save, LayoutGrid, Loader2, 
  X, User, Wand2, Crown, 
  Video, Tag, ImageIcon, CheckCircle2, Plus, Zap
} from "lucide-react";

import FileUpload from "@/components/Fileupload"; 
import RichTextEditor from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ICategory { _id: string; name: string; }

interface IPlanState {
  isEnabled: boolean;
  price: string | number;
  regularPrice: string | number;
  validityLabel: string;
  description: string;
  accessLink: string;
  accessNote: string;
}

export interface ProductFormInitialData {
  _id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category?: string | { _id: string; name: string };
  categoryId?: string;
  videoUrl?: string;
  fileType?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  defaultPrice?: number | string;
  salePrice?: number | string;
  regularPrice?: number | string;
  accessLink?: string;
  accessNote?: string;
  thumbnail?: string;
  gallery?: string[];
  features?: string[];
  tags?: string[];
  pricing?: {
    monthly?: Partial<IPlanState>;
    yearly?: Partial<IPlanState>;
    lifetime?: Partial<IPlanState>;
  };
  accountAccess?: {
    isEnabled: boolean;
    price: number | string;
    accountEmail?: string;
    accountPassword?: string;
  };
}

interface ProductFormProps {
  initialData?: ProductFormInitialData;
  isEditMode?: boolean;
}

export default function ProductForm({ initialData, isEditMode = false }: ProductFormProps) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditMode);

  // Media
  const [thumbnail, setThumbnail] = useState<string>(initialData?.thumbnail || "");
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);
  const [features, setFeatures] = useState<string[]>(
    initialData?.features && initialData.features.length > 0 ? initialData.features : [""]
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");

  // VIP Pricing State
  const [pricing, setPricing] = useState<{
    monthly: IPlanState;
    yearly: IPlanState;
    lifetime: IPlanState;
  }>({
    monthly: {
      isEnabled: initialData?.pricing?.monthly?.isEnabled || false,
      price: initialData?.pricing?.monthly?.price ?? "",
      regularPrice: initialData?.pricing?.monthly?.regularPrice ?? "",
      validityLabel: initialData?.pricing?.monthly?.validityLabel || "1 Month",
      description: initialData?.pricing?.monthly?.description || "",
      accessLink: initialData?.pricing?.monthly?.accessLink || "",
      accessNote: initialData?.pricing?.monthly?.accessNote || "",
    },
    yearly: {
      isEnabled: initialData?.pricing?.yearly?.isEnabled || false,
      price: initialData?.pricing?.yearly?.price ?? "",
      regularPrice: initialData?.pricing?.yearly?.regularPrice ?? "",
      validityLabel: initialData?.pricing?.yearly?.validityLabel || "1 Year",
      description: initialData?.pricing?.yearly?.description || "",
      accessLink: initialData?.pricing?.yearly?.accessLink || "",
      accessNote: initialData?.pricing?.yearly?.accessNote || "",
    },
    lifetime: {
      isEnabled: initialData?.pricing?.lifetime?.isEnabled || false,
      price: initialData?.pricing?.lifetime?.price ?? "",
      regularPrice: initialData?.pricing?.lifetime?.regularPrice ?? "",
      validityLabel: initialData?.pricing?.lifetime?.validityLabel || "Lifetime",
      description: initialData?.pricing?.lifetime?.description || "",
      accessLink: initialData?.pricing?.lifetime?.accessLink || "",
      accessNote: initialData?.pricing?.lifetime?.accessNote || "",
    },
  });

  // Account Access State
  const [accountAccess, setAccountAccess] = useState({
    isEnabled: initialData?.accountAccess?.isEnabled || false,
    price: initialData?.accountAccess?.price ?? "",
    accountEmail: initialData?.accountAccess?.accountEmail || "",
    accountPassword: initialData?.accountAccess?.accountPassword || "",
  });

  // Basic Form Data
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    categoryId: typeof initialData?.category === "object" 
      ? initialData?.category?._id 
      : (initialData?.category || initialData?.categoryId || ""),
    videoUrl: initialData?.videoUrl || "",
    fileType: initialData?.fileType || "Subscription",
    isAvailable: initialData?.isAvailable ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    defaultPrice: initialData?.defaultPrice ?? "",
    salePrice: initialData?.salePrice ?? "",
    regularPrice: initialData?.regularPrice ?? "",
    accessLink: initialData?.accessLink || "",
    accessNote: initialData?.accessNote || "",
  });

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || data || []);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCats();
  }, []);

  // Auto Generate Slug
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, slugManuallyEdited]);

  const regenerateSlug = () => {
    const generatedSlug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    setSlugManuallyEdited(false);
    toast.info("Slug regenerated");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updatePlan = (planKey: "monthly" | "yearly" | "lifetime", field: keyof IPlanState, value: any) => {
    setPricing((prev) => ({
      ...prev,
      [planKey]: { ...prev[planKey], [field]: value },
    }));
  };

  // Feature Handlers
  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

  // Tag Handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => setTags(tags.filter((t) => t !== tagToRemove));

  // Image Upload helper for RichTextEditor
  const handlePickImageForEditor = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        try {
          const authRes = await fetch("/api/auth/imagekit-auth");
          const auth = await authRes.json();
          const { upload } = await import("@imagekit/next");
          const res = await upload({
            expire: auth.expire,
            token: auth.token,
            signature: auth.signature,
            publicKey: auth.publicKey,
            file,
            fileName: `editor-${Date.now()}-${file.name}`,
          });
          resolve(res.url || null);
        } catch (err) {
          toast.error("Image upload failed");
          resolve(null);
        }
      };
      input.click();
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Product Title is required");
    if (!formData.slug.trim()) return toast.error("Slug is required");

    setSaving(true);

    try {
      const payload = {
        ...formData,
        thumbnail,
        gallery,
        features: features.filter((f) => f.trim() !== ""),
        tags,
        regularPrice: Number(formData.regularPrice) || 0,
        salePrice: Number(formData.salePrice) || 0,
        defaultPrice: Number(formData.defaultPrice) || 0,
        category: formData.categoryId || undefined,
        pricing: {
          monthly: { ...pricing.monthly, price: Number(pricing.monthly.price), regularPrice: Number(pricing.monthly.regularPrice) },
          yearly: { ...pricing.yearly, price: Number(pricing.yearly.price), regularPrice: Number(pricing.yearly.regularPrice) },
          lifetime: { ...pricing.lifetime, price: Number(pricing.lifetime.price), regularPrice: Number(pricing.lifetime.regularPrice) },
        },
        accountAccess: {
          isEnabled: accountAccess.isEnabled,
          price: Number(accountAccess.price),
          accountEmail: accountAccess.accountEmail,
          accountPassword: accountAccess.accountPassword,
        },
      };

      const url = isEditMode && initialData?._id 
        ? `/api/products/${initialData._id}` 
        : "/api/products";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      toast.success(isEditMode ? "Product Updated Successfully!" : "Product Created Successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* ⚡ STICKY PC-APP COMMAND BAR (HIGH CONTRAST) */}
      <header className="sticky top-0 z-40 bg-[#121216]/95 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                {isEditMode ? "Edit Product" : "Create New Product"}
              </h1>
              <Badge className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 border ${
                formData.isAvailable 
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" 
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}>
                {formData.isAvailable ? "Available" : "Hidden"}
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              {formData.title ? `Configuring "${formData.title}"` : "Configure product details, VIP pricing, & credentials"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="hidden sm:inline-flex border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs h-9"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 h-9 text-xs shadow-lg shadow-emerald-900/40 transition-all active:scale-95 border border-emerald-500/30"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Save className="w-3.5 h-3.5 mr-2" />}
            {isEditMode ? "Save Changes" : "Publish Product"}
          </Button>
        </div>
      </header>

      {/* MAIN FORM GRID */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN (Core Details - 8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. CORE INFORMATION CARD */}
            <Card className="bg-[#121215] border-zinc-800 text-zinc-100 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#18181c] px-5 py-3.5 border-b border-zinc-800/80">
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-400" />
                  Core Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-4">
                
                {/* Product Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Product Title <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="e.g. Masterclass 2026 - Premium Access" 
                    className="bg-[#1a1a20] border-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-white font-medium text-sm h-10 placeholder:text-zinc-500 rounded-xl"
                    required
                  />
                </div>

                {/* Slug & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Slug (Auto Generated)</Label>
                    <div className="flex gap-2">
                      <Input 
                        name="slug" 
                        value={formData.slug} 
                        onChange={(e) => { setSlugManuallyEdited(true); setFormData({ ...formData, slug: e.target.value }); }} 
                        className="bg-[#1a1a20] border-zinc-700 text-xs h-10 font-mono text-zinc-300 rounded-xl"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={regenerateSlug} 
                        title="Regenerate Slug"
                        className="shrink-0 h-10 w-10 border-zinc-700 bg-[#18181c] hover:bg-zinc-800 text-amber-400 rounded-xl"
                      >
                        <Wand2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Category</Label>
                    <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({ ...prev, categoryId: v }))}>
                      <SelectTrigger className="bg-[#1a1a20] border-zinc-700 text-xs h-10 text-white rounded-xl">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#18181c] border-zinc-700 text-white">
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id} className="text-xs focus:bg-zinc-800">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Short Summary */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Short Summary</Label>
                  <Textarea 
                    name="shortDescription" 
                    value={formData.shortDescription} 
                    onChange={handleChange} 
                    placeholder="Brief summary displayed on product cards..." 
                    className="bg-[#1a1a20] border-zinc-700 text-xs text-white min-h-[60px] resize-none placeholder:text-zinc-500 rounded-xl"
                  />
                </div>

                {/* Full Description */}
                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Full Description</Label>
                  <div className="bg-[#1a1a20] border border-zinc-700 rounded-xl overflow-hidden">
                    <RichTextEditor 
                      value={formData.description} 
                      onChange={(html) => setFormData(prev => ({ ...prev, description: html }))} 
                      onPickImage={handlePickImageForEditor}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* 2. VIP PRICING & TIERED PLANS CARD */}
            <Card className="bg-[#121215] border-zinc-800 text-zinc-100 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#18181c] px-5 py-3.5 border-b border-zinc-800/80 flex flex-row items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  VIP Tiered Pricing Plans
                </CardTitle>
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] uppercase font-mono">
                  Optional Subscriptions
                </Badge>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                
                <Tabs defaultValue="monthly" className="w-full">
                  <TabsList className="grid grid-cols-3 bg-[#1a1a20] border border-zinc-700 p-1 rounded-xl mb-5">
                    <TabsTrigger 
                      value="monthly" 
                      className="text-xs font-bold text-zinc-300 hover:text-white data-[state=active]:!bg-emerald-600 data-[state=active]:!text-white rounded-lg transition-all py-2"
                    >
                      Monthly Plan
                    </TabsTrigger>
                    <TabsTrigger 
                      value="yearly" 
                      className="text-xs font-bold text-zinc-300 hover:text-white data-[state=active]:!bg-emerald-600 data-[state=active]:!text-white rounded-lg transition-all py-2"
                    >
                      Yearly Plan
                    </TabsTrigger>
                    <TabsTrigger 
                      value="lifetime" 
                      className="text-xs font-bold text-zinc-300 hover:text-white data-[state=active]:!bg-emerald-600 data-[state=active]:!text-white rounded-lg transition-all py-2"
                    >
                      Lifetime Access
                    </TabsTrigger>
                  </TabsList>

                  {(["monthly", "yearly", "lifetime"] as const).map((planKey) => {
                    const plan = pricing[planKey];
                    const label = planKey === "monthly" ? "Monthly" : planKey === "yearly" ? "Yearly" : "Lifetime";

                    return (
                      <TabsContent key={planKey} value={planKey} className="space-y-4">
                        
                        <div className="flex items-center justify-between bg-[#18181c] p-3.5 rounded-xl border border-zinc-700">
                          <div className="flex items-center gap-3">
                            <Crown className={`w-4 h-4 ${plan.isEnabled ? "text-amber-400" : "text-zinc-500"}`} />
                            <div>
                              <Label className="text-xs font-bold text-white cursor-pointer" htmlFor={`${planKey}-toggle`}>
                                Enable {label} Subscription
                              </Label>
                              <p className="text-[10px] text-zinc-400 font-mono">Allows customers to select {label} billing tier</p>
                            </div>
                          </div>
                          <Switch 
                            id={`${planKey}-toggle`} 
                            checked={plan.isEnabled} 
                            onCheckedChange={(c) => updatePlan(planKey, "isEnabled", c)} 
                          />
                        </div>

                        {plan.isEnabled && (
                          <div className="space-y-3 p-4 bg-[#1a1a20] border border-zinc-700 rounded-xl animate-in fade-in">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[10px] text-zinc-300 uppercase font-bold">Sale Price (৳)</Label>
                                <Input 
                                  type="number" 
                                  value={plan.price} 
                                  onChange={(e) => updatePlan(planKey, "price", e.target.value)} 
                                  placeholder="0" 
                                  className="bg-[#121215] border-zinc-700 h-9 text-xs text-emerald-400 font-mono font-bold"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] text-zinc-300 uppercase font-bold">Regular Price (৳)</Label>
                                <Input 
                                  type="number" 
                                  value={plan.regularPrice} 
                                  onChange={(e) => updatePlan(planKey, "regularPrice", e.target.value)} 
                                  placeholder="0" 
                                  className="bg-[#121215] border-zinc-700 h-9 text-xs text-zinc-400 font-mono"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] text-zinc-300 uppercase font-bold">Access Link (Optional Override)</Label>
                              <Input 
                                value={plan.accessLink} 
                                onChange={(e) => updatePlan(planKey, "accessLink", e.target.value)} 
                                placeholder="https://..." 
                                className="bg-[#121215] border-zinc-700 h-9 text-xs text-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[10px] text-zinc-300 uppercase font-bold">Access Notes (Optional Override)</Label>
                              <Textarea 
                                value={plan.accessNote} 
                                onChange={(e) => updatePlan(planKey, "accessNote", e.target.value)} 
                                placeholder="Instructions for tier..." 
                                className="bg-[#121215] border-zinc-700 text-xs text-white min-h-[50px] resize-none"
                              />
                            </div>
                          </div>
                        )}

                      </TabsContent>
                    );
                  })}
                </Tabs>

              </CardContent>
            </Card>

            {/* 3. ACCOUNT ACCESS CREDENTIALS CARD */}
            <Card className="bg-[#121215] border-zinc-800 text-zinc-100 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#18181c] px-5 py-3.5 border-b border-zinc-800/80 flex flex-row items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  Account Credentials Delivery
                </CardTitle>
                <Switch 
                  checked={accountAccess.isEnabled} 
                  onCheckedChange={(c) => setAccountAccess(prev => ({ ...prev, isEnabled: c }))} 
                />
              </CardHeader>
              {accountAccess.isEnabled && (
                <CardContent className="p-5 sm:p-6 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-zinc-300 uppercase font-bold">Account Username / Email</Label>
                      <Input 
                        value={accountAccess.accountEmail} 
                        onChange={(e) => setAccountAccess(prev => ({ ...prev, accountEmail: e.target.value }))} 
                        placeholder="user@example.com" 
                        className="bg-[#1a1a20] border-zinc-700 h-9 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-zinc-300 uppercase font-bold">Account Password</Label>
                      <Input 
                        value={accountAccess.accountPassword} 
                        onChange={(e) => setAccountAccess(prev => ({ ...prev, accountPassword: e.target.value }))} 
                        placeholder="••••••••" 
                        className="bg-[#1a1a20] border-zinc-700 h-9 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-300 uppercase font-bold">Account Access Price (৳)</Label>
                    <Input 
                      type="number" 
                      value={accountAccess.price} 
                      onChange={(e) => setAccountAccess(prev => ({ ...prev, price: e.target.value }))} 
                      placeholder="0" 
                      className="bg-[#1a1a20] border-zinc-700 h-9 text-xs text-purple-400 font-mono font-bold max-w-xs"
                    />
                  </div>
                </CardContent>
              )}
            </Card>

          </div>

          {/* RIGHT COLUMN (Product Configuration & Media - 4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. PRICING & AVAILABILITY CARD */}
            <Card className="bg-[#121215] border-zinc-800 text-zinc-100 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#18181c] px-5 py-3.5 border-b border-zinc-800/80">
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-400" />
                  Pricing & Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-300 uppercase font-bold">Regular Price (৳)</Label>
                    <Input 
                      type="number" 
                      name="regularPrice" 
                      value={formData.regularPrice} 
                      onChange={handleChange} 
                      placeholder="0" 
                      className="bg-[#1a1a20] border-zinc-700 h-9 text-xs text-zinc-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-300 uppercase font-bold">Sale Price (৳)</Label>
                    <Input 
                      type="number" 
                      name="salePrice" 
                      value={formData.salePrice} 
                      onChange={handleChange} 
                      placeholder="0" 
                      className="bg-[#1a1a20] border-zinc-700 h-9 text-xs text-emerald-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-zinc-300 uppercase font-bold">Display Price / Starts At (৳)</Label>
                  <Input 
                    type="number" 
                    name="defaultPrice" 
                    value={formData.defaultPrice} 
                    onChange={handleChange} 
                    placeholder="Main price on product card..." 
                    className="bg-[#1a1a20] border-zinc-700 h-9 text-xs text-amber-400 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-zinc-300 uppercase font-bold">Delivery / Product Type</Label>
                  <Select value={formData.fileType} onValueChange={(v) => setFormData(prev => ({ ...prev, fileType: v }))}>
                    <SelectTrigger className="bg-[#1a1a20] border-zinc-700 text-xs h-9 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181c] border-zinc-700 text-white">
                      <SelectItem value="Subscription" className="text-xs">Subscription Plan</SelectItem>
                      <SelectItem value="Account Access" className="text-xs">Account Access Credentials</SelectItem>
                      <SelectItem value="Course Link" className="text-xs">Direct Course Link / Drive</SelectItem>
                      <SelectItem value="Software License" className="text-xs">Software Key / License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 space-y-3 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-white cursor-pointer" htmlFor="isAvailable-toggle">
                      Is Available for Purchase?
                    </Label>
                    <Switch 
                      id="isAvailable-toggle" 
                      checked={formData.isAvailable} 
                      onCheckedChange={(c) => setFormData(prev => ({ ...prev, isAvailable: c }))} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-white cursor-pointer" htmlFor="isFeatured-toggle">
                      Featured Product Badge
                    </Label>
                    <Switch 
                      id="isFeatured-toggle" 
                      checked={formData.isFeatured} 
                      onCheckedChange={(c) => setFormData(prev => ({ ...prev, isFeatured: c }))} 
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* 2. MEDIA ASSETS CARD */}
            <Card className="bg-[#121215] border-zinc-800 text-zinc-100 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#18181c] px-5 py-3.5 border-b border-zinc-800/80">
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-400" />
                  Media & Images
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                
                {/* Thumbnail Uploader */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Thumbnail Image</Label>
                  <FileUpload 
                    initialImages={thumbnail ? [thumbnail] : []} 
                    onChange={(imgs) => setThumbnail(imgs[0] || "")} 
                  />
                </div>

                {/* Video Trailer URL */}
                <div className="space-y-1 pt-2">
                  <Label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <Video className="w-3.5 h-3.5 text-purple-400" /> Video Trailer URL (Optional)
                  </Label>
                  <Input 
                    name="videoUrl" 
                    value={formData.videoUrl} 
                    onChange={handleChange} 
                    placeholder="https://youtube.com/watch?v=..." 
                    className="bg-[#1a1a20] border-zinc-700 h-9 text-xs text-white"
                  />
                </div>

              </CardContent>
            </Card>

            {/* 3. KEY FEATURES LIST CARD */}
            <Card className="bg-[#121215] border-zinc-800 text-zinc-100 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#18181c] px-5 py-3.5 border-b border-zinc-800/80 flex flex-row items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Key Features
                </CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addFeature} 
                  className="h-7 text-[10px] border-zinc-700 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Item
                </Button>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input 
                      value={feat} 
                      onChange={(e) => handleFeatureChange(idx, e.target.value)} 
                      placeholder={`Feature #${idx + 1}...`} 
                      className="bg-[#1a1a20] border-zinc-700 h-8 text-xs text-white"
                    />
                    {features.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFeature(idx)} 
                        className="h-8 w-8 text-zinc-500 hover:text-red-400 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 4. TAGS CARD */}
            <Card className="bg-[#121215] border-zinc-800 text-zinc-100 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-[#18181c] px-5 py-3.5 border-b border-zinc-800/80">
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  Search Keywords & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <Input 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)} 
                  onKeyDown={handleAddTag} 
                  placeholder="Type tag and press Enter..." 
                  className="bg-[#1a1a20] border-zinc-700 h-9 text-xs text-white"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 bg-[#1a1a20] border border-zinc-700 text-zinc-200 text-xs px-2.5 py-1 rounded-lg font-mono">
                      {t}
                      <X className="w-3 h-3 cursor-pointer text-zinc-400 hover:text-red-400" onClick={() => removeTag(t)} />
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>

        {/* MOBILE STICKY BOTTOM SAVE BAR */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#121216]/95 border-t border-zinc-800 backdrop-blur-md sm:hidden z-40 flex items-center justify-between gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()} 
            className="border-zinc-700 bg-zinc-900 text-zinc-300 text-xs h-10 flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saving} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 flex-1 shadow-lg shadow-emerald-900/40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            {isEditMode ? "Save Changes" : "Publish"}
          </Button>
        </div>

      </form>
    </div>
  );
}

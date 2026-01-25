"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Loader2, Star, User 
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ✅ Import FileUpload Component
import FileUpload from "@/components/Fileupload"; 

interface IReview {
  _id: string;
  imageUrl: string;
  name: string;
  rating: number;
  isActive: boolean;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    imageUrl: "",
    name: "Happy Customer",
    rating: 5,
    isActive: true
  });

  // Fetch Data
  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (data.success) setReviews(data.reviews);
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Validation
    if (!formData.imageUrl) {
        toast.error("Please upload a screenshot");
        setSubmitting(false);
        return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      
      if (res.ok) {
        toast.success("Review added successfully");
        setIsModalOpen(false);
        // Reset Form
        setFormData({ imageUrl: "", name: "Happy Customer", rating: 5, isActive: true });
        fetchReviews();
      } else {
        toast.error(json.error);
      }
    } catch (error) {
      toast.error("Error creating review");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if(!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if(res.ok) {
        toast.success("Deleted");
        setReviews(prev => prev.filter(r => r._id !== id));
      }
    } catch(err) { toast.error("Failed to delete"); }
  };

  // Toggle Visibility
  const toggleActive = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setReviews(prev => prev.map(r => r._id === id ? { ...r, isActive: !currentStatus } : r));
    
    try {
      await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
    } catch(err) { 
        toast.error("Connection error");
        fetchReviews(); // Revert on error
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 bg-black min-h-screen text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-[#111] p-4 rounded-xl border border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
             <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Reviews
          </h1>
          <p className="text-xs text-gray-500">Manage customer feedback screenshots</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-white text-black hover:bg-gray-200">
          <Plus className="w-4 h-4 mr-2" /> Add Review
        </Button>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-500" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No reviews found. Add some!</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reviews.map((review) => (
            <div key={review._id} className={`group relative bg-[#111] rounded-xl border overflow-hidden transition-all ${review.isActive ? 'border-white/10' : 'border-red-500/30 opacity-60'}`}>
              
              {/* Image Preview */}
              <div className="relative aspect-[3/4] w-full bg-[#050505]">
                <Image src={review.imageUrl} alt="Review" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <Button size="icon" variant="destructive" onClick={() => handleDelete(review._id)}>
                     <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-xs font-bold text-white truncate max-w-[100px]">{review.name}</p>
                   <div className="flex gap-0.5">
                     {[...Array(review.rating)].map((_,i) => (
                       <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                     ))}
                   </div>
                </div>
                
                <div className="flex items-center justify-between">
                   <span className="text-[10px] text-gray-500">Visible?</span>
                   <Switch 
                      checked={review.isActive} 
                      onCheckedChange={() => toggleActive(review._id, review.isActive)} 
                      className="scale-75"
                   />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Review Screenshot</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            
            {/* ✅ FIXED: File Upload Implementation */}
            <div className="space-y-2">
              <Label>Review Screenshot</Label>
              <div className="p-1 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <FileUpload 
                    // 1. Pass current image as array (if exists) or empty array
                    initialImages={formData.imageUrl ? [formData.imageUrl] : []} 
                    
                    // 2. Handle change: Grab the first URL from the array
                    onChange={(urls) => setFormData(prev => ({ ...prev, imageUrl: urls[0] || "" }))} 
                  />
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <Label>Reviewer Name (Optional)</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="pl-9 bg-[#0a0a0a] border-white/10"
                />
              </div>
            </div>

            {/* Rating Selector */}
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({...formData, rating: num})}
                    className={`p-1 rounded transition-colors ${formData.rating >= num ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                    <Star className={`w-6 h-6 ${formData.rating >= num ? 'fill-yellow-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
               <Button type="submit" disabled={submitting} className="bg-white text-black w-full font-bold">
                 {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : "Save Review"}
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
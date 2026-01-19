"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Pencil, Trash2, Megaphone, Loader2, 
  Calendar, CheckCircle2, XCircle, AlertTriangle, Tag, Info, MoreHorizontal 
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Types ---
interface Announcement {
  _id: string;
  title: string;
  description: string;
  type: "update" | "alert" | "offer" | "info";
  isActive: boolean;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "info",
    isActive: true
  });

  // --- 1. Fetch Data ---
  const fetchData = async () => {
    try {
      // Note: Ensure your GET API returns ALL items for admin (not just active ones)
      // You might need to tweak the API to check session role if you haven't already.
      const res = await fetch("/api/announcements");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. Handlers ---
  
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ title: "", description: "", type: "info", isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      type: item.type,
      isActive: item.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingItem 
        ? `/api/announcements/${editingItem._id}` 
        : "/api/announcements";
      
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error);

      toast.success(editingItem ? "Updated successfully" : "Created successfully");
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully");
        setData(prev => prev.filter(item => item._id !== id));
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  // --- Helper: Type Badges ---
  const getTypeBadge = (type: string) => {
    const styles: any = {
      offer: "bg-green-500/10 text-green-400 border-green-500/20",
      alert: "bg-red-500/10 text-red-400 border-red-500/20",
      update: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      info: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };
    return (
      <Badge variant="outline" className={`${styles[type]} capitalize border`}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-8 bg-black min-h-screen text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111] p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Announcements</h1>
            <p className="text-xs text-gray-500">Manage public notices & offers</p>
          </div>
        </div>
        <Button onClick={openCreateModal} className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Create New
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 bg-[#111] rounded-xl border border-dashed border-white/10">
          <p className="text-gray-500">No announcements found.</p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-[#111] rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((item) => (
                  <tr key={item._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                    <td className="px-6 py-4">{getTypeBadge(item.type)}</td>
                    <td className="px-6 py-4">
                      {item.isActive ? (
                        <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-500/20 gap-1"><CheckCircle2 className="w-3 h-3"/> Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-800 text-gray-500 border-gray-700 gap-1"><XCircle className="w-3 h-3"/> Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(item)} className="h-8 w-8 text-gray-400 hover:text-white"><Pencil className="w-4 h-4"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)} className="h-8 w-8 text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {data.map((item) => (
              <div key={item._id} className="bg-[#111] p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2"><MoreHorizontal className="w-4 h-4"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1a1a1a] border-white/10 text-white">
                      <DropdownMenuItem onClick={() => openEditModal(item)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(item._id)} className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex gap-2">
                    {getTypeBadge(item.type)}
                    {item.isActive ? (
                        <span className="text-[10px] bg-green-900/20 text-green-400 px-2 py-0.5 rounded border border-green-500/20 flex items-center">Active</span>
                      ) : (
                        <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded border border-gray-700 flex items-center">Hidden</span>
                      )}
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- MODAL (CREATE / EDIT) --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Announcement" : "New Announcement"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            
            {/* Title */}
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Eid Special Offer"
                className="bg-[#0a0a0a] border-white/10"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Details of the announcement..."
                className="bg-[#0a0a0a] border-white/10 min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Type Select */}
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({...formData, type: val})}
                >
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectItem value="info">Info (Gray)</SelectItem>
                    <SelectItem value="update">Update (Blue)</SelectItem>
                    <SelectItem value="offer">Offer (Green)</SelectItem>
                    <SelectItem value="alert">Alert (Red)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Switch */}
              <div className="space-y-1.5 flex flex-col justify-center">
                <Label className="mb-2">Visibility</Label>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <span className="text-xs text-gray-400">{formData.isActive ? "Visible" : "Hidden"}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-white text-black hover:bg-gray-200">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : (editingItem ? "Update" : "Create")}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
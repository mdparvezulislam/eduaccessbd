"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Loader2, Save, UserCog, Mail, Phone, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription, // Added for better UI/Accessibility
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface matches your Mongoose Schema exactly
interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "ADMIN";
}

interface EditUserDialogProps {
  user: User;
  onUpdate: (user: User) => void;
  fullWidth?: boolean; 
}

export function EditUserDialog({ user, onUpdate, fullWidth }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("User updated successfully");
        onUpdate(data.user);
        setOpen(false);
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={fullWidth ? "outline" : "ghost"} 
          size={fullWidth ? "default" : "icon"}
          className={`
            ${fullWidth 
              ? "w-full border-gray-800 bg-[#111] text-gray-300 hover:bg-gray-800 hover:text-white transition-all" 
              : "text-blue-500 hover:bg-blue-900/20 hover:text-blue-400 h-8 w-8"
            }
          `}
        >
          <Pencil className="w-4 h-4 mr-2" /> {fullWidth ? "Edit Profile" : ""}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-[#111] border-gray-800 text-white sm:max-w-[450px] shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserCog className="w-5 h-5 text-green-500" />
            Edit User Details
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            Make changes to the user profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          
          {/* Name Field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</Label>
            <div className="relative">
              <UserCog className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="pl-9 bg-[#0a0a0a] border-gray-800 text-white focus-visible:ring-green-500/50 focus-visible:border-green-500 h-10"
                placeholder="User Name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="pl-9 bg-[#0a0a0a] border-gray-800 text-white focus-visible:ring-green-500/50 focus-visible:border-green-500 h-10"
                placeholder="user@example.com"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="pl-9 bg-[#0a0a0a] border-gray-800 text-white focus-visible:ring-green-500/50 focus-visible:border-green-500 h-10"
                placeholder="017xxxxxxxx"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Role</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-2.5 h-4 w-4 z-10 text-gray-500" />
              <Select 
                value={formData.role} 
                onValueChange={(val: "user" | "ADMIN") => setFormData({...formData, role: val})}
              >
                <SelectTrigger className="pl-9 bg-[#0a0a0a] border-gray-800 text-white focus:ring-green-500/50 h-10">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
                  <SelectItem value="user" className="focus:bg-gray-800 focus:text-white cursor-pointer">User (Standard)</SelectItem>
                  <SelectItem value="ADMIN" className="focus:bg-gray-800 focus:text-white cursor-pointer text-purple-400 font-semibold">ADMIN (Full Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto font-semibold shadow-lg shadow-green-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2"/> Save Changes
                </>
              )}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}
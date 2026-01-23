"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil, Loader2, Save, User, Mail, Phone, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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

interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "ADMIN";
}

interface EditUserDialogProps {
  user: IUser;
  onUpdate: (user: IUser) => void;
  fullWidth?: boolean; 
}

export function EditUserDialog({ user, onUpdate, fullWidth }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initialize form data
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
  });

  // Reset form when user prop changes or modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
      });
    }
  }, [open, user]);

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
          className={
            fullWidth 
              ? "w-full border-white/10 bg-[#111] text-gray-300 hover:bg-white/5 hover:text-white transition-all h-9" 
              : "text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 h-8 w-8"
          }
        >
          <Pencil className={`w-3.5 h-3.5 ${fullWidth ? "mr-2" : ""}`} /> 
          {fullWidth && "Edit Profile"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-[450px] shadow-2xl p-6 gap-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-lg">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            Edit User Details
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Update personal information and permissions for <span className="text-white font-medium">{user.name}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid gap-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="pl-9 bg-[#0a0a0a] border-white/10 text-white focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 h-10"
                  placeholder="User Name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-9 bg-[#0a0a0a] border-white/10 text-white focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 h-10"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="pl-9 bg-[#0a0a0a] border-white/10 text-white focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 h-10"
                  placeholder="017xxxxxxxx"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4 w-4 z-10 text-gray-500" />
                <Select 
                  value={formData.role} 
                  onValueChange={(val: "user" | "ADMIN") => setFormData({...formData, role: val})}
                >
                  <SelectTrigger className="pl-9 bg-[#0a0a0a] border-white/10 text-white focus:ring-blue-500/50 h-10">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectItem value="user" className="focus:bg-white/10 focus:text-white cursor-pointer py-3">
                      User (Standard)
                    </SelectItem>
                    <SelectItem value="ADMIN" className="focus:bg-white/10 focus:text-white cursor-pointer text-purple-400 font-semibold py-3">
                      ADMIN (Full Access)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-white text-black hover:bg-gray-200 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
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
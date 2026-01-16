"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Save, 
  Loader2, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "", // Only sent if user wants to change it
  });

  // Fetch latest user data from API (Session data might be stale)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // We reuse the admin fetch logic or standard user fetch if you have one
        // If not, we can rely on session for initial fill, but API is better for 'phone'
        // Here we assume session has basic info, but let's try to get fresh data
        // NOTE: You might need a simple GET endpoint for /api/user/profile if phone isn't in session
        
        if (session?.user) {
          setFormData({
            name: session.user.name || "",
            email: session.user.email || "",
            phone: (session.user as any).phone || "",
            password: ""
          });
        }
      } finally {
        setFetching(false);
      }
    };
    fetchUserData();
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Profile updated successfully!");
      
      // Update Client Session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          email: formData.email,
        }
      });
      
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400">Manage your account information and security.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid gap-8">
        
        {/* Personal Info Card */}
        <Card className="bg-[#111] border-gray-800 shadow-lg">
          <CardHeader className="border-b border-gray-800 pb-4">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <User className="w-5 h-5 text-green-500" /> Personal Information
            </CardTitle>
            <CardDescription className="text-gray-500">
              Update your public profile details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-9 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-9 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50"
                    placeholder="017xxxxxxxx"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50"
                />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> 
                Changing email may require re-login.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="bg-[#111] border-gray-800 shadow-lg">
          <CardHeader className="border-b border-gray-800 pb-4">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" /> Security
            </CardTitle>
            <CardDescription className="text-gray-500">
              Manage your password and account security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            <div className="space-y-2">
              <Label className="text-gray-300">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="pl-9 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50 placeholder:text-gray-600"
                />
              </div>
              <p className="text-xs text-gray-500">
                Must be at least 6 characters long.
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading} 
            className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 text-base font-semibold shadow-lg shadow-green-900/20"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" /> Save Changes
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
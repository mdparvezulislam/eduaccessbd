"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, UserPlus, Lock, Mail, User, Eye, EyeOff, Phone } from "lucide-react"; // ✅ Imported Phone

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // ✅ Added phone to state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "", 
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Client-side validation
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      // 2. Call API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // 3. Success Logic
      toast.success("Account created! Please log in.");
      router.push("/auth/login");

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] opacity-30"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl ring-1 ring-slate-200/50">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-600/10 rounded-full">
                <UserPlus className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Mehmet Khan"
                    className="pl-9"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* ✅ Phone Input (New) */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="017xxxxxxxx"
                    className="pl-9"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Must be at least 6 characters long.
                </p>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <p>
              Already have an account?{" "}
              <Link href="/auth/login" className="text-green-600 hover:underline font-medium">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
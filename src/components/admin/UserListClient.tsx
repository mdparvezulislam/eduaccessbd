"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Search, 
  Trash2, 
  MoreHorizontal, 
  Shield, 
  Loader2,
  Mail,
  Phone
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

import { EditUserDialog } from "./EditUserDialog";

// 1. Defined Interface locally to match your Mongoose Model exactly
// You can move this to @/types if preferred, but this ensures it works here immediately.
interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "ADMIN"; // Matches your Mongoose Enum
  image?: string;
  createdAt?: string; // Optional because it comes from timestamps
}

export default function UserListClient() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users",{
        cache:"force-cache",
        next:{revalidate:60}
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Fetch error", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Delete User
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("User deleted successfully");
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  // 3. Update Handler (Passed to Edit Dialog)
  const handleUserUpdated = (updatedUser: IUser) => {
    setUsers((prev) => 
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
  };

  // 4. Filtering
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    (user.phone && user.phone.includes(search))
  );

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* --- HEADER CONTROLS --- */}
      <div className="flex items-center gap-2 bg-[#111] p-1 rounded-xl border border-gray-800">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          placeholder="Search name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-gray-600"
        />
        <div className="text-sm text-gray-500 font-mono whitespace-nowrap">
          {filteredUsers.length} Users
        </div>
      </div>

      {/* --- DESKTOP TABLE --- */}
      <div className="hidden md:block rounded-xl border border-gray-800 bg-[#0a0a0a] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#111]">
            <TableRow className="border-gray-800 hover:bg-[#111]">
              <TableHead className="text-gray-400">User</TableHead>
              <TableHead className="text-gray-400">Contact</TableHead>
              <TableHead className="text-gray-400">Role</TableHead>
              <TableHead className="text-gray-400">Joined</TableHead>
              <TableHead className="text-right text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user:IUser) => (
              <TableRow key={user._id} className="border-gray-800 hover:bg-[#111] transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-gray-700">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="bg-gray-800 text-gray-400">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 font-mono">ID: {user._id.slice(-6)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-sm text-gray-300">
                      <Mail className="w-3 h-3 mr-2 text-gray-500" /> {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center text-sm text-gray-300">
                        <Phone className="w-3 h-3 mr-2 text-gray-500" /> {user.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`
                    ${user.role === 'ADMIN' ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' : 'border-gray-700 text-gray-400'}
                  `}>
                    {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                    {user.role.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <EditUserDialog user={user} onUpdate={handleUserUpdated} />
                    
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-red-500 hover:bg-red-900/20 hover:text-red-400"
                      onClick={() => handleDelete(user._id)}
                      disabled={deletingId === user._id}
                    >
                      {deletingId === user._id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE CARDS --- */}
      <div className="md:hidden grid gap-4">
        {filteredUsers.map((user:IUser) => (
          <Card key={user._id} className="bg-[#111] border-gray-800">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-gray-700">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-gray-800 text-gray-400">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-white">{user.name}</p>
                    <Badge variant="outline" className={`mt-1 text-[10px] h-5 
                      ${user.role === 'ADMIN' ? 'border-purple-500 text-purple-400' : 'border-gray-600 text-gray-400'}
                    `}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                {/* Actions Dropdown for Mobile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-gray-800 text-white">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <button 
                        className="w-full flex items-center text-red-500 hover:bg-red-900/20 px-2 py-1.5 rounded-sm text-sm"
                        onClick={() => handleDelete(user._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete User
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {user.phone}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                 <div className="w-full">
                   {/* Passed fullWidth prop for mobile button styling */}
                   <EditUserDialog user={user} onUpdate={handleUserUpdated} fullWidth />
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
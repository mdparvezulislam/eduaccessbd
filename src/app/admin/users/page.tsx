"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  Search, Trash2, MoreHorizontal, Shield, Loader2,
  Mail, Phone, ChevronLeft, ChevronRight, Users 
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EditUserDialog } from "@/components/admin/EditUserDialog";



// Types
interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "ADMIN";
  image?: string;
  createdAt?: string;
}

interface PaginationMeta {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export default function UserListClient() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    totalUsers: 0, totalPages: 1, currentPage: 1, pageSize: 22
  });

  // Debounce Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on new search
      fetchUsers(1, search);
    }, 500); // 500ms delay
    return () => clearTimeout(timer);
  }, [search]);

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
      fetchUsers(newPage, search);
    }
  };

  // 1. Fetch Users (Optimized)
  const fetchUsers = async (pageParam = 1, searchParam = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: "10",
        search: searchParam
      });

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
        setMeta(data.pagination);
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

  // 2. Delete User
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        toast.success("User deleted successfully");
        // Refresh current page
        fetchUsers(page, search);
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  // 3. Update Handler
  const handleUserUpdated = (updatedUser: IUser) => {
    setUsers((prev) => 
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
  };

  return (
    <div className="space-y-6">
      
      {/* --- HEADER CONTROLS --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111] p-4 rounded-xl border border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-purple-500/50"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 whitespace-nowrap">
          <Users className="w-3.5 h-3.5" />
          {meta.totalUsers} Total Users
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-3 bg-[#0a0a0a] rounded-xl border border-white/5">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-xs text-gray-500">Loading users...</p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-[#111]">
                <TableRow className="border-white/5 hover:bg-[#111]">
                  <TableHead className="text-gray-400 font-medium">User Profile</TableHead>
                  <TableHead className="text-gray-400 font-medium">Contact Details</TableHead>
                  <TableHead className="text-gray-400 font-medium">Role</TableHead>
                  <TableHead className="text-gray-400 font-medium">Joined Date</TableHead>
                  <TableHead className="text-right text-gray-400 font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500 text-xs">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id} className="border-white/5 hover:bg-[#111] transition-colors group">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-white/10">
                            <AvatarImage src={user.image} />
                            <AvatarFallback className="bg-gray-800 text-gray-400 text-xs">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white text-sm">{user.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono">ID: {user._id.slice(-6)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs text-gray-300">
                            <Mail className="w-3 h-3 mr-2 text-gray-500" /> {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-xs text-gray-300">
                              <Phone className="w-3 h-3 mr-2 text-gray-500" /> {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`h-6 px-2 text-[10px] uppercase tracking-wide border
                          ${user.role === 'ADMIN' 
                            ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' 
                            : 'border-gray-700 text-gray-400 bg-gray-800/30'}
                        `}>
                          {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <EditUserDialog user={user} onUpdate={handleUserUpdated} />
                          
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDelete(user._id)}
                            disabled={deletingId === user._id}
                          >
                            {deletingId === user._id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden grid gap-3">
            {users.length === 0 ? (
              <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <Card key={user._id} className="bg-[#0a0a0a] border-white/10 shadow-none">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-white/10">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="bg-gray-800 text-gray-400">
                            {user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-white text-sm">{user.name}</p>
                          <Badge variant="outline" className={`mt-1 text-[9px] h-5 px-1.5 uppercase
                            ${user.role === 'ADMIN' ? 'border-purple-500 text-purple-400' : 'border-gray-700 text-gray-500'}
                          `}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 -mr-2">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <button 
                              className="w-full flex items-center text-red-500 hover:bg-red-900/20 px-2 py-1.5 rounded-sm text-xs"
                              onClick={() => handleDelete(user._id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete User
                            </button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2 text-xs text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" /> <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" /> {user.phone}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                       <div className="w-full">
                         <EditUserDialog user={user} onUpdate={handleUserUpdated} fullWidth />
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* --- PAGINATION CONTROLS --- */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="text-[10px] text-gray-500 font-mono hidden sm:block">
                Page {page} of {meta.totalPages}
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 border-white/10 bg-[#0a0a0a] text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                    .map((p, i, arr) => (
                      <div key={p} className="flex items-center">
                        {i > 0 && p - arr[i - 1] > 1 && <span className="text-gray-600 text-xs px-1">..</span>}
                        <button
                          onClick={() => handlePageChange(p)}
                          className={`h-8 w-8 rounded-md text-xs font-medium transition-all font-mono ${
                            page === p
                              ? "bg-white text-black font-bold border border-white"
                              : "text-gray-400 hover:bg-white/10 hover:text-white border border-transparent"
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    ))}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === meta.totalPages}
                  className="h-8 w-8 p-0 border-white/10 bg-[#0a0a0a] text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
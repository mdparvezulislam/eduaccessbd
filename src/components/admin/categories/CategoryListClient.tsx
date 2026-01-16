"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ImageIcon
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card"; // Import Card for mobile view

export default function CategoryListClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? Products in this category might lose their link.")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Category deleted");
        setData((prev) => prev.filter((c) => c._id !== id));
        router.refresh();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-4">
      
      {/* --- HEADER ACTIONS --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111] p-4 rounded-xl border border-gray-800">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search categories..."
            className="pl-9 bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-green-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/admin/categories/new" className="w-full sm:w-auto">
          <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-white font-semibold">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </Link>
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block rounded-xl border border-gray-800 bg-[#0a0a0a] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#111]">
            <TableRow className="border-gray-800 hover:bg-[#111]">
              <TableHead className="w-[80px] text-gray-400">Icon</TableHead>
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">Slug</TableHead>
              <TableHead className="text-gray-400">Description</TableHead>
              <TableHead className="text-right text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((cat) => (
                <TableRow key={cat._id} className="border-gray-800 hover:bg-[#111] transition-colors">
                  <TableCell>
                    <Avatar className="h-10 w-10 rounded-lg border border-gray-700 bg-gray-900">
                      <AvatarImage src={cat.image} className="object-cover" />
                      <AvatarFallback className="rounded-lg bg-gray-800 text-gray-400">
                        <ImageIcon className="w-4 h-4"/>
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-white">{cat.name}</TableCell>
                  <TableCell>
                    <code className="relative rounded bg-gray-900 px-[0.4rem] py-[0.2rem] font-mono text-xs text-green-500 border border-gray-800">
                      {cat.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm max-w-[300px] truncate">
                    {cat.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-gray-500 hover:text-white hover:bg-gray-800">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-gray-800 text-white w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link href={`/admin/categories/${cat._id}`}>
                          <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white">
                            <Pencil className="mr-2 h-4 w-4 text-blue-400" /> Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                          className="text-red-500 hover:bg-red-900/20 focus:bg-red-900/20 cursor-pointer"
                          onClick={() => handleDelete(cat._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE CARD VIEW --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredData.length === 0 ? (
           <div className="text-center p-8 text-gray-500 bg-[#111] rounded-xl border border-dashed border-gray-800">
             No categories found.
           </div>
        ) : (
          filteredData.map((cat) => (
            <Card key={cat._id} className="bg-[#111] border-gray-800 text-white">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-lg border border-gray-700 bg-gray-900">
                      <AvatarImage src={cat.image} className="object-cover" />
                      <AvatarFallback className="rounded-lg bg-gray-800 text-gray-400">
                        <ImageIcon className="w-5 h-5"/>
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-white text-lg">{cat.name}</h3>
                      <code className="text-xs text-green-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                        /{cat.slug}
                      </code>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-gray-800 text-white">
                      <Link href={`/admin/categories/${cat._id}`}>
                        <DropdownMenuItem className="cursor-pointer">Edit</DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={() => handleDelete(cat._id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {cat.description && (
                  <div className="text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-gray-800">
                    {cat.description}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}
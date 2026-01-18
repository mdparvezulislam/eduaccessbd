"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Search, Trash2, Loader2, Package, User, Phone } from "lucide-react";
import { columns, OrderColumn } from "./columns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OrdersClientProps {
  data: OrderColumn[];
}

export function OrdersClient({ data }: OrdersClientProps) {
  const router = useRouter();
  const [orders, setOrders] = React.useState<OrderColumn[]>(data);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  // --- DELETE HANDLER ---
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Order deleted");
        setOrders((prev) => prev.filter((o) => o._id !== id));
        router.refresh();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoadingId(null);
    }
  };

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
    // ⚡ SUPER SEARCH: Searches ID, Email, Name, Phone, and Product Title
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      
      const txId = String(row.original.transactionId).toLowerCase();
      
      // User Details
      const email = String(row.original.user?.email || "").toLowerCase();
      const name = String(row.original.user?.name || "").toLowerCase();
      const phone = String(row.original.user?.phone || "").toLowerCase();
      
      // Product Titles
      const hasProduct = row.original.products?.some(p => p.title.toLowerCase().includes(search));
      
      return txId.includes(search) || email.includes(search) || name.includes(search) || phone.includes(search) || hasProduct;
    },
  });

  return (
    <div className="space-y-4 px-0 w-full"> 
      
      {/* --- HEADER & SEARCH --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111] p-3 rounded-lg border border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <Input
            placeholder="Search Name, Phone, ID..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9 w-full bg-black/50 border-white/10 text-white text-xs focus-visible:ring-1 focus-visible:ring-green-500/50"
          />
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {table.getFilteredRowModel().rows.length} Records
        </div>
      </div>

      {/* --- DESKTOP VIEW (Table) --- */}
      <div className="hidden md:block rounded-lg border border-white/10 bg-[#0f0f0f] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#151515]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-400 font-medium text-[11px] uppercase tracking-wider h-10">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                <TableHead className="text-right text-gray-400 font-medium text-[11px] uppercase tracking-wider pr-4 h-10">Manage</TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-gray-300 text-xs py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  <TableCell className="text-right pr-2 py-2.5">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(row.original._id)} 
                      disabled={loadingId === row.original._id} 
                      className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 h-7 w-7 rounded-md transition-colors"
                    >
                      {loadingId === row.original._id ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Trash2 className="h-3.5 w-3.5"/>}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length + 1} className="h-24 text-center text-gray-500 text-xs">No orders found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW (Cards) --- */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <Card key={row.id} className="bg-[#111] border-white/10 text-white shadow-md">
              <CardContent className="p-0">
                
                {/* Header: ID + Status */}
                <div className="flex justify-between items-center bg-white/5 p-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">ID</span>
                    <span className="font-mono text-xs text-white font-bold bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                      #{row.original.transactionId.slice(-6)}
                    </span>
                  </div>
                  <div className="scale-90 origin-right">
                    {flexRender(row.getVisibleCells().find(c => c.column.id === 'status')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'status')?.getContext() as any)}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-3 space-y-2.5">
                  {/* Product */}
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-800/50 p-1.5 rounded text-gray-400 mt-0.5"><Package className="w-3.5 h-3.5"/></div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Item</p>
                      <p className="text-xs font-medium text-white line-clamp-1">{row.original.products?.[0]?.title || "Unknown Item"}</p>
                      {row.original.products.length > 1 && <span className="text-[10px] text-blue-400">+{row.original.products.length - 1} more</span>}
                    </div>
                  </div>

                  {/* Customer (Name & Phone) */}
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-800/50 p-1.5 rounded text-gray-400 mt-0.5"><User className="w-3.5 h-3.5"/></div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Customer</p>
                      <p className="text-xs text-white font-medium">{row.original.user?.name || "Guest"}</p>
                      {/* Phone Display */}
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[10px] text-gray-500">{row.original.user?.email}</span>
                         {row.original.user?.phone && (
                           <span className="text-[10px] text-blue-400 flex items-center gap-0.5">
                             <Phone className="w-2.5 h-2.5" /> {row.original.user.phone}
                           </span>
                         )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-black/20 p-3 flex items-center justify-between gap-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                     <span className="text-xs text-gray-500">Total:</span>
                     <span className="text-sm font-bold text-green-400 font-mono">৳{row.original.amount}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="scale-90 origin-right">
                       {flexRender(row.getVisibleCells().find(c => c.column.id === 'actions')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'actions')?.getContext() as any)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDelete(row.original._id)} 
                      disabled={loadingId === row.original._id}
                      className="border-red-900/30 text-red-500 hover:bg-red-950/30 bg-transparent h-8 w-8 rounded-md shrink-0"
                    >
                      {loadingId === row.original._id ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Trash2 className="h-3.5 w-3.5"/>}
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-[#111] rounded-lg border border-dashed border-white/10 text-xs">
            <Search className="h-6 w-6 mx-auto mb-2 opacity-30" />
            <p>No orders match.</p>
          </div>
        )}
      </div>

      {/* --- PAGINATION --- */}
      <div className="flex items-center justify-end gap-2 pt-2 pb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => table.previousPage()} 
          disabled={!table.getCanPreviousPage()} 
          className="border-white/10 bg-[#111] text-gray-400 hover:text-white h-7 text-[10px] px-2"
        >
          <ChevronLeft className="h-3 w-3 mr-1" /> Prev
        </Button>
        <span className="text-[10px] text-gray-600 font-mono">
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => table.nextPage()} 
          disabled={!table.getCanNextPage()} 
          className="border-white/10 bg-[#111] text-gray-400 hover:text-white h-7 text-[10px] px-2"
        >
          Next <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
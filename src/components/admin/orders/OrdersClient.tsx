"use client";

import * as React from "react";
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
import { 
  ChevronLeft, ChevronRight, Search, Trash2, Loader2, 
  Package, User, Phone, Filter, Inbox 
} from "lucide-react";
import { columns, OrderColumn } from "./columns"; // Ensure path is correct
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
  
  // ✅ 1. Add Pagination State
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 27,
  });

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
    getPaginationRowModel: getPaginationRowModel(), // ✅ Activates Pagination logic
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination, // ✅ Syncs state
    state: { 
      sorting, 
      globalFilter, 
      pagination // ✅ Pass pagination state
    },
    // ⚡ SUPER SEARCH
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const txId = String(row.original.transactionId).toLowerCase();
      const email = String(row.original.user?.email || "").toLowerCase();
      const name = String(row.original.user?.name || "").toLowerCase();
      const phone = String(row.original.user?.phone || "").toLowerCase();
      const hasProduct = row.original.products?.some(p => p.title.toLowerCase().includes(search));
      
      return txId.includes(search) || email.includes(search) || name.includes(search) || phone.includes(search) || hasProduct;
    },
  });

  // Helper for pagination numbers
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  return (
    <div className="space-y-4 px-0 w-full"> 
      
      {/* --- HEADER & SEARCH --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111] p-3 rounded-xl border border-white/10 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <Input
            placeholder="Search Order ID, Name, Phone..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9 w-full bg-[#0a0a0a] border-white/10 text-white text-xs focus-visible:ring-1 focus-visible:ring-green-500/50 rounded-lg placeholder:text-gray-600"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <Filter className="w-3 h-3" />
          {table.getFilteredRowModel().rows.length} Total Orders
        </div>
      </div>

      {/* --- DESKTOP VIEW (Table) --- */}
      <div className="hidden md:block rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#111]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-400 font-bold text-[10px] uppercase tracking-wider h-10">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                <TableHead className="text-right text-gray-400 font-bold text-[10px] uppercase tracking-wider pr-4 h-10">Manage</TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-white/5 hover:bg-[#111] transition-colors group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-gray-300 text-xs py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  <TableCell className="text-right pr-2 py-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(row.original._id)} 
                      disabled={loadingId === row.original._id} 
                      className="text-gray-600 hover:text-red-500 hover:bg-red-500/10 h-8 w-8 rounded-md transition-colors"
                    >
                      {loadingId === row.original._id ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Trash2 className="h-3.5 w-3.5"/>}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-40 text-center text-gray-500 text-xs">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox className="w-8 h-8 opacity-20" />
                    <p>No orders found matching your search.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW (Cards) --- */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <Card key={row.id} className="bg-[#0a0a0a] border-white/10 text-white shadow-none">
              <CardContent className="p-0">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-[#111] p-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">ID</span>
                    <span className="font-mono text-xs text-white font-bold bg-black px-1.5 py-0.5 rounded border border-white/10">
                      #{row.original.transactionId.slice(-6)}
                    </span>
                  </div>
                  <div className="scale-90 origin-right">
                    {flexRender(row.getVisibleCells().find(c => c.column.id === 'status')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'status')?.getContext() as any)}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-3 space-y-3">
                  {/* Product */}
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-800/40 p-1.5 rounded text-gray-400 mt-0.5"><Package className="w-3.5 h-3.5"/></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Item</p>
                      <p className="text-xs font-medium text-white line-clamp-1">{row.original.products?.[0]?.title || "Unknown Item"}</p>
                      {row.original.products[0]?.variant && (
                        <span className="text-[10px] text-green-400/80 font-mono mt-0.5 block">{row.original.products[0].variant}</span>
                      )}
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-800/40 p-1.5 rounded text-gray-400 mt-0.5"><User className="w-3.5 h-3.5"/></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Customer</p>
                      <p className="text-xs text-white font-medium">{row.original.user?.name || "Guest"}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
                         <span className="truncate max-w-[150px]">{row.original.user?.email}</span>
                         {row.original.user?.phone && (
                           <span className="text-blue-400 flex items-center gap-0.5 whitespace-nowrap">
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
                     <span className="text-[10px] text-gray-500 font-bold uppercase">Total</span>
                     <span className="text-sm font-bold text-green-400 font-mono">৳{row.original.amount}</span>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <div className="scale-90 origin-right">
                       {flexRender(row.getVisibleCells().find(c => c.column.id === 'actions')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'actions')?.getContext() as any)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDelete(row.original._id)} 
                      disabled={loadingId === row.original._id}
                      className="border-red-900/20 text-red-500 hover:bg-red-950/20 bg-transparent h-8 w-8 rounded-md shrink-0"
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
            <p>No orders found.</p>
          </div>
        )}
      </div>

      {/* --- ✅ NUMBERED PAGINATION CONTROLS --- */}
      {pageCount > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          
          <div className="text-[10px] text-gray-500 font-mono">
            Page {pageIndex + 1} of {pageCount}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()} 
              className="h-8 w-8 p-0 border-white/10 bg-[#111] text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: pageCount }, (_, i) => i).map((page) => {
                // Logic: Show first, last, and pages around current
                if (page === 0 || page === pageCount - 1 || Math.abs(page - pageIndex) <= 1) {
                  return (
                    <button
                      key={page}
                      onClick={() => table.setPageIndex(page)}
                      className={`h-8 w-8 rounded-md text-xs font-medium transition-all font-mono ${
                        pageIndex === page
                          ? "bg-white text-black font-bold border border-white"
                          : "text-gray-400 hover:bg-white/10 hover:text-white border border-transparent"
                      }`}
                    >
                      {page + 1}
                    </button>
                  );
                }
                // Ellipsis logic
                if (Math.abs(page - pageIndex) === 2) {
                  return <span key={page} className="text-gray-600 text-xs px-1">..</span>;
                }
                return null;
              })}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()} 
              className="h-8 w-8 p-0 border-white/10 bg-[#111] text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
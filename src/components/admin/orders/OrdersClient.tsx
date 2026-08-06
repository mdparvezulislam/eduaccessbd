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
  Package, User, Phone, Filter, Inbox, FileImage, ShieldCheck, Clock, XCircle
} from "lucide-react";
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
  const [proofFilter, setProofFilter] = React.useState("all");

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 15,
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

  // Filter orders by proof status
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const proof = order.paymentProof;
      if (proofFilter === "uploaded") return !!proof?.url;
      if (proofFilter === "missing") return !proof?.url;
      if (proofFilter === "verified") return proof?.verificationStatus === "verified";
      if (proofFilter === "pending") return proof?.verificationStatus === "pending" || (!proof?.verificationStatus && order.status === "pending");
      if (proofFilter === "rejected") return proof?.verificationStatus === "rejected";
      return true;
    });
  }, [orders, proofFilter]);

  // Statistics counts
  const stats = React.useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const hasProof = orders.filter((o) => !!o.paymentProof?.url).length;
    const verified = orders.filter((o) => o.paymentProof?.verificationStatus === "verified").length;
    return { total, pending, hasProof, verified };
  }, [orders]);

  const table = useReactTable({
    data: filteredOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: { 
      sorting, 
      globalFilter, 
      pagination
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const txId = String(row.original.transactionId || "").toLowerCase();
      const email = String(row.original.user?.email || "").toLowerCase();
      const name = String(row.original.user?.name || "").toLowerCase();
      const phone = String(row.original.user?.phone || "").toLowerCase();
      const proofName = String(row.original.paymentProof?.originalName || "").toLowerCase();
      const hasProduct = row.original.products?.some(p => p.title.toLowerCase().includes(search));
      
      return txId.includes(search) || email.includes(search) || name.includes(search) || phone.includes(search) || proofName.includes(search) || hasProduct;
    },
  });

  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  return (
    <div className="space-y-4 w-full"> 
      
      {/* --- QUICK STATS SUMMARY BANNER --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111] border border-white/10 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-mono font-bold">Total Orders</p>
            <p className="text-base font-bold text-white font-mono">{stats.total}</p>
          </div>
        </div>

        <div className="bg-[#111] border border-white/10 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-mono font-bold">Pending Review</p>
            <p className="text-base font-bold text-amber-400 font-mono">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-[#111] border border-white/10 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <FileImage className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-mono font-bold">Has Proof</p>
            <p className="text-base font-bold text-pink-400 font-mono">{stats.hasProof}</p>
          </div>
        </div>

        <div className="bg-[#111] border border-white/10 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-mono font-bold">Verified Paid</p>
            <p className="text-base font-bold text-emerald-400 font-mono">{stats.verified}</p>
          </div>
        </div>
      </div>

      {/* --- CONTROLS & SEARCH BAR --- */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#111] p-3.5 rounded-xl border border-white/10">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <Input
            placeholder="Search Order ID, Name, Phone..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9 w-full bg-[#0a0a0a] border-white/10 text-white text-xs focus-visible:ring-1 focus-visible:ring-emerald-500/50 rounded-lg placeholder:text-gray-600"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full md:w-auto">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending Verification" },
            { id: "uploaded", label: "Has Proof" },
            { id: "verified", label: "Verified" },
            { id: "rejected", label: "Rejected" },
            { id: "missing", label: "No Proof" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setProofFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                proofFilter === tab.id
                  ? "bg-white text-black border-white shadow-md font-bold"
                  : "bg-[#0a0a0a] text-gray-400 border-white/10 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#141414]">
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
                      className="text-gray-600 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 rounded-md transition-colors"
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
                    <p>No orders found matching filter criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE CARDS VIEW --- */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <Card key={row.id} className="bg-[#0a0a0a] border-white/10 text-white shadow-none rounded-xl overflow-hidden">
              <CardContent className="p-0">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-[#141414] p-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">ID</span>
                    <span className="font-mono text-xs text-white font-bold bg-black px-1.5 py-0.5 rounded border border-white/10">
                      #{row.original.transactionId || row.original._id.slice(-6)}
                    </span>
                  </div>
                  <div className="scale-90 origin-right">
                    {flexRender(row.getVisibleCells().find(c => c.column.id === 'status')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'status')?.getContext() as any)}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-3.5 space-y-3">
                  {/* Product */}
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-800/40 p-1.5 rounded text-gray-400 mt-0.5"><Package className="w-3.5 h-3.5"/></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Item</p>
                      <p className="text-xs font-medium text-white line-clamp-1">{row.original.products?.[0]?.title || "Unknown Item"}</p>
                      {row.original.products?.[0]?.variant && (
                        <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">{row.original.products[0].variant}</span>
                      )}
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-800/40 p-1.5 rounded text-gray-400 mt-0.5"><User className="w-3.5 h-3.5"/></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Customer</p>
                      <p className="text-xs text-white font-medium">{row.original.user?.name || "Guest"}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                         <span className="truncate max-w-[160px]">{row.original.user?.email}</span>
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
                <div className="bg-black/40 p-3 flex items-center justify-between gap-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] text-gray-500 font-bold uppercase">Total</span>
                     <span className="text-sm font-bold text-emerald-400 font-mono">৳{row.original.amount}</span>
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
                      className="border-red-900/30 text-red-400 hover:bg-red-950/30 bg-transparent h-8 w-8 rounded-md shrink-0"
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
            <p>No orders found matching filter criteria.</p>
          </div>
        )}
      </div>

      {/* --- NUMBERED PAGINATION CONTROLS --- */}
      {pageCount > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          
          <div className="text-[10px] text-gray-500 font-mono">
            Page {pageIndex + 1} of {pageCount} ({filteredOrders.length} total)
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
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Search, Trash2, SlidersHorizontal, Loader2 } from "lucide-react";
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

  // --- DELETE ---
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
    // ⚡ FIX: Safe Search Logic
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const txId = String(row.original.transactionId).toLowerCase();
      const email = String(row.original.user?.email || "").toLowerCase();
      // Check if ANY product in the array matches
      const hasProduct = row.original.products?.some(p => p.title.toLowerCase().includes(search));
      return txId.includes(search) || email.includes(search) || hasProduct;
    },
  });

  return (
    <div className="space-y-4 px-0 w-full"> 
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111] p-4 rounded-xl border border-white/10">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search ID, Email, Product..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-10 w-full bg-black/50 border-white/10 text-white focus-visible:ring-1 focus-visible:ring-green-500/50"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-white/10 bg-[#0f0f0f] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#151515]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-400 font-medium text-xs uppercase tracking-wider">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                <TableHead className="text-right text-gray-400 font-medium text-xs uppercase tracking-wider pr-6">Manage</TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-gray-300 text-sm py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  <TableCell className="text-right pr-4">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original._id)} disabled={loadingId === row.original._id} className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 h-8 w-8">
                      {loadingId === row.original._id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length + 1} className="h-32 text-center text-gray-500">No orders found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards (Simplified for brevity) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <Card key={row.id} className="bg-[#111] border-white/10 text-white">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-mono text-sm">#{row.original.transactionId.slice(-6)}</span>
                <span className="font-bold text-green-400">৳{row.original.amount}</span>
              </div>
              <div className="text-sm text-gray-400">{row.original.products[0]?.title}</div>
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <div className="flex-1">{flexRender(row.getVisibleCells().find(c => c.column.id === 'actions')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'actions')?.getContext() as any)}</div>
                <Button variant="outline" size="icon" onClick={() => handleDelete(row.original._id)} className="border-red-900/30 text-red-500"><Trash2 className="h-4 w-4"/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="bg-[#111] border-white/10 text-white">Previous</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="bg-[#111] border-white/10 text-white">Next</Button>
      </div>
    </div>
  );
}
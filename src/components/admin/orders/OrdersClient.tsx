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
import { ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";
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
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  // --- DELETE HANDLER ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Order deleted");
        setOrders((prev) => prev.filter((order) => order._id !== id));
        router.refresh();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
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
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, columnFilters, globalFilter },
    globalFilterFn: (row, columnId, filterValue) => {
      const txId = row.original.transactionId.toLowerCase();
      const email = row.original.user.email.toLowerCase();
      const search = filterValue.toLowerCase();
      return txId.includes(search) || email.includes(search);
    },
  });

  return (
    <div className="space-y-4 px-0"> {/* ✅ PX-0 ensures it fits full width */}
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111] p-4 rounded-xl border border-gray-800">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search Transaction ID or Email..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 h-10 w-full bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-green-500/50"
          />
        </div>
      </div>

      {/* --- DESKTOP VIEW (Table) --- */}
      <div className="hidden md:block rounded-xl border border-gray-800 bg-[#0a0a0a] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#111]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-800 hover:bg-[#111]">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-400 font-medium text-white">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                <TableHead className="text-right text-white font-medium">Actions</TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-gray-800 hover:bg-[#111] transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-gray-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(row.original._id)}
                      disabled={loadingId === row.original._id}
                      className="text-red-500 hover:bg-red-900/20 hover:text-red-400"
                    >
                      {loadingId === row.original._id ? (
                        <span className="animate-spin text-xs">...</span>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center text-gray-500">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW (Cards) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <Card key={row.id} className="bg-[#111] border-gray-800 text-white">
              <CardContent className="p-4 space-y-4">
                
                {/* Header: ID + Status */}
                <div className="flex justify-between items-start border-b border-gray-800 pb-3">
                  <div className="min-w-0 pr-2"> {/* Prevents overflow */}
                    <p className="font-mono text-xs text-gray-500">ID: #{row.original.transactionId.slice(-8)}</p>
                    <h3 className="font-bold text-white mt-1 truncate max-w-[200px]">{row.original.product.title}</h3>
                  </div>
                  <div className="scale-90 origin-top-right shrink-0">
                    {flexRender(row.getVisibleCells().find(c => c.column.id === 'status')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'status')?.getContext() as any)}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wider">Customer</span>
                    <span className="font-medium text-white">{row.original.user.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 block text-xs uppercase tracking-wider">Amount</span>
                    <span className="font-bold text-green-500">৳{row.original.amount}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex gap-3 pt-3 border-t border-gray-800">
                  <div className="flex-1 text-white [&_button]:text-white">
                     {/* Renders the "Verify/Details" Button from Columns. 
                         Ensure your column definition uses neutral or white text buttons */}
                     {flexRender(row.getVisibleCells().find(c => c.column.id === 'actions')?.column.columnDef.cell, row.getVisibleCells().find(c => c.column.id === 'actions')?.getContext() as any)}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(row.original._id)}
                    disabled={loadingId === row.original._id}
                    className="border-red-900/30 text-red-500 hover:bg-red-900/20 bg-transparent shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 text-gray-500 bg-[#111] rounded-xl border border-dashed border-gray-800">
            No orders found.
          </div>
        )}
      </div>

      {/* --- PAGINATION --- */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 py-4">
        <div className="text-sm text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-gray-800 bg-[#111] text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-gray-800 bg-[#111] text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
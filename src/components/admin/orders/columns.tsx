"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Copy, CheckCircle2, XCircle, Clock, Package } from "lucide-react";
import { OrderActionModal } from "./OrderActionModal"; 
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ✅ Updated Type to match your Order Model
export type OrderColumn = {
  _id: string;
  transactionId: string;
  amount: number;
  status: "pending" | "completed" | "declined" | "cancelled" | "processing";
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  // ✅ Products is an Array now
  products: {
    title: string;
    quantity: number;
    variant?: string;
  }[];
  deliveredContent?: {
    accountEmail?: string;
    accountPassword?: string;
    downloadLink?: string;
    accessNotes?: string;
  };
};

export const columns: ColumnDef<OrderColumn>[] = [
  // 1. Transaction ID
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
    cell: ({ row }) => {
      const id = row.getValue("transactionId") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-white bg-[#1a1a1a] px-2 py-1 rounded border border-white/10">
            {id}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-500 hover:text-white hover:bg-white/10"
            onClick={() => {
              navigator.clipboard.writeText(id);
              toast.success("Copied ID");
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      );
    },
  },

  // 2. Customer
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-gray-200">{user?.name || "Guest"}</span>
          <span className="text-[11px] text-gray-500">{user?.email || "No Email"}</span>
        </div>
      );
    },
  },

  // 3. Products (Safe Array Handling)
  {
    id: "products",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.products || [];
      const firstItem = items[0];

      if (!firstItem) return <span className="text-gray-600 text-xs">Empty</span>;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col cursor-help">
                <div className="flex items-center gap-2">
                  <Package className="w-3 h-3 text-gray-500" />
                  <span className="font-medium text-gray-300 text-sm truncate max-w-[150px]">
                    {firstItem.quantity}x {firstItem.title}
                  </span>
                </div>
                {/* Badge for extra items */}
                {items.length > 1 && (
                  <span className="text-[10px] text-blue-400 font-medium ml-5">
                    +{items.length - 1} more
                  </span>
                )}
                {/* Variant badge */}
                {items.length === 1 && firstItem.variant && (
                  <span className="text-[10px] text-gray-500 ml-5">
                    {firstItem.variant}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a1a1a] border-white/10 text-white text-xs p-3">
              <p className="font-bold mb-1 border-b border-white/10 pb-1">Order Contents:</p>
              <ul className="space-y-1">
                {items.map((item, idx) => (
                  <li key={idx} className="flex justify-between gap-4">
                    <span>{item.quantity}x {item.title}</span>
                    <span className="text-gray-400">{item.variant}</span>
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },

  // 4. Amount
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-400 hover:text-white hover:bg-transparent pl-0 text-xs uppercase"
        >
          Amount
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        minimumFractionDigits: 0,
      }).format(amount);
      return <div className="font-mono font-bold text-green-400">{formatted}</div>;
    },
  },

  // 5. Status
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const styles: Record<string, string> = {
        pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        completed: "bg-green-500/10 text-green-400 border-green-500/20",
        declined: "bg-red-500/10 text-red-400 border-red-500/20",
        cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      };
      
      return (
        <Badge className={`${styles[status] || "bg-gray-800"} border px-2 py-0.5 text-[10px] uppercase font-bold`}>
          {status}
        </Badge>
      );
    },
  },

  // 6. Action Modal
  {
    id: "actions",
    header: () => <div className="text-right text-xs uppercase text-gray-400">Manage</div>,
    cell: ({ row }) => <div className="flex justify-end"><OrderActionModal order={row.original} /></div>,
  },
];
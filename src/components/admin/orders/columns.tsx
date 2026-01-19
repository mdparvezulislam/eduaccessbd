"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpDown, Copy, CheckCircle2, XCircle, Clock, 
  Package, Phone, Mail, User, AlertCircle, Eye
} from "lucide-react";
import { OrderActionModal } from "./OrderActionModal"; // Ensure this path matches your project
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ✅ Updated Type Definition
export type OrderColumn = {
  _id: string;
  transactionId: string;
  amount: number;
  status: "pending" | "completed" | "declined" | "cancelled" | "processing";
  createdAt: string;
  
  // ✅ User Object
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  
  // ✅ Products Array
  products: {
    title: string;
    quantity: number;
    price: number;
    variant?: string; // e.g. "Account Access", "Monthly"
  }[];
  
  // Delivery Info (Optional, but good to have in type)
  deliveredContent?: {
    accountEmail?: string;
    accountPassword?: string;
    downloadLink?: string;
    accessNotes?: string;
  };
};

export const columns: ColumnDef<OrderColumn>[] = [
  // 1. Transaction ID & Date
  {
    accessorKey: "transactionId",
    header: "Order Info",
    cell: ({ row }) => {
      const id = row.getValue("transactionId") as string;
      const date = new Date(row.original.createdAt).toLocaleDateString("en-GB", {
        day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute:'2-digit'
      });

      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 group">
            <span className="font-mono text-xs font-bold text-white bg-[#1a1a1a] px-2 py-0.5 rounded border border-white/10 group-hover:border-blue-500/30 transition-colors">
              {id}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(id);
                toast.success("ID Copied");
              }}
              className="text-gray-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <span className="text-[10px] text-gray-500 pl-0.5">{date}</span>
        </div>
      );
    },
  },

  // 2. Customer Details
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex flex-col gap-1 min-w-[140px]">
          <div className="flex items-center gap-1.5">
            <div className="bg-white/5 p-1 rounded-full shrink-0 border border-white/5">
              <User className="w-3 h-3 text-gray-300" />
            </div>
            <span className="font-semibold text-sm text-gray-200 truncate max-w-[120px]" title={user?.name}>
              {user?.name || "Guest"}
            </span>
          </div>
          
          <div className="flex flex-col gap-0.5 ml-1">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Mail className="w-2.5 h-2.5" />
              <span className="truncate max-w-[140px]" title={user?.email}>{user?.email || "No Email"}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-1.5 text-[11px] text-blue-400">
                <Phone className="w-2.5 h-2.5" />
                <span className="font-mono tracking-wide">{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      );
    },
  },

  // 3. Products (With Variant Visible)
  {
    id: "products",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.products || [];
      const firstItem = items[0];

      if (!firstItem) return <span className="text-gray-600 text-xs italic">Empty Order</span>;

      // Check if it's Account Access to style it differently
      const isAccount = firstItem.variant?.toLowerCase().includes("account");

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col cursor-help group max-w-[180px]">
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-md text-gray-400 group-hover:text-white transition-colors mt-0.5 ${isAccount ? "bg-purple-900/20 text-purple-400" : "bg-gray-800"}`}>
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-gray-300 text-xs truncate w-full" title={firstItem.title}>
                      {firstItem.title}
                    </span>
                    
                    {/* ✅ DISPLAY VARIANT PROMINENTLY */}
                    <span className={`text-[10px] font-mono mt-0.5 inline-flex items-center px-1.5 rounded ${
                        isAccount 
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}
                    >
                      {firstItem.variant || "Standard"}
                    </span>
                  </div>
                </div>
                {items.length > 1 && (
                  <span className="text-[10px] text-blue-400 font-medium ml-9 mt-1 flex items-center gap-1">
                    <Eye className="w-2.5 h-2.5"/> +{items.length - 1} more
                  </span>
                )}
              </div>
            </TooltipTrigger>
            
            {/* Tooltip Content */}
            <TooltipContent className="bg-[#111] border-white/10 text-white p-0 overflow-hidden shadow-2xl rounded-lg z-50">
              <div className="bg-[#1a1a1a] px-3 py-2 border-b border-white/5 text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                Full Order Contents
              </div>
              <div className="p-2 space-y-1 min-w-[200px]">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-4 text-xs py-1.5 px-2 rounded hover:bg-white/5 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-gray-200 font-medium">{item.title}</span>
                      <span className="text-[10px] text-gray-500">{item.variant || "Standard"} • x{item.quantity}</span>
                    </div>
                    <span className="font-mono text-gray-400 text-[11px]">৳{item.price}</span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },

  // 4. Amount Column
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-400 hover:text-white hover:bg-transparent pl-0 text-xs uppercase tracking-wider font-bold"
        >
          Total
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
      
      return (
        <div className="font-mono font-bold text-sm text-white tracking-tight">
          {formatted}
        </div>
      );
    },
  },

  // 5. Status Column (Badges)
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      const styles: Record<string, string> = {
        pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]",
        processing: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
        completed: "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]",
        declined: "bg-red-500/10 text-red-400 border-red-500/20",
        cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      };

      const icons: Record<string, React.ReactNode> = {
        pending: <Clock className="w-3 h-3 mr-1.5" />,
        processing: <Clock className="w-3 h-3 mr-1.5" />,
        completed: <CheckCircle2 className="w-3 h-3 mr-1.5" />,
        declined: <XCircle className="w-3 h-3 mr-1.5" />,
        cancelled: <AlertCircle className="w-3 h-3 mr-1.5" />,
      };

      return (
        <Badge 
          className={`${styles[status] || "bg-gray-800 text-gray-400"} border px-2.5 py-1 text-[10px] uppercase font-bold tracking-wide transition-all min-w-[95px] justify-center h-7`} 
          variant="outline"
        >
          {icons[status]} {status}
        </Badge>
      );
    },
  },

  // 6. Actions Column
  {
    id: "actions",
    header: () => <div className="text-right text-xs uppercase tracking-wider text-gray-500 pr-2">Action</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end pr-2">
          {/* This modal handles manual delivery override */}
          <OrderActionModal order={row.original} />
        </div>
      );
    },
  },
];
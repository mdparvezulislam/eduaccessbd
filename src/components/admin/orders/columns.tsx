"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Copy, CheckCircle2, XCircle, Clock } from "lucide-react";
import { OrderActionModal } from "./OrderActionModal"; // Ensure this path is correct
import { toast } from "sonner";

// This type must match the data shape we created in page.tsx
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
  product: {
    title: string;
  };
  deliveredContent?: {
    accountEmail?: string;
  };
};

export const columns: ColumnDef<OrderColumn>[] = [
  // 1. Transaction ID Column
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
    cell: ({ row }) => {
      const id = row.getValue("transactionId") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-white bg-[#1a1a1a] px-2 py-1 rounded border border-gray-800">
            {id}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-500 hover:text-white hover:bg-white/10"
            onClick={() => {
              navigator.clipboard.writeText(id);
              toast.success("Copied Transaction ID");
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      );
    },
  },

  // 2. User Info Column
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-gray-200">{user.name}</span>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
      );
    },
  },

  // 3. Product Column
  {
    accessorKey: "product.title",
    header: "Product",
    cell: ({ row }) => (
      <span className="font-medium text-gray-300 truncate max-w-[180px] block" title={row.original.product.title}>
        {row.original.product.title}
      </span>
    ),
  },

  // 4. Amount Column (Sortable)
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-400 hover:text-white hover:bg-transparent pl-0"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      // Format as Bangladeshi Taka
      const formatted = new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        minimumFractionDigits: 0,
      }).format(amount);
      return <div className="font-bold text-green-500">{formatted}</div>;
    },
  },

  // 5. Status Column (Styled Badges for Dark Mode)
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      const styles: Record<string, string> = {
        pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
        processing: "bg-blue-400/10 text-blue-400 border-blue-400/20",
        completed: "bg-green-400/10 text-green-400 border-green-400/20",
        declined: "bg-red-400/10 text-red-400 border-red-400/20",
        cancelled: "bg-gray-400/10 text-gray-400 border-gray-400/20",
      };

      const icons: Record<string, React.ReactNode> = {
        pending: <Clock className="w-3 h-3 mr-1" />,
        processing: <Clock className="w-3 h-3 mr-1" />,
        completed: <CheckCircle2 className="w-3 h-3 mr-1" />,
        declined: <XCircle className="w-3 h-3 mr-1" />,
      };

      return (
        <Badge 
          className={`${styles[status] || "bg-gray-800 text-gray-400"} border px-2 py-0.5 text-[10px] uppercase font-bold`} 
          variant="outline"
        >
          {icons[status]} {status}
        </Badge>
      );
    },
  },

  // 6. Actions Column (The Modal Trigger)
  {
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex justify-end">
          <OrderActionModal order={order} />
        </div>
      );
    },
  },
];
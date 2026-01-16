"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function RecentPayments() {
  // In a real app, you might pass 'orders' here too if you want to show a list
  // For now, mirroring the "Empty / Placeholder" look from the screenshot
  return (
    <Card className="bg-[#111] border-gray-800 h-full min-h-[300px]">
      <CardHeader>
        <CardTitle className="text-lg text-white flex justify-between">
          Recent Payments <CreditCard className="w-4 h-4 text-gray-500"/>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-[200px] text-gray-500">
        <CreditCard className="w-10 h-10 mb-2 opacity-20" />
        <p className="text-sm">No recent payments</p>
      </CardContent>
    </Card>
  );
}
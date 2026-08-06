"use client";

import React from "react";
import { 
  CheckCircle2, Clock, XCircle, FileImage, ShieldCheck, 
  ShoppingBag, Key, AlertCircle 
} from "lucide-react";
import { IOrder } from "@/types";

interface OrderTimelineProps {
  order: IOrder;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const isFree = order.amount === 0 || order.paymentMethod?.toLowerCase().includes("free");
  const hasProof = !!order.paymentProof?.url;
  const verificationStatus = order.paymentProof?.verificationStatus || "none";

  // Build timeline steps
  const steps = [
    {
      id: "created",
      title: "Order Placed",
      subtitle: new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
      }),
      status: "completed",
      icon: ShoppingBag,
    },
    {
      id: "payment",
      title: isFree ? "Free Order Confirmed" : `Payment Submitted (${order.paymentMethod})`,
      subtitle: isFree ? "Instant Access Granted" : `TrxID: ${order.transactionId || "Pending"}`,
      status: "completed",
      icon: ShieldCheck,
    },
  ];

  if (!isFree) {
    if (hasProof) {
      steps.push({
        id: "proof",
        title: "Screenshot Uploaded",
        subtitle: order.paymentProof?.uploadedAt 
          ? new Date(order.paymentProof.uploadedAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            })
          : "Attached by customer",
        status: "completed",
        icon: FileImage,
      });
    } else {
      steps.push({
        id: "proof",
        title: "Screenshot Optional",
        subtitle: "No image attached yet",
        status: order.status === "completed" ? "completed" : "pending",
        icon: FileImage,
      });
    }
  }

  // Admin Verification Step
  if (order.status === "completed") {
    steps.push({
      id: "verification",
      title: "Payment Verified",
      subtitle: order.paymentProof?.verifiedAt 
        ? `Verified on ${new Date(order.paymentProof.verifiedAt).toLocaleDateString("en-GB")}`
        : "Confirmed by admin",
      status: "completed",
      icon: CheckCircle2,
    });
    steps.push({
      id: "delivery",
      title: "Access Delivered",
      subtitle: "Digital credentials & links active",
      status: "completed",
      icon: Key,
    });
  } else if (order.status === "declined" || order.status === "cancelled" || verificationStatus === "rejected") {
    steps.push({
      id: "verification",
      title: verificationStatus === "rejected" ? "Payment Screenshot Rejected" : "Order Declined",
      subtitle: order.paymentProof?.rejectionReason || "Please verify your payment details",
      status: "error",
      icon: XCircle,
    });
  } else {
    steps.push({
      id: "verification",
      title: "Admin Reviewing",
      subtitle: "Verification in progress (Within 12 hours)",
      status: "active",
      icon: Clock,
    });
  }

  return (
    <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 space-y-3">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-2">
        <span>Order Timeline & Verification</span>
        <span className="font-mono text-[10px] text-gray-500">{steps.length} Steps</span>
      </h4>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;

          let bulletStyle = "bg-[#111] text-gray-500 border-white/20";
          let textStyle = "text-gray-400";

          if (step.status === "completed") {
            bulletStyle = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
            textStyle = "text-white";
          } else if (step.status === "active") {
            bulletStyle = "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse";
            textStyle = "text-amber-200 font-bold";
          } else if (step.status === "error") {
            bulletStyle = "bg-red-500/20 text-red-400 border-red-500/40";
            textStyle = "text-red-300 font-bold";
          }

          return (
            <div key={step.id} className="relative flex items-start gap-3">
              {/* Bullet Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 z-10 ${bulletStyle}`}
              >
                <Icon className="w-3 h-3" />
              </div>

              {/* Step Info */}
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold ${textStyle}`}>
                  {step.title}
                </p>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

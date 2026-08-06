"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Maximize2, ZoomIn, ZoomOut, RotateCw, ExternalLink, Download, Copy, Check
} from "lucide-react";
import { toast } from "sonner";

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  fileName?: string;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  imageUrl,
  title = "Payment Proof Screenshot",
  fileName = "payment-proof.png",
}: ImageLightboxModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    toast.success("Image URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (err) {
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] bg-black/95 border-white/10 text-white p-0 overflow-hidden shadow-2xl backdrop-blur-xl">
        <DialogHeader className="p-4 border-b border-white/10 bg-[#0a0a0a] flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-pink-400" />
            <span>{title}</span>
          </DialogTitle>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1 sm:gap-2 mr-6">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              className="h-8 w-8 border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              className="h-8 w-8 border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRotate}
              className="h-8 w-8 border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
              title="Rotate 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2.5 text-[10px] font-mono border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 hidden sm:inline-flex"
            >
              Reset ({Math.round(zoom * 100)}%)
            </Button>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyUrl}
              className="h-8 w-8 border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
              title="Copy Image URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleDownload}
              className="h-8 w-8 border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
              title="Download Image"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              asChild
              variant="outline"
              size="icon"
              className="h-8 w-8 border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
              title="Open Original"
            >
              <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </DialogHeader>

        {/* Viewport */}
        <div className="relative w-full h-[65vh] sm:h-[75vh] flex items-center justify-center p-4 overflow-auto bg-[#050505] scrollbar-thin">
          <img
            src={imageUrl}
            alt={title}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease-out",
            }}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

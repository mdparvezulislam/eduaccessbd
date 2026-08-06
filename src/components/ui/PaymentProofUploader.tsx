"use client";

import React, { useCallback, useRef, useState, DragEvent } from "react";
import { upload } from "@imagekit/next";
import { 
  UploadCloud, Image as ImageIcon, X, RefreshCw, CheckCircle2, 
  AlertCircle, Camera, ShieldCheck, Loader2, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { IPaymentProof } from "@/types";

const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface PaymentProofUploaderProps {
  value?: IPaymentProof | null;
  onChange: (proof: IPaymentProof | null) => void;
  disabled?: boolean;
}

export function PaymentProofUploader({
  value,
  onChange,
  disabled = false,
}: PaymentProofUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const authenticateImageKit = useCallback(async () => {
    const res = await fetch("/api/auth/imagekit-auth");
    if (!res.ok) throw new Error("ImageKit authentication failed");
    return res.json() as Promise<{
      signature: string;
      expire: number;
      token: string;
      publicKey: string;
    }>;
  }, []);

  const validateFile = (file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type)) {
      return "Invalid file format. Please upload PNG, JPG, JPEG, or WEBP images.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`;
    }
    return null;
  };

  const processAndUploadFile = async (file: File) => {
    setErrorMsg(null);
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      toast.error(validationError);
      return;
    }

    setSelectedFile(file);
    setUploading(true);
    setProgress(0);

    const aborter = new AbortController();
    abortControllerRef.current = aborter;

    try {
      const auth = await authenticateImageKit();

      const uploadResult = await upload({
        expire: auth.expire,
        token: auth.token,
        signature: auth.signature,
        publicKey: auth.publicKey,
        file: file,
        fileName: `payment-proof-${Date.now()}-${file.name.replace(/\s+/g, "_")}`,
        folder: "/payment-proofs",
        onProgress: (evt) => {
          if (evt.total > 0) {
            const pct = Math.round((evt.loaded * 100) / evt.total);
            setProgress(pct);
          }
        },
        abortSignal: aborter.signal,
      });

      if (!uploadResult || !uploadResult.url) {
        throw new Error("Failed to receive valid image URL from storage service.");
      }

      const proofData: IPaymentProof = {
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
        imageKitFileId: uploadResult.fileId || "",
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "customer",
        verificationStatus: "pending",
      };

      onChange(proofData);
      toast.success("Payment screenshot uploaded successfully!");
    } catch (err: any) {
      if (err.name === "AbortError") {
        toast.info("Upload cancelled");
      } else {
        console.error("Upload error:", err);
        const errMessage = err.message || "Failed to upload image. Please try again.";
        setErrorMsg(errMessage);
        toast.error(errMessage);
      }
    } finally {
      setUploading(false);
      abortControllerRef.current = null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processAndUploadFile(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || uploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSelectedFile(null);
    setErrorMsg(null);
    setProgress(0);
    onChange(null);
  };

  const handleRetry = () => {
    if (selectedFile) {
      processAndUploadFile(selectedFile);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Label / Subtitle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-pink-400" />
          <span className="text-sm font-bold text-white tracking-wide">
            Payment Screenshot
          </span>
          <span className="text-[10px] text-gray-400 bg-white/10 px-2 py-0.5 rounded font-mono">
            (Optional)
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" /> Faster Verification
        </div>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Uploading your payment screenshot helps our team verify your payment much faster and gives you quicker access after payment confirmation.
      </p>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        disabled={disabled || uploading}
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={disabled || uploading}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* State 1: Image Uploaded Successfully */}
      {value?.url ? (
        <div className="relative group border border-emerald-500/40 bg-emerald-950/20 p-4 rounded-xl flex items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/30 shrink-0 bg-black">
              <img
                src={value.thumbnailUrl || value.url}
                alt="Payment proof screenshot"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-0.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Screenshot Attached</span>
              </div>
              <p className="text-[11px] text-gray-300 font-mono truncate max-w-[200px] sm:max-w-xs">
                {value.originalName || "payment-proof.png"}
              </p>
              {value.fileSize && (
                <p className="text-[10px] text-gray-500 font-mono">
                  {(value.fileSize / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold flex items-center gap-1 transition-all border border-white/10"
              title="Replace Screenshot"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replace</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1 transition-all border border-red-500/20"
              title="Remove Screenshot"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      ) : (
        /* State 2: Dropzone & Upload Controls */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all ${
            dragActive
              ? "border-pink-500 bg-pink-950/20 shadow-lg shadow-pink-500/10 scale-[1.01]"
              : errorMsg
              ? "border-red-500/50 bg-red-950/10"
              : "border-white/15 bg-[#111] hover:border-white/30 hover:bg-white/[0.02]"
          }`}
        >
          {uploading ? (
            /* Uploading Progress State */
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">
                  Uploading Screenshot ({progress}%)
                </p>
                <p className="text-[10px] text-gray-400 font-mono">
                  Processing via ImageKit CDN...
                </p>
              </div>
              <div className="w-full max-w-xs bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            /* Idle Dropzone State */
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-white/5 rounded-full text-pink-400 border border-white/10">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs font-semibold text-white">
                  {dragActive
                    ? "Drop screenshot to upload..."
                    : "Drag & drop screenshot here, or click to upload"}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  PNG • JPG • JPEG • WEBP (Maximum 5 MB)
                </p>
              </div>

              {/* Upload Options Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-pink-900/30 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Select Screenshot
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={disabled}
                  className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-semibold border border-white/10 transition-all active:scale-95 flex items-center gap-1.5 sm:hidden"
                >
                  <Camera className="w-3.5 h-3.5 text-pink-400" /> Take Photo
                </button>
              </div>

              {/* Error Alert & Retry */}
              {errorMsg && (
                <div className="flex items-center gap-2 text-red-400 bg-red-950/30 border border-red-500/30 p-2.5 rounded-lg text-xs mt-2 w-full max-w-sm justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">{errorMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="text-[10px] underline font-bold hover:text-white shrink-0"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Security Badge */}
      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-gray-400" /> Encrypted & Private
        </span>
        <span className="font-mono">Max size: 5MB</span>
      </div>
    </div>
  );
}

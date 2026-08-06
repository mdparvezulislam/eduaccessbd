"use client";

import { upload } from "@imagekit/next";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  DragEvent,
} from "react";

interface FileUploadProps {
  initialImages?: string[];
  onChange?: (images: string[]) => void;
  accept?: string;
  disabled?: boolean;
}

type ProgressMap = Record<string, number>;

const FileUpload: React.FC<FileUploadProps> = ({
  initialImages = [],
  onChange,
  accept = "image/*",
  disabled = false,
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchAbortRef = useRef<AbortController | null>(null);

  // ✅ Keep initial images
  useEffect(() => {
    setUploadedImages((prev) => {
      const same =
        prev.length === initialImages.length &&
        prev.every((v, i) => v === initialImages[i]);
      return same ? prev : [...initialImages];
    });
  }, [initialImages]);

  const authenticator = useCallback(async () => {
    const res = await fetch("/api/auth/imagekit-auth");
    if (!res.ok) throw new Error("Auth request failed");
    return res.json() as Promise<{
      signature: string;
      expire: number;
      token: string;
      publicKey: string;
    }>;
  }, []);

  const resetProgress = () => setProgress({});

  // ✅ Handle upload for both file input & drag-drop
  const handleUploadFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!files || files.length === 0) {
        alert("অনুগ্রহ করে একটি ইমেজ নির্বাচন করুন।");
        return;
      }

      setUploading(true);
      resetProgress();
      const aborter = new AbortController();
      batchAbortRef.current = aborter;

      try {
        const fileArray = Array.from(files);

        // Step 1: Create an array of upload promises
        // সব ফাইলকে একসাথে আপলোড করার জন্য প্রস্তুত করা হচ্ছে
        const uploadPromises = fileArray.map(async (file) => {
          try {
            // ⭐️⭐️⭐️ FIX HERE ⭐️⭐️⭐️
            // প্রতিটি ফাইলের জন্য আলাদাভাবে নতুন টোকেন নেওয়া হচ্ছে
            const { signature, expire, token, publicKey } =
              await authenticator();

            return upload({
              expire,
              token,
              signature,
              publicKey,
              file,
              fileName: `${Date.now()}-${file.name}`,
              onProgress: (evt) => {
                setProgress((prev) => ({
                  ...prev,
                  [file.name]: Math.round((evt.loaded * 100) / evt.total),
                }));
              },
              abortSignal: aborter.signal,
            });
          } catch (err) {
            console.error(`Error uploading ${file.name}:`, err);
            return null; // Handle individual file upload error gracefully
          }
        });

        // Step 2: Wait for all uploads to complete
        // সব ফাইল আপলোড শেষ না হওয়া পর্যন্ত অপেক্ষা করা হচ্ছে
        const results = await Promise.all(uploadPromises);

        // Step 3: Filter out failed uploads and get valid URLs
        // সফলভাবে আপলোড হওয়া ছবির URL গুলোকে আলাদা করা হচ্ছে
        const newlyUploadedUrls = results
          .map((result) => result?.url)
          .filter(
            (url): url is string => typeof url === "string" && url.trim() !== ""
          );

        // Step 4: Update the state once with all new images
        // নতুন এবং পুরনো সব ছবির URL একসাথে State-এ যোগ করা হচ্ছে
        if (newlyUploadedUrls.length > 0) {
          setUploadedImages((prev) => {
            const updatedImages = [...prev, ...newlyUploadedUrls];
            onChange?.(updatedImages);
            return updatedImages;
          });
        }
      } catch (err) {
        console.error("❌ Upload process failed:", err);
      } finally {
        setUploading(false);
        batchAbortRef.current = null;
        setTimeout(() => resetProgress(), 1500);
      }
    },
    [authenticator, onChange]
  );

  // ✅ File Input Change Handler
  const handleFileInput = () => {
    const files = fileInputRef.current?.files;
    if (files) handleUploadFiles(files);
  };

  // ✅ Drag and Drop Handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleAbort = useCallback(() => {
    batchAbortRef.current?.abort();
  }, []);

  // ✅ Remove image
  const handleRemove = useCallback(
    (url: string) => {
      setUploadedImages((prev) => {
        const updated = prev.filter((u) => u !== url);
        onChange?.(updated);
        return updated;
      });
    },
    [onChange]
  );

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full p-6 rounded-2xl border-2 border-dashed transition-all ${
          dragActive
            ? "border-emerald-500 bg-emerald-950/20"
            : "border-zinc-700 bg-[#1a1a20] hover:border-zinc-600"
        } shadow-lg flex flex-col items-center justify-center gap-3`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          disabled={disabled || uploading}
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Upload Area */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="text-3xl">📤</div>
          <h3 className="text-xs sm:text-sm font-bold text-white">
            {dragActive
              ? "Drop files here to upload..."
              : "Drag & drop files or click button"}
          </h3>
          <p className="text-[11px] text-zinc-400">
            JPG, PNG, or WEBP formats supported
          </p>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="mt-1 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all duration-300 active:scale-95 border border-emerald-400/20"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>

          {uploading && (
            <button
              type="button"
              onClick={handleAbort}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Progress */}
        {uploading && Object.entries(progress).length > 0 && (
          <div className="mt-4 w-full max-w-md space-y-2">
            {Object.entries(progress).map(([name, value]) => (
              <div key={name}>
                <div className="flex justify-between text-xs text-zinc-300">
                  <span className="truncate max-w-[65%]">{name}</span>
                  <span>{value}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Image Gallery */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Uploaded Images:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {uploadedImages.map((url) => (
              <div
                key={url}
                className="group relative overflow-hidden rounded-xl border border-zinc-700 bg-[#121215] shadow-md"
              >
                <img
                  src={url}
                  alt="Uploaded"
                  className="aspect-square w-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
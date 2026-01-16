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
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full p-8 rounded-2xl border-2 border-dashed transition-all ${
          dragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 bg-gradient-to-br from-gray-50 via-white to-gray-100"
        } shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-5`}
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
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="text-4xl">📤</div>
          <h3 className="text-lg font-semibold text-gray-800">
            {dragActive
              ? "ছেড়ে দিন, আপলোড শুরু হবে..."
              : "ফাইল টেনে আনুন অথবা নিচের বাটনে ক্লিক করুন"}
          </h3>
          <p className="text-sm text-gray-500">
            JPG, PNG, বা WEBP ফরম্যাট সমর্থিত (একাধিক আপলোড সম্ভব)
          </p>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-all duration-300 active:scale-95"
          >
            {uploading ? "আপলোড হচ্ছে..." : "প্রিমিয়াম ইমেজ আপলোড করুন"}
          </button>

          {uploading && (
            <button
              type="button"
              onClick={handleAbort}
              className="px-5 py-2 rounded-md bg-gray-200 text-gray-800 text-sm hover:bg-gray-300 transition-colors"
            >
              ❌ বাতিল করুন
            </button>
          )}
        </div>

        {/* Progress */}
        {uploading && Object.entries(progress).length > 0 && (
          <div className="mt-6 w-full max-w-md space-y-3">
            {Object.entries(progress).map(([name, value]) => (
              <div key={name}>
                <div className="flex justify-between text-sm text-gray-700">
                  <span className="truncate max-w-[65%]">{name}</span>
                  <span>{value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
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
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">
            📸 আপলোড করা ইমেজ:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedImages.map((url) => (
              <div
                key={url}
                className="group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <img
                  src={url}
                  alt="Uploaded"
                  className="aspect-square w-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute top-2 right-2 bg-red-600/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  মুছে ফেলুন
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
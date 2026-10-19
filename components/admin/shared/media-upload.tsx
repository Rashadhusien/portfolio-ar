"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getUploadSignature,
  type UploadSignature,
} from "@/lib/actions/media.actions";
import { toast } from "sonner";

interface MediaUploadProps {
  type: "image" | "video";
  onUpload: (url: string) => void;
}

const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  video: 50 * 1024 * 1024, // 50MB
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Uploads straight from the browser to Cloudinary using a server-issued
// signature, reporting real progress.
function uploadToCloudinary(
  file: File,
  sig: UploadSignature,
  onProgress: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", sig.apiKey);
    body.append("timestamp", String(sig.timestamp));
    body.append("signature", sig.signature);
    body.append("folder", sig.folder);
    body.append("allowed_formats", sig.allowedFormats);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(sig.cloudName)}/${sig.resourceType}/upload`,
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let response: { secure_url?: string; error?: { message?: string } } = {};
      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        // fall through to the generic error below
      }
      if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
        resolve(response.secure_url);
      } else {
        reject(new Error(response.error?.message || `HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("تعذر الاتصال بخدمة الرفع"));
    xhr.send(body);
  });
}

export function MediaUpload({ type, onUpload }: MediaUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const label = type === "image" ? "الصورة" : "الفيديو";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    const maxSize = FILE_SIZE_LIMITS[type];
    if (file.size > maxSize) {
      toast.error(
        `حجم الملف كبير جداً. الحد الأقصى هو ${formatFileSize(maxSize)}`,
      );
      input.value = "";
      return;
    }
    if (!file.type.startsWith(`${type}/`)) {
      toast.error(type === "image" ? "يرجى رفع ملف صورة صالح" : "يرجى رفع ملف فيديو صالح");
      input.value = "";
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const sig = await getUploadSignature(type);
      if ("error" in sig) throw new Error(sig.error);

      const url = await uploadToCloudinary(file, sig.data, setUploadProgress);
      onUpload(url);
      toast.success(`تم رفع ${label} بنجاح`);
    } catch (error) {
      console.error("Upload failed:", error);
      const message = error instanceof Error ? error.message : "";
      toast.error(message ? `فشل رفع ${label}: ${message}` : `فشل رفع ${label}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      input.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={type === "image" ? "image/*" : "video/*"}
        onChange={handleUpload}
        disabled={uploading}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        className="w-full"
        onClick={() => inputRef.current?.click()}
        aria-busy={uploading}
      >
        <span className="flex items-center justify-center gap-2">
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span aria-live="polite">جاري الرفع... {uploadProgress}%</span>
            </>
          ) : (
            <>
              رفع {type === "image" ? "صورة" : "فيديو"}
              <span className="text-xs text-muted-foreground">
                (الحد الأقصى: {formatFileSize(FILE_SIZE_LIMITS[type])})
              </span>
            </>
          )}
        </span>
      </Button>
    </div>
  );
}

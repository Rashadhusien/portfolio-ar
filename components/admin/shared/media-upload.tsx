"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadImage, uploadVideo } from "@/lib/actions/media.actions";
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

export function MediaUpload({ type, onUpload }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size before upload
    const maxSize = FILE_SIZE_LIMITS[type];
    if (file.size > maxSize) {
      toast.error(
        `حجم الملف كبير جداً. الحد الأقصى هو ${formatFileSize(maxSize)}`,
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const uploadAction = type === "image" ? uploadImage : uploadVideo;
      const result = (await uploadAction(file)) as any;

      clearInterval(progressInterval);
      setUploadProgress(100);

      onUpload(result.secure_url);
      toast.success(`تم رفع ${type === "image" ? "الصورة" : "الفيديو"} بنجاح`);

      // Reset file input
      e.target.value = "";
    } catch (error: any) {
      console.error("Upload failed:", error);
      const errorMessage = error?.message || "فشل رفع الملف";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept={type === "image" ? "image/*" : "video/*"}
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        id={`upload-${type}`}
      />
      <label htmlFor={`upload-${type}`}>
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          asChild
          className="w-full"
        >
          <span className="flex items-center justify-center gap-2">
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                جاري الرفع... {uploadProgress}%
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
      </label>
    </div>
  );
}

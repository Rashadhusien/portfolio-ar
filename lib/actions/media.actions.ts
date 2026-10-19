"use server";

import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type MediaKind = "image" | "video";

const UPLOAD_RULES: Record<
  MediaKind,
  { folder: string; allowedFormats: string }
> = {
  image: { folder: "portfolio", allowedFormats: "jpg,jpeg,png,webp,gif" },
  video: { folder: "portfolio/videos", allowedFormats: "mp4,webm,mov" },
};

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
  resourceType: MediaKind;
};

/**
 * Returns a short-lived signature that lets the admin's browser upload a
 * file directly to Cloudinary. The file never passes through this server,
 * so Server Action / platform request-body limits don't apply.
 * Cloudinary rejects the signature after about an hour, and the signed
 * folder/allowed_formats can't be changed by the client.
 */
export async function getUploadSignature(
  kind: MediaKind,
): Promise<{ data: UploadSignature } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "غير مصرح" };

  const rules = UPLOAD_RULES[kind];
  if (!rules) return { error: "نوع ملف غير مدعوم" };

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    console.error("[media] Cloudinary environment variables are missing");
    return { error: "خدمة رفع الملفات غير مهيأة" };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: rules.folder,
      allowed_formats: rules.allowedFormats,
    },
    apiSecret,
  );

  return {
    data: {
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder: rules.folder,
      allowedFormats: rules.allowedFormats,
      resourceType: kind,
    },
  };
}

export async function deleteMedia(publicId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("غير مصرح");
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Cloudinary delete error:", error);
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

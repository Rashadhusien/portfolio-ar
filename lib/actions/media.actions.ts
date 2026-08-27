"use server";

import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export async function uploadImage(file: File) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("غير مصرح");
  }

  // Validate file size
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      `حجم الصورة كبير جداً. الحد الأقصى هو ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    );
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("يرجى رفع ملف صورة صالح");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: "portfolio",
          max_file_size: MAX_IMAGE_SIZE,
          allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            console.error("Error details:", {
              message: error.message,
              http_code: error.http_code,
              name: error.name,
            });
            reject(
              new Error(`فشل رفع الصورة: ${error.message || "خطأ في السيرفر"}`),
            );
          } else {
            resolve(result);
          }
        },
      )
      .end(buffer);
  });
}

export async function uploadVideo(file: File) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("غير مصرح");
  }

  // Validate file size
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error(
      `حجم الفيديو كبير جداً. الحد الأقصى هو ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
    );
  }

  // Validate file type
  if (!file.type.startsWith("video/")) {
    throw new Error("يرجى رفع ملف فيديو صالح");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Try upload with resource_type: "auto" first
  try {
    return await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            folder: "portfolio/videos",
            max_file_size: MAX_VIDEO_SIZE,
            allowed_formats: ["mp4", "webm", "mov", "avi"],
            chunk_size: 6000000,
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error (auto):", error);
              console.error("Error details:", {
                message: error.message,
                http_code: error.http_code,
                name: error.name,
              });

              // Extract detailed error information
              const errorMessage = error.message || "خطأ في السيرفر";
              const httpCode = error.http_code || "Unknown";

              reject(
                new Error(`فشل رفع الفيديو (${httpCode}): ${errorMessage}`),
              );
            } else {
              resolve(result);
            }
          },
        )
        .end(buffer);
    });
  } catch (autoError) {
    console.log(
      "Auto resource_type failed, trying explicit video resource_type",
    );

    // Fallback to explicit video resource_type
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "video",
            folder: "portfolio/videos",
            max_file_size: MAX_VIDEO_SIZE,
            allowed_formats: ["mp4", "webm", "mov", "avi"],
            chunk_size: 6000000,
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error (video):", error);
              console.error("Error details:", {
                message: error.message,
                http_code: error.http_code,
                name: error.name,
              });

              const errorMessage = error.message || "خطأ في السيرفر";
              const httpCode = error.http_code || "Unknown";

              reject(
                new Error(`فشل رفع الفيديو (${httpCode}): ${errorMessage}`),
              );
            } else {
              resolve(result);
            }
          },
        )
        .end(buffer);
    });
  }
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
        console.error("Error details:", {
          message: error.message,
          http_code: error.http_code,
          name: error.name,
        });
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

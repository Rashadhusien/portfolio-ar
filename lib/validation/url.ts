import { z } from "zod";

// Hosts allowed for next/image. Keep in sync with images.remotePatterns
// in next.config.mjs, otherwise next/image throws at render time.
const IMAGE_HOSTS = ["res.cloudinary.com"];

function isRelativePath(value: string) {
  // "/foo" is a same-site path; "//foo" would be protocol-relative (external).
  return value.startsWith("/") && !value.startsWith("//");
}

function parse(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/** Link targets: same-site paths, #anchors, http(s), mailto: and tel:. */
export function isSafeLink(value: string) {
  const v = value.trim();
  if (isRelativePath(v) || /^#[\w-]*$/.test(v)) return true;
  const url = parse(v);
  return !!url && ["https:", "http:", "mailto:", "tel:"].includes(url.protocol);
}

/** Image sources renderable by next/image: local files or allowed hosts. */
export function isSafeImageSrc(value: string) {
  const v = value.trim();
  if (isRelativePath(v)) return true;
  const url = parse(v);
  return !!url && url.protocol === "https:" && IMAGE_HOSTS.includes(url.hostname);
}

/** Media (video) sources: local files or any https URL. */
export function isSafeMediaSrc(value: string) {
  const v = value.trim();
  if (isRelativePath(v)) return true;
  const url = parse(v);
  return !!url && url.protocol === "https:";
}

export const safeLink = (message: string) =>
  z.string().trim().min(1, message).refine(isSafeLink, { message: "رابط غير صالح" });

export const safeImageSrc = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine(isSafeImageSrc, {
      message: "يجب أن تكون الصورة ملفًا محليًا أو رابط Cloudinary",
    });

export const safeMediaSrc = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine(isSafeMediaSrc, { message: "رابط الفيديو غير صالح" });

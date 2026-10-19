import React from "react";
import type { Metadata, Viewport } from "next";
import { Amiri, Noto_Sans_Arabic } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

// Display: Amiri, a classical Naskh designed for typesetting Arabic books —
// the face of the printed page this site is about.
const displayFont = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

// Text and UI: a quiet, highly legible Arabic sans.
const sansFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Books With Arwa | مراجعات كتب وصناعة محتوى ثقافي",
  description:
    "منصة متخصصة في مراجعات الكتب والتسويق الثقافي على وسائل التواصل الاجتماعي",
  openGraph: {
    title: "Books With Arwa | مراجعات كتب وصناعة محتوى ثقافي",
    description:
      "منصة متخصصة في مراجعات الكتب والتسويق الثقافي على وسائل التواصل الاجتماعي",
    locale: "ar_EG",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={cn(displayFont.variable, sansFont.variable)}
      suppressHydrationWarning
    >
      <head>
        {/* Marks JS as available before first paint so the hero intro can
            start from its hidden state without a flash (see globals.css). */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        <SessionProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-center" richColors dir="rtl" />
        </SessionProvider>
      </body>
    </html>
  );
}

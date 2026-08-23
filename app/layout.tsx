import React from "react";
import type { Metadata } from "next";
import { Cairo, Noto_Sans_Arabic } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

// const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const cairoFont = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
});

const fontSans = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Books With Arwa | مراجعات كتب وصناعة محتوى ثقافي",
  description:
    "منصة متخصصة في مراجعات الكتب والتسويق الثقافي على وسائل التواصل الاجتماعي",
  generator: "v0.app",
  openGraph: {
    title: "Books With Arwa | مراجعات كتب وصناعة محتوى ثقافي",
    description:
      "منصة متخصصة في مراجعات الكتب والتسويق الثقافي على وسائل التواصل الاجتماعي",
    locale: "ar_EG",
  },
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
      className={cn(cairoFont.variable, fontSans.variable, "font-sans")}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className="font-cairo antialiased bg-background text-foreground">
        <SessionProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-center" richColors dir="rtl" />
        </SessionProvider>
      </body>
    </html>
  );
}

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        حدث خطأ غير متوقع
      </h1>
      <p className="text-muted-foreground max-w-md">
        نعتذر، لم نتمكن من عرض الصفحة الآن. يرجى المحاولة مرة أخرى.
      </p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </main>
  );
}

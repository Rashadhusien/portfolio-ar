"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
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
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h2 className="text-xl font-bold">حدث خطأ أثناء تحميل هذه الصفحة</h2>
      <p className="text-sm text-muted-foreground">
        حاول مرة أخرى، وإذا استمرت المشكلة تحقق من الاتصال بقاعدة البيانات.
        {error.digest && <span className="block mt-1">رمز الخطأ: {error.digest}</span>}
      </p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </div>
  );
}

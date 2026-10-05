import { Suspense } from "react";

import HomePage from "@/features/posts/pages/HomePage";

function DashboardContent() {
  return <HomePage />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-400" />

            <p className="text-sm font-medium text-slate-600">
              Memuat postingan...
            </p>
          </div>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
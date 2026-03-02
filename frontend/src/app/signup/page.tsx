"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page - signup is handled there via toggle
    router.replace("/login?mode=signup");
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mx-auto mb-4"></div>
        <p className="text-neutral-600">Redirecting to signup...</p>
      </div>
    </div>
  );
}

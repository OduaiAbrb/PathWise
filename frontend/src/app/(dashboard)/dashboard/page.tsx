"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";
import BlackWhiteDashboard from "@/components/BlackWhiteDashboard";
import WelcomeWizard from "@/components/WelcomeWizard";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;
  const [hasRoadmap, setHasRoadmap] = useState<boolean | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) return;

    // Check if user has an existing roadmap
    const checkRoadmap = async () => {
      try {
        const res = await fetch(getApiUrl("/api/v1/roadmaps?limit=1"), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          const roadmaps = data.data || [];
          if (roadmaps.length === 0) {
            // First-time user — show onboarding wizard
            setHasRoadmap(false);
            setShowWizard(true);
          } else {
            setHasRoadmap(true);
          }
        } else {
          setHasRoadmap(false);
          setShowWizard(true);
        }
      } catch {
        setHasRoadmap(false);
        setShowWizard(true);
      }
    };
    checkRoadmap();
  }, [accessToken, status]);

  // Loading state
  if (hasRoadmap === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4 dark:border-neutral-600 dark:border-t-white" />
          <p className="text-black dark:text-white font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // First-time user → Welcome Wizard
  if (showWizard) {
    return (
      <WelcomeWizard
        onComplete={() => {
          setShowWizard(false);
          setHasRoadmap(true);
        }}
      />
    );
  }

  // Existing user → Full Dashboard
  return (
    <div className="max-w-7xl mx-auto">
      <BlackWhiteDashboard />
    </div>
  );
}


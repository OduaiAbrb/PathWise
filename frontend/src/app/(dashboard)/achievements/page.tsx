"use client";

import Gamification from "@/components/Gamification";
import ComparisonBenchmarks from "@/components/ComparisonBenchmarks";
import TransparencyPanel from "@/components/ui/TransparencyPanel";

export default function AchievementsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Achievements & Progress</h1>
          <p className="text-neutral-600 mt-1">
            Track your learning journey and see how you compare to others.
          </p>
        </div>
      </div>

      {/* Main Gamification Component */}
      <Gamification />

      {/* Comparison Benchmarks */}
      <ComparisonBenchmarks />

      {/* Transparency */}
      <TransparencyPanel context="general" />
    </div>
  );
}

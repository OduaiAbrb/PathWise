"use client";

import CareerDashboard from "@/components/CareerDashboard";
import AILearningAssistant from "@/components/AILearningAssistant";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <CareerDashboard />
      {/* AI Learning Assistant */}
      <div className="mt-8">
        <AILearningAssistant />
      </div>
    </div>
  );
}

"use client";

import SmartLearningDashboard from "@/components/SmartLearningDashboard";
import AILearningAssistant from "@/components/AILearningAssistant";

export default function DashboardPage() {

  return (
    <div className="space-y-8">
      {/* Smart Learning Dashboard */}
      <SmartLearningDashboard />

      {/* AI Learning Assistant */}
      <div className="mt-8">
        <AILearningAssistant />
      </div>
    </div>
  );
}

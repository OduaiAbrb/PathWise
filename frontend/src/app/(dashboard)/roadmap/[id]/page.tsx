"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";
import HorizontalTimelineRoadmap from "@/components/HorizontalTimelineRoadmap";

interface RoadmapData {
  id: string;
  job_title: string;
  experience_level: string;
  estimated_months: number;
  phases: any[];
  completion_percentage: number;
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!accessToken || !params.id) return;

      try {
        const response = await fetch(getApiUrl(`/api/v1/roadmaps/${params.id}`), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const rawRoadmap = data.data || data;
          
          // Transform to HorizontalTimelineRoadmap format
          const transformedRoadmap: RoadmapData = {
            id: rawRoadmap.id,
            job_title: rawRoadmap.job_title,
            experience_level: rawRoadmap.skill_level || "Intermediate",
            estimated_months: Math.ceil((rawRoadmap.phases?.length || 4) * 1.5),
            completion_percentage: rawRoadmap.completion_percentage || 0,
            phases: (rawRoadmap.phases || []).map((phase: any, index: number) => ({
              id: phase.id || `phase-${index}`,
              title: phase.name || phase.title,
              duration_weeks: phase.estimated_weeks || 4,
              importance: index === 0 ? "critical" : index < 3 ? "important" : "optional",
              status: phase.status || (index === 0 ? "in_progress" : "not_started"),
              understanding_score: 0,
              why_it_matters: `Skills in this phase appear in 75-90% of ${rawRoadmap.job_title} interviews.`,
              skills: (phase.skills || []).map((skill: any) => ({
                id: skill.id || skill.name,
                name: skill.name,
                status: skill.status || skill.progress?.status || "not_started",
                estimated_hours: skill.estimated_hours || 4,
                interview_frequency: skill.interview_frequency || Math.floor(Math.random() * 30 + 60),
                resources: skill.resources || [],
              })),
            })),
          };
          
          setRoadmap(transformedRoadmap);
        }
      } catch (error) {
        console.error("Failed to fetch roadmap:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmap();
  }, [params.id, accessToken]);

  // Handle skill click - navigate to AI mentor with skill context
  const handleSkillClick = (skill: any, phaseId: string) => {
    // Store skill context for AI mentor
    if (typeof window !== "undefined") {
      localStorage.setItem("currentSkill", skill.name);
      localStorage.setItem("currentPhase", phaseId);
    }
    // Navigate to AI mentor
    window.location.href = "/study-buddy";
  };

  // Handle checkpoint answer - send to backend for validation
  const handleCheckpointAnswer = async (phaseId: string, checkpointId: string, answer: string | number) => {
    if (!accessToken || !roadmap) return;
    
    try {
      const response = await fetch(getApiUrl("/api/v1/exams/checkpoint/answer"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          roadmap_id: roadmap.id,
          phase_id: phaseId,
          checkpoint_id: checkpointId,
          answer,
          question_type: typeof answer === "number" ? "mcq" : "open",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Checkpoint result:", data);
        // Could update local state with understanding score delta
      }
    } catch (error) {
      console.error("Failed to submit checkpoint answer:", error);
    }
  };

  // Handle exam submission - send to backend for AI evaluation
  const handleExamSubmit = async (phaseId: string, answers: Record<string, string | number>) => {
    if (!accessToken || !roadmap) return;
    
    try {
      const response = await fetch(getApiUrl("/api/v1/exams/exam/submit"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          roadmap_id: roadmap.id,
          phase_id: phaseId,
          answers,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Exam result:", data);
        
        if (data.data?.passed) {
          alert(`🎉 Congratulations! You passed with ${data.data.score}%! Next phase unlocked.`);
          // Refresh roadmap to show unlocked phase
          window.location.reload();
        } else {
          alert(`Score: ${data.data?.score}%. You need 70% to pass. Keep practicing!`);
        }
      }
    } catch (error) {
      console.error("Failed to submit exam:", error);
      alert("Failed to submit exam. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Roadmap not found</h2>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-6">
      {/* Back Button - Fixed Position */}
      <div className="fixed top-20 left-6 z-50">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      {/* Horizontal Timeline Roadmap */}
      <HorizontalTimelineRoadmap
        roadmap={roadmap}
        onSkillClick={handleSkillClick}
        onCheckpointAnswer={handleCheckpointAnswer}
        onExamSubmit={handleExamSubmit}
      />
    </div>
  );
}

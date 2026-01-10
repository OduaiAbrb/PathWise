"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";
import {
  Target,
  Clock,
  Play,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Zap,
  Users,
  MessageSquare,
} from "lucide-react";
import RoadmapFlowchart from "./RoadmapFlowchart";

interface RoadmapData {
  id: string;
  job_title: string;
  completion_percentage: number;
  phases: Array<{
    id: string;
    title: string;
    status: "completed" | "in_progress" | "not_started";
    skills: Array<{
      id: string;
      name: string;
      status: "completed" | "in_progress" | "not_started" | "locked";
      progress?: number;
      estimated_hours?: number;
      interview_frequency?: number;
    }>;
  }>;
}

/**
 * Black & White Dashboard
 * Single roadmap limit
 * Everything in one place: roadmap flowchart + analytics + study groups
 */
export default function BlackWhiteDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [stats, setStats] = useState({
    readiness: 0,
    streak: 0,
    skillsCompleted: 0,
    totalSkills: 0,
    hoursInvested: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining({ hours, minutes });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && accessToken) {
      fetchDashboard();
    }
  }, [accessToken, status]);

  const fetchDashboard = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);

      // Fetch roadmap (limit 1)
      const roadmapResponse = await fetch(getApiUrl("/api/v1/roadmaps?limit=1"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (roadmapResponse.ok) {
        const roadmapData = await roadmapResponse.json();
        const userRoadmap = roadmapData.data?.[0];

        if (userRoadmap) {
          // Transform roadmap data for flowchart
          const transformedRoadmap: RoadmapData = {
            id: userRoadmap.id,
            job_title: userRoadmap.job_title,
            completion_percentage: userRoadmap.completion_percentage || 0,
            phases: userRoadmap.phases?.map((phase: any) => ({
              id: phase.id || phase.phase_id,
              title: phase.title || phase.name,
              status: phase.status || "not_started",
              skills: phase.skills?.map((skill: any) => ({
                id: skill.id,
                name: skill.name,
                status: skill.status || skill.progress?.status || "not_started",
                progress: skill.progress?.percentage,
                estimated_hours: skill.estimated_hours,
                interview_frequency: skill.interview_frequency || Math.floor(Math.random() * 30 + 50),
              })) || [],
            })) || [],
          };

          setRoadmap(transformedRoadmap);

          // Calculate stats
          const allSkills = transformedRoadmap.phases.flatMap(p => p.skills);
          const completedSkills = allSkills.filter(s => s.status === "completed").length;
          const totalHours = allSkills.reduce((sum, s) => sum + (s.estimated_hours || 0), 0);

          setStats({
            readiness: transformedRoadmap.completion_percentage,
            streak: 0, // Will be fetched separately
            skillsCompleted: completedSkills,
            totalSkills: allSkills.length,
            hoursInvested: Math.floor(completedSkills * (totalHours / allSkills.length)),
          });
        }
      }

      // Fetch streak
      const statsResponse = await fetch(getApiUrl("/api/v1/gamification/stats"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(prev => ({ ...prev, streak: statsData.data?.current_streak || 0 }));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-black font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // MANDATORY ROADMAP: Redirect to creation if none exists
  if (!roadmap && !isLoading) {
    router.push("/roadmap/new");
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-black font-semibold">Redirecting to roadmap creation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Black Header Strip */}
      <div className="bg-black text-white p-6 border-b-4 border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {session?.user?.name ? `${session.user.name.split(" ")[0]}'s Dashboard` : "Your Dashboard"}
            </h1>
            <p className="text-gray-300 mt-1">
              {roadmap.job_title} · {timeRemaining.hours}h {timeRemaining.minutes}m left today
            </p>
          </div>
          <button
            onClick={() => router.push("/study-groups")}
            className="px-4 py-2 bg-white text-black font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Study Groups
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Grid - Black & White */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Readiness */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-black p-6 bg-white"
          >
            <div className="text-5xl font-bold text-black mb-2">
              {stats.readiness}%
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">
              Job Ready
            </div>
            {stats.readiness < 60 && (
              <div className="mt-2 text-xs text-black font-semibold">
                ⚠️ Need 60%+
              </div>
            )}
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border-2 border-black p-6 bg-black text-white"
          >
            <div className="text-5xl font-bold mb-2">
              {stats.streak}
            </div>
            <div className="text-sm text-gray-300 uppercase tracking-wide">
              Day Streak
            </div>
          </motion.div>

          {/* Skills Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border-2 border-black p-6 bg-white"
          >
            <div className="text-5xl font-bold text-black mb-2">
              {stats.skillsCompleted}
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">
              Skills Done
            </div>
            <div className="mt-1 text-xs text-gray-500">
              of {stats.totalSkills}
            </div>
          </motion.div>

          {/* Hours Invested */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border-2 border-black p-6 bg-white"
          >
            <div className="text-5xl font-bold text-black mb-2">
              {stats.hoursInvested}h
            </div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">
              Time Invested
            </div>
          </motion.div>
        </div>

        {/* Roadmap Flowchart - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RoadmapFlowchart
            roadmap={roadmap}
            onSkillClick={(skill, phaseId) => {
              // Navigate to skill detail or start learning
              console.log("Skill clicked:", skill.name);
            }}
          />
        </motion.div>

        {/* Quick Actions - Black & White */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border-2 border-black p-6 bg-white"
        >
          <h3 className="text-xl font-bold text-black mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/projects")}
              className="p-4 border-2 border-black hover:bg-black hover:text-white transition-all text-left"
            >
              <Target className="w-6 h-6 mb-2" />
              <p className="font-semibold">Projects</p>
            </button>
            <button
              onClick={() => router.push("/interview")}
              className="p-4 border-2 border-black hover:bg-black hover:text-white transition-all text-left"
            >
              <Zap className="w-6 h-6 mb-2" />
              <p className="font-semibold">Interview Prep</p>
            </button>
            <button
              onClick={() => router.push("/study-groups")}
              className="p-4 border-2 border-black hover:bg-black hover:text-white transition-all text-left"
            >
              <Users className="w-6 h-6 mb-2" />
              <p className="font-semibold">Study Groups</p>
            </button>
            <button
              onClick={() => router.push("/portfolio")}
              className="p-4 border-2 border-black hover:bg-black hover:text-white transition-all text-left"
            >
              <CheckCircle2 className="w-6 h-6 mb-2" />
              <p className="font-semibold">Portfolio</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

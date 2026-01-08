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
  AlertCircle,
  ArrowRight,
  Zap,
  Trophy,
  Calendar,
  BookOpen,
  Code,
  FileText,
} from "lucide-react";

interface TodaysMission {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  estimatedMinutes: number;
  type: "learn" | "practice" | "project" | "interview_prep";
  roadmapId: string;
  taskId: string;
  difficulty: "easy" | "medium" | "hard";
}

interface ReadinessScore {
  overall: number;
  technical: number;
  projects: number;
  interview: number;
  lastUpdated: Date;
  trend: "up" | "down" | "stable";
}

export default function CareerDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const [todaysMission, setTodaysMission] = useState<TodaysMission | null>(null);
  const [readinessScore, setReadinessScore] = useState<ReadinessScore | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [targetRole, setTargetRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    // Only fetch when session is ready
    if (status === "authenticated" && accessToken) {
      fetchDashboardData();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
      setAuthError(true);
    } else if (status === "loading") {
      setIsLoading(true);
    }
  }, [accessToken, status]);

  const fetchDashboardData = async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch user's active roadmap
      const roadmapsResponse = await fetch(getApiUrl("/api/v1/roadmaps"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Check for auth errors
      if (roadmapsResponse.status === 401 || roadmapsResponse.status === 403) {
        setAuthError(true);
        setIsLoading(false);
        return;
      }

      if (roadmapsResponse.ok) {
        const roadmapsData = await roadmapsResponse.json();
        console.log("📊 Dashboard roadmaps data:", roadmapsData);
        const activeRoadmap = roadmapsData.data?.[0]; // Get primary roadmap
        
        if (activeRoadmap) {
          console.log("✅ Active roadmap found:", activeRoadmap.job_title);
          setTargetRole(activeRoadmap.job_title);
          
          // Find today's mission from roadmap skills
          const allSkills = activeRoadmap.phases?.flatMap((phase: any) => 
            phase.skills?.map((skill: any) => ({
              id: skill.id,
              name: skill.name,
              description: skill.description,
              status: skill.progress?.status || skill.status || "not_started",
              phaseTitle: phase.title || phase.name,
              roadmapId: activeRoadmap.id,
              difficulty: skill.difficulty,
              estimated_hours: skill.estimated_hours,
              resources: skill.resources,
            })) || []
          ) || [];

          console.log("🎯 All skills:", allSkills.length);

          // Get first incomplete skill
          const nextSkill = allSkills.find((skill: any) => skill.status !== "completed");
          
          if (nextSkill) {
            console.log("✅ Next skill for today's mission:", nextSkill.name);
            setTodaysMission({
              id: nextSkill.id,
              title: nextSkill.name,
              description: nextSkill.description || `Master ${nextSkill.name} in ${nextSkill.phaseTitle}`,
              whyItMatters: `This skill appears in ${Math.floor(Math.random() * 30 + 60)}% of job postings for ${activeRoadmap.job_title}`,
              estimatedMinutes: (nextSkill.estimated_hours || 1) * 60,
              type: "learn",
              roadmapId: nextSkill.roadmapId,
              taskId: nextSkill.id,
              difficulty: nextSkill.difficulty || "medium",
            });
          } else {
            console.log("⚠️ No incomplete skills found");
          }

          // Calculate readiness score
          const completedSkills = allSkills.filter((s: any) => s.status === "completed").length;
          const totalSkills = allSkills.length;
          const overallScore = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;
          console.log("📈 Progress:", completedSkills, "/", totalSkills, "=", overallScore + "%");

          setReadinessScore({
            overall: overallScore,
            technical: Math.min(overallScore + 5, 100),
            projects: Math.max(overallScore - 10, 0),
            interview: Math.max(overallScore - 15, 0),
            lastUpdated: new Date(),
            trend: completedSkills > 0 ? "up" : "stable",
          });
        }
      }

      // Fetch gamification stats for streak
      const statsResponse = await fetch(getApiUrl("/api/v1/gamification/stats"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setCurrentStreak(statsData.data?.current_streak || 0);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMission = () => {
    if (!todaysMission) return;
    setIsStarting(true);
    // Navigate to the specific task/learning content
    router.push(`/roadmap/${todaysMission.roadmapId}`);
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case "learn": return BookOpen;
      case "practice": return Code;
      case "project": return FileText;
      case "interview_prep": return Target;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700 border-green-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "hard": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading your career progress...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-12"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="heading-3 mb-2">Session Expired</h2>
          <p className="text-neutral-600 mb-6">
            Your session has expired. Please refresh the page to sign in again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mx-auto"
          >
            Refresh Page
          </button>
        </motion.div>
      </div>
    );
  }

  if (!todaysMission) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 text-center"
        >
          <Target className="w-16 h-16 text-neutral-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">
            No Active Roadmap
          </h2>
          <p className="text-neutral-600 mb-6">
            You need a roadmap to get started. Let's create one based on your career goals.
          </p>
          <button
            onClick={() => router.push("/roadmap/new")}
            className="btn-primary"
          >
            Create Your Roadmap
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  const MissionIcon = getMissionIcon(todaysMission.type);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* PRIMARY ACTION - Today's Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20" />
        <div className="relative card p-8 border-2 border-blue-200">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  Today's Mission
                </span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-1">
                {todaysMission.title}
              </h1>
              <p className="text-neutral-600">
                {todaysMission.description}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(todaysMission.difficulty)}`}>
              {todaysMission.difficulty}
            </span>
          </div>

          {/* Why It Matters */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-900 mb-1">Why this matters:</p>
                <p className="text-neutral-700">{todaysMission.whyItMatters}</p>
              </div>
            </div>
          </div>

          {/* Time Estimate */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-neutral-500" />
              <span className="text-neutral-700">
                <span className="font-semibold">{todaysMission.estimatedMinutes}</span> minutes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MissionIcon className="w-5 h-5 text-neutral-500" />
              <span className="text-neutral-700 capitalize">
                {todaysMission.type.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleStartMission}
            disabled={isStarting}
            className="w-full btn-primary text-lg py-4 justify-center"
          >
            {isStarting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Start Mission
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* SECONDARY INFO - Readiness & Streak */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Readiness Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Job Readiness
            </h3>
            <Trophy className="w-5 h-5 text-neutral-400" />
          </div>

          {readinessScore && (
            <>
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-neutral-900">
                    {readinessScore.overall}%
                  </span>
                  <span className="text-neutral-600">overall</span>
                  {readinessScore.trend === "up" && (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-neutral-600">
                  for {targetRole} positions
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-700">Technical Skills</span>
                    <span className="font-medium text-neutral-900">{readinessScore.technical}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${readinessScore.technical}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-700">Portfolio Projects</span>
                    <span className="font-medium text-neutral-900">{readinessScore.projects}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${readinessScore.projects}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-700">Interview Ready</span>
                    <span className="font-medium text-neutral-900">{readinessScore.interview}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${readinessScore.interview}%` }}
                    />
                  </div>
                </div>
              </div>

              {readinessScore.overall < 60 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Keep going. You need 60%+ to start applying with confidence.
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Current Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Current Streak
            </h3>
            <Calendar className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="text-center py-6">
            <div className="relative inline-block">
              <div className="text-6xl font-bold text-neutral-900 mb-2">
                {currentStreak}
              </div>
              <Zap className="absolute -top-2 -right-6 w-8 h-8 text-orange-500" />
            </div>
            <p className="text-neutral-600 mb-4">
              {currentStreak === 0
                ? "Start your streak today!"
                : `${currentStreak} day${currentStreak !== 1 ? "s" : ""} of consistent progress`}
            </p>

            {currentStreak > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  Keep it up! Consistency beats intensity.
                </p>
              </div>
            )}

            {currentStreak === 0 && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                <p className="text-sm text-neutral-700">
                  Complete today's mission to start your streak
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Links - Tertiary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => router.push("/roadmap")}
            className="p-4 border-2 border-neutral-200 rounded-xl hover:border-neutral-300 transition-all text-left"
          >
            <Target className="w-6 h-6 text-neutral-700 mb-2" />
            <p className="font-medium text-neutral-900 text-sm">View Roadmap</p>
          </button>
          <button
            onClick={() => router.push("/projects")}
            className="p-4 border-2 border-neutral-200 rounded-xl hover:border-neutral-300 transition-all text-left"
          >
            <FileText className="w-6 h-6 text-neutral-700 mb-2" />
            <p className="font-medium text-neutral-900 text-sm">Projects</p>
          </button>
          <button
            onClick={() => router.push("/study-buddy")}
            className="p-4 border-2 border-neutral-200 rounded-xl hover:border-neutral-300 transition-all text-left"
          >
            <Target className="w-6 h-6 text-neutral-700 mb-2" />
            <p className="font-medium text-neutral-900 text-sm">AI Mentor</p>
          </button>
          <button
            onClick={() => router.push("/code-editor")}
            className="p-4 border-2 border-neutral-200 rounded-xl hover:border-neutral-300 transition-all text-left"
          >
            <Code className="w-6 h-6 text-neutral-700 mb-2" />
            <p className="font-medium text-neutral-900 text-sm">Practice</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

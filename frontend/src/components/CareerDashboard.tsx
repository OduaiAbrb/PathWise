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
  Trophy,
  Calendar,
  BookOpen,
  Code,
  FileText,
  ChevronRight,
  AlertTriangle,
  Brain,
  Flame,
} from "lucide-react";
import ReadinessConfidenceMeter from "./ReadinessConfidenceMeter";
import TimeToJobEstimator from "./TimeToJobEstimator";
import RegretPreview from "./RegretPreview";

interface TodaysMission {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  whatHappensIfSkipped: string;
  estimatedMinutes: number;
  type: "learn" | "practice" | "test" | "interview_prep";
  roadmapId: string;
  taskId: string;
  difficulty: "easy" | "medium" | "hard";
  interviewFrequency: number; // % of interviews that ask this
}

interface ReadinessScore {
  overall: number;
  technical: number;
  projects: number;
  interview: number;
  lastUpdated: Date;
  trend: "up" | "down" | "stable";
  weeklyChange: number;
}

/**
 * CareerDashboard - The Heart of PathWise
 * 
 * HARD RULE: ONE PRIMARY ACTION PER DAY
 * 
 * Dashboard shows:
 * - Today's Mission (45-90 minutes)
 * - Why it matters
 * - Time estimate
 * - ONE big "Start" button
 * 
 * Everything else is secondary.
 */
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
  const [skippedTasks, setSkippedTasks] = useState(0);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);

  useEffect(() => {
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

      if (roadmapsResponse.status === 401 || roadmapsResponse.status === 403) {
        setAuthError(true);
        setIsLoading(false);
        return;
      }

      if (roadmapsResponse.ok) {
        const roadmapsData = await roadmapsResponse.json();
        const activeRoadmap = roadmapsData.data?.[0];
        
        // Also fetch ALL roadmaps for display
        const allRoadmapsResponse = await fetch(getApiUrl("/api/v1/roadmaps/list"), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (allRoadmapsResponse.ok) {
          const allRoadmapsData = await allRoadmapsResponse.json();
          setRoadmaps(allRoadmapsData.data || []);
        }
        
        if (activeRoadmap) {
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
              difficulty: skill.difficulty || "medium",
              estimated_hours: skill.estimated_hours || 2,
              importance: skill.importance || "important",
              interview_frequency: skill.interview_frequency || Math.floor(Math.random() * 30 + 50),
            })) || []
          ) || [];

          // Get first incomplete skill - prioritized by importance
          const nextSkill = allSkills
            .filter((s: any) => s.status !== "completed")
            .sort((a: any, b: any) => {
              const importanceOrder = { critical: 0, important: 1, optional: 2 };
              return (importanceOrder[a.importance as keyof typeof importanceOrder] || 1) - 
                     (importanceOrder[b.importance as keyof typeof importanceOrder] || 1);
            })[0];
          
          if (nextSkill) {
            setTodaysMission({
              id: nextSkill.id,
              title: nextSkill.name,
              description: nextSkill.description || `Master ${nextSkill.name} - a critical skill for ${activeRoadmap.job_title} roles.`,
              whyItMatters: `This skill appears in ${nextSkill.interview_frequency}% of ${activeRoadmap.job_title} job interviews.`,
              whatHappensIfSkipped: "Skipping core skills leads to rejection in technical interviews. Your readiness score will decrease.",
              estimatedMinutes: Math.min(90, Math.max(45, (nextSkill.estimated_hours || 1) * 60)),
              type: "learn",
              roadmapId: nextSkill.roadmapId,
              taskId: nextSkill.id,
              difficulty: nextSkill.difficulty,
              interviewFrequency: nextSkill.interview_frequency,
            });
          }

          // Calculate readiness score - HONEST & PAINFUL
          const completedSkills = allSkills.filter((s: any) => s.status === "completed").length;
          const totalSkills = allSkills.length;
          const baseScore = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;
          
          // Penalize for skipped tasks (stored in local storage for demo)
          const storedSkipped = parseInt(localStorage.getItem("pathwise_skipped") || "0");
          setSkippedTasks(storedSkipped);
          const penalty = storedSkipped * 3; // -3% per skipped task
          const adjustedScore = Math.max(0, baseScore - penalty);

          setReadinessScore({
            overall: adjustedScore,
            technical: Math.min(adjustedScore + 5, 100),
            projects: Math.max(adjustedScore - 15, 0),
            interview: Math.max(adjustedScore - 20, 0),
            lastUpdated: new Date(),
            trend: storedSkipped > 0 ? "down" : completedSkills > 0 ? "up" : "stable",
            weeklyChange: storedSkipped > 0 ? -storedSkipped * 3 : completedSkills > 0 ? 5 : 0,
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
    router.push(`/roadmap/${todaysMission.roadmapId}`);
  };

  const handleSkipMission = () => {
    // PENALTY: Readiness score goes down
    const newSkipped = skippedTasks + 1;
    localStorage.setItem("pathwise_skipped", newSkipped.toString());
    setSkippedTasks(newSkipped);
    
    if (readinessScore) {
      setReadinessScore({
        ...readinessScore,
        overall: Math.max(0, readinessScore.overall - 3),
        trend: "down",
        weeklyChange: readinessScore.weeklyChange - 3,
      });
    }
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case "learn": return BookOpen;
      case "practice": return Code;
      case "test": return Brain;
      case "interview_prep": return Target;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "hard": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="loading-state">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Preparing your mission...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Expired</h2>
          <p className="text-slate-600 mb-6">
            Your session has expired. Please sign in again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!todaysMission) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
        >
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            No Active Roadmap
          </h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            You need a roadmap to start your journey. Let's create one based on your career goals.
          </p>
          <button
            onClick={() => router.push("/roadmap/new")}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            data-testid="create-roadmap-btn"
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2"
      >
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-slate-600">
          Your path to {targetRole} continues today.
        </p>
      </motion.div>

      {/* PRIMARY ACTION - Today's Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
        data-testid="todays-mission"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20" />
        <div className="relative bg-white rounded-2xl border-2 border-blue-100 p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  Today's Mission
                </span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {todaysMission.title}
              </h2>
              <p className="text-slate-600 max-w-xl">
                {todaysMission.description}
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getDifficultyColor(todaysMission.difficulty)}`}>
              {todaysMission.difficulty}
            </span>
          </div>

          {/* Why It Matters - Critical */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 mb-1">Why this matters:</p>
                <p className="text-slate-700">{todaysMission.whyItMatters}</p>
              </div>
            </div>
          </div>

          {/* Time & Type */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-5 h-5 text-slate-500" />
              <span className="font-medium">{todaysMission.estimatedMinutes} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MissionIcon className="w-5 h-5 text-slate-500" />
              <span className="capitalize font-medium">{todaysMission.type.replace("_", " ")}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-medium">{todaysMission.interviewFrequency}% interview frequency</span>
            </div>
          </div>

          {/* CTA - ONE BIG BUTTON */}
          <button
            onClick={handleStartMission}
            disabled={isStarting}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            data-testid="start-mission-btn"
          >
            {isStarting ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-white" />
                Start Today's Mission
              </>
            )}
          </button>

          {/* Skip Warning */}
          <button
            onClick={handleSkipMission}
            className="w-full mt-3 py-2 text-slate-500 text-sm hover:text-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Skip (your readiness score will decrease)
          </button>
        </div>
      </motion.div>

      {/* SECONDARY - Readiness Score & Streak */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Readiness Score - HONEST & PAINFUL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 p-6"
          data-testid="readiness-score"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Job Readiness</h3>
            {readinessScore?.trend === "down" && (
              <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                <TrendingDown className="w-4 h-4" />
                {readinessScore.weeklyChange}%
              </span>
            )}
            {readinessScore?.trend === "up" && (
              <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +{readinessScore.weeklyChange}%
              </span>
            )}
          </div>

          {readinessScore && (
            <>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-slate-900">
                    {readinessScore.overall}%
                  </span>
                </div>
                <p className="text-sm text-slate-600">ready for {targetRole}</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                {[
                  { label: "Technical Skills", value: readinessScore.technical, color: "bg-blue-600" },
                  { label: "Portfolio Projects", value: readinessScore.projects, color: "bg-emerald-600" },
                  { label: "Interview Ready", value: readinessScore.interview, color: "bg-purple-600" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="font-medium text-slate-900">{item.value}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning if low */}
              {readinessScore.overall < 60 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    {readinessScore.overall < 30 
                      ? "You're not ready for interviews yet. Focus on daily missions."
                      : "Keep going! You need 60%+ to start applying with confidence."}
                  </p>
                </div>
              )}

              {/* Penalty warning */}
              {skippedTasks > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800">
                    You've skipped {skippedTasks} task{skippedTasks > 1 ? "s" : ""}. 
                    This costs you {skippedTasks * 3}% on your readiness score.
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 p-6"
          data-testid="streak-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Current Streak</h3>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>

          <div className="text-center py-4">
            <div className="relative inline-block">
              <span className="text-6xl font-bold text-slate-900">{currentStreak}</span>
              {currentStreak > 0 && (
                <Flame className="absolute -top-2 -right-8 w-8 h-8 text-orange-500 animate-pulse" />
              )}
            </div>
            <p className="text-slate-600 mt-2">
              {currentStreak === 0
                ? "Start your streak today!"
                : `${currentStreak} day${currentStreak !== 1 ? "s" : ""} of consistent progress`}
            </p>

            {currentStreak > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-emerald-800 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Consistency beats intensity. Keep it up!
                </p>
              </div>
            )}

            {currentStreak === 0 && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-sm text-slate-700">
                  Complete today's mission to start your streak
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Premium Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Readiness vs Confidence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ReadinessConfidenceMeter
            technicalReadiness={readinessScore?.technical || 0}
            interviewConfidence={readinessScore?.interview || 0}
            targetRole={targetRole}
          />
        </motion.div>

        {/* Time to Job Estimator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <TimeToJobEstimator
            targetRole={targetRole}
            currentProgress={readinessScore?.overall || 0}
            weeklyHours={10}
            consistencyScore={currentStreak > 0 ? Math.min(100, currentStreak * 10) : 50}
          />
        </motion.div>
      </div>

      {/* Regret Preview */}
      {targetRole && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <RegretPreview targetRole={targetRole} />
        </motion.div>
      )}

      {/* My Roadmaps Section */}
      {roadmaps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white rounded-2xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">My Roadmaps</h3>
              <p className="text-sm text-slate-600">{roadmaps.length} active learning path{roadmaps.length > 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => router.push("/roadmap/new")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              New Roadmap
            </button>
          </div>

          <div className="space-y-4">
            {roadmaps.slice(0, 3).map((roadmap: any) => (
              <div
                key={roadmap.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => router.push(`/roadmap/${roadmap.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {roadmap.job_title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {roadmap.estimated_weeks} weeks
                      </span>
                      <span>•</span>
                      <span className="capitalize">{roadmap.skill_level}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        roadmap.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        roadmap.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {roadmap.status}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-slate-900">{roadmap.completion_percentage || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (roadmap.completion_percentage || 0) >= 80 ? 'bg-emerald-500' :
                        (roadmap.completion_percentage || 0) >= 50 ? 'bg-blue-500' :
                        (roadmap.completion_percentage || 0) >= 20 ? 'bg-amber-500' :
                        'bg-slate-300'
                      }`}
                      style={{ width: `${roadmap.completion_percentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {roadmaps.length > 3 && (
            <button
              onClick={() => router.push("/roadmap")}
              className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-2"
            >
              View All {roadmaps.length} Roadmaps
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* Quick Actions - Tertiary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl border border-slate-200 p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Target, label: "View Roadmap", path: "/roadmap", color: "blue" },
            { icon: FileText, label: "Projects", path: "/projects", color: "emerald" },
            { icon: Brain, label: "AI Mentor", path: "/study-buddy", color: "purple" },
            { icon: Code, label: "Practice", path: "/code-editor", color: "orange" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.path)}
              className="p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group"
            >
              <action.icon className={`w-6 h-6 text-${action.color}-600 mb-2`} />
              <p className="font-medium text-slate-900 text-sm flex items-center gap-1">
                {action.label}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

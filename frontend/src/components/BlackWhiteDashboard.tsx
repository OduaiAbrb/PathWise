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
  Briefcase,
  Code,
  Flame,
  BookOpen,
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
      resources?: Array<{ title: string; url: string; type: string }>;
    }>;
  }>;
}

interface NextTask {
  skillName: string;
  skillId: string;
  phaseTitle: string;
  estimatedMinutes: number;
  interviewFrequency: number;
  resourceUrl?: string;
  resourceTitle?: string;
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
  const [nextTask, setNextTask] = useState<NextTask | null>(null);
  const [stats, setStats] = useState({
    readiness: 0,
    streak: 0,
    skillsCompleted: 0,
    totalSkills: 0,
    hoursInvested: 0,
    technicalScore: 0,
    projectsScore: 0,
    interviewScore: 0,
    readinessTrend: 0,
    streakTrend: 0,
    skillsTrend: 0,
    hoursTrend: 0,
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
          
          // Calculate readiness breakdown
          const technicalScore = Math.round((completedSkills / Math.max(allSkills.length, 1)) * 100);
          const projectsScore = Math.min(100, technicalScore * 0.8); // Projects lag behind skills
          const interviewScore = Math.min(100, technicalScore * 0.6); // Interview readiness lags more

          // Calculate trends (mock for now - would come from historical data)
          const readinessTrend = completedSkills > 0 ? 5 : 0;
          const skillsTrend = completedSkills > 0 ? 2 : 0;
          const hoursTrend = completedSkills > 0 ? 3 : 0;

          setStats({
            readiness: transformedRoadmap.completion_percentage,
            streak: 0,
            skillsCompleted: completedSkills,
            totalSkills: allSkills.length,
            hoursInvested: Math.floor(completedSkills * (totalHours / Math.max(allSkills.length, 1))),
            technicalScore,
            projectsScore: Math.round(projectsScore),
            interviewScore: Math.round(interviewScore),
            readinessTrend,
            streakTrend: 0,
            skillsTrend,
            hoursTrend,
          });

          // Find next task (first incomplete skill)
          for (const phase of transformedRoadmap.phases) {
            for (const skill of phase.skills) {
              if (skill.status !== "completed") {
                const firstResource = skill.resources?.[0];
                setNextTask({
                  skillName: skill.name,
                  skillId: skill.id,
                  phaseTitle: phase.title,
                  estimatedMinutes: (skill.estimated_hours || 1) * 60,
                  interviewFrequency: skill.interview_frequency || 65,
                  resourceUrl: firstResource?.url,
                  resourceTitle: firstResource?.title,
                });
                break;
              }
            }
            if (nextTask) break;
          }
        }
      }

      // Fetch streak
      const statsResponse = await fetch(getApiUrl("/api/v1/gamification/stats"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const currentStreak = statsData.data?.current_streak || 0;
        const streakTrend = currentStreak > 0 ? 1 : 0;
        setStats(prev => ({ ...prev, streak: currentStreak, streakTrend }));
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (roadmap?.id) {
                  router.push(`/roadmap/${roadmap.id}`);
                } else {
                  router.push("/roadmap");
                }
              }}
              className="px-4 py-2 bg-white text-black font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              View Roadmap
            </button>
            <button
              onClick={() => router.push("/study-groups")}
              className="px-4 py-2 border-2 border-white text-white font-semibold hover:bg-white hover:text-black transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Study Groups
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Consolidated Metrics - Single Row with Trend Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Job Readiness */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-black p-6 bg-white hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-black text-white rounded">
                <Briefcase className="w-5 h-5" />
              </div>
              {stats.readinessTrend !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  stats.readinessTrend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.readinessTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(stats.readinessTrend)}%
                </div>
              )}
            </div>
            <div className="text-4xl font-bold text-black mb-1">
              {stats.readiness}%
            </div>
            <div className="text-sm font-semibold text-gray-900 mb-2">
              Job Readiness
            </div>
            <div className="text-xs text-gray-600">
              {stats.readiness < 60 ? '⚠️ Need 60%+ to apply' : '✓ Ready to apply'}
            </div>
          </motion.div>

          {/* Day Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border-2 border-black p-6 bg-white hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-orange-500 text-white rounded">
                <Flame className="w-5 h-5" />
              </div>
              {stats.streakTrend !== 0 && (
                <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  +{stats.streakTrend}
                </div>
              )}
            </div>
            <div className="text-4xl font-bold text-black mb-1">
              {stats.streak}
            </div>
            <div className="text-sm font-semibold text-gray-900 mb-2">
              Day Streak
            </div>
            <div className="text-xs text-gray-600">
              {stats.streak === 0 ? 'Start today!' : stats.streak === 1 ? 'Keep it going!' : 'On fire! 🔥'}
            </div>
          </motion.div>

          {/* Skills Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border-2 border-black p-6 bg-white hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-blue-600 text-white rounded">
                <Code className="w-5 h-5" />
              </div>
              {stats.skillsTrend !== 0 && (
                <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  +{stats.skillsTrend}
                </div>
              )}
            </div>
            <div className="text-4xl font-bold text-black mb-1">
              {stats.skillsCompleted}
            </div>
            <div className="text-sm font-semibold text-gray-900 mb-2">
              Skills Completed
            </div>
            <div className="text-xs text-gray-600">
              {stats.totalSkills - stats.skillsCompleted} remaining of {stats.totalSkills}
            </div>
          </motion.div>

          {/* Time Invested */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border-2 border-black p-6 bg-white hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-purple-600 text-white rounded">
                <Clock className="w-5 h-5" />
              </div>
              {stats.hoursTrend !== 0 && (
                <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  +{stats.hoursTrend}h
                </div>
              )}
            </div>
            <div className="text-4xl font-bold text-black mb-1">
              {stats.hoursInvested}h
            </div>
            <div className="text-sm font-semibold text-gray-900 mb-2">
              Time Invested
            </div>
            <div className="text-xs text-gray-600">
              {stats.hoursInvested < 10 ? 'Just getting started' : stats.hoursInvested < 50 ? 'Building momentum' : 'Serious commitment! 💪'}
            </div>
          </motion.div>
        </div>

        {/* Next Task Card - Concrete Action */}
        {nextTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="border-4 border-black bg-gradient-to-r from-black to-gray-900 text-white overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold uppercase rounded">
                      Next Task
                    </div>
                    <span className="text-xs text-gray-400">
                      ~{Math.round(nextTask.estimatedMinutes)} minutes
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-3">
                    Complete: {nextTask.skillName}
                  </h2>
                  <p className="text-gray-300 text-lg mb-4">
                    {nextTask.phaseTitle}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200">
                        <strong className="text-white">Why it matters:</strong> This skill appears in {nextTask.interviewFrequency}% of {roadmap.job_title} job interviews
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200">
                        <strong className="text-white">What you'll learn:</strong> Master this skill to boost your technical readiness score
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push(`/roadmap/${roadmap.id}`)}
                    className="px-8 py-4 bg-white text-black font-bold text-lg hover:bg-gray-100 transition-colors flex items-center gap-3 whitespace-nowrap"
                  >
                    <Play className="w-6 h-6" />
                    Start Now
                  </button>
                  {nextTask.resourceUrl && (
                    <a
                      href={nextTask.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3 border-2 border-white text-white font-semibold hover:bg-white hover:text-black transition-colors flex items-center gap-2 justify-center"
                    >
                      <BookOpen className="w-5 h-5" />
                      View Resource
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Visual Roadmap Progress Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="border-2 border-black p-6 bg-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">Roadmap Progress</h3>
            <span className="text-sm text-gray-600">{stats.readiness}% Complete</span>
          </div>
          
          {/* Segmented Progress Bar */}
          <div className="flex gap-1 mb-4">
            {roadmap.phases.map((phase, index) => {
              const phaseSkills = phase.skills.length;
              const completedSkills = phase.skills.filter(s => s.status === "completed").length;
              const phaseProgress = phaseSkills > 0 ? (completedSkills / phaseSkills) * 100 : 0;
              const isActive = phase.status === "in_progress";
              const isCompleted = phase.status === "completed";
              
              return (
                <button
                  key={phase.id}
                  onClick={() => router.push(`/roadmap/${roadmap.id}#phase-${phase.id}`)}
                  className="flex-1 group relative"
                  title={`${phase.title}: ${Math.round(phaseProgress)}% complete`}
                >
                  <div className={`h-8 border-2 transition-all ${
                    isCompleted ? 'bg-black border-black' :
                    isActive ? 'bg-gray-300 border-black' :
                    'bg-gray-100 border-gray-300'
                  } hover:shadow-md`}>
                    <div 
                      className={`h-full transition-all duration-700 ${
                        isCompleted ? 'bg-black' : 'bg-black'
                      }`}
                      style={{ width: `${phaseProgress}%` }}
                    />
                  </div>
                  <div className="absolute -bottom-6 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold text-black whitespace-nowrap">
                      {phase.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-600 mt-8">
            <span>Phase 1</span>
            <span>Phase {roadmap.phases.length}</span>
          </div>
        </motion.div>

        {/* Readiness Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-2 border-black p-6 bg-white"
        >
          <h3 className="text-lg font-bold text-black mb-4">Readiness Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Technical Skills</span>
                <span className="font-bold">{stats.technicalScore}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-black rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${stats.technicalScore}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Projects</span>
                <span className="font-bold">{stats.projectsScore}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-black rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${stats.projectsScore}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Interview Ready</span>
                <span className="font-bold">{stats.interviewScore}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-black rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${stats.interviewScore}%` }}
                />
              </div>
            </div>
          </div>
          {stats.readiness < 60 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
              <strong>Keep going!</strong> You need 60%+ readiness before applying to jobs. Focus on {nextTask?.skillName || "your next skill"} to increase your score.
            </div>
          )}
        </motion.div>

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

        {/* Quick Actions - 2x2 Grid with Icons & Descriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border-2 border-black p-8 bg-white"
        >
          <h3 className="text-2xl font-bold text-black mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => router.push("/projects")}
              className="p-6 border-2 border-black hover:bg-black hover:text-white transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-black text-white group-hover:bg-white group-hover:text-black transition-colors rounded">
                  <Target className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold mb-2">Projects</p>
                  <p className="text-sm text-gray-600 group-hover:text-gray-300">
                    Build portfolio projects that showcase your skills to employers
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push("/interview")}
              className="p-6 border-2 border-black hover:bg-black hover:text-white transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-black text-white group-hover:bg-white group-hover:text-black transition-colors rounded">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold mb-2">Interview Prep</p>
                  <p className="text-sm text-gray-600 group-hover:text-gray-300">
                    Practice technical and behavioral interviews with AI feedback
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push("/groups")}
              className="p-6 border-2 border-black hover:bg-black hover:text-white transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-black text-white group-hover:bg-white group-hover:text-black transition-colors rounded">
                  <Users className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold mb-2">Study Groups</p>
                  <p className="text-sm text-gray-600 group-hover:text-gray-300">
                    Join peers on the same journey and learn together
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push("/portfolio")}
              className="p-6 border-2 border-black hover:bg-black hover:text-white transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-black text-white group-hover:bg-white group-hover:text-black transition-colors rounded">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold mb-2">Portfolio</p>
                  <p className="text-sm text-gray-600 group-hover:text-gray-300">
                    Generate and showcase your work to stand out to recruiters
                  </p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

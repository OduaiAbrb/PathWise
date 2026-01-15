"use client";
// Version: 2.0.0 - Black & White Theme with Tree Roadmap
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
      {/* Black Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black text-white p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-white"
            >
              {session?.user?.name ? `${session.user.name.split(" ")[0]}'s Dashboard` : "Your Dashboard"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-300 mt-2 flex items-center gap-2"
            >
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">{roadmap.job_title}</span>
              <span className="text-sm">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {timeRemaining.hours}h {timeRemaining.minutes}m left today
              </span>
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (roadmap?.id) {
                  router.push(`/roadmap/${roadmap.id}`);
                } else {
                  router.push("/roadmap");
                }
              }}
              className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:shadow-2xl transition-all flex items-center gap-2 group"
            >
              <Target className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              View Roadmap
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/groups")}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white font-bold rounded-xl hover:bg-white hover:text-black transition-all flex items-center gap-2 group"
            >
              <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Study Groups
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Animated Metrics with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Job Readiness */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative bg-black p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden group"
          >
            {/* Animated background circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-black text-white rounded-2xl"
                >
                  <Briefcase className="w-6 h-6" />
                </motion.div>
                {stats.readinessTrend !== 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="flex items-center gap-1 text-sm font-bold text-black bg-gray-200 px-3 py-1 rounded-full"
                  >
                    {stats.readinessTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    +{Math.abs(stats.readinessTrend)}%
                  </motion.div>
                )}
              </div>
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-5xl font-black text-black mb-2"
              >
                {stats.readiness}%
              </motion.div>
              <div className="text-sm font-bold text-white mb-2">
                Job Readiness
              </div>
              <div className="text-xs text-gray-300 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                {stats.readiness < 60 ? '⚠️ Need 60%+ to apply' : '✨ Ready to apply'}
              </div>
            </div>
          </motion.div>

          {/* Day Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="relative bg-white border-4 border-black p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-black/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="p-3 bg-black text-white rounded-2xl"
                >
                  <Flame className="w-6 h-6" />
                </motion.div>
                {stats.streakTrend !== 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="flex items-center gap-1 text-sm font-bold text-black bg-gray-200 px-3 py-1 rounded-full"
                  >
                    <TrendingUp className="w-4 h-4" />
                    +{stats.streakTrend}
                  </motion.div>
                )}
              </div>
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-5xl font-black text-black mb-2"
              >
                {stats.streak}
              </motion.div>
              <div className="text-sm font-bold text-black mb-2">
                Day Streak
              </div>
              <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full inline-block">
                {stats.streak === 0 ? '🚀 Start today!' : stats.streak === 1 ? '💪 Keep it going!' : '🔥 On fire!'}
              </div>
            </div>
          </motion.div>

          {/* Skills Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            className="relative bg-black p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-black text-white rounded-2xl"
                >
                  <Code className="w-6 h-6" />
                </motion.div>
                {stats.skillsTrend !== 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="flex items-center gap-1 text-sm font-bold text-black bg-gray-200 px-3 py-1 rounded-full"
                  >
                    <TrendingUp className="w-4 h-4" />
                    +{stats.skillsTrend}
                  </motion.div>
                )}
              </div>
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-5xl font-black text-black mb-2"
              >
                {stats.skillsCompleted}
              </motion.div>
              <div className="text-sm font-bold text-white mb-2">
                Skills Completed
              </div>
              <div className="text-xs text-gray-300 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                {stats.totalSkills - stats.skillsCompleted} remaining of {stats.totalSkills}
              </div>
            </div>
          </motion.div>

          {/* Time Invested */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
            className="relative bg-white border-4 border-black p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-black/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-black text-white rounded-2xl"
                >
                  <Clock className="w-6 h-6" />
                </motion.div>
                {stats.hoursTrend !== 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="flex items-center gap-1 text-sm font-bold text-black bg-gray-200 px-3 py-1 rounded-full"
                  >
                    <TrendingUp className="w-4 h-4" />
                    +{stats.hoursTrend}h
                  </motion.div>
                )}
              </div>
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-5xl font-black text-black mb-2"
              >
                {stats.hoursInvested}h
              </motion.div>
              <div className="text-sm font-bold text-black mb-2">
                Time Invested
              </div>
              <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full inline-block">
                {stats.hoursInvested < 10 ? '🌱 Just getting started' : stats.hoursInvested < 50 ? '⚡ Building momentum' : '💪 Serious commitment!'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Next Task Card - Black & White */}
        {nextTask && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="relative bg-black rounded-3xl shadow-2xl overflow-hidden border-4 border-black"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-5">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-20 -right-20 w-96 h-96 bg-white rounded-full blur-3xl"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, -90, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"
              />
            </div>
            <div className="p-8 relative z-10">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-4 py-2 bg-white text-black text-sm font-black uppercase rounded-full shadow-lg"
                    >
                      🎯 Next Task
                    </motion.div>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                      ⏱️ ~{Math.round(nextTask.estimatedMinutes)} min
                    </span>
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-4xl font-black text-white mb-3 leading-tight"
                  >
                    {nextTask.skillName}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-white/90 text-lg mb-5 font-medium"
                  >
                    📚 {nextTask.phaseTitle}
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                  >
                    <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Zap className="w-6 h-6 text-white flex-shrink-0" />
                      </motion.div>
                      <span className="text-white text-sm">
                        <strong className="text-white">Why it matters:</strong> Appears in <span className="text-white font-bold">{nextTask.interviewFrequency}%</span> of {roadmap.job_title} interviews
                      </span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      <Target className="w-6 h-6 text-white flex-shrink-0" />
                      <span className="text-white text-sm">
                        <strong className="text-white">Impact:</strong> Boosts your technical readiness score significantly
                      </span>
                    </div>
                  </motion.div>
                </div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/roadmap/${roadmap.id}`)}
                    className="px-10 py-5 bg-white text-black font-black text-xl rounded-2xl hover:shadow-2xl transition-all flex items-center gap-3 whitespace-nowrap group"
                  >
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Play className="w-7 h-7" />
                    </motion.div>
                    Start Now
                  </motion.button>
                  {nextTask.resourceUrl && (
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={nextTask.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white font-bold rounded-2xl hover:bg-white hover:text-black transition-all flex items-center gap-2 justify-center"
                    >
                      <BookOpen className="w-5 h-5" />
                      View Resource
                    </motion.a>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tree-Based Roadmap Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="relative bg-white p-8 rounded-3xl shadow-xl border-4 border-black overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-black text-black"
            >
              🌳 Your Learning Tree
            </motion.h3>
            <motion.span 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="px-4 py-2 bg-black text-white font-bold rounded-full text-sm shadow-lg"
            >
              {stats.readiness}% Complete
            </motion.span>
          </div>
          
          {/* Tree Structure */}
          <div className="relative pl-8">
            {/* Main Trunk Line */}
            <div className="absolute left-4 top-0 bottom-0 w-1 bg-black" />
            
            {roadmap.phases.map((phase, index) => {
              const phaseSkills = phase.skills.length;
              const completedSkills = phase.skills.filter((s: any) => s.status === "completed").length;
              const phaseProgress = phaseSkills > 0 ? Math.round((completedSkills / phaseSkills) * 100) : 0;
              const isActive = phase.status === "in_progress";
              const isCompleted = phase.status === "completed";
              const isLast = index === roadmap.phases.length - 1;
              
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.15 }}
                  className={`relative ${isLast ? '' : 'mb-6'}`}
                >
                  {/* Branch Line */}
                  <div className="absolute left-[-16px] top-6 w-8 h-0.5 bg-black" />
                  
                  {/* Phase Node (Circle) */}
                  <div className="absolute left-[-24px] top-3 w-6 h-6 rounded-full border-4 border-black bg-white flex items-center justify-center z-10">
                    {isCompleted ? (
                      <div className="w-3 h-3 bg-black rounded-full" />
                    ) : isActive ? (
                      <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                    ) : null}
                  </div>
                  
                  {/* Phase Content */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => router.push(`/roadmap/${roadmap.id}#phase-${phase.id}`)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isCompleted 
                        ? 'bg-black text-white border-black' 
                        : isActive 
                        ? 'bg-white text-black border-black shadow-lg' 
                        : 'bg-gray-50 text-gray-600 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">
                        Phase {index + 1}: {phase.title}
                      </span>
                      <span className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-black'}`}>
                        {phaseProgress}%
                      </span>
                    </div>
                    
                    {/* Skills as mini branches */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {phase.skills.slice(0, 5).map((skill: any, skillIndex: number) => (
                        <span 
                          key={skill.id}
                          className={`text-xs px-2 py-1 rounded-full ${
                            skill.status === 'completed' 
                              ? isCompleted ? 'bg-white text-black' : 'bg-black text-white'
                              : skill.status === 'in_progress'
                              ? 'bg-gray-200 text-black border border-black'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {skill.name}
                        </span>
                      ))}
                      {phase.skills.length > 5 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
                          +{phase.skills.length - 5} more
                        </span>
                      )}
                    </div>
                    
                    {/* Progress bar inside phase */}
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${phaseProgress}%` }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                        className={`h-full ${isCompleted ? 'bg-white' : 'bg-black'}`}
                      />
                    </div>
                  </motion.button>
                </motion.div>
              );
            })}
            
            {/* Tree Root */}
            <div className="absolute left-2 bottom-[-20px] w-5 h-5 bg-black rounded-full border-4 border-white shadow-lg" />
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-black rounded-full" />
              <span className="text-sm font-semibold text-black">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-black rounded-full">
                <div className="w-1.5 h-1.5 bg-black rounded-full m-auto mt-0.5 animate-pulse" />
              </div>
              <span className="text-sm font-semibold text-black">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded-full border border-gray-300" />
              <span className="text-sm font-semibold text-gray-500">Not Started</span>
            </div>
          </div>
        </motion.div>

        {/* Readiness Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="relative bg-white p-8 rounded-3xl shadow-xl border-4 border-black overflow-hidden"
        >
          <div className="absolute inset-0 bg-gray-50/50 pointer-events-none" />
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="text-2xl font-black text-black mb-6 relative z-10"
          >
            📊 Readiness Breakdown
          </motion.h3>
          <div className="grid grid-cols-3 gap-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-black">💻 Technical Skills</span>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="font-black text-lg text-black"
                >
                  {stats.technicalScore}%
                </motion.span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner border-2 border-gray-300">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.technicalScore}%` }}
                  transition={{ duration: 1, delay: 1.1, ease: "easeOut" }}
                  className="h-full bg-black rounded-full shadow-lg"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-black">🚀 Projects</span>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1, type: "spring" }}
                  className="font-black text-lg text-black"
                >
                  {stats.projectsScore}%
                </motion.span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner border-2 border-gray-300">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.projectsScore}%` }}
                  transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                  className="h-full bg-black rounded-full shadow-lg"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-black">🎯 Interview Ready</span>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring" }}
                  className="font-black text-lg text-black"
                >
                  {stats.interviewScore}%
                </motion.span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner border-2 border-gray-300">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.interviewScore}%` }}
                  transition={{ duration: 1, delay: 1.3, ease: "easeOut" }}
                  className="h-full bg-black rounded-full shadow-lg"
                />
              </div>
            </motion.div>
          </div>
          {stats.readiness < 60 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="mt-6 p-5 bg-gray-100 border-4 border-black rounded-2xl text-black text-sm shadow-lg relative z-10"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <strong className="text-base">Keep pushing forward!</strong>
                  <p className="mt-1">You need 60%+ readiness to start applying. Focus on <span className="font-bold">{nextTask?.skillName || "your next skill"}</span> to level up!</p>
                </div>
              </div>
            </motion.div>
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
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
          className="relative bg-white p-8 rounded-3xl shadow-xl border-4 border-black overflow-hidden"
        >
          <div className="absolute inset-0 bg-gray-50/50 pointer-events-none" />
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="text-2xl font-black text-black mb-8 relative z-10"
          >
            ⚡ Quick Actions
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              transition={{ delay: 0.9 }}
              onClick={() => router.push("/projects")}
              className="p-6 bg-black hover:bg-gray-900 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all text-left group overflow-hidden relative border-4 border-black"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start gap-4 relative z-10">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-black text-white rounded-2xl"
                >
                  <Target className="w-8 h-8" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-2xl font-black mb-2">Projects</p>
                  <p className="text-sm text-white/90">
                    Build portfolio projects that showcase your skills to employers
                  </p>
                </div>
              </div>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              transition={{ delay: 1 }}
              onClick={() => router.push("/interview")}
              className="p-6 bg-white border-4 border-black hover:bg-gray-100 text-black rounded-2xl shadow-xl hover:shadow-2xl transition-all text-left group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start gap-4 relative z-10">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-black text-white rounded-2xl"
                >
                  <MessageSquare className="w-8 h-8" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-2xl font-black mb-2">Interview Prep</p>
                  <p className="text-sm text-gray-700">
                    Practice technical and behavioral interviews with AI feedback
                  </p>
                </div>
              </div>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              transition={{ delay: 1.1 }}
              onClick={() => router.push("/groups")}
              className="p-6 bg-black hover:bg-gray-900 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all text-left group overflow-hidden relative border-4 border-black"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start gap-4 relative z-10">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-black text-white rounded-2xl"
                >
                  <Users className="w-8 h-8" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-2xl font-black mb-2">Study Groups</p>
                  <p className="text-sm text-white/90">
                    Join peers on the same journey and learn together
                  </p>
                </div>
              </div>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              transition={{ delay: 1.2 }}
              onClick={() => router.push("/portfolio")}
              className="p-6 bg-white border-4 border-black hover:bg-gray-100 text-black rounded-2xl shadow-xl hover:shadow-2xl transition-all text-left group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start gap-4 relative z-10">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-black text-white rounded-2xl"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-2xl font-black mb-2">Portfolio</p>
                  <p className="text-sm text-gray-700">
                    Generate and showcase your work to stand out to recruiters
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

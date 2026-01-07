"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Target,
  Clock,
  Zap,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Sparkles,
  ChevronRight,
  Play,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface Roadmap {
  id: string;
  job_title: string;
  completion_percentage: number;
  status: string;
  generated_at: string;
}

interface NextAction {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  resourceUrl: string;
  resourceTitle: string;
  skillName: string;
  phase: string;
}

interface ReadinessScore {
  overall: number;
  skillsCovered: number;
  projectsCompleted: number;
  interviewReadiness: number;
  missingSkills: string[];
  targetRole: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  // Mock data for demo - in production, fetch from API
  const [readinessScore] = useState<ReadinessScore>({
    overall: 67,
    skillsCovered: 72,
    projectsCompleted: 50,
    interviewReadiness: 45,
    missingSkills: ["System Design", "Docker", "CI/CD"],
    targetRole: "Senior Backend Engineer",
  });

  const [nextAction] = useState<NextAction>({
    id: "1",
    title: "Complete REST API fundamentals",
    description: "Learn how to design and implement RESTful APIs with proper status codes and error handling.",
    estimatedMinutes: 35,
    resourceUrl: "https://youtube.com/watch?v=example",
    resourceTitle: "REST API Design Best Practices",
    skillName: "REST APIs",
    phase: "Phase 2: Backend Fundamentals",
  });

  const [streak] = useState(7);
  const [weeklyProgress] = useState(65);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(getApiUrl("/api/v1/roadmap/list"), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setRoadmaps(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch roadmaps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmaps();
  }, [accessToken]);

  const userName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-2 mb-2">Welcome back, {userName}</h1>
        <p className="body-large">Here's your learning progress at a glance.</p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Job Readiness Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="card p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="heading-3 mb-1">Job Readiness Score</h2>
                <p className="text-sm text-neutral-500">
                  {readinessScore.targetRole}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-neutral-900">
                  {readinessScore.overall}%
                </div>
                <p className="text-sm text-neutral-500">Ready</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="progress-bar h-3">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${readinessScore.overall}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {readinessScore.skillsCovered}%
                </div>
                <p className="text-xs text-neutral-500">Skills Covered</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {readinessScore.projectsCompleted}%
                </div>
                <p className="text-xs text-neutral-500">Projects Done</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-xl">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {readinessScore.interviewReadiness}%
                </div>
                <p className="text-xs text-neutral-500">Interview Ready</p>
              </div>
            </div>

            {/* Missing Skills */}
            {readinessScore.missingSkills.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  High-impact skills to focus on:
                </p>
                <div className="flex flex-wrap gap-2">
                  {readinessScore.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column - Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Streak Card */}
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{streak} days</div>
                <p className="text-sm text-neutral-500">Learning streak</p>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-neutral-900">{weeklyProgress}%</div>
                <p className="text-sm text-neutral-500">Weekly goal progress</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Next Best Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <div className="card border-2 border-neutral-900 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-primary">Today's Focus</span>
                <span className="text-sm text-neutral-500">{nextAction.phase}</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {nextAction.title}
              </h3>
              <p className="text-neutral-600 mb-4">{nextAction.description}</p>
              <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {nextAction.estimatedMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {nextAction.resourceTitle}
                </span>
              </div>
              <a
                href={nextAction.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex"
              >
                <Play className="w-4 h-4" />
                Start Learning
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Roadmaps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-3">Your Roadmaps</h2>
          <Link
            href="/roadmap/new"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
          >
            Create New <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-neutral-200 rounded w-3/4 mb-3" />
                <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4" />
                <div className="h-2 bg-neutral-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : roadmaps.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {roadmaps.slice(0, 4).map((roadmap, i) => (
              <motion.div
                key={roadmap.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link href={`/roadmap/${roadmap.id}`} className="card-hover block">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-neutral-900">{roadmap.job_title}</h3>
                    <span className={`badge ${roadmap.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {roadmap.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-neutral-500">Progress</span>
                      <span className="font-medium text-neutral-900">
                        {roadmap.completion_percentage}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${roadmap.completion_percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-neutral-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Started {new Date(roadmap.generated_at).toLocaleDateString()}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Create your first roadmap
            </h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              Paste a job description and let AI create your personalized learning path.
            </p>
            <Link href="/roadmap/new" className="btn-primary inline-flex">
              Generate Roadmap
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { href: "/study-buddy", icon: Sparkles, label: "AI Study Buddy", color: "bg-purple-100 text-purple-600" },
          { href: "/resume-scanner", icon: BookOpen, label: "Resume Scanner", color: "bg-blue-100 text-blue-600" },
          { href: "/projects", icon: Target, label: "Projects", color: "bg-green-100 text-green-600" },
          { href: "/scheduler", icon: Calendar, label: "Scheduler", color: "bg-orange-100 text-orange-600" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="card-hover text-center py-6"
          >
            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <action.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-neutral-900">{action.label}</p>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/fetch-api";
import {
  Map,
  Plus,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ArrowRight,
  Target,
  Sparkles,
  AlertCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface RoadmapListItem {
  id: string;
  job_title: string;
  industry: string;
  skill_level: string;
  completion_percentage: number;
  estimated_weeks: number;
  status: string;
  generated_at: string;
}

export default function RoadmapListPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [roadmaps, setRoadmaps] = useState<RoadmapListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    fetchRoadmaps();
  }, [accessToken]);

  const fetchRoadmaps = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl("/api/v1/roadmaps/list"), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roadmaps");
      }

      const data = await response.json();
      setRoadmaps(data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load roadmaps");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRoadmap = async (id: string) => {
    if (!confirm("Are you sure you want to delete this roadmap?")) return;

    try {
      const response = await fetch(getApiUrl(`/api/v1/roadmaps/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setRoadmaps(roadmaps.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "paused":
        return "text-amber-600 bg-amber-50 border-amber-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 20) return "bg-amber-500";
    return "bg-slate-300";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your roadmaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Roadmaps</h1>
            <p className="text-slate-600">
              Your personalized learning paths to career success
            </p>
          </div>
          <Link
            href="/roadmap/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Roadmap
          </Link>
        </div>

        {/* Stats */}
        {roadmaps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Map className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Roadmaps</p>
                  <p className="text-2xl font-bold text-slate-900">{roadmaps.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Active</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {roadmaps.filter((r) => r.status === "active").length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {Math.round(
                      roadmaps.reduce((sum, r) => sum + r.completion_percentage, 0) /
                        roadmaps.length
                    )}
                    %
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Roadmaps</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchRoadmaps}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!error && roadmaps.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
        >
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Map className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              No Roadmaps Yet
            </h2>
            <p className="text-slate-600 mb-8">
              Create your first learning roadmap to get started on your career journey. 
              Our AI will generate a personalized path based on your goals.
            </p>
            <Link
              href="/roadmap/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Create Your First Roadmap
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Roadmap List */}
      {roadmaps.length > 0 && (
        <div className="space-y-4">
          {roadmaps.map((roadmap, index) => (
            <motion.div
              key={roadmap.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
                        {roadmap.job_title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {roadmap.estimated_weeks} weeks
                        </span>
                        <span>•</span>
                        <span>{roadmap.skill_level}</span>
                        <span>•</span>
                        <span>{roadmap.industry}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-semibold text-slate-900">
                        {roadmap.completion_percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${roadmap.completion_percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${getCompletionColor(
                          roadmap.completion_percentage
                        )}`}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(roadmap.status)}`}>
                      {roadmap.status.charAt(0).toUpperCase() + roadmap.status.slice(1)}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Created {new Date(roadmap.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/roadmap/${roadmap.id}`}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    Continue Learning
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteRoadmap(roadmap.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

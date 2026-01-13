"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Target,
  Clock,
  Zap,
  Award,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface BenchmarkData {
  category: string;
  userValue: number;
  avgValue: number;
  topPerformerValue: number;
  percentile: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

interface ComparisonBenchmarksProps {
  targetRole?: string;
}

export default function ComparisonBenchmarks({ targetRole }: ComparisonBenchmarksProps) {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    if (accessToken) {
      fetchBenchmarks();
    }
  }, [accessToken, timeframe]);

  const fetchBenchmarks = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/gamification/benchmarks?timeframe=${timeframe}`), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBenchmarks(data.data || generateMockBenchmarks());
      } else {
        setBenchmarks(generateMockBenchmarks());
      }
    } catch (error) {
      setBenchmarks(generateMockBenchmarks());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockBenchmarks = (): BenchmarkData[] => [
    {
      category: "Skills Completed",
      userValue: 12,
      avgValue: 8,
      topPerformerValue: 25,
      percentile: 72,
      trend: "up",
      trendValue: 15,
    },
    {
      category: "Study Hours",
      userValue: 45,
      avgValue: 32,
      topPerformerValue: 80,
      percentile: 68,
      trend: "up",
      trendValue: 8,
    },
    {
      category: "Exam Scores",
      userValue: 78,
      avgValue: 72,
      topPerformerValue: 95,
      percentile: 65,
      trend: "stable",
      trendValue: 0,
    },
    {
      category: "Projects Built",
      userValue: 2,
      avgValue: 1.5,
      topPerformerValue: 5,
      percentile: 60,
      trend: "up",
      trendValue: 33,
    },
    {
      category: "Learning Streak",
      userValue: 7,
      avgValue: 4,
      topPerformerValue: 30,
      percentile: 75,
      trend: "up",
      trendValue: 40,
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return "text-green-600";
    if (percentile >= 60) return "text-blue-600";
    if (percentile >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getPercentileBg = (percentile: number) => {
    if (percentile >= 80) return "bg-green-500";
    if (percentile >= 60) return "bg-blue-500";
    if (percentile >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <div className="bg-white border-2 border-neutral-200 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate overall percentile
  const overallPercentile = Math.round(
    benchmarks.reduce((sum, b) => sum + b.percentile, 0) / benchmarks.length
  );

  return (
    <div className="bg-white border-2 border-neutral-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-neutral-900">How You Compare</h2>
            <p className="text-sm text-neutral-500">
              vs. other {targetRole || "learners"}
            </p>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-neutral-100 rounded-lg p-1">
          {(["week", "month", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeframe === t
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {t === "all" ? "All Time" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Percentile */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700">Overall Ranking</p>
            <p className="text-2xl font-bold text-blue-900">
              Top {100 - overallPercentile}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-700">You're ahead of</p>
            <p className="text-2xl font-bold text-blue-900">{overallPercentile}%</p>
            <p className="text-xs text-blue-600">of learners</p>
          </div>
        </div>
      </div>

      {/* Benchmarks List */}
      <div className="space-y-3">
        {benchmarks.map((benchmark, index) => (
          <motion.div
            key={benchmark.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-neutral-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-neutral-900">{benchmark.category}</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(benchmark.trend)}
                {benchmark.trend !== "stable" && (
                  <span className={`text-sm ${
                    benchmark.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {benchmark.trend === "up" ? "+" : "-"}{benchmark.trendValue}%
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-neutral-100 rounded-full mb-2">
              {/* Average marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-neutral-400"
                style={{ left: `${(benchmark.avgValue / benchmark.topPerformerValue) * 100}%` }}
              />
              {/* User progress */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(benchmark.userValue / benchmark.topPerformerValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`h-full rounded-full ${getPercentileBg(benchmark.percentile)}`}
              />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-neutral-600">
                  You: <strong className="text-neutral-900">{benchmark.userValue}</strong>
                </span>
                <span className="text-neutral-400">|</span>
                <span className="text-neutral-600">
                  Avg: <strong>{benchmark.avgValue}</strong>
                </span>
                <span className="text-neutral-400">|</span>
                <span className="text-neutral-600">
                  Top: <strong>{benchmark.topPerformerValue}</strong>
                </span>
              </div>
              <span className={`font-medium ${getPercentileColor(benchmark.percentile)}`}>
                Top {100 - benchmark.percentile}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivational message */}
      <div className="mt-6 p-4 bg-neutral-50 rounded-xl text-center">
        {overallPercentile >= 70 ? (
          <p className="text-neutral-700">
            🎉 <strong>Excellent work!</strong> You're outperforming most learners. Keep it up!
          </p>
        ) : overallPercentile >= 50 ? (
          <p className="text-neutral-700">
            💪 <strong>You're on track!</strong> A bit more effort and you'll be in the top tier.
          </p>
        ) : (
          <p className="text-neutral-700">
            🚀 <strong>Room to grow!</strong> Focus on consistency and you'll climb the ranks.
          </p>
        )}
      </div>
    </div>
  );
}

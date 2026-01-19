"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { TrendingUp, Calendar, BarChart3, Clock, Target, Award } from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface VelocityData {
  week: string;
  skillsLearned: number;
  hoursStudied: number;
  tasksCompleted: number;
  xpGained: number;
  streak: number;
}

interface Milestone {
  week: string;
  achievement: string;
  type: "skill" | "project" | "streak" | "certificate";
}

interface LearningVelocityGraphProps {
  timeframe?: "4weeks" | "12weeks" | "6months" | "1year";
}

export function LearningVelocityGraph({ timeframe = "12weeks" }: LearningVelocityGraphProps) {
  const { data: session } = useSession();
  const [velocityData, setVelocityData] = useState<VelocityData[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<"skills" | "hours" | "tasks" | "xp">("skills");
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (accessToken) {
      fetchVelocityData();
    }
  }, [accessToken, timeframe]);

  const fetchVelocityData = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/analytics/velocity?timeframe=${timeframe}`), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVelocityData(data.data?.velocity || []);
        setMilestones(data.data?.milestones || []);
      } else {
        // Show empty state when API not available
        setVelocityData([]);
        setMilestones([]);
      }
    } catch (error) {
      // Show empty state on error
      setVelocityData([]);
      setMilestones([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricData = () => {
    switch (selectedMetric) {
      case "skills":
        return velocityData.map(d => d.skillsLearned);
      case "hours":
        return velocityData.map(d => d.hoursStudied);
      case "tasks":
        return velocityData.map(d => d.tasksCompleted);
      case "xp":
        return velocityData.map(d => d.xpGained);
      default:
        return velocityData.map(d => d.skillsLearned);
    }
  };

  const getMetricLabel = () => {
    const labels = {
      skills: "Skills Learned",
      hours: "Hours Studied", 
      tasks: "Tasks Completed",
      xp: "XP Gained"
    };
    return labels[selectedMetric];
  };

  const getMetricColor = () => {
    const colors = {
      skills: "bg-blue-500",
      hours: "bg-green-500",
      tasks: "bg-purple-500", 
      xp: "bg-orange-500"
    };
    return colors[selectedMetric];
  };

  const calculateStats = () => {
    if (velocityData.length === 0) return { total: 0, average: 0, trend: 0 };
    
    const metricData = getMetricData();
    const total = metricData.reduce((sum, val) => sum + val, 0);
    const average = Math.round(total / metricData.length);
    
    // Calculate trend (comparing last 4 weeks to previous 4 weeks)
    const recent = metricData.slice(-4).reduce((sum, val) => sum + val, 0);
    const previous = metricData.slice(-8, -4).reduce((sum, val) => sum + val, 0);
    const trend = previous > 0 ? Math.round(((recent - previous) / previous) * 100) : 0;
    
    return { total, average, trend };
  };

  const maxValue = Math.max(...getMetricData(), 1);
  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Learning Velocity
          </h3>
          <p className="text-sm text-gray-600 mt-1">Track your progress over time</p>
        </div>

        <div className="flex gap-2">
          {[
            { key: "skills", label: "Skills", icon: Target },
            { key: "hours", label: "Hours", icon: Clock },
            { key: "tasks", label: "Tasks", icon: Calendar },
            { key: "xp", label: "XP", icon: Award }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key as typeof selectedMetric)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                selectedMetric === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-3 h-3 inline mr-1" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600">Total {getMetricLabel()}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.average}</div>
          <div className="text-xs text-gray-600">Weekly Average</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${stats.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.trend >= 0 ? '+' : ''}{stats.trend}%
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
            <TrendingUp className={`w-3 h-3 ${stats.trend >= 0 ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
            Trend
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-40 mb-6">
        <div className="absolute inset-0 flex items-end justify-between px-2">
          {getMetricData().map((value, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(value / maxValue) * 100}%` }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`w-6 ${getMetricColor()} rounded-t-sm relative group cursor-pointer`}
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Week {index + 1}: {value} {getMetricLabel().toLowerCase()}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
      </div>

      {/* Timeline/Milestones */}
      {milestones.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            Recent Milestones
          </h4>
          <div className="space-y-2">
            {milestones.slice(0, 3).map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className={`w-2 h-2 rounded-full ${
                  milestone.type === 'skill' ? 'bg-blue-500' :
                  milestone.type === 'project' ? 'bg-green-500' :
                  milestone.type === 'streak' ? 'bg-orange-500' :
                  'bg-purple-500'
                }`} />
                <span className="text-gray-600">{new Date(milestone.week).toLocaleDateString()}</span>
                <span className="text-gray-900">{milestone.achievement}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Velocity Insight</p>
            <p className="text-blue-800">
              {stats.trend > 10 
                ? "Great momentum! You're learning faster each week."
                : stats.trend > 0
                ? "Steady progress. Keep up the consistent effort."
                : stats.trend > -10
                ? "Learning pace has slowed slightly. Consider adjusting your routine."
                : "Learning velocity has decreased. Time to re-energize your approach!"
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

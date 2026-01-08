"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";
import {
  BarChart3,
  Users,
  BookOpen,
  Trophy,
  Clock,
  Star,
  TrendingUp,
  Target,
  Zap,
  Brain,
  MessageCircle,
  Calendar,
  Settings,
  Bell,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ChevronDown,
  Play,
  Pause
} from "lucide-react";

interface DashboardWidget {
  id: string;
  title: string;
  type: "chart" | "metric" | "activity" | "progress" | "social";
  size: "small" | "medium" | "large";
  priority: number;
  data: any;
}

interface LearningMetric {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ElementType;
}

interface RecentActivity {
  id: string;
  type: "study" | "quiz" | "group" | "achievement" | "reminder";
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

export default function SmartLearningDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;
  
  const [activeWidgets, setActiveWidgets] = useState<DashboardWidget[]>([]);
  const [metrics, setMetrics] = useState<LearningMetric[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch gamification stats
        const statsResponse = await fetch(getApiUrl("/api/v1/gamification/stats"), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Fetch roadmaps
        const roadmapsResponse = await fetch(getApiUrl("/api/v1/roadmaps"), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          const stats = statsData.data || {};

          // Convert backend stats to dashboard metrics
          const dashboardMetrics: LearningMetric[] = [
            {
              label: "Study Hours",
              value: Math.round((stats.total_study_minutes || 0) / 60 * 10) / 10,
              change: 0,
              trend: "stable" as const,
              icon: Clock,
            },
            {
              label: "Skills Completed",
              value: stats.skills_completed || 0,
              change: 0,
              trend: "stable" as const,
              icon: BookOpen,
            },
            {
              label: "Current Level",
              value: stats.level || 1,
              change: 0,
              trend: "stable" as const,
              icon: Trophy,
            },
            {
              label: "Current Streak",
              value: stats.current_streak || 0,
              change: 0,
              trend: stats.current_streak > (stats.longest_streak || 0) / 2 ? "up" as const : "stable" as const,
              icon: Zap,
            },
          ];

          setMetrics(dashboardMetrics);

          // Convert achievements to recent activity
          if (stats.achievements && stats.achievements.length > 0) {
            const activities: RecentActivity[] = stats.achievements.slice(0, 3).map((achievement: any) => ({
              id: achievement.id,
              type: "achievement" as const,
              title: achievement.title,
              description: achievement.description,
              timestamp: new Date(achievement.unlocked_at),
            }));
            setRecentActivity(activities);
          }
        }

        if (roadmapsResponse.ok) {
          const roadmapsData = await roadmapsResponse.json();
          setRoadmaps(roadmapsData.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [accessToken]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "study": return BookOpen;
      case "quiz": return Brain;
      case "group": return Users;
      case "achievement": return Trophy;
      case "reminder": return Bell;
      default: return Clock;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    return hours < 1 ? "Just now" : `${hours}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your progress and stay motivated</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            
            <button 
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Customize
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    metric.trend === "up" ? "bg-green-100" :
                    metric.trend === "down" ? "bg-red-100" : "bg-gray-100"
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      metric.trend === "up" ? "text-green-600" :
                      metric.trend === "down" ? "text-red-600" : "text-gray-600"
                    }`} />
                  </div>
                  
                  {metric.change !== 0 && (
                    <div className={`flex items-center gap-1 text-sm ${
                      metric.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${
                        metric.trend === "down" ? "rotate-180" : ""
                      }`} />
                      {metric.change}%
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Learning Progress */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Learning Progress</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            
            {/* Real Roadmap Progress */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading your roadmaps...</div>
              ) : roadmaps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No active roadmaps yet</p>
                  <button
                    onClick={() => router.push("/roadmap/new")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create Your First Roadmap →
                  </button>
                </div>
              ) : (
                roadmaps.slice(0, 3).map((roadmap, index) => {
                  const colors = ["blue", "green", "purple"];
                  const color = colors[index % colors.length];
                  return (
                    <div key={roadmap.id}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{roadmap.job_title}</span>
                        <span className="text-sm text-gray-500">{roadmap.completion_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`bg-${color}-500 h-2 rounded-full transition-all`}
                          style={{ width: `${roadmap.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {roadmaps.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Overall Progress</p>
                    <p className="text-sm text-gray-600">{roadmaps.length} active roadmap{roadmaps.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(
                        roadmaps.reduce((sum, r) => sum + (r.completion_percentage || 0), 0) / roadmaps.length
                      )}%
                    </p>
                    <p className="text-sm text-gray-500">Average completion</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.round(
                        roadmaps.reduce((sum, r) => sum + (r.completion_percentage || 0), 0) / roadmaps.length
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-blue-600 hover:text-blue-700">
                <Bell className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Loading activity...</div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                  <p className="text-xs mt-2">Start learning to see your progress here!</p>
                </div>
              ) : (
                recentActivity.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.type === "achievement" ? "bg-yellow-100 text-yellow-600" :
                      activity.type === "group" ? "bg-blue-100 text-blue-600" :
                      activity.type === "study" ? "bg-green-100 text-green-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                      <p className="text-gray-600 text-xs mt-1">{activity.description}</p>
                      <p className="text-gray-400 text-xs mt-2">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Activity
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: "Start Learning", color: "blue", path: "/learning-paths" },
              { icon: Users, label: "Join Study Group", color: "green", path: "/groups" },
              { icon: Brain, label: "Take Quiz", color: "purple", path: "/study-buddy" },
              { icon: Calendar, label: "Schedule Session", color: "orange", path: "/scheduler" }
            ].map((action, index) => {
              const IconComponent = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => router.push(action.path)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-${action.color}-200 hover:bg-${action.color}-50 transition-colors group cursor-pointer`}
                >
                  <div className={`p-3 bg-${action.color}-100 text-${action.color}-600 rounded-lg group-hover:bg-${action.color}-200 transition-colors`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

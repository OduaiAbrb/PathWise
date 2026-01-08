"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
  const [activeWidgets, setActiveWidgets] = useState<DashboardWidget[]>([]);
  const [metrics, setMetrics] = useState<LearningMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  useEffect(() => {
    // Load dashboard data
    const dashboardMetrics: LearningMetric[] = [
      {
        label: "Study Hours",
        value: 24.5,
        change: 12,
        trend: "up",
        icon: Clock
      },
      {
        label: "Completed Lessons",
        value: 47,
        change: 8,
        trend: "up",  
        icon: BookOpen
      },
      {
        label: "Quiz Score",
        value: 87,
        change: 5,
        trend: "up",
        icon: Trophy
      },
      {
        label: "Study Streak",
        value: 12,
        change: 0,
        trend: "stable",
        icon: Zap
      }
    ];

    const activities: RecentActivity[] = [
      {
        id: "1",
        type: "achievement",
        title: "React Master Badge Earned!",
        description: "Completed all React fundamentals with 95% score",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: "2", 
        type: "group",
        title: "Joined 'Backend Engineers Hub'",
        description: "Connected with 24 fellow learners",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: "3",
        type: "study",
        title: "Completed: Advanced JavaScript Patterns",
        description: "3.5 hours of focused learning",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    setMetrics(dashboardMetrics);
    setRecentActivity(activities);
  }, []);

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
            
            {/* Progress Charts Placeholder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">JavaScript Fundamentals</span>
                <span className="text-sm text-gray-500">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: "85%"}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">React Development</span>
                <span className="text-sm text-gray-500">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: "67%"}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Node.js Backend</span>
                <span className="text-sm text-gray-500">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: "23%"}}></div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Weekly Goal</p>
                  <p className="text-sm text-gray-600">8 hours of study time</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">6.2h</p>
                  <p className="text-sm text-gray-500">1.8h remaining</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{width: "77%"}}></div>
              </div>
            </div>
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
              {recentActivity.map((activity) => {
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

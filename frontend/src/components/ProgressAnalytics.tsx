"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Clock,
  Calendar,
  BookOpen,
  Zap,
  Award,
  Activity
} from "lucide-react";

interface AnalyticsData {
  weeklyStudyHours: number[];
  weeklyGoalHours: number;
  skillProgress: { skill: string; progress: number; target: number }[];
  learningStreak: number;
  averageSessionLength: number;
  totalSkillsLearned: number;
  weeklyGrowth: number;
  focusAreas: { area: string; timeSpent: number }[];
  upcomingDeadlines: { task: string; deadline: string; priority: "high" | "medium" | "low" }[];
  strongestSkills: string[];
  areasForImprovement: string[];
}

interface ProgressAnalyticsProps {
  userId?: string;
}

export default function ProgressAnalytics({ userId }: ProgressAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "quarter">("week");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API calls
    // Generate realistic analytics data based on user activity
    const generateAnalyticsData = (): AnalyticsData => {
      const today = new Date();
      const weeklyHours = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return Math.random() * 4; // 0-4 hours per day
      });

      return {
        weeklyStudyHours: weeklyHours,
        weeklyGoalHours: 15,
        skillProgress: [
          { skill: "React", progress: 7, target: 10 },
          { skill: "TypeScript", progress: 5, target: 8 },
          { skill: "Node.js", progress: 4, target: 6 },
          { skill: "Database Design", progress: 3, target: 5 },
          { skill: "System Design", progress: 2, target: 8 }
        ],
        learningStreak: Math.floor(Math.random() * 15) + 5,
        averageSessionLength: 45 + Math.random() * 30,
        totalSkillsLearned: Math.floor(Math.random() * 20) + 10,
        weeklyGrowth: (Math.random() - 0.3) * 50, // -15% to +35%
        focusAreas: [
          { area: "Frontend", timeSpent: 12.5 },
          { area: "Backend", timeSpent: 8.3 },
          { area: "Database", timeSpent: 4.2 },
          { area: "DevOps", timeSpent: 2.1 }
        ],
        upcomingDeadlines: [
          { task: "Complete React project", deadline: "3 days", priority: "high" },
          { task: "Finish API documentation", deadline: "1 week", priority: "medium" },
          { task: "Review system design", deadline: "2 weeks", priority: "low" }
        ],
        strongestSkills: ["JavaScript", "CSS", "Problem Solving"],
        areasForImprovement: ["Testing", "Performance", "Security"]
      };
    };

    setTimeout(() => {
      setAnalytics(generateAnalyticsData());
      setIsLoading(false);
    }, 1000);
  }, [userId, selectedTimeframe]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getTrendIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-neutral-200 h-32 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const totalWeeklyHours = analytics.weeklyStudyHours.reduce((sum, hours) => sum + hours, 0);
  const weeklyProgress = (totalWeeklyHours / analytics.weeklyGoalHours) * 100;

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">Progress Analytics</h2>
        <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-lg">
          {(["week", "month", "quarter"] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedTimeframe === timeframe
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 text-center"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{Math.round(totalWeeklyHours)}h</div>
          <p className="text-sm text-neutral-500">This Week</p>
          <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
            <div 
              className="h-2 bg-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 text-center"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Zap className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{analytics.learningStreak}</div>
          <p className="text-sm text-neutral-500">Day Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4 text-center"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{analytics.totalSkillsLearned}</div>
          <p className="text-sm text-neutral-500">Skills Learned</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4 text-center"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{Math.round(analytics.averageSessionLength)}min</div>
          <p className="text-sm text-neutral-500">Avg Session</p>
        </motion.div>
      </div>

      {/* Weekly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Weekly Study Hours
          </h3>
          <div className="flex items-center gap-2">
            {React.createElement(getTrendIcon(analytics.weeklyGrowth), {
              className: `w-4 h-4 ${getTrendColor(analytics.weeklyGrowth)}`
            })}
            <span className={`text-sm font-medium ${getTrendColor(analytics.weeklyGrowth)}`}>
              {analytics.weeklyGrowth >= 0 ? '+' : ''}{analytics.weeklyGrowth.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const hours = analytics.weeklyStudyHours[index] || 0;
            const maxHours = Math.max(...analytics.weeklyStudyHours);
            const height = maxHours > 0 ? (hours / maxHours) * 120 : 0;
            
            return (
              <div key={day} className="text-center">
                <div className="h-32 flex items-end justify-center mb-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}px` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-8 bg-blue-500 rounded-t-md relative group"
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {hours.toFixed(1)}h
                    </div>
                  </motion.div>
                </div>
                <p className="text-xs text-neutral-500">{day}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Skill Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Current Focus Areas
        </h3>
        
        <div className="space-y-4">
          {analytics.skillProgress.map((skill, index) => (
            <div key={skill.skill}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-neutral-900">{skill.skill}</span>
                <span className="text-neutral-500">
                  {skill.progress}/{skill.target} sessions
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(skill.progress / skill.target) * 100}%` }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Focus Areas & Upcoming Deadlines */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Study Distribution
          </h3>
          
          <div className="space-y-3">
            {analytics.focusAreas.map((area, index) => (
              <div key={area.area} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" style={{
                    backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                  }}></div>
                  <span className="text-sm font-medium text-neutral-900">{area.area}</span>
                </div>
                <span className="text-sm text-neutral-500">{area.timeSpent}h</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Deadlines
          </h3>
          
          <div className="space-y-3">
            {analytics.upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <p className="font-medium text-neutral-900 text-sm">{deadline.task}</p>
                  <p className="text-xs text-neutral-500">Due in {deadline.deadline}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(deadline.priority)}`}>
                  {deadline.priority}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Strengths & Areas for Improvement */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Your Strengths
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {analytics.strongestSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card p-6"
        >
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Focus Areas
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {analytics.areasForImprovement.map((area) => (
              <span key={area} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {area}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Zap,
  Target,
  Star,
  Award,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  streak: number;
  isCurrentUser: boolean;
}

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "leaderboard">("overview");
  
  const [stats] = useState({
    totalPoints: 2450,
    currentStreak: 7,
    longestStreak: 14,
    level: 12,
    nextLevelPoints: 3000,
    skillsCompleted: 24,
    projectsFinished: 5,
  });

  const [achievements] = useState<Achievement[]>([
    { id: "1", title: "First Steps", description: "Complete your first skill", icon: "🎯", unlocked: true },
    { id: "2", title: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", unlocked: true },
    { id: "3", title: "Project Master", description: "Complete 5 projects", icon: "🏆", unlocked: true },
    { id: "4", title: "Knowledge Seeker", description: "Complete 25 skills", icon: "📚", unlocked: false, progress: 24, maxProgress: 25 },
    { id: "5", title: "Consistency King", description: "30-day learning streak", icon: "👑", unlocked: false, progress: 7, maxProgress: 30 },
    { id: "6", title: "Speed Learner", description: "Complete a phase in under a week", icon: "⚡", unlocked: false },
  ]);

  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: "Alex M.", points: 4520, streak: 21, isCurrentUser: false },
    { rank: 2, name: "Sarah K.", points: 3890, streak: 15, isCurrentUser: false },
    { rank: 3, name: "Mike R.", points: 3450, streak: 12, isCurrentUser: false },
    { rank: 4, name: "You", points: 2450, streak: 7, isCurrentUser: true },
    { rank: 5, name: "Emma L.", points: 2100, streak: 5, isCurrentUser: false },
  ]);

  const levelProgress = ((stats.totalPoints % 500) / 500) * 100;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-2 mb-2">Gamification</h1>
        <p className="body-large">Track your progress and compete with others</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6"
      >
        {[
          { value: "overview", label: "Overview" },
          { value: "achievements", label: "Achievements" },
          { value: "leaderboard", label: "Leaderboard" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Level Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-neutral-900 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <p className="text-neutral-400 text-sm">Current Level</p>
                  <p className="text-3xl font-bold">Level {stats.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
                <p className="text-neutral-400 text-sm">Total Points</p>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">Progress to Level {stats.level + 1}</span>
                <span>{stats.totalPoints} / {stats.nextLevelPoints}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: Zap, label: "Current Streak", value: `${stats.currentStreak} days`, color: "text-orange-500" },
              { icon: Calendar, label: "Longest Streak", value: `${stats.longestStreak} days`, color: "text-blue-500" },
              { icon: Target, label: "Skills Completed", value: stats.skillsCompleted, color: "text-green-500" },
              { icon: Award, label: "Projects Finished", value: stats.projectsFinished, color: "text-purple-500" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="card"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h2 className="font-semibold text-neutral-900 mb-4">Recent Achievements</h2>
            <div className="grid grid-cols-3 gap-4">
              {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="text-center p-4 bg-neutral-50 rounded-xl">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <p className="font-medium text-neutral-900 text-sm">{achievement.title}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === "achievements" && (
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card ${!achievement.unlocked ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                  achievement.unlocked ? "bg-amber-100" : "bg-neutral-100"
                }`}>
                  {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6 text-neutral-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-900">{achievement.title}</h3>
                    {achievement.unlocked && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mb-2">{achievement.description}</p>
                  {achievement.progress !== undefined && !achievement.unlocked && (
                    <div>
                      <div className="flex justify-between text-xs text-neutral-500 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="progress-bar h-2">
                        <div
                          className="progress-fill"
                          style={{ width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="font-semibold text-neutral-900 mb-4">Weekly Leaderboard</h2>
          <div className="space-y-3">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  entry.isCurrentUser ? "bg-neutral-900 text-white" : "bg-neutral-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  entry.rank === 1 ? "bg-amber-400 text-amber-900" :
                  entry.rank === 2 ? "bg-neutral-300 text-neutral-700" :
                  entry.rank === 3 ? "bg-orange-300 text-orange-800" :
                  entry.isCurrentUser ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
                }`}>
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${entry.isCurrentUser ? "text-white" : "text-neutral-900"}`}>
                    {entry.name}
                  </p>
                  <p className={`text-sm ${entry.isCurrentUser ? "text-neutral-300" : "text-neutral-500"}`}>
                    {entry.streak} day streak
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${entry.isCurrentUser ? "text-white" : "text-neutral-900"}`}>
                    {entry.points.toLocaleString()}
                  </p>
                  <p className={`text-sm ${entry.isCurrentUser ? "text-neutral-300" : "text-neutral-500"}`}>
                    points
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

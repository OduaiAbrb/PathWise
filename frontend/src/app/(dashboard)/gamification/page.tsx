"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Trophy,
  Zap,
  Flame,
  Star,
  TrendingUp,
  Award,
  Target,
  Calendar,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import toast from "react-hot-toast";

interface UserStats {
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  total_study_minutes: number;
  skills_completed: number;
  projects_completed: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  unlocked_at: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  image: string | null;
  level: number;
  total_xp: number;
  current_streak: number;
  skills_completed: number;
}

export default function GamificationPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stats" | "achievements" | "leaderboard">("stats");

  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;

      try {
        // Fetch user stats
        const statsRes = await fetch("/api/v1/gamification/stats", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.data);
        }

        // Fetch leaderboard
        const leaderboardRes = await fetch("/api/v1/gamification/leaderboard?limit=50", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (leaderboardRes.ok) {
          const data = await leaderboardRes.json();
          setLeaderboard(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch gamification data:", error);
        toast.error("Failed to load gamification data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const xpToNextLevel = stats ? ((stats.level + 1) ** 2 * 100) - stats.total_xp : 0;
  const xpProgress = stats ? (stats.total_xp / ((stats.level + 1) ** 2 * 100)) * 100 : 0;

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Your Progress</h1>
          <p className="text-dark-400">Track your learning journey and compete with others</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-primary-400" />
                <span className="text-3xl font-bold text-white">{stats?.level || 1}</span>
              </div>
              <p className="text-dark-300 text-sm">Level</p>
              <div className="mt-3">
                <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <p className="text-dark-500 text-xs mt-1">{xpToNextLevel} XP to next level</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent-500/10 to-yellow-500/10 border-accent-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-8 h-8 text-accent-400" />
                <span className="text-3xl font-bold text-white">{stats?.current_streak || 0}</span>
              </div>
              <p className="text-dark-300 text-sm">Day Streak</p>
              <p className="text-dark-500 text-xs mt-1">Longest: {stats?.longest_streak || 0} days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary-500/10 to-accent-500/10 border-secondary-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-secondary-400" />
                <span className="text-3xl font-bold text-white">{stats?.total_xp || 0}</span>
              </div>
              <p className="text-dark-300 text-sm">Total XP</p>
              <p className="text-dark-500 text-xs mt-1">{stats?.achievements?.length || 0} achievements</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-primary-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-white">{stats?.skills_completed || 0}</span>
              </div>
              <p className="text-dark-300 text-sm">Skills Completed</p>
              <p className="text-dark-500 text-xs mt-1">{stats?.projects_completed || 0} projects</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "stats", label: "Stats", icon: TrendingUp },
            { key: "achievements", label: "Achievements", icon: Award },
            { key: "leaderboard", label: "Leaderboard", icon: Trophy },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-primary-500 text-white"
                  : "bg-dark-800 text-dark-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "achievements" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {stats?.achievements.map((achievement) => (
              <Card key={achievement.id} className="bg-dark-900/50 border-dark-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-dark-400 text-sm mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">+{achievement.xp_reward} XP</Badge>
                        <span className="text-dark-500 text-xs">
                          {new Date(achievement.unlocked_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!stats?.achievements || stats.achievements.length === 0) && (
              <div className="col-span-full text-center py-12">
                <Award className="w-16 h-16 text-dark-700 mx-auto mb-4" />
                <p className="text-dark-400">No achievements yet. Keep learning to unlock them!</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "leaderboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-0">
                <div className="divide-y divide-dark-800">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.user_id}
                      className="flex items-center gap-4 p-4 hover:bg-dark-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-12">
                        {entry.rank <= 3 ? (
                          <Trophy
                            className={`w-6 h-6 ${
                              entry.rank === 1
                                ? "text-yellow-400"
                                : entry.rank === 2
                                ? "text-gray-400"
                                : "text-orange-600"
                            }`}
                          />
                        ) : (
                          <span className="text-dark-500 font-semibold">#{entry.rank}</span>
                        )}
                      </div>
                      {entry.image ? (
                        <img
                          src={entry.image}
                          alt={entry.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center">
                          <span className="text-dark-400 font-semibold">
                            {entry.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium">{entry.name}</p>
                        <p className="text-dark-400 text-sm">
                          Level {entry.level} • {entry.skills_completed} skills
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{entry.total_xp.toLocaleString()} XP</p>
                        <p className="text-dark-400 text-sm flex items-center gap-1">
                          <Flame className="w-3 h-3 text-accent-400" />
                          {entry.current_streak} days
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "stats" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Learning Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Total Study Time</span>
                    <span className="text-white font-semibold">
                      {Math.floor((stats?.total_study_minutes || 0) / 60)}h {(stats?.total_study_minutes || 0) % 60}m
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Skills Completed</span>
                    <span className="text-white font-semibold">{stats?.skills_completed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Projects Completed</span>
                    <span className="text-white font-semibold">{stats?.projects_completed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Current Level</span>
                    <span className="text-white font-semibold">Level {stats?.level || 1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

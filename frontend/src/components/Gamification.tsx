"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";
import {
  Trophy,
  Star,
  Flame,
  Target,
  Zap,
  Award,
  Crown,
  Medal,
  Rocket,
  BookOpen,
  Code,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "skills" | "projects" | "community" | "milestone";
  tier: "bronze" | "silver" | "gold" | "platinum";
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  unlockedAt: string;
}

interface GamificationStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  recentAchievements: Achievement[];
  rank: string;
  percentile: number;
}

const BADGE_ICONS: Record<string, any> = {
  flame: Flame,
  star: Star,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  award: Award,
  crown: Crown,
  medal: Medal,
  rocket: Rocket,
  book: BookOpen,
  code: Code,
  users: Users,
  calendar: Calendar,
  trending: TrendingUp,
};

const TIER_COLORS = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-cyan-400 to-blue-600",
};

const TIER_BG = {
  bronze: "bg-amber-100 border-amber-300",
  silver: "bg-gray-100 border-gray-300",
  gold: "bg-yellow-100 border-yellow-300",
  platinum: "bg-cyan-100 border-cyan-300",
};

export default function Gamification() {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchGamificationData();
    }
  }, [accessToken]);

  const fetchGamificationData = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/gamification/stats"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data || null);
      } else {
        // Show empty state when API not available
        setStats(null);
      }
    } catch (error) {
      // Show empty state on error
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockStats = (): GamificationStats => ({
    level: 12,
    xp: 2450,
    xpToNextLevel: 3000,
    totalXp: 12450,
    currentStreak: 7,
    longestStreak: 21,
    rank: "Rising Star",
    percentile: 78,
    badges: [
      {
        id: "streak-7",
        name: "Week Warrior",
        description: "Maintain a 7-day learning streak",
        icon: "flame",
        category: "streak",
        tier: "bronze",
        requirement: 7,
        progress: 7,
        unlocked: true,
        unlockedAt: "2024-01-10",
      },
      {
        id: "streak-30",
        name: "Monthly Master",
        description: "Maintain a 30-day learning streak",
        icon: "flame",
        category: "streak",
        tier: "gold",
        requirement: 30,
        progress: 7,
        unlocked: false,
      },
      {
        id: "skills-10",
        name: "Skill Collector",
        description: "Complete 10 skills",
        icon: "star",
        category: "skills",
        tier: "bronze",
        requirement: 10,
        progress: 8,
        unlocked: false,
      },
      {
        id: "skills-25",
        name: "Skill Master",
        description: "Complete 25 skills",
        icon: "trophy",
        category: "skills",
        tier: "silver",
        requirement: 25,
        progress: 8,
        unlocked: false,
      },
      {
        id: "project-1",
        name: "First Build",
        description: "Complete your first project",
        icon: "code",
        category: "projects",
        tier: "bronze",
        requirement: 1,
        progress: 1,
        unlocked: true,
        unlockedAt: "2024-01-08",
      },
      {
        id: "project-5",
        name: "Portfolio Builder",
        description: "Complete 5 portfolio projects",
        icon: "rocket",
        category: "projects",
        tier: "gold",
        requirement: 5,
        progress: 2,
        unlocked: false,
      },
      {
        id: "exam-pass",
        name: "Exam Ace",
        description: "Pass a phase exam with 90%+ score",
        icon: "award",
        category: "milestone",
        tier: "silver",
        requirement: 1,
        progress: 0,
        unlocked: false,
      },
      {
        id: "roadmap-complete",
        name: "Journey Complete",
        description: "Complete an entire roadmap",
        icon: "crown",
        category: "milestone",
        tier: "platinum",
        requirement: 1,
        progress: 0,
        unlocked: false,
      },
    ],
    recentAchievements: [
      {
        id: "1",
        title: "First Steps",
        description: "Started your learning journey",
        xp: 100,
        unlockedAt: "2024-01-05",
      },
      {
        id: "2",
        title: "Week Warrior",
        description: "7-day streak achieved!",
        xp: 250,
        unlockedAt: "2024-01-10",
      },
    ],
  });

  const filteredBadges = (stats?.badges || []).filter(
    (b) => selectedCategory === "all" || b.category === selectedCategory
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <Trophy className="w-10 h-10" />
              <div>
                <p className="text-sm opacity-90">Achievement Unlocked!</p>
                <p className="text-xl font-bold">{showAchievement.title}</p>
                <p className="text-sm">+{showAchievement.xp} XP</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level & XP Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold">{stats.level}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{stats.rank}</h2>
              <p className="text-neutral-400">Top {100 - stats.percentile}% of learners</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{stats.totalXp.toLocaleString()}</p>
            <p className="text-neutral-400">Total XP</p>
          </div>
        </div>

        {/* XP Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Level {stats.level}</span>
            <span>{stats.xp} / {stats.xpToNextLevel} XP</span>
            <span>Level {stats.level + 1}</span>
          </div>
          <div className="h-3 bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.xp / stats.xpToNextLevel) * 100}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Streak Card */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-2 border-neutral-200 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Current Streak</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.currentStreak} days</p>
            </div>
          </div>
          <p className="text-sm text-neutral-600">
            Longest streak: <strong>{stats.longestStreak} days</strong>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-2 border-neutral-200 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Badges Earned</h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats.badges.filter(b => b.unlocked).length}/{stats.badges.length}
              </p>
            </div>
          </div>
          <p className="text-sm text-neutral-600">
            Keep learning to unlock more badges!
          </p>
        </motion.div>
      </div>

      {/* Badges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">Badges & Achievements</h2>
          <div className="flex gap-2">
            {["all", "streak", "skills", "projects", "milestone"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBadges.map((badge, index) => {
            const IconComponent = BADGE_ICONS[badge.icon] || Star;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`relative border-2 rounded-2xl p-5 ${
                  badge.unlocked
                    ? TIER_BG[badge.tier]
                    : "bg-neutral-50 border-neutral-200 opacity-60"
                }`}
              >
                {/* Tier indicator */}
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br ${TIER_COLORS[badge.tier]} flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">
                    {badge.tier.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Badge Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
                  badge.unlocked
                    ? `bg-gradient-to-br ${TIER_COLORS[badge.tier]}`
                    : "bg-neutral-200"
                }`}>
                  {badge.unlocked ? (
                    <IconComponent className="w-7 h-7 text-white" />
                  ) : (
                    <Lock className="w-7 h-7 text-neutral-400" />
                  )}
                </div>

                <h3 className="font-semibold text-neutral-900 mb-1">{badge.name}</h3>
                <p className="text-sm text-neutral-600 mb-3">{badge.description}</p>

                {/* Progress */}
                {!badge.unlocked && (
                  <div>
                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                      <span>Progress</span>
                      <span>{badge.progress}/{badge.requirement}</span>
                    </div>
                    <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${TIER_COLORS[badge.tier]}`}
                        style={{ width: `${(badge.progress / badge.requirement) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {badge.unlocked && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Unlocked</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border-2 border-neutral-200 rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Achievements</h2>
        <div className="space-y-3">
          {stats.recentAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">{achievement.title}</h4>
                  <p className="text-sm text-neutral-600">{achievement.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">+{achievement.xp} XP</p>
                <p className="text-xs text-neutral-500">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

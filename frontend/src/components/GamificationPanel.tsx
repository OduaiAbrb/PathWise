"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Zap,
  Target,
  Star,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  Calendar,
  Flame,
  Medal,
  Crown
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  deadline: string;
  completed: boolean;
}

interface GamificationStats {
  totalXP: number;
  level: number;
  xpToNext: number;
  currentLevelXP: number;
  nextLevelXP: number;
  streak: number;
  longestStreak: number;
  skillsMastered: number;
  totalStudyHours: number;
  completedChallenges: number;
}

interface GamificationPanelProps {
  userId: string;
}

export default function GamificationPanel({ userId }: GamificationPanelProps) {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API calls
    // For now, generate dynamic mock data based on user activity
    const generateGamificationData = () => {
      const baseStats: GamificationStats = {
        totalXP: Math.floor(Math.random() * 5000) + 1000,
        level: Math.floor(Math.random() * 15) + 1,
        xpToNext: Math.floor(Math.random() * 800) + 200,
        currentLevelXP: Math.floor(Math.random() * 1000),
        nextLevelXP: 1000,
        streak: Math.floor(Math.random() * 30) + 1,
        longestStreak: Math.floor(Math.random() * 60) + 10,
        skillsMastered: Math.floor(Math.random() * 25) + 5,
        totalStudyHours: Math.floor(Math.random() * 200) + 50,
        completedChallenges: Math.floor(Math.random() * 12) + 3,
      };

      const sampleAchievements: Achievement[] = [
        {
          id: "first_roadmap",
          title: "Path Finder",
          description: "Create your first learning roadmap",
          icon: "🗺️",
          unlocked: true,
          unlockedAt: "2024-01-15",
          progress: 1,
          maxProgress: 1,
          rarity: "common"
        },
        {
          id: "week_streak",
          title: "Consistent Learner",
          description: "Maintain a 7-day learning streak",
          icon: "🔥",
          unlocked: baseStats.streak >= 7,
          unlockedAt: baseStats.streak >= 7 ? "2024-01-20" : undefined,
          progress: Math.min(baseStats.streak, 7),
          maxProgress: 7,
          rarity: "rare"
        },
        {
          id: "skill_master",
          title: "Skill Collector",
          description: "Master 10 different skills",
          icon: "🎯",
          unlocked: baseStats.skillsMastered >= 10,
          progress: baseStats.skillsMastered,
          maxProgress: 10,
          rarity: "epic"
        },
        {
          id: "study_marathon",
          title: "Knowledge Seeker",
          description: "Complete 100 hours of study",
          icon: "📚",
          unlocked: baseStats.totalStudyHours >= 100,
          progress: baseStats.totalStudyHours,
          maxProgress: 100,
          rarity: "legendary"
        },
        {
          id: "challenge_champion",
          title: "Challenge Champion",
          description: "Complete 5 weekly challenges",
          icon: "🏆",
          unlocked: baseStats.completedChallenges >= 5,
          progress: baseStats.completedChallenges,
          maxProgress: 5,
          rarity: "epic"
        }
      ];

      const currentChallenge: WeeklyChallenge = {
        id: "weekly_focus",
        title: "Weekly Deep Dive",
        description: "Complete 5 learning sessions this week",
        progress: Math.floor(Math.random() * 5),
        target: 5,
        reward: "250 XP + Rare Badge",
        deadline: "Sunday, 11:59 PM",
        completed: false
      };

      setStats(baseStats);
      setAchievements(sampleAchievements);
      setWeeklyChallenge(currentChallenge);
      setIsLoading(false);
    };

    generateGamificationData();
  }, [userId]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-700 border-gray-200";
      case "rare": return "bg-blue-100 text-blue-700 border-blue-200";
      case "epic": return "bg-purple-100 text-purple-700 border-purple-200";
      case "legendary": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common": return Medal;
      case "rare": return Award;
      case "epic": return Trophy;
      case "legendary": return Crown;
      default: return Medal;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-neutral-200 h-24 rounded-xl"></div>
        <div className="animate-pulse bg-neutral-200 h-32 rounded-xl"></div>
      </div>
    );
  }

  if (!stats) return null;

  const levelProgress = ((stats.totalXP - stats.currentLevelXP) / (stats.nextLevelXP - stats.currentLevelXP)) * 100;

  return (
    <div className="space-y-6">
      {/* Level & XP Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Level {stats.level}</h3>
              <p className="text-sm text-neutral-600">{stats.totalXP.toLocaleString()} Total XP</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-blue-600">{stats.xpToNext} XP to next level</p>
            <p className="text-sm text-neutral-500">Level {stats.level + 1}</p>
          </div>
        </div>
        
        <div className="w-full bg-neutral-200 rounded-full h-3">
          <motion.div 
            className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          {Math.round(levelProgress)}% progress to Level {stats.level + 1}
        </p>
      </motion.div>

      {/* Current Streak & Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 text-center"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{stats.streak}</div>
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
          <div className="text-2xl font-bold text-neutral-900">{stats.skillsMastered}</div>
          <p className="text-sm text-neutral-500">Skills Mastered</p>
        </motion.div>
      </div>

      {/* Weekly Challenge */}
      {weeklyChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 border-2 border-green-200 bg-green-50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900">{weeklyChallenge.title}</h4>
              <p className="text-sm text-green-700">{weeklyChallenge.description}</p>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-700">Progress</span>
              <span className="text-green-700">
                {weeklyChallenge.progress}/{weeklyChallenge.target}
              </span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <motion.div 
                className="h-2 bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-green-600 font-medium">🎁 {weeklyChallenge.reward}</span>
            <span className="text-green-600 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {weeklyChallenge.deadline}
            </span>
          </div>
        </motion.div>
      )}

      {/* Recent Achievements */}
      <div className="card p-6">
        <h4 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})
        </h4>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {achievements.map((achievement, index) => {
            const RarityIcon = getRarityIcon(achievement.rarity);
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  achievement.unlocked 
                    ? getRarityColor(achievement.rarity)
                    : "bg-neutral-50 text-neutral-400 border-neutral-200"
                }`}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{achievement.title}</h5>
                    <RarityIcon className="w-4 h-4" />
                    {achievement.unlocked && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <p className="text-sm opacity-75">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="mt-2">
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-400 rounded-full"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1">
                        {achievement.progress}/{achievement.maxProgress}
                      </p>
                    </div>
                  )}
                </div>
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-right opacity-60">
                    Unlocked<br />{new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

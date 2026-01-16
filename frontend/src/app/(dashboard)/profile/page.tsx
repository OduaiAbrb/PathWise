"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/fetch-api";
import {
  User,
  Settings,
  BarChart3,
  Trophy,
  Target,
  Calendar,
  Flame,
  TrendingUp,
  Award,
  Star,
  Users,
  Code,
  BookOpen,
  Zap,
  AlertTriangle,
  Download,
  FileText,
  Activity
} from "lucide-react";
import { LearningVelocityGraph } from "@/components/LearningVelocityGraph";
import { WeaknessIdentifier } from "@/components/WeaknessIdentifier";
import { SkillDecaySystem } from "@/components/SkillDecaySystem";
import { ExportStats } from "@/components/ExportStats";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  target_role?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  stats: {
    total_skills: number;
    completed_skills: number;
    current_streak: number;
    total_hours: number;
    readiness_score: number;
    technical_score: number;
    projects_score: number;
    interview_score: number;
  };
}

interface Challenge {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  technology: string;
  description: string;
  points: number;
  participants: number;
  deadline: string;
  status: "active" | "completed" | "upcoming";
  user_submission?: {
    id: string;
    submitted_at: string;
    score: number;
    rank: number;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  category: "learning" | "project" | "streak" | "challenge";
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;
  
  const [activeTab, setActiveTab] = useState<"profile" | "analytics" | "challenges" | "achievements">("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ target_role: "", bio: "" });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch(`${getApiUrl()}/api/v1/users/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setFormData({
            target_role: data.target_role || "",
            bio: data.bio || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  // Fetch challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch(`${getApiUrl()}/api/v1/challenges`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setChallenges(data);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchChallenges();
  }, [accessToken]);

  // Fetch achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch(`${getApiUrl()}/api/v1/users/achievements`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAchievements(data);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    };

    fetchAchievements();
  }, [accessToken]);

  // Update profile
  const updateProfile = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/users/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-600 bg-green-50";
      case "intermediate": return "text-yellow-600 bg-yellow-50";
      case "advanced": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-blue-600 bg-blue-50";
      case "completed": return "text-green-600 bg-green-50";
      case "upcoming": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{session?.user?.name}</h1>
            <p className="text-gray-600">{session?.user?.email}</p>
            {profile?.target_role && (
              <p className="text-sm text-blue-600 font-medium">Target Role: {profile.target_role}</p>
            )}
          </div>
          {profile && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{profile.stats.readiness_score}%</div>
              <div className="text-sm text-gray-600">Job Ready</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <nav className="flex space-x-8 px-6 pt-6">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "challenges", label: "Challenges", icon: Trophy },
            { id: "achievements", label: "Achievements", icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <button
                  onClick={() => editMode ? updateProfile() : setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editMode ? "Save Changes" : "Edit Profile"}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Role
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.target_role}
                      onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Full Stack Developer"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.target_role || "Not set"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <p className="text-gray-900">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {editMode ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself and your learning goals..."
                  />
                ) : (
                  <p className="text-gray-900">{profile?.bio || "No bio added yet."}</p>
                )}
              </div>

              {profile && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profile.stats.completed_skills}</div>
                    <div className="text-sm text-blue-700">Skills Mastered</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profile.stats.current_streak}</div>
                    <div className="text-sm text-green-700">Day Streak</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profile.stats.total_hours}h</div>
                    <div className="text-sm text-purple-700">Time Invested</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{achievements.length}</div>
                    <div className="text-sm text-orange-700">Achievements</div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Learning Analytics</h2>
                <ExportStats />
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <LearningVelocityGraph />
                <WeaknessIdentifier onStartLearning={(skillId) => {
                  console.log('Starting learning for skill:', skillId);
                }} />
              </div>

              <SkillDecaySystem onPracticeSkill={(skillId) => {
                console.log('Practicing skill:', skillId);
              }} />
            </motion.div>
          )}

          {activeTab === "challenges" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Coding Challenges</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option>All Difficulties</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Upcoming</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4">
                {challenges.length > 0 ? (
                  challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                          <p className="text-gray-600 mt-1">{challenge.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(challenge.status)}`}>
                            {challenge.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Code className="w-4 h-4" />
                            {challenge.technology}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.participants} participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {challenge.points} points
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {challenge.user_submission ? (
                            <div className="text-sm">
                              <span className="text-green-600 font-medium">Completed</span>
                              <span className="text-gray-500 ml-2">Score: {challenge.user_submission.score}</span>
                            </div>
                          ) : (
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                              Start Challenge
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No challenges available yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold">Your Achievements</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                          <span className="text-xs text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">
                            {achievement.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{achievement.description}</p>
                      <p className="text-xs text-gray-500">
                        Earned {new Date(achievement.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No achievements earned yet. Keep learning!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

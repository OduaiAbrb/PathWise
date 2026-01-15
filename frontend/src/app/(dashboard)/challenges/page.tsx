"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Clock,
  Code,
  Star,
  Medal,
  Target,
  Calendar,
  CheckCircle2,
  Play,
  Award,
  TrendingUp,
  Zap,
  Flame
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: "algorithm" | "frontend" | "backend" | "fullstack" | "system-design";
  points: number;
  timeLimit: number; // minutes
  participants: number;
  submissions: number;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  requirements: string[];
  prizes: Prize[];
  leaderboard: LeaderboardEntry[];
}

interface Prize {
  position: number;
  reward: string;
  description: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  completionTime: number;
  avatar?: string;
}

interface UserSubmission {
  challengeId: string;
  score: number;
  rank: number;
  completionTime: number;
  submittedAt: string;
}

export default function ChallengesPage() {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<UserSubmission[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "active" | "completed">("active");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (accessToken) {
      fetchChallenges();
      fetchUserSubmissions();
    }
  }, [accessToken]);

  const fetchChallenges = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/challenges"), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.data || []);
      } else {
        setChallenges(generateMockChallenges());
      }
    } catch (error) {
      setChallenges(generateMockChallenges());
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSubmissions = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/challenges/my-submissions"), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserSubmissions(data.data || []);
      }
    } catch (error) {
      setUserSubmissions([]);
    }
  };

  const generateMockChallenges = (): Challenge[] => [
    {
      id: "1",
      title: "Algorithm Sprint: Two Sum Variants",
      description: "Solve 5 variations of the classic Two Sum problem. Test your problem-solving speed and accuracy.",
      difficulty: "medium",
      category: "algorithm",
      points: 500,
      timeLimit: 60,
      participants: 1247,
      submissions: 892,
      startDate: "2024-01-15T00:00:00Z",
      endDate: "2024-01-22T23:59:59Z",
      status: "active",
      requirements: ["JavaScript/Python/Java", "Basic algorithms", "Hash tables"],
      prizes: [
        { position: 1, reward: "1000 XP + Badge", description: "Algorithm Master" },
        { position: 2, reward: "750 XP + Badge", description: "Speed Demon" },
        { position: 3, reward: "500 XP + Badge", description: "Problem Solver" }
      ],
      leaderboard: [
        { rank: 1, userId: "u1", username: "CodeNinja", score: 950, completionTime: 23, avatar: "" },
        { rank: 2, userId: "u2", username: "AlgoMaster", score: 925, completionTime: 28 },
        { rank: 3, userId: "u3", username: "DevPro", score: 900, completionTime: 31 }
      ]
    },
    {
      id: "2",
      title: "React Component Challenge",
      description: "Build a reusable component library with proper TypeScript typing and comprehensive tests.",
      difficulty: "hard",
      category: "frontend",
      points: 750,
      timeLimit: 120,
      participants: 834,
      submissions: 456,
      startDate: "2024-01-20T00:00:00Z",
      endDate: "2024-01-27T23:59:59Z",
      status: "active",
      requirements: ["React", "TypeScript", "Testing", "Component design"],
      prizes: [
        { position: 1, reward: "1500 XP + Badge", description: "React Expert" },
        { position: 2, reward: "1000 XP + Badge", description: "Component Architect" },
        { position: 3, reward: "750 XP + Badge", description: "Frontend Craftsman" }
      ],
      leaderboard: [
        { rank: 1, userId: "u4", username: "ReactGuru", score: 875, completionTime: 89 },
        { rank: 2, userId: "u5", username: "TSMaster", score: 850, completionTime: 95 },
        { rank: 3, userId: "u6", username: "ComponentKing", score: 825, completionTime: 102 }
      ]
    },
    {
      id: "3",
      title: "API Design Championship",
      description: "Design and implement a RESTful API with authentication, rate limiting, and comprehensive documentation.",
      difficulty: "hard",
      category: "backend",
      points: 800,
      timeLimit: 180,
      participants: 567,
      submissions: 234,
      startDate: "2024-01-25T00:00:00Z",
      endDate: "2024-02-01T23:59:59Z",
      status: "upcoming",
      requirements: ["Node.js/Python", "API Design", "Authentication", "Documentation"],
      prizes: [
        { position: 1, reward: "2000 XP + Badge", description: "API Architect" },
        { position: 2, reward: "1250 XP + Badge", description: "Backend Master" },
        { position: 3, reward: "1000 XP + Badge", description: "Server Specialist" }
      ],
      leaderboard: []
    }
  ];

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    const colors = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-red-100 text-red-800"
    };
    return colors[difficulty];
  };

  const getCategoryIcon = (category: Challenge['category']) => {
    switch (category) {
      case "algorithm": return <Code className="w-4 h-4" />;
      case "frontend": return <Star className="w-4 h-4" />;
      case "backend": return <Target className="w-4 h-4" />;
      case "fullstack": return <Zap className="w-4 h-4" />;
      case "system-design": return <TrendingUp className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Challenge['status']) => {
    const colors = {
      upcoming: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800", 
      completed: "bg-gray-100 text-gray-800"
    };
    return colors[status];
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      await fetch(getApiUrl(`/api/v1/challenges/${challengeId}/join`), {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Update challenge participant count optimistically
      setChallenges(prev => prev.map(c => 
        c.id === challengeId ? { ...c, participants: c.participants + 1 } : c
      ));
    } catch (error) {
      console.error("Failed to join challenge:", error);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const statusMatch = filter === "all" || challenge.status === filter;
    const categoryMatch = categoryFilter === "all" || challenge.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-2 mb-2">Weekly Challenges</h1>
        <p className="body-large">Compete with developers worldwide and improve your skills</p>
      </motion.div>

      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">This Week</span>
          </div>
          <div className="text-2xl font-bold">3</div>
          <div className="text-xs opacity-75">Active Challenges</div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Participants</span>
          </div>
          <div className="text-2xl font-bold">2.6K</div>
          <div className="text-xs opacity-75">Competing Now</div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Your Streak</span>
          </div>
          <div className="text-2xl font-bold">5</div>
          <div className="text-xs opacity-75">Weeks Participating</div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Total XP</span>
          </div>
          <div className="text-2xl font-bold">12.5K</div>
          <div className="text-xs opacity-75">From Challenges</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4 mb-6"
      >
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "upcoming", label: "Upcoming" },
            { value: "completed", label: "Completed" }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {[
            { value: "all", label: "All Categories" },
            { value: "algorithm", label: "Algorithm" },
            { value: "frontend", label: "Frontend" },
            { value: "backend", label: "Backend" },
            { value: "fullstack", label: "Full Stack" }
          ].map(c => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === c.value
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Challenges List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredChallenges.length > 0 ? (
        <div className="space-y-6">
          {filteredChallenges.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    {getCategoryIcon(challenge.category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{challenge.title}</h3>
                        <p className="text-gray-600 mb-3">{challenge.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {challenge.timeLimit}min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.participants} participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {challenge.points} XP
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                          {challenge.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prizes */}
              {challenge.prizes.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                    <Medal className="w-4 h-4" />
                    Prizes
                  </h4>
                  <div className="flex gap-4 text-sm">
                    {challenge.prizes.slice(0, 3).map((prize) => (
                      <div key={prize.position} className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                          prize.position === 1 ? 'bg-yellow-400 text-yellow-900' :
                          prize.position === 2 ? 'bg-gray-300 text-gray-700' :
                          'bg-orange-300 text-orange-900'
                        }`}>
                          {prize.position}
                        </span>
                        <span className="text-yellow-800">{prize.reward}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Performers */}
              {challenge.leaderboard.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Top Performers
                  </h4>
                  <div className="flex gap-4">
                    {challenge.leaderboard.slice(0, 3).map((entry) => (
                      <div key={entry.rank} className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 bg-gray-100 rounded-full text-xs font-medium flex items-center justify-center">
                          {entry.rank}
                        </span>
                        <span className="font-medium">{entry.username}</span>
                        <span className="text-gray-500">{entry.score}pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {challenge.status === "active" && `Ends ${new Date(challenge.endDate).toLocaleDateString()}`}
                  {challenge.status === "upcoming" && `Starts ${new Date(challenge.startDate).toLocaleDateString()}`}
                  {challenge.status === "completed" && "Challenge completed"}
                </div>

                <div className="flex items-center gap-2">
                  {challenge.status === "active" && (
                    <button
                      onClick={() => joinChallenge(challenge.id)}
                      className="btn-primary"
                    >
                      <Play className="w-4 h-4" />
                      Join Challenge
                    </button>
                  )}
                  
                  {challenge.status === "upcoming" && (
                    <button className="btn-secondary">
                      <Calendar className="w-4 h-4" />
                      Notify Me
                    </button>
                  )}

                  {challenge.status === "completed" && (
                    <button className="btn-secondary">
                      <CheckCircle2 className="w-4 h-4" />
                      View Results
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
          <p className="text-gray-600">Check back soon for new coding challenges!</p>
        </div>
      )}
    </div>
  );
}

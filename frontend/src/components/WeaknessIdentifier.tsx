"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  TrendingDown,
  Clock,
  Target,
  BookOpen,
  PlayCircle,
  ChevronRight,
  Calendar,
  BarChart3,
  Zap,
  RefreshCw
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface WeakSkill {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  expectedLevel: number; // Where you should be by now
  daysOverdue: number;
  priority: "critical" | "high" | "medium" | "low";
  impact: string; // Why this skill matters
  quickActions: QuickAction[];
  lastStudied?: Date;
  timeToTarget: number; // estimated hours
}

interface QuickAction {
  type: "resource" | "practice" | "project" | "review";
  title: string;
  estimatedTime: number; // minutes
  difficulty: "easy" | "medium" | "hard";
  url?: string;
}

interface WeaknessIdentifierProps {
  onStartLearning?: (skillId: string) => void;
}

export function WeaknessIdentifier({ onStartLearning }: WeaknessIdentifierProps) {
  const { data: session } = useSession();
  const [weakSkills, setWeakSkills] = useState<WeakSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"priority" | "overdue" | "impact">("priority");
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (accessToken) {
      analyzeWeaknesses();
    }
  }, [accessToken]);

  const analyzeWeaknesses = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/skills/weakness-analysis"), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWeakSkills(processWeaknessData(data.data || []));
      } else {
        // Show empty state when API not available
        setWeakSkills([]);
      }
    } catch (error) {
      // Show empty state on error
      setWeakSkills([]);
    } finally {
      setIsLoading(false);
    }
  };

  const processWeaknessData = (skillsData: any[]): WeakSkill[] => {
    return skillsData
      .map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        currentLevel: skill.currentLevel,
        targetLevel: skill.targetLevel,
        expectedLevel: skill.expectedLevel,
        daysOverdue: Math.max(0, skill.daysOverdue),
        priority: calculatePriority(skill),
        impact: skill.impact || getDefaultImpact(skill.name),
        quickActions: generateQuickActions(skill),
        lastStudied: skill.lastStudied ? new Date(skill.lastStudied) : undefined,
        timeToTarget: skill.timeToTarget || estimateTimeToTarget(skill)
      }))
      .filter((skill: WeakSkill) => skill.currentLevel < skill.expectedLevel)
      .sort(sortSkillsByPriority);
  };

  const calculatePriority = (skill: any): WeakSkill['priority'] => {
    const levelGap = skill.expectedLevel - skill.currentLevel;
    const timeOverdue = skill.daysOverdue;

    if (levelGap > 30 || timeOverdue > 14) return "critical";
    if (levelGap > 20 || timeOverdue > 7) return "high";
    if (levelGap > 10 || timeOverdue > 3) return "medium";
    return "low";
  };

  const getDefaultImpact = (skillName: string): string => {
    const impacts: Record<string, string> = {
      "JavaScript": "Found in 85% of frontend job postings",
      "React": "Most popular frontend framework",
      "Node.js": "Essential for full-stack development",
      "Python": "Required for 70% of backend roles",
      "SQL": "Database skills needed for all roles",
      "System Design": "Critical for senior positions",
      "Data Structures": "Foundation for technical interviews",
      "Algorithms": "Core computer science fundamentals"
    };
    return impacts[skillName] || "Important for your career progression";
  };

  const generateQuickActions = (skill: any): QuickAction[] => [
    {
      type: "resource",
      title: `${skill.name} Crash Course`,
      estimatedTime: 45,
      difficulty: "medium",
      url: `/resources/skill/${skill.name.toLowerCase()}`
    },
    {
      type: "practice",
      title: "Interactive Exercises",
      estimatedTime: 30,
      difficulty: "easy"
    },
    {
      type: "project",
      title: `Build a ${skill.name} Project`,
      estimatedTime: 120,
      difficulty: "hard"
    },
    {
      type: "review",
      title: "Review Fundamentals",
      estimatedTime: 20,
      difficulty: "easy"
    }
  ];

  const estimateTimeToTarget = (skill: any): number => {
    const levelGap = skill.targetLevel - skill.currentLevel;
    return Math.ceil(levelGap * 0.5); // Rough estimate: 30 min per level point
  };

  const sortSkillsByPriority = (a: WeakSkill, b: WeakSkill): number => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    switch (sortBy) {
      case "overdue":
        return b.daysOverdue - a.daysOverdue;
      case "impact":
        return (b.expectedLevel - b.currentLevel) - (a.expectedLevel - a.currentLevel);
      case "priority":
      default:
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
  };


  const getPriorityColor = (priority: WeakSkill['priority']) => {
    const colors = {
      critical: "bg-red-100 border-red-300 text-red-800",
      high: "bg-orange-100 border-orange-300 text-orange-800",
      medium: "bg-yellow-100 border-yellow-300 text-yellow-800",
      low: "bg-gray-100 border-gray-300 text-gray-800"
    };
    return colors[priority];
  };

  const getPriorityIcon = (priority: WeakSkill['priority']) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      case "high":
        return <TrendingDown className="w-4 h-4" />;
      case "medium":
        return <Clock className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getActionIcon = (type: QuickAction['type']) => {
    switch (type) {
      case "resource":
        return <BookOpen className="w-4 h-4" />;
      case "practice":
        return <PlayCircle className="w-4 h-4" />;
      case "project":
        return <Target className="w-4 h-4" />;
      case "review":
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  const startLearning = (skill: WeakSkill) => {
    onStartLearning?.(skill.id);
    // Optimistically update the last studied date
    setWeakSkills(prev => prev.map(s => 
      s.id === skill.id ? { ...s, lastStudied: new Date() } : s
    ));
  };

  const filteredSkills = selectedCategory === "all" 
    ? weakSkills 
    : weakSkills.filter(skill => skill.category === selectedCategory);

  const categories = [...new Set(weakSkills.map(s => s.category))];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (weakSkills.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center">
          <Target className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No Skill Gaps Detected!</h3>
          <p className="text-gray-600">You're on track with all your learning goals.</p>
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
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Skills Behind Schedule
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {weakSkills.length} skills need attention to stay on track
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="priority">Priority</option>
            <option value="overdue">Most Overdue</option>
            <option value="impact">Biggest Gap</option>
          </select>
        </div>
      </div>

      {/* Skills List */}
      <div className="space-y-4">
        {filteredSkills.slice(0, 5).map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 ${getPriorityColor(skill.priority)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getPriorityIcon(skill.priority)}
                  <h4 className="font-medium">{skill.name}</h4>
                  <span className="text-xs px-2 py-0.5 bg-white bg-opacity-60 rounded-full">
                    {skill.priority}
                  </span>
                </div>
                
                <p className="text-sm opacity-90 mb-2">{skill.impact}</p>
                
                <div className="flex items-center gap-4 text-xs">
                  <span>Current: {skill.currentLevel}%</span>
                  <span>Expected: {skill.expectedLevel}%</span>
                  <span>Gap: {skill.expectedLevel - skill.currentLevel}%</span>
                  {skill.daysOverdue > 0 && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {skill.daysOverdue}d overdue
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => startLearning(skill)}
                className="px-3 py-1 bg-white bg-opacity-80 text-sm font-medium rounded-lg hover:bg-opacity-100 transition-all"
              >
                Start Now
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{skill.timeToTarget}h to target</span>
              </div>
              <div className="h-2 bg-white bg-opacity-50 rounded-full">
                <div className="h-full bg-current rounded-full relative" style={{ width: `${skill.currentLevel}%` }}>
                  <div 
                    className="absolute top-0 h-full bg-white bg-opacity-40 rounded-full"
                    style={{ 
                      left: `${skill.currentLevel}%`, 
                      width: `${skill.expectedLevel - skill.currentLevel}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              {skill.quickActions.slice(0, 3).map((action, actionIndex) => (
                <button
                  key={actionIndex}
                  className="flex items-center gap-1 px-2 py-1 bg-white bg-opacity-60 hover:bg-opacity-80 rounded text-xs transition-colors"
                >
                  {getActionIcon(action.type)}
                  <span>{action.title}</span>
                  <span className="opacity-75">({action.estimatedTime}m)</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Insight */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Learning Focus Recommendation</p>
            <p className="text-blue-800">
              {weakSkills.filter(s => s.priority === "critical").length > 0
                ? "Focus on critical skills first. They're blocking your progress toward job readiness."
                : weakSkills.filter(s => s.priority === "high").length > 0
                ? "Address high-priority skills this week to stay on track with your learning goals."
                : "You're doing well! Focus on the medium-priority skills to maintain momentum."
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

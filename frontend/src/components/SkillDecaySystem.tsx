"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, TrendingDown, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";

interface DecayingSkill {
  id: string;
  name: string;
  currentLevel: number;
  originalLevel: number;
  lastPracticed: Date;
  decayRate: number;
  daysInactive: number;
  urgency: "low" | "medium" | "high" | "critical";
}

interface SkillDecaySystemProps {
  onPracticeSkill?: (skillId: string) => void;
}

export function SkillDecaySystem({ onPracticeSkill }: SkillDecaySystemProps) {
  const { data: session } = useSession();
  const [decayingSkills, setDecayingSkills] = useState<DecayingSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDecayModal, setShowDecayModal] = useState(false);
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (accessToken) {
      fetchDecayingSkills();
    }
  }, [accessToken]);

  const fetchDecayingSkills = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(getApiUrl("/api/v1/skills/decay-analysis"), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDecayingSkills(calculateSkillDecay(data.data || []));
      } else {
        // Generate mock decaying skills for demo
        setDecayingSkills(generateMockDecayingSkills());
      }
    } catch (error) {
      setDecayingSkills(generateMockDecayingSkills());
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSkillDecay = (skills: any[]): DecayingSkill[] => {
    return skills
      .map((skill: any) => {
        const lastPracticed = new Date(skill.lastPracticed || skill.updatedAt);
        const daysInactive = Math.floor((Date.now() - lastPracticed.getTime()) / (1000 * 60 * 60 * 24));
        
        // Decay formula: newLevel = originalLevel * e^(-decayRate * days)
        const decayRate = getSkillDecayRate(skill.category);
        const decayFactor = Math.exp(-decayRate * daysInactive);
        const currentLevel = Math.max(0, Math.floor(skill.originalLevel * decayFactor));
        
        const urgency = getDecayUrgency(daysInactive, skill.originalLevel - currentLevel);

        return {
          id: skill.id,
          name: skill.name,
          currentLevel,
          originalLevel: skill.originalLevel,
          lastPracticed,
          decayRate,
          daysInactive,
          urgency
        };
      })
      .filter((skill: DecayingSkill) => skill.currentLevel < skill.originalLevel)
      .sort((a, b) => {
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      });
  };

  const getSkillDecayRate = (category: string): number => {
    const decayRates: Record<string, number> = {
      'programming-language': 0.02, // Slower decay for core languages
      'framework': 0.04, // Faster decay for frameworks
      'tool': 0.03,
      'concept': 0.01, // Concepts decay slowest
      'practice': 0.05, // Practical skills decay fastest
    };
    return decayRates[category] || 0.03;
  };

  const getDecayUrgency = (daysInactive: number, levelLoss: number): DecayingSkill['urgency'] => {
    if (daysInactive > 60 || levelLoss > 30) return "critical";
    if (daysInactive > 30 || levelLoss > 20) return "high";
    if (daysInactive > 14 || levelLoss > 10) return "medium";
    return "low";
  };

  const generateMockDecayingSkills = (): DecayingSkill[] => [
    {
      id: "1",
      name: "React Hooks",
      currentLevel: 65,
      originalLevel: 85,
      lastPracticed: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      decayRate: 0.04,
      daysInactive: 25,
      urgency: "medium"
    },
    {
      id: "2", 
      name: "SQL Queries",
      currentLevel: 45,
      originalLevel: 75,
      lastPracticed: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      decayRate: 0.03,
      daysInactive: 45,
      urgency: "high"
    },
    {
      id: "3",
      name: "Docker",
      currentLevel: 30,
      originalLevel: 70,
      lastPracticed: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      decayRate: 0.05,
      daysInactive: 60,
      urgency: "critical"
    }
  ];

  const getUrgencyColor = (urgency: DecayingSkill['urgency']) => {
    const colors = {
      low: "bg-yellow-50 border-yellow-200 text-yellow-800",
      medium: "bg-orange-50 border-orange-200 text-orange-800", 
      high: "bg-red-50 border-red-200 text-red-800",
      critical: "bg-red-100 border-red-300 text-red-900"
    };
    return colors[urgency];
  };

  const getUrgencyIcon = (urgency: DecayingSkill['urgency']) => {
    if (urgency === "critical") return <AlertTriangle className="w-4 h-4" />;
    if (urgency === "high") return <TrendingDown className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const practiceSkill = (skill: DecayingSkill) => {
    onPracticeSkill?.(skill.id);
    // Remove from decaying list optimistically
    setDecayingSkills(prev => prev.filter(s => s.id !== skill.id));
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-5 h-5 bg-yellow-200 rounded"></div>
          <div className="h-4 bg-yellow-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (decayingSkills.length === 0) {
    return (
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <RefreshCw className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-green-900">Skills Sharp!</h3>
            <p className="text-sm text-green-700">All your skills are well-maintained. Keep up the great work!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-orange-600" />
          Skills Needing Practice
        </h3>
        <button 
          onClick={() => setShowDecayModal(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Learn More
        </button>
      </div>

      <div className="space-y-2">
        {decayingSkills.slice(0, 5).map((skill) => (
          <motion.div
            key={skill.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-lg border ${getUrgencyColor(skill.urgency)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getUrgencyIcon(skill.urgency)}
                <div>
                  <p className="font-medium">{skill.name}</p>
                  <p className="text-xs opacity-75">
                    {skill.currentLevel}% (was {skill.originalLevel}%) • {skill.daysInactive}d inactive
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => practiceSkill(skill)}
                className="px-3 py-1 bg-white bg-opacity-80 text-sm font-medium rounded-lg hover:bg-opacity-100 transition-all"
              >
                Practice Now
              </button>
            </div>

            <div className="mt-2 bg-white bg-opacity-50 rounded-full h-2">
              <div 
                className="h-2 bg-current rounded-full transition-all duration-300"
                style={{ width: `${skill.currentLevel}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {decayingSkills.length > 5 && (
        <p className="text-sm text-gray-600 text-center">
          +{decayingSkills.length - 5} more skills need attention
        </p>
      )}
    </div>
  );
}

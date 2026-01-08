"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ExternalLink,
  Target,
  Sparkles,
  ArrowLeft,
  Play,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface Skill {
  name: string;
  description: string;
  importance: string;
  estimated_hours: number;
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

interface Phase {
  name: string;
  description: string;
  order: number;
  estimated_weeks: number;
  skills: Skill[];
}

interface Roadmap {
  id: string;
  job_title: string;
  industry: string;
  skill_level: string;
  phases: Phase[];
  completion_percentage: number;
  status: string;
}

interface Progress {
  [skillName: string]: {
    status: "not_started" | "in_progress" | "completed";
    completed_at?: string;
  };
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [expandedPhases, setExpandedPhases] = useState<number[]>([0]);
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!accessToken || !params.id) return;

      try {
        const response = await fetch(getApiUrl(`/api/v1/roadmap/${params.id}`), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRoadmap(data.data || data);
          
          // Build progress map
          const progressMap: Progress = {};
          (data.data?.phases || data.phases || []).forEach((phase: Phase) => {
            phase.skills?.forEach((skill: Skill) => {
              progressMap[skill.name] = { status: "not_started" };
            });
          });
          setProgress(progressMap);
        }
      } catch (error) {
        console.error("Failed to fetch roadmap:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmap();
  }, [params.id, accessToken]);

  const togglePhase = (index: number) => {
    setExpandedPhases((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const updateSkillStatus = async (skillName: string, status: "not_started" | "in_progress" | "completed") => {
    // Find the skill ID from the roadmap data
    let skillId = null;
    if (roadmap?.phases) {
      for (const phase of roadmap.phases) {
        for (const skill of phase.skills || []) {
          if (skill.name === skillName) {
            skillId = skill.id;
            break;
          }
        }
        if (skillId) break;
      }
    }

    if (!skillId) {
      console.error("Skill ID not found for:", skillName);
      return;
    }

    // Optimistically update the UI
    setProgress((prev) => ({
      ...prev,
      [skillName]: { ...prev[skillName], status },
    }));

    // Update on server with correct endpoint and data format
    try {
      const response = await fetch(getApiUrl("/api/v1/roadmap/progress"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          roadmap_id: params.id,
          skill_id: skillId,
          status,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the roadmap completion percentage if returned
        if (data.data?.roadmap_completion !== undefined) {
          setRoadmap(prev => prev ? { ...prev, completion_percentage: data.data.roadmap_completion } : prev);
        }
      } else {
        console.error("Failed to update progress on server:", response.status);
        // Revert optimistic update on failure
        setProgress((prev) => ({
          ...prev,
          [skillName]: { ...prev[skillName], status: prev[skillName]?.status || "not_started" },
        }));
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
      // Revert optimistic update on failure
      setProgress((prev) => ({
        ...prev,
        [skillName]: { ...prev[skillName], status: prev[skillName]?.status || "not_started" },
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Play className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-neutral-300" />;
    }
  };

  const calculatePhaseProgress = (phase: Phase) => {
    if (!phase.skills?.length) return 0;
    const completed = phase.skills.filter(
      (s) => progress[s.name]?.status === "completed"
    ).length;
    return Math.round((completed / phase.skills.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
          <div className="h-4 bg-neutral-200 rounded w-1/2" />
          <div className="card h-48" />
          <div className="card h-48" />
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="heading-3 mb-4">Roadmap not found</h2>
        <Link href="/dashboard" className="btn-primary inline-flex">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="heading-2 mb-2">{roadmap.job_title}</h1>
            <div className="flex items-center gap-3 text-neutral-500">
              <span className="badge-neutral">{roadmap.skill_level}</span>
              <span>{roadmap.industry}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-neutral-900">
              {roadmap.completion_percentage || 0}%
            </div>
            <p className="text-sm text-neutral-500">Complete</p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6">
          <div className="progress-bar h-3">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${roadmap.completion_percentage || 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Phases */}
      <div className="space-y-4">
        {roadmap.phases?.map((phase, phaseIndex) => (
          <motion.div
            key={phase.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: phaseIndex * 0.1 }}
            className="card overflow-hidden"
          >
            {/* Phase Header */}
            <button
              onClick={() => togglePhase(phaseIndex)}
              className="w-full flex items-center justify-between p-6 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-semibold">
                  {phaseIndex + 1}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-neutral-900">{phase.name}</h3>
                  <p className="text-sm text-neutral-500">
                    {phase.skills?.length || 0} skills • {phase.estimated_weeks} weeks
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm font-medium text-neutral-900">
                    {calculatePhaseProgress(phase)}%
                  </span>
                </div>
                {expandedPhases.includes(phaseIndex) ? (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </button>

            {/* Phase Content */}
            <AnimatePresence>
              {expandedPhases.includes(phaseIndex) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-4">
                    <p className="text-neutral-600 text-sm">{phase.description}</p>

                    {/* Skills */}
                    <div className="space-y-3">
                      {phase.skills?.map((skill) => (
                        <div
                          key={skill.name}
                          className="p-4 bg-neutral-50 rounded-xl"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => {
                                const currentStatus = progress[skill.name]?.status || "not_started";
                                const nextStatus = 
                                  currentStatus === "not_started" ? "in_progress" :
                                  currentStatus === "in_progress" ? "completed" : "not_started";
                                updateSkillStatus(skill.name, nextStatus);
                              }}
                              className="mt-0.5"
                            >
                              {getStatusIcon(progress[skill.name]?.status || "not_started")}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-neutral-900">{skill.name}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  skill.importance === "critical" 
                                    ? "bg-red-100 text-red-700"
                                    : skill.importance === "important"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-neutral-200 text-neutral-600"
                                }`}>
                                  {skill.importance}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-600 mb-3">{skill.description}</p>
                              
                              {/* Why this matters */}
                              {skill.importance === "critical" && (
                                <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                                  <p className="text-xs font-semibold text-red-900 mb-1">🎯 Why this matters:</p>
                                  <p className="text-xs text-red-800">
                                    Appears in <strong>75-90%</strong> of {roadmap.job_title} interviews. Employers expect mastery.
                                  </p>
                                </div>
                              )}
                              {skill.importance === "important" && (
                                <div className="mb-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
                                  <p className="text-xs font-semibold text-amber-900 mb-1">🎯 Why this matters:</p>
                                  <p className="text-xs text-amber-800">
                                    Appears in <strong>50-75%</strong> of {roadmap.job_title} interviews. Strong advantage.
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {skill.estimated_hours}h
                                </span>
                              </div>

                              {/* Resources */}
                              {skill.resources?.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-neutral-500 uppercase">Resources</p>
                                  {skill.resources.map((resource, i) => (
                                    <a
                                      key={i}
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900"
                                    >
                                      <BookOpen className="w-4 h-4" />
                                      {resource.title}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* AI Study Buddy CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Link href="/study-buddy" className="card-hover block p-6 text-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-neutral-600" />
          </div>
          <h3 className="font-semibold text-neutral-900 mb-1">Need help with a skill?</h3>
          <p className="text-sm text-neutral-500">
            Ask our AI Study Buddy for explanations and practice exercises
          </p>
        </Link>
      </motion.div>
    </div>
  );
}

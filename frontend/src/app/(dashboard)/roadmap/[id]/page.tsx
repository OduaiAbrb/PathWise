"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Clock,
  BookOpen,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { formatDuration } from "@/lib/utils";
import toast from "react-hot-toast";

interface Skill {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  importance: string;
  estimated_hours: number;
  description: string;
  resources: Resource[];
  progress?: {
    status: string;
    time_spent_minutes: number;
    completed_at: string | null;
  };
}

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  difficulty: string;
  duration_minutes: number | null;
  quality_score: number;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  order: number;
  estimated_weeks: number;
  skills: Skill[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_hours: number;
  skills: string[];
  steps: string[];
}

interface Roadmap {
  id: string;
  job_title: string;
  job_description: string;
  industry: string | null;
  skill_level: string;
  estimated_weeks: number | null;
  phases: Phase[];
  projects: Project[];
  completion_percentage: number;
  status: string;
  generated_at: string;
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  
  // Get access token from session
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!accessToken) return;
      try {
        const response = await fetch(`/api/v1/roadmap/${params.id}`, {
          headers: {
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });
        if (response.ok) {
          const data = await response.json();
          setRoadmap(data.data);
          // Expand first phase by default
          if (data.data.phases?.length > 0) {
            setExpandedPhases(new Set([data.data.phases[0].id]));
          }
        }
      } catch (error) {
        console.error("Failed to fetch roadmap:", error);
        toast.error("Failed to load roadmap");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchRoadmap();
    }
  }, [params.id, accessToken]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const toggleSkill = (skillId: string) => {
    setExpandedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  const updateSkillStatus = async (skillId: string, status: string) => {
    if (!roadmap) return;

    try {
      const response = await fetch("/api/v1/roadmap/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmap_id: roadmap.id,
          skill_id: skillId,
          status,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state
        setRoadmap((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            completion_percentage: data.data.roadmap_completion,
            phases: prev.phases.map((phase) => ({
              ...phase,
              skills: phase.skills.map((skill) =>
                skill.id === skillId
                  ? { ...skill, progress: { ...skill.progress, status } }
                  : skill
              ),
            })),
          };
        });
        toast.success(
          status === "completed" ? "Skill completed!" : "Progress updated"
        );
      }
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const startTimer = (skillId: string) => {
    if (activeTimer === skillId) {
      // Stop timer and log time
      logTime(skillId, Math.floor(timerSeconds / 60));
      setActiveTimer(null);
      setTimerSeconds(0);
    } else {
      setActiveTimer(skillId);
      setTimerSeconds(0);
    }
  };

  const logTime = async (skillId: string, minutes: number) => {
    if (!roadmap || minutes < 1) return;

    try {
      await fetch("/api/v1/roadmap/time-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmap_id: roadmap.id,
          skill_id: skillId,
          minutes,
        }),
      });
      toast.success(`Logged ${minutes} minutes`);
    } catch (error) {
      console.error("Failed to log time:", error);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-accent-400 bg-accent-400/10";
      case "in_progress":
        return "text-primary-400 bg-primary-400/10";
      default:
        return "text-dark-400 bg-dark-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-dark-800 rounded w-1/2 mb-4" />
            <div className="h-6 bg-dark-800 rounded w-1/3 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-dark-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-dark-950 pt-20 pb-12 flex items-center justify-center">
        <p className="text-dark-400">Roadmap not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            {roadmap.job_title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-dark-400">
            <Badge variant="secondary">{roadmap.skill_level}</Badge>
            {roadmap.industry && <span>{roadmap.industry}</span>}
            <span>•</span>
            <span>{roadmap.estimated_weeks} weeks estimated</span>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-dark-900/50 border-dark-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Overall Progress
                </h2>
                <span className="text-2xl font-bold text-primary-400">
                  {roadmap.completion_percentage}%
                </span>
              </div>
              <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${roadmap.completion_percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Phases */}
        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-white">Learning Phases</h2>
          
          {roadmap.phases.map((phase, phaseIndex) => (
            <Card
              key={phase.id}
              className="bg-dark-900/50 border-dark-800 overflow-hidden"
            >
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 font-bold">
                    {phaseIndex + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">{phase.name}</h3>
                    <p className="text-sm text-dark-400">
                      {phase.skills.length} skills • {phase.estimated_weeks} weeks
                    </p>
                  </div>
                </div>
                {expandedPhases.has(phase.id) ? (
                  <ChevronDown className="w-5 h-5 text-dark-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-dark-400" />
                )}
              </button>

              {/* Phase Content */}
              <AnimatePresence>
                {expandedPhases.has(phase.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <p className="text-dark-400 text-sm mb-4">
                        {phase.description}
                      </p>

                      {phase.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="bg-dark-800/50 rounded-xl overflow-hidden"
                        >
                          {/* Skill Header */}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <button
                                onClick={() => toggleSkill(skill.id)}
                                className="flex items-center gap-2 text-left flex-1"
                              >
                                {expandedSkills.has(skill.id) ? (
                                  <ChevronDown className="w-4 h-4 text-dark-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-dark-400 flex-shrink-0" />
                                )}
                                <span className="font-medium text-white">
                                  {skill.name}
                                </span>
                              </button>

                              <div className="flex items-center gap-2">
                                {/* Timer */}
                                {activeTimer === skill.id ? (
                                  <span className="text-primary-400 font-mono text-sm">
                                    {formatTimer(timerSeconds)}
                                  </span>
                                ) : null}
                                <button
                                  onClick={() => startTimer(skill.id)}
                                  className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
                                >
                                  {activeTimer === skill.id ? (
                                    <Pause className="w-4 h-4 text-primary-400" />
                                  ) : (
                                    <Play className="w-4 h-4 text-dark-400" />
                                  )}
                                </button>

                                {/* Status Toggle */}
                                <button
                                  onClick={() =>
                                    updateSkillStatus(
                                      skill.id,
                                      skill.progress?.status === "completed"
                                        ? "not_started"
                                        : "completed"
                                    )
                                  }
                                  className={`p-2 rounded-lg transition-colors ${getStatusColor(
                                    skill.progress?.status || "not_started"
                                  )}`}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-dark-400 ml-6">
                              <Badge
                                size="sm"
                                variant={
                                  skill.importance === "critical"
                                    ? "primary"
                                    : "default"
                                }
                              >
                                {skill.importance}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {skill.estimated_hours}h
                              </span>
                              <span>{skill.difficulty}</span>
                            </div>
                          </div>

                          {/* Skill Resources */}
                          <AnimatePresence>
                            {expandedSkills.has(skill.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-dark-700"
                              >
                                <div className="p-4 space-y-3">
                                  <p className="text-dark-400 text-sm">
                                    {skill.description}
                                  </p>

                                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Resources
                                  </h4>

                                  <div className="space-y-2">
                                    {skill.resources.map((resource) => (
                                      <a
                                        key={resource.id}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors group"
                                      >
                                        <div className="flex-1">
                                          <p className="text-white text-sm group-hover:text-primary-400 transition-colors">
                                            {resource.title}
                                          </p>
                                          <div className="flex items-center gap-2 text-xs text-dark-400 mt-1">
                                            <Badge size="sm" variant="default">
                                              {resource.type}
                                            </Badge>
                                            {resource.duration_minutes && (
                                              <span>
                                                {formatDuration(
                                                  resource.duration_minutes
                                                )}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-dark-500 group-hover:text-primary-400" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </motion.div>

        {/* Projects */}
        {roadmap.projects && roadmap.projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              Portfolio Projects
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {roadmap.projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-dark-900/50 border-dark-800"
                >
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-dark-400 text-sm mb-4">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="secondary">{project.difficulty}</Badge>
                      <span className="text-dark-400">
                        ~{project.estimated_hours}h
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

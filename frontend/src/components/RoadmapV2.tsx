"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Lock,
  Target,
  Clock,
  Zap,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Award,
  Brain,
  Play,
  CheckCheck,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Star,
  Video,
  FileText,
  Code,
  GraduationCap,
  Minus,
  Plus,
  Map,
  X,
  Rocket,
  Trophy,
  ListChecks,
  Hammer,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  duration_minutes?: number;
  difficulty?: string;
  quality_score?: number;
}

interface Checkpoint {
  id: string;
  type: "mcq" | "open" | "code";
  question: string;
  options?: string[];
  correct_answer?: string | number;
  explanation: string;
  completed?: boolean;
  user_answer?: string | number;
}

interface Exam {
  id: string;
  questions: Checkpoint[];
  pass_score: number;
  user_score?: number;
  passed?: boolean;
  attempts?: number;
}

interface Skill {
  id: string;
  name: string;
  status: "completed" | "in_progress" | "not_started" | "locked";
  progress?: number;
  estimated_hours?: number;
  interview_frequency?: number;
  resources?: Resource[];
  why_this_matters?: string;
  what_if_skipped?: string;
}

interface PhaseProject {
  title: string;
  description: string;
  requirements?: string[];
  estimated_hours?: number;
}

interface Phase {
  id: string;
  title: string;
  description?: string;
  duration_weeks: number;
  importance: "critical" | "important" | "optional";
  skills: Skill[];
  status: "completed" | "in_progress" | "not_started" | "locked";
  understanding_score?: number;
  checkpoints?: Checkpoint[];
  exam?: Exam;
  why_it_matters?: string;
  deliverables?: string[];
  benchmarks?: string[];
  phase_project?: PhaseProject;
}

interface RoadmapData {
  id: string;
  job_title: string;
  experience_level: string;
  estimated_months: number;
  phases: Phase[];
  completion_percentage: number;
}

interface RoadmapV2Props {
  roadmap: RoadmapData;
  onSkillClick?: (skill: Skill, phaseId: string) => void;
  onCheckpointAnswer?: (phaseId: string, checkpointId: string, answer: string | number) => void;
  onExamSubmit?: (phaseId: string, answers: Record<string, string | number>) => void;
  onBookmarkResource?: (resource: Resource, skillId: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESOURCE TYPE ICONS
// ═══════════════════════════════════════════════════════════════════════════

const getResourceIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "video":
      return Video;
    case "article":
    case "documentation":
      return FileText;
    case "course":
      return GraduationCap;
    case "code":
    case "interactive":
      return Code;
    default:
      return BookOpen;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function RoadmapV2({
  roadmap,
  onSkillClick,
  onCheckpointAnswer,
  onExamSubmit,
  onBookmarkResource,
}: RoadmapV2Props) {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, number | string>>({});
  const [showExam, setShowExam] = useState<string | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string | number>>({});
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState<{ skill: Skill; phaseId: string } | null>(null);
  const [bookmarkedResources, setBookmarkedResources] = useState<Set<string>>(new Set());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Find current active phase (first non-completed)
  const currentPhaseIndex = roadmap.phases.findIndex(
    (p) => p.status === "in_progress" || p.status === "not_started"
  );

  // Set initial active phase
  useEffect(() => {
    if (currentPhaseIndex >= 0) {
      setActivePhaseIndex(currentPhaseIndex);
    }
  }, [currentPhaseIndex]);

  // Scroll to phase
  const scrollToPhase = useCallback((index: number) => {
    setActivePhaseIndex(index);
    phaseRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // Navigate phases
  const goToPrevPhase = () => {
    if (activePhaseIndex > 0) scrollToPhase(activePhaseIndex - 1);
  };
  const goToNextPhase = () => {
    if (activePhaseIndex < roadmap.phases.length - 1) scrollToPhase(activePhaseIndex + 1);
  };

  // Handle checkpoint answer
  const handleCheckpointAnswer = (phaseId: string, checkpointId: string, answer: number | string) => {
    setCheckpointAnswers((prev) => ({ ...prev, [`${phaseId}-${checkpointId}`]: answer }));
    onCheckpointAnswer?.(phaseId, checkpointId, answer);
  };

  // Handle bookmark
  const toggleBookmark = (resource: Resource, skillId: string) => {
    setBookmarkedResources((prev) => {
      const next = new Set(prev);
      if (next.has(resource.id)) {
        next.delete(resource.id);
      } else {
        next.add(resource.id);
        onBookmarkResource?.(resource, skillId);
      }
      return next;
    });
  };

  // Get phase status styling
  const getPhaseNodeStyle = (phase: Phase, index: number) => {
    const isActive = index === activePhaseIndex;
    const isCurrent = index === currentPhaseIndex;

    if (phase.status === "completed") {
      return {
        bg: "bg-black",
        border: "border-black",
        text: "text-white",
        glow: isActive ? "ring-3 ring-slate-300" : "",
      };
    }
    if (isCurrent || phase.status === "in_progress") {
      return {
        bg: "bg-slate-900",
        border: "border-slate-900",
        text: "text-white",
        glow: "shadow-lg shadow-slate-900/30 " + (isActive ? "ring-3 ring-slate-400" : ""),
      };
    }
    if (phase.status === "locked") {
      return {
        bg: "bg-slate-200",
        border: "border-slate-300",
        text: "text-slate-400",
        glow: "",
      };
    }
    return {
      bg: "bg-white",
      border: "border-slate-300",
      text: "text-slate-600",
      glow: isActive ? "ring-3 ring-slate-300" : "",
    };
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "critical":
        return { bg: "bg-black", text: "text-white", label: " Critical Foundation" };
      case "important":
        return { bg: "bg-slate-800", text: "text-white", label: " Important" };
      default:
        return { bg: "bg-slate-100", text: "text-slate-600", label: "Optional" };
    }
  };

  const activePhase = roadmap.phases[activePhaseIndex];

  return (
    <div className="bg-slate-50 min-h-screen" ref={containerRef}>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STICKY MINI-MAP TOGGLE */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <button
        onClick={() => setShowMiniMap(!showMiniMap)}
        className="fixed top-24 right-6 z-50 p-3 bg-white rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
      >
        <Map className="w-5 h-5 text-slate-600" />
      </button>

      {/* Mini-map overlay */}
      <AnimatePresence>
        {showMiniMap && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-20 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-slate-900">Roadmap Overview</h4>
              <button onClick={() => setShowMiniMap(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {roadmap.phases.map((phase, idx) => (
                <button
                  key={phase.id}
                  onClick={() => { scrollToPhase(idx); setShowMiniMap(false); }}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors
                    ${idx === activePhaseIndex ? "bg-violet-100 text-violet-700" : "hover:bg-slate-100"}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${phase.status === "completed" ? "bg-emerald-500 text-white" :
                      phase.status === "in_progress" ? "bg-violet-500 text-white" :
                      phase.status === "locked" ? "bg-slate-200 text-slate-400" : "bg-white border border-slate-300"}`}
                  >
                    {phase.status === "completed" ? "✓" : idx + 1}
                  </div>
                  <span className={phase.status === "locked" ? "text-slate-400" : "text-slate-700"}>
                    {phase.title}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION - FULL BLEED */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-violet-400 text-sm mb-4 font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Your Personalized Learning Journey</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight">
            {roadmap.job_title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-slate-300 mb-10">
            <span className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full">
              <Target className="w-5 h-5 text-violet-400" />
              {roadmap.experience_level}
            </span>
            <span className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full">
              <Clock className="w-5 h-5 text-violet-400" />
              {roadmap.estimated_months || "6-8"} Months
            </span>
            <span className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full">
              <BookOpen className="w-5 h-5 text-violet-400" />
              {roadmap.phases.length} Phases
            </span>
          </div>

          {/* Overall Progress - Large */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg text-slate-400">Overall Progress</span>
              <span className="text-5xl font-black">{roadmap.completion_percentage}%</span>
            </div>
            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${roadmap.completion_percentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"
              />
            </div>
          </div>

          {/* Current Phase Indicator */}
          {currentPhaseIndex >= 0 && (
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 rounded-full px-6 py-3">
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse" />
              <span className="text-violet-300">
                Currently on: <strong className="text-white">{roadmap.phases[currentPhaseIndex]?.title}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HORIZONTAL TIMELINE - COMPACT */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-slate-200">
        <div className="py-4 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Zoom Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={goToPrevPhase}
                  disabled={activePhaseIndex === 0}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-slate-600">
                  Phase {activePhaseIndex + 1} of {roadmap.phases.length}
                </span>
                <button
                  onClick={goToNextPhase}
                  disabled={activePhaseIndex === roadmap.phases.length - 1}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Removed zoom controls for cleaner UI */}
            </div>

            {/* Timeline */}
            <div className="overflow-x-auto pb-2">
              <div className="relative flex items-center justify-between min-w-[800px] py-3">
                {/* Timeline Line */}
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-200 -translate-y-1/2 rounded-full" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((Math.max(0, currentPhaseIndex) + 0.5) / roadmap.phases.length) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute top-1/2 left-0 h-2 bg-black -translate-y-1/2 rounded-full"
                />

                {/* Phase Nodes - BIGGER */}
                {roadmap.phases.map((phase, index) => {
                  const style = getPhaseNodeStyle(phase, index);
                  const isActive = index === activePhaseIndex;

                  return (
                    <motion.button
                      key={phase.id}
                      onClick={() => scrollToPhase(index)}
                      className="relative z-10 flex flex-col items-center cursor-pointer group"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Node Circle - COMPACT */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${style.bg} ${style.border} border-3 
                          flex items-center justify-center ${style.glow} transition-all duration-300`}
                      >
                        {phase.status === "completed" ? (
                          <CheckCircle2 className={`w-6 h-6 md:w-7 md:h-7 ${style.text}`} />
                        ) : phase.status === "locked" ? (
                          <Lock className={`w-5 h-5 md:w-6 md:h-6 ${style.text}`} />
                        ) : (
                          <span className={`text-lg md:text-xl font-black ${style.text}`}>
                            {index + 1}
                          </span>
                        )}
                      </motion.div>

                      {/* Phase Label */}
                      <div className="mt-3 text-center max-w-[120px]">
                        <p className={`text-sm font-bold truncate ${isActive ? "text-violet-600" : "text-slate-700"}`}>
                          {phase.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {phase.duration_weeks || 4} weeks
                        </p>
                      </div>

                      {/* Understanding Score Badge */}
                      {phase.understanding_score !== undefined && phase.understanding_score > 0 && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          {phase.understanding_score}%
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PHASE CARDS - FULL WIDTH, FOCUS MODE */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-24">
          {roadmap.phases.map((phase, index) => {
            const isActive = index === activePhaseIndex;
            const isLocked = phase.status === "locked";
            const importanceBadge = getImportanceBadge(phase.importance || "important");

            return (
              <motion.div
                key={phase.id}
                ref={(el) => { phaseRefs.current[index] = el; }}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`relative scroll-mt-48 ${isLocked ? "opacity-40 blur-[2px] pointer-events-none select-none" : ""}`}
              >
                {/* Phase Card - MUCH BIGGER */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white rounded-3xl overflow-hidden transition-all duration-500
                    ${isActive ? "ring-4 ring-black shadow-2xl" : "shadow-xl border border-slate-200"}`}
                  style={{ minHeight: "560px" }}
                >
                  {/* Phase Header */}
                  <div className={`p-8 ${isActive ? "bg-black text-white" : "bg-slate-50"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold ${isActive ? "bg-white/20 text-white" : `${importanceBadge.bg} ${importanceBadge.text}`}`}
                          >
                            {importanceBadge.label}
                          </motion.span>
                          {phase.status === "completed" && (
                            <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                              <Trophy className="w-4 h-4" /> Completed
                            </span>
                          )}
                        </div>
                        <motion.h2
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-3xl md:text-4xl font-black mb-3">
                          {phase.title}
                        </motion.h2>
                        {phase.description && (
                          <p className={`text-lg ${isActive ? "text-white/80" : "text-slate-600"} max-w-3xl`}>
                            {phase.description}
                          </p>
                        )}
                        <div className={`flex items-center gap-6 text-base mt-4 ${isActive ? "text-white/70" : "text-slate-500"}`}>
                          <span className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            {phase.duration_weeks || 4} weeks
                          </span>
                          <span className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            {phase.skills?.length || 0} skills
                          </span>
                        </div>
                      </div>

                      {/* Understanding Score - BIGGER */}
                      <div className="text-right ml-8">
                        <div className={`text-6xl font-black ${isActive ? "text-white" : "text-slate-900"}`}>
                          {phase.understanding_score || 0}%
                        </div>
                        <p className={`text-base ${isActive ? "text-white/60" : "text-slate-400"}`}>
                          Understanding
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Phase Content */}
                  <div className="p-10 space-y-10">
                    {/* Why It Matters */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Zap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-slate-900 mb-2">Why This Phase Matters</h3>
                          <p className="text-slate-600 text-lg">
                            {phase.why_it_matters ||
                              `Skills in this phase appear in 75-90% of ${roadmap.job_title} interviews. Mastering these concepts is critical for your success.`}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Deliverables & Benchmarks Row */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Deliverables */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                            <ListChecks className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-bold text-lg text-slate-900">After This Phase, You Can:</h4>
                        </div>
                        <ul className="space-y-3">
                          {(phase.deliverables || [
                            "Build foundational projects independently",
                            "Explain core concepts in interviews",
                            "Debug common issues confidently",
                          ]).map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700">
                              <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>

                      {/* Benchmarks */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-bold text-lg text-slate-900">Pass Criteria:</h4>
                        </div>
                        <ul className="space-y-3">
                          {(phase.benchmarks || [
                            "Score 70%+ on phase exam",
                            "Complete the phase project",
                            "Answer checkpoint questions correctly",
                          ]).map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700">
                              <Target className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>

                    {/* Phase Project */}
                    {(phase.phase_project || index === 0) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="p-8 bg-black rounded-2xl text-white">
                        <div className="flex items-start gap-5">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Hammer className="w-7 h-7 text-black" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-2xl font-bold mb-2">
                              Phase Project: {phase.phase_project?.title || `Build a ${phase.title} Demo`}
                            </h4>
                            <p className="text-slate-300 mb-4">
                              {phase.phase_project?.description || "Apply everything you've learned in this phase by building a practical project."}
                            </p>
                            {phase.phase_project?.requirements && (
                              <div className="flex flex-wrap gap-2">
                                {phase.phase_project.requirements.map((req, i) => (
                                  <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">{req}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold">{phase.phase_project?.estimated_hours || 8}h</div>
                            <p className="text-slate-400 text-sm">estimated</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Skills Grid - BIGGER */}
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <BookOpen className="w-6 h-6" />
                        Skills to Master
                      </h3>
                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {phase.skills?.map((skill) => (
                          <motion.button
                            key={skill.id}
                            onClick={() => setSelectedSkill({ skill, phaseId: phase.id })}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className={`p-6 rounded-2xl border-2 text-left transition-all
                              ${skill.status === "completed"
                                ? "border-black bg-slate-50 shadow-lg"
                                : skill.status === "in_progress"
                                ? "border-slate-800 bg-slate-50 shadow-lg"
                                : "border-slate-200 hover:border-slate-400 hover:shadow-lg bg-white"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-bold text-lg text-slate-900">{skill.name}</span>
                              {skill.status === "completed" ? (
                                <CheckCircle2 className="w-6 h-6 text-black" />
                              ) : skill.status === "in_progress" ? (
                                <div className="w-6 h-6 border-2 border-slate-800 rounded-full flex items-center justify-center">
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="w-3 h-3 bg-slate-800 rounded-full"
                                  />
                                </div>
                              ) : (
                                <Circle className="w-6 h-6 text-slate-300" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              {skill.interview_frequency && (
                                <span className="text-black font-medium">
                                  🎯 {skill.interview_frequency}% interviews
                                </span>
                              )}
                              {skill.estimated_hours && (
                                <span className="text-slate-500">
                                  ⏱️ {skill.estimated_hours}h
                                </span>
                              )}
                            </div>
                            {skill.resources && skill.resources.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <span className="text-xs text-slate-500">{skill.resources.length} resources available</span>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Phase Exam Section */}
                    <div className="border-t-2 border-slate-200 pt-10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <Award className="w-6 h-6 text-amber-500" />
                            Phase {index + 1} Certification Exam
                          </h3>
                          <p className="text-slate-500 mt-1">
                            Pass with 70% to unlock the next phase and earn your certificate
                          </p>
                        </div>

                        {phase.exam?.passed ? (
                          <div className="flex items-center gap-3 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full">
                            <Trophy className="w-6 h-6" />
                            <span className="font-bold text-lg">Passed ({phase.exam.user_score}%)</span>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowExam(showExam === phase.id ? null : phase.id)}
                            className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg"
                          >
                            <Rocket className="w-6 h-6" />
                            {showExam === phase.id ? "Hide Exam" : "Take Exam"}
                          </motion.button>
                        )}
                      </div>

                      {/* Exam content would go here */}
                      <AnimatePresence>
                        {showExam === phase.id && !phase.exam?.passed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200"
                          >
                            <div className="text-center py-8">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-12 h-12 border-4 border-slate-200 border-t-black rounded-full mx-auto mb-4"
                              />
                              <p className="text-slate-500">Loading AI-generated exam questions...</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>

                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-3xl backdrop-blur-sm">
                    <div className="text-center">
                      <Lock className="w-20 h-20 text-slate-400 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-slate-600">Complete Phase {index} to unlock</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* RESOURCES DRAWER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedSkill && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSkill(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedSkill.skill.name}</h2>
                  <p className="text-slate-500">Resources & Learning Materials</p>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Skill Meta */}
                <div className="flex items-center gap-4">
                  {selectedSkill.skill.interview_frequency && (
                    <div className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                      🎯 Asked in {selectedSkill.skill.interview_frequency}% of interviews
                    </div>
                  )}
                  {selectedSkill.skill.estimated_hours && (
                    <div className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                      ⏱️ ~{selectedSkill.skill.estimated_hours} hours
                    </div>
                  )}
                </div>

                {selectedSkill.skill.why_this_matters && (
                  <div className="p-4 bg-violet-50 rounded-xl">
                    <h4 className="font-bold text-slate-900 mb-2">Why This Matters</h4>
                    <p className="text-slate-600">{selectedSkill.skill.why_this_matters}</p>
                  </div>
                )}

                {/* Resources List */}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-4">Learning Resources</h3>
                  <div className="space-y-3">
                    {selectedSkill.skill.resources && selectedSkill.skill.resources.length > 0 ? (
                      selectedSkill.skill.resources.map((resource) => {
                        const Icon = getResourceIcon(resource.type);
                        const isBookmarked = bookmarkedResources.has(resource.id);

                        return (
                          <div
                            key={resource.id}
                            className="p-4 border border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Icon className="w-6 h-6 text-slate-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 truncate">{resource.title}</h4>
                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                  <span className="capitalize">{resource.type}</span>
                                  {resource.duration_minutes && (
                                    <span>• {resource.duration_minutes} min</span>
                                  )}
                                  {resource.quality_score && (
                                    <span className="flex items-center gap-1">
                                      • <Star className="w-3 h-3 text-amber-500" /> {Math.round(resource.quality_score * 5)}/5
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleBookmark(resource, selectedSkill.skill.id)}
                                  className={`p-2 rounded-lg transition-colors ${isBookmarked ? "bg-black text-white" : "hover:bg-slate-100 text-slate-400"}`}
                                >
                                  {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                                </button>
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                  <ExternalLink className="w-5 h-5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No resources available yet</p>
                        <p className="text-sm">Resources will be added by AI or curated soon</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSkillClick?.(selectedSkill.skill, selectedSkill.phaseId);
                    setSelectedSkill(null);
                  }}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors"
                >
                  Start Learning with AI Mentor
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

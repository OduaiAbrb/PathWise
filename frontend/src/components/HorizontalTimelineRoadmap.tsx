"use client";

import { useState, useRef, useEffect } from "react";
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
  Award,
  Brain,
  Play,
  CheckCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

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
  resources?: { title: string; url: string; type: string }[];
}

interface Phase {
  id: string;
  title: string;
  duration_weeks: number;
  importance: "critical" | "important" | "optional";
  skills: Skill[];
  status: "completed" | "in_progress" | "not_started" | "locked";
  understanding_score?: number;
  checkpoints?: Checkpoint[];
  exam?: Exam;
  why_it_matters?: string;
}

interface RoadmapData {
  id: string;
  job_title: string;
  experience_level: string;
  estimated_months: number;
  phases: Phase[];
  completion_percentage: number;
}

interface HorizontalTimelineRoadmapProps {
  roadmap: RoadmapData;
  onSkillClick?: (skill: Skill, phaseId: string) => void;
  onCheckpointAnswer?: (phaseId: string, checkpointId: string, answer: string | number) => void;
  onExamSubmit?: (phaseId: string, answers: Record<string, string | number>) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA FOR CHECKPOINTS (will be replaced by backend)
// ═══════════════════════════════════════════════════════════════════════════

const generateMockCheckpoints = (phaseName: string): Checkpoint[] => {
  const checkpointsByPhase: Record<string, Checkpoint[]> = {
    "Core Programming": [
      {
        id: "cp1",
        type: "mcq",
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correct_answer: 1,
        explanation: "Binary search divides the search space in half each iteration, resulting in O(log n) complexity.",
      },
      {
        id: "cp2",
        type: "mcq",
        question: "Which data structure uses LIFO (Last In, First Out)?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correct_answer: 1,
        explanation: "A Stack follows LIFO - the last element added is the first one removed.",
      },
    ],
    "default": [
      {
        id: "cp1",
        type: "mcq",
        question: "Understanding check: Are you ready to proceed?",
        options: ["Yes, I understand the concepts", "I need more practice", "Skip for now"],
        correct_answer: 0,
        explanation: "Great! Let's continue to the next section.",
      },
    ],
  };

  return checkpointsByPhase[phaseName] || checkpointsByPhase["default"];
};

const generateMockExam = (phaseName: string): Exam => ({
  id: `exam-${phaseName}`,
  questions: [
    {
      id: "eq1",
      type: "mcq",
      question: `What is the most important concept from ${phaseName}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct_answer: 0,
      explanation: "This tests your understanding of core concepts.",
    },
    {
      id: "eq2",
      type: "open",
      question: `Explain the key takeaway from ${phaseName} in your own words.`,
      explanation: "AI will evaluate your response for clarity and correctness.",
    },
  ],
  pass_score: 70,
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function HorizontalTimelineRoadmap({
  roadmap,
  onSkillClick,
  onCheckpointAnswer,
  onExamSubmit,
}: HorizontalTimelineRoadmapProps) {
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, number | string>>({});
  const [showExam, setShowExam] = useState<string | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string | number>>({});
  const timelineRef = useRef<HTMLDivElement>(null);
  const phaseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Find current active phase (first non-completed)
  const currentPhaseIndex = roadmap.phases.findIndex(
    (p) => p.status === "in_progress" || p.status === "not_started"
  );

  // Set initial active phase
  useEffect(() => {
    if (!activePhaseId && roadmap.phases.length > 0) {
      const activePhase = roadmap.phases[currentPhaseIndex] || roadmap.phases[0];
      setActivePhaseId(activePhase.id);
    }
  }, [roadmap.phases, currentPhaseIndex, activePhaseId]);

  // Scroll to phase when clicked
  const scrollToPhase = (phaseId: string) => {
    setActivePhaseId(phaseId);
    const phaseElement = phaseRefs.current[phaseId];
    if (phaseElement) {
      phaseElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle checkpoint answer
  const handleCheckpointAnswer = (phaseId: string, checkpointId: string, answer: number | string) => {
    setCheckpointAnswers((prev) => ({ ...prev, [`${phaseId}-${checkpointId}`]: answer }));
    onCheckpointAnswer?.(phaseId, checkpointId, answer);
  };

  // Get phase status styling
  const getPhaseNodeStyle = (phase: Phase, index: number) => {
    const isActive = phase.id === activePhaseId;
    const isCurrent = index === currentPhaseIndex;

    if (phase.status === "completed") {
      return {
        bg: "bg-black",
        border: "border-black",
        text: "text-white",
        glow: "",
      };
    }
    if (isCurrent || phase.status === "in_progress") {
      return {
        bg: "bg-gradient-to-br from-blue-500 to-purple-600",
        border: "border-blue-500",
        text: "text-white",
        glow: "shadow-lg shadow-blue-500/50 animate-pulse",
      };
    }
    if (phase.status === "locked") {
      return {
        bg: "bg-gray-200",
        border: "border-gray-300",
        text: "text-gray-400",
        glow: "",
      };
    }
    return {
      bg: "bg-white",
      border: "border-gray-300",
      text: "text-gray-600",
      glow: "",
    };
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "critical":
        return { bg: "bg-red-100", text: "text-red-700", label: "Critical Foundation" };
      case "important":
        return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Important" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600", label: "Optional" };
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-black text-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <span>Roadmap Timeline</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {roadmap.job_title}
          </h1>

          <div className="flex items-center gap-4 text-gray-300 mb-8">
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {roadmap.experience_level}
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {roadmap.estimated_months || "6-8"} Months
            </span>
          </div>

          {/* Overall Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Overall Progress</span>
              <span className="text-2xl font-bold">{roadmap.completion_percentage}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${roadmap.completion_percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              />
            </div>
          </div>

          {/* "You are here" indicator */}
          {currentPhaseIndex >= 0 && (
            <div className="flex items-center gap-2 text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">
                You are here: <strong>{roadmap.phases[currentPhaseIndex]?.title}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HORIZONTAL TIMELINE */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-gray-50 py-8 px-4 overflow-x-auto" ref={timelineRef}>
        <div className="max-w-6xl mx-auto">
          <div className="relative flex items-center justify-between min-w-[800px]">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 -translate-y-1/2 rounded-full" />
            <div
              className="absolute top-1/2 left-0 h-2 bg-black -translate-y-1/2 rounded-full transition-all duration-500"
              style={{
                width: `${((currentPhaseIndex + 1) / roadmap.phases.length) * 100}%`,
              }}
            />

            {/* Phase Nodes */}
            {roadmap.phases.map((phase, index) => {
              const style = getPhaseNodeStyle(phase, index);
              const isActive = phase.id === activePhaseId;

              return (
                <motion.button
                  key={phase.id}
                  onClick={() => scrollToPhase(phase.id)}
                  className={`relative z-10 flex flex-col items-center cursor-pointer group`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Node Circle */}
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${style.bg} ${style.border} border-4 
                      flex items-center justify-center ${style.glow} transition-all duration-300
                      ${isActive ? "ring-4 ring-blue-300 ring-offset-2" : ""}`}
                  >
                    {phase.status === "completed" ? (
                      <CheckCircle2 className={`w-6 h-6 md:w-8 md:h-8 ${style.text}`} />
                    ) : phase.status === "locked" ? (
                      <Lock className={`w-5 h-5 md:w-6 md:h-6 ${style.text}`} />
                    ) : (
                      <span className={`text-lg md:text-xl font-bold ${style.text}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Phase Label */}
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-semibold ${isActive ? "text-black" : "text-gray-600"}`}>
                      Phase {index + 1}
                    </p>
                    <p className="text-xs text-gray-500">
                      Month {Math.ceil((index + 1) * (roadmap.estimated_months || 6) / roadmap.phases.length)}
                    </p>
                  </div>

                  {/* Understanding Score Badge */}
                  {phase.understanding_score !== undefined && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {phase.understanding_score}%
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PHASE CARDS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto py-12 px-4 space-y-16">
        {roadmap.phases.map((phase, index) => {
          const isActive = phase.id === activePhaseId;
          const isLocked = phase.status === "locked";
          const importanceBadge = getImportanceBadge(phase.importance || "important");
          const checkpoints = phase.checkpoints || generateMockCheckpoints(phase.title);
          const exam = phase.exam || generateMockExam(phase.title);

          return (
            <motion.div
              key={phase.id}
              ref={(el) => { phaseRefs.current[phase.id] = el; }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`relative ${isLocked ? "opacity-50 blur-sm pointer-events-none" : ""}`}
            >
              {/* Phase Card */}
              <div
                className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300
                  ${isActive ? "border-black shadow-2xl" : "border-gray-200 shadow-lg"}`}
                style={{ minHeight: "400px" }}
              >
                {/* Phase Header */}
                <div className={`p-8 ${isActive ? "bg-black text-white" : "bg-gray-50"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${importanceBadge.bg} ${importanceBadge.text}`}>
                          {importanceBadge.label}
                        </span>
                        {phase.status === "completed" && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl font-bold mb-2">
                        Phase {index + 1} – {phase.title}
                      </h2>
                      <div className={`flex items-center gap-4 text-sm ${isActive ? "text-gray-300" : "text-gray-600"}`}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {phase.duration_weeks || 4} weeks
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {phase.skills?.length || 0} skills
                        </span>
                      </div>
                    </div>

                    {/* Understanding Score */}
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${isActive ? "text-white" : "text-black"}`}>
                        {phase.understanding_score || 0}%
                      </div>
                      <p className={`text-sm ${isActive ? "text-gray-400" : "text-gray-500"}`}>
                        Understanding
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phase Content */}
                <div className="p-8">
                  {/* Why It Matters */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">Why This Matters</h3>
                        <p className="text-slate-600">
                          {phase.why_it_matters ||
                            `Skills in this phase appear in 75-90% of ${roadmap.job_title} interviews. Mastering these concepts is critical for your success.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Skills to Master
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {phase.skills?.map((skill) => (
                        <motion.button
                          key={skill.id}
                          onClick={() => onSkillClick?.(skill, phase.id)}
                          whileHover={{ scale: 1.02 }}
                          className={`p-4 rounded-xl border-2 text-left transition-all
                            ${skill.status === "completed"
                              ? "border-green-500 bg-green-50"
                              : skill.status === "in_progress"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-400"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-900">{skill.name}</span>
                            {skill.status === "completed" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : skill.status === "in_progress" ? (
                              <div className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              </div>
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          {skill.interview_frequency && (
                            <p className="text-xs text-gray-500">
                              Asked in {skill.interview_frequency}% of interviews
                            </p>
                          )}
                          {skill.estimated_hours && (
                            <p className="text-xs text-gray-500">
                              ~{skill.estimated_hours}h to complete
                            </p>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* ═══════════════════════════════════════════════════════════ */}
                  {/* INLINE CHECKPOINTS */}
                  {/* ═══════════════════════════════════════════════════════════ */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Understanding Checkpoints
                    </h3>
                    <div className="space-y-4">
                      {checkpoints.map((checkpoint, cpIndex) => {
                        const answerKey = `${phase.id}-${checkpoint.id}`;
                        const userAnswer = checkpointAnswers[answerKey];
                        const isCorrect = userAnswer === checkpoint.correct_answer;
                        const hasAnswered = userAnswer !== undefined;

                        return (
                          <div
                            key={checkpoint.id}
                            className={`p-6 rounded-xl border-2 transition-all
                              ${hasAnswered
                                ? isCorrect
                                  ? "border-green-500 bg-green-50"
                                  : "border-red-500 bg-red-50"
                                : "border-gray-200 bg-gray-50"
                              }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                ${hasAnswered
                                  ? isCorrect
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {hasAnswered ? (
                                  isCorrect ? <CheckCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />
                                ) : (
                                  <span className="font-bold">{cpIndex + 1}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 mb-3">
                                  {checkpoint.question}
                                </p>

                                {checkpoint.type === "mcq" && checkpoint.options && (
                                  <div className="space-y-2">
                                    {checkpoint.options.map((option, optIndex) => (
                                      <button
                                        key={optIndex}
                                        onClick={() => handleCheckpointAnswer(phase.id, checkpoint.id, optIndex)}
                                        disabled={hasAnswered}
                                        className={`w-full p-3 rounded-lg text-left transition-all flex items-center gap-3
                                          ${hasAnswered
                                            ? optIndex === checkpoint.correct_answer
                                              ? "bg-green-200 border-2 border-green-500"
                                              : userAnswer === optIndex
                                              ? "bg-red-200 border-2 border-red-500"
                                              : "bg-white border border-gray-200"
                                            : "bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                                          }`}
                                      >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                          ${hasAnswered && optIndex === checkpoint.correct_answer
                                            ? "border-green-500 bg-green-500"
                                            : hasAnswered && userAnswer === optIndex
                                            ? "border-red-500 bg-red-500"
                                            : "border-gray-300"
                                          }`}
                                        >
                                          {hasAnswered && optIndex === checkpoint.correct_answer && (
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                          )}
                                        </div>
                                        <span className={hasAnswered && optIndex === checkpoint.correct_answer ? "font-semibold" : ""}>
                                          {option}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* Explanation after answering */}
                                {hasAnswered && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className={`mt-4 p-4 rounded-lg ${isCorrect ? "bg-green-100" : "bg-yellow-100"}`}
                                  >
                                    <p className={`text-sm ${isCorrect ? "text-green-800" : "text-yellow-800"}`}>
                                      <strong>{isCorrect ? "Correct!" : "Not quite."}</strong> {checkpoint.explanation}
                                    </p>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ═══════════════════════════════════════════════════════════ */}
                  {/* PHASE EXAM */}
                  {/* ═══════════════════════════════════════════════════════════ */}
                  <div className="border-t-2 border-gray-200 pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-500" />
                          Phase {index + 1} Exam
                        </h3>
                        <p className="text-sm text-gray-600">
                          Pass with {exam.pass_score}% to unlock the next phase
                        </p>
                      </div>

                      {exam.passed ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-semibold">Passed ({exam.user_score}%)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowExam(showExam === phase.id ? null : phase.id)}
                          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                        >
                          <Play className="w-5 h-5" />
                          {showExam === phase.id ? "Hide Exam" : "Take Exam"}
                        </button>
                      )}
                    </div>

                    {/* Exam Questions */}
                    <AnimatePresence>
                      {showExam === phase.id && !exam.passed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 p-6 bg-gray-50 rounded-xl border-2 border-gray-200"
                        >
                          <div className="space-y-6">
                            {exam.questions.map((q, qIndex) => (
                              <div key={q.id} className="p-4 bg-white rounded-lg border border-gray-200">
                                <p className="font-semibold text-slate-900 mb-3">
                                  {qIndex + 1}. {q.question}
                                </p>

                                {q.type === "mcq" && q.options ? (
                                  <div className="space-y-2">
                                    {q.options.map((opt, optIdx) => (
                                      <button
                                        key={optIdx}
                                        onClick={() => setExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                                        className={`w-full p-3 rounded-lg text-left border transition-all
                                          ${examAnswers[q.id] === optIdx
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-400"
                                          }`}
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <textarea
                                    placeholder="Type your answer here..."
                                    value={(examAnswers[q.id] as string) || ""}
                                    onChange={(e) => setExamAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 outline-none min-h-[100px]"
                                  />
                                )}
                              </div>
                            ))}

                            <button
                              onClick={() => onExamSubmit?.(phase.id, examAnswers)}
                              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
                            >
                              Submit Exam
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Locked Overlay */}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                  <div className="text-center">
                    <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-600">Complete Phase {index} to unlock</p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

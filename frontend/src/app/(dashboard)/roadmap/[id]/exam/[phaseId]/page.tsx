"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "@/lib/fetch-api";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Brain,
  Trophy,
  Target,
  Sparkles,
  BookOpen,
  Code,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Award,
  RefreshCw,
} from "lucide-react";

interface ExamQuestion {
  id: string;
  type: "mcq" | "open" | "code";
  question: string;
  options?: string[];
  correct_answer?: number;
  explanation?: string;
  skill?: string;
  difficulty?: string;
  rubric?: string;
}

interface ExamResult {
  score: number;
  passed: boolean;
  message: string;
  correct_answers: number;
  total_questions: number;
  feedback: Array<{
    question_id: string;
    is_correct?: boolean;
    score?: number;
    feedback?: string;
  }>;
}

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const roadmapId = params.id as string;
  const phaseId = params.phaseId as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [phaseInfo, setPhaseInfo] = useState<{ title: string; skills: string[] } | null>(null);
  const [roadmapTitle, setRoadmapTitle] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [examStarted, setExamStarted] = useState(false);

  // Fetch roadmap and phase info
  useEffect(() => {
    if (!accessToken || status !== "authenticated") return;

    const fetchRoadmapInfo = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/v1/roadmaps/${roadmapId}`), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          const roadmap = data.data;
          setRoadmapTitle(roadmap.job_title);
          
          // Find the phase
          const phase = roadmap.phases?.find((p: any) => p.id === phaseId);
          if (phase) {
            setPhaseInfo({
              title: phase.title || phase.name,
              skills: phase.skills?.map((s: any) => s.name) || [],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching roadmap:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapInfo();
  }, [accessToken, status, roadmapId, phaseId]);

  // Timer countdown
  useEffect(() => {
    if (!examStarted || result) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, result]);

  // Generate exam questions
  const generateExam = async () => {
    if (!accessToken || !phaseInfo) return;

    setGenerating(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/exams/exam/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          phase_title: phaseInfo.title,
          skills: phaseInfo.skills,
          target_role: roadmapTitle,
          difficulty: "intermediate",
          num_questions: 10, // Longer exam
        }),
      });

      if (!response.ok) throw new Error("Failed to generate exam");

      const data = await response.json();
      if (data.success && data.data?.questions) {
        setQuestions(data.data.questions);
        setExamStarted(true);
      }
    } catch (error) {
      console.error("Error generating exam:", error);
    } finally {
      setGenerating(false);
    }
  };

  // Handle answer selection
  const handleAnswer = (questionId: string, answer: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Submit exam
  const handleSubmitExam = async () => {
    if (!accessToken) return;

    setSubmitting(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/exams/exam/submit"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          roadmap_id: roadmapId,
          phase_id: phaseId,
          answers,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit exam");

      const data = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Exam result screen
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center"
          >
            {result.passed ? (
              <>
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-emerald-700 mb-2">
                  Congratulations! 🎉
                </h1>
                <p className="text-xl text-slate-600 mb-6">
                  You passed with {result.score}%
                </p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="w-12 h-12 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold text-amber-700 mb-2">
                  Keep Going!
                </h1>
                <p className="text-xl text-slate-600 mb-6">
                  You scored {result.score}% - need 70% to pass
                </p>
              </>
            )}

            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{result.score}%</p>
                  <p className="text-sm text-slate-500">Score</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">
                    {result.correct_answers}/{result.total_questions}
                  </p>
                  <p className="text-sm text-slate-500">Correct</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">
                    {result.passed ? "✓" : "✗"}
                  </p>
                  <p className="text-sm text-slate-500">Pass Status</p>
                </div>
              </div>
            </div>

            <p className="text-slate-600 mb-8">{result.message}</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push(`/roadmap/${roadmapId}`)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Back to Roadmap
              </button>
              {!result.passed && (
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                    setCurrentQuestion(0);
                    setTimeRemaining(30 * 60);
                    setQuestions([]);
                    setExamStarted(false);
                  }}
                  className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Pre-exam start screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push(`/roadmap/${roadmapId}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Roadmap
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Phase Certification Exam
              </h1>
              <p className="text-lg text-slate-600">
                {phaseInfo?.title || "Loading..."}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-slate-900 mb-4">Exam Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <HelpCircle className="w-5 h-5 text-slate-500" />
                  <span><strong>10 Questions</strong> - Multiple choice & open-ended</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <span><strong>30 Minutes</strong> - Time limit</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Target className="w-5 h-5 text-slate-500" />
                  <span><strong>70%</strong> - Passing score required</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Award className="w-5 h-5 text-slate-500" />
                  <span>Passing unlocks the next phase</span>
                </div>
              </div>
            </div>

            {phaseInfo?.skills && phaseInfo.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-slate-900 mb-3">Skills Being Tested</h3>
                <div className="flex flex-wrap gap-2">
                  {phaseInfo.skills.slice(0, 8).map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Important:</strong> Once you start, the timer begins. Make sure you have 30 uninterrupted minutes. Your progress will not be saved if you leave.
                </div>
              </div>
            </div>

            <button
              onClick={generateExam}
              disabled={generating || !phaseInfo}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Your Exam...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Start Exam
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Active exam screen
  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-slate-900">{phaseInfo?.title} Exam</h1>
              <p className="text-sm text-slate-500">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${
              timeRemaining < 300 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-black"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            {/* Question header */}
            <div className="flex items-start gap-4 mb-6">
              <span className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg">
                {currentQuestion + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {currentQ?.type === "mcq" && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      Multiple Choice
                    </span>
                  )}
                  {currentQ?.type === "open" && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      Open Ended
                    </span>
                  )}
                  {currentQ?.type === "code" && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                      Code
                    </span>
                  )}
                  {currentQ?.skill && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      {currentQ.skill}
                    </span>
                  )}
                </div>
                <p className="text-xl font-medium text-slate-900">{currentQ?.question}</p>
              </div>
            </div>

            {/* Answer options */}
            <div className="space-y-3 mb-8">
              {currentQ?.type === "mcq" && currentQ.options && (
                currentQ.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(currentQ.id, i)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                      answers[currentQ.id] === i
                        ? "border-black bg-black text-white"
                        : "border-slate-200 hover:border-slate-400 bg-white"
                    }`}
                  >
                    <span className="font-bold mr-3">{String.fromCharCode(65 + i)}.</span>
                    {option}
                  </button>
                ))
              )}

              {(currentQ?.type === "open" || currentQ?.type === "code") && (
                <textarea
                  placeholder={currentQ.type === "code" ? "Write your code here..." : "Type your detailed answer..."}
                  value={(answers[currentQ.id] as string) || ""}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  className={`w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:border-black focus:outline-none min-h-[200px] ${
                    currentQ.type === "code" ? "font-mono bg-slate-900 text-green-400 border-slate-700" : ""
                  }`}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      i === currentQuestion
                        ? "bg-black text-white"
                        : answers[questions[i]?.id] !== undefined
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmitExam}
                  disabled={submitting || answeredCount < questions.length}
                  className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Exam
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-2 px-4 py-2 text-slate-900 hover:text-black"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Answer count warning */}
        {answeredCount < questions.length && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              <span>
                You've answered {answeredCount} of {questions.length} questions.
                Answer all to submit.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

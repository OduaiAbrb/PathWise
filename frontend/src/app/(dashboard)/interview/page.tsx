"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  MessageSquare,
  Layout,
  Zap,
  Clock,
  Trophy,
  TrendingUp,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface InterviewSession {
  id: string;
  session_type: string;
  target_role: string;
  difficulty: string;
  overall_score: number;
  status: string;
  started_at: string;
  completed_at: string | null;
}

interface Question {
  id: string;
  type: string;
  question: string;
  hints: string[];
  ideal_answer: string;
}

export default function InterviewSimulator() {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const [activeSession, setActiveSession] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    if (accessToken) {
      loadHistory();
    }
  }, [accessToken]);

  const loadHistory = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/interview/history"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const startInterview = async (type: string, role: string, difficulty: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/interview/start"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_type: type,
          target_role: role,
          difficulty: difficulty,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSession(data.data);
        setQuestions(data.data.questions);
        setCurrentQuestionIndex(0);
        setUserAnswer("");
        setEvaluation(null);
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !activeSession) return;

    try {
      await fetch(getApiUrl(`/api/v1/interview/${activeSession.session_id}/submit`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_id: questions[currentQuestionIndex].id,
          response: userAnswer,
        }),
      });

      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setUserAnswer("");
        setShowHints(false);
      } else {
        completeInterview();
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
    }
  };

  const completeInterview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        getApiUrl(`/api/v1/interview/${activeSession.session_id}/complete`),
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvaluation(data.data);
        loadHistory();
      }
    } catch (err) {
      console.error("Failed to complete interview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setActiveSession(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setEvaluation(null);
    setShowHints(false);
  };

  // Interview type selection
  const interviewTypes = [
    {
      type: "coding",
      title: "Coding Interview",
      icon: Code,
      description: "LeetCode-style problems with test cases",
      color: "blue",
    },
    {
      type: "system_design",
      title: "System Design",
      icon: Layout,
      description: "Design scalable systems and architectures",
      color: "purple",
    },
    {
      type: "behavioral",
      title: "Behavioral",
      icon: MessageSquare,
      description: "STAR method behavioral questions",
      color: "green",
    },
    {
      type: "full_mock",
      title: "Full Mock Interview",
      icon: Zap,
      description: "45-min comprehensive interview simulation",
      color: "orange",
    },
  ];

  if (evaluation) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Interview Complete!</h2>
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {evaluation.overall_score}/100
          </div>
          <p className="text-slate-600 mb-8">
            {evaluation.overall_score >= 80
              ? "Outstanding performance! You're interview-ready."
              : evaluation.overall_score >= 60
              ? "Good work! A few more practice sessions and you'll be ready."
              : "Keep practicing! Focus on the areas below."}
          </p>

          {/* Strengths */}
          {evaluation.strengths && evaluation.strengths.length > 0 && (
            <div className="mb-6 text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Your Strengths
              </h3>
              <div className="space-y-2">
                {evaluation.strengths.map((strength: string, i: number) => (
                  <div key={i} className="p-3 bg-green-50 rounded-lg text-slate-700">
                    {strength}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {evaluation.improvements && evaluation.improvements.length > 0 && (
            <div className="mb-8 text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Areas to Improve
              </h3>
              <div className="space-y-2">
                {evaluation.improvements.map((improvement: string, i: number) => (
                  <div key={i} className="p-3 bg-orange-50 rounded-lg text-slate-700">
                    {improvement}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={resetSession}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            Start New Interview
          </button>
        </motion.div>
      </div>
    );
  }

  if (activeSession && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-blue-600"
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              {currentQuestion.type === "coding" && <Code className="w-6 h-6 text-blue-600" />}
              {currentQuestion.type === "system_design" && (
                <Layout className="w-6 h-6 text-purple-600" />
              )}
              {currentQuestion.type === "behavioral" && (
                <MessageSquare className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-500 uppercase">
                {currentQuestion.type.replace("_", " ")}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {currentQuestion.question}
              </h3>
            </div>
          </div>

          {/* Answer Input */}
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-64 p-4 border-2 border-slate-200 rounded-xl resize-none focus:border-blue-500 focus:outline-none font-mono text-sm"
          />

          {/* Hints */}
          {currentQuestion.hints && currentQuestion.hints.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showHints ? "Hide Hints" : "Show Hints"}
              </button>
              <AnimatePresence>
                {showHints && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2"
                  >
                    {currentQuestion.hints.map((hint: string, i: number) => (
                      <div key={i} className="p-3 bg-blue-50 rounded-lg text-sm text-slate-700">
                        💡 {hint}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={resetSession}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                "Complete Interview"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Interview Simulator</h1>
        <p className="text-slate-600">
          Practice real interview questions with AI evaluation and feedback
        </p>
      </div>

      {/* Interview Types */}
      <div className="grid md:grid-cols-2 gap-6">
        {interviewTypes.map((type) => (
          <motion.div
            key={type.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-300 p-6 cursor-pointer transition-all"
            onClick={() => startInterview(type.type, "Software Engineer", "medium")}
          >
            <div className={`p-3 bg-${type.color}-100 rounded-xl w-fit mb-4`}>
              <type.icon className={`w-8 h-8 text-${type.color}-600`} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{type.title}</h3>
            <p className="text-slate-600 mb-4">{type.description}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {type.type === "full_mock" ? "45" : "15"} min
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                AI Evaluated
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Your Interview History
          </h2>
          <div className="space-y-3">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.target_role}</p>
                  <p className="text-sm text-slate-500">
                    {item.session_type.replace("_", " ")} • {item.difficulty}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{item.overall_score}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.started_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

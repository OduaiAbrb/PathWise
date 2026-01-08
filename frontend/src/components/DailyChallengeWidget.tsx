"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, TrendingUp, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  difficulty: string;
  question: string;
  hints: string[];
  points: number;
  is_completed: boolean;
  user_score: number | null;
}

export default function DailyChallengeWidget() {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    if (accessToken) {
      loadTodaysChallenge();
      loadStats();
    }
  }, [accessToken]);

  const loadTodaysChallenge = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/challenges/today"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setChallenge(data.data);
      }
    } catch (err) {
      console.error("Failed to load challenge:", err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/challenges/stats"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !challenge) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        getApiUrl(`/api/v1/challenges/${challenge.id}/submit`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_answer: userAnswer }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResult(data.data);
        loadStats();
        
        // Mark as completed
        if (data.data.is_correct) {
          setChallenge({ ...challenge, is_completed: true, user_score: data.data.score });
        }
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!challenge) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-2xl border-2 p-6 ${
          result.is_correct
            ? "border-green-300 bg-green-50"
            : "border-orange-300 bg-orange-50"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl ${
              result.is_correct ? "bg-green-100" : "bg-orange-100"
            }`}
          >
            {result.is_correct ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-orange-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {result.is_correct ? "Correct! 🎉" : "Not quite... 🤔"}
            </h3>
            <p className="text-slate-700 mb-3">{result.explanation}</p>
            {!result.is_correct && result.answer && (
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Correct Answer:</p>
                <p className="text-slate-800">{result.answer}</p>
              </div>
            )}
            {result.points_earned > 0 && (
              <div className="mt-3 flex items-center gap-2 text-green-600 font-semibold">
                <Trophy className="w-5 h-5" />
                +{result.points_earned} points earned!
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setResult(null);
            setUserAnswer("");
            loadTodaysChallenge();
          }}
          className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Next Challenge
        </button>
      </motion.div>
    );
  }

  const difficultyColors = {
    easy: "text-green-600 bg-green-100",
    medium: "text-orange-600 bg-orange-100",
    hard: "text-red-600 bg-red-100",
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Today's Challenge</h3>
            <p className="text-sm text-slate-600">Daily coding question</p>
          </div>
        </div>
        {stats && (
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{stats.total_score || 0}</div>
            <div className="text-xs text-slate-600">Total Points</div>
          </div>
        )}
      </div>

      {/* Challenge Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              difficultyColors[challenge.difficulty as keyof typeof difficultyColors] ||
              "text-slate-600 bg-slate-100"
            }`}
          >
            {challenge.difficulty}
          </span>
          <span className="text-xs text-slate-600">• {challenge.points} points</span>
        </div>
        <h4 className="font-semibold text-slate-900 mb-2">{challenge.title}</h4>
        <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
          {challenge.question}
        </p>
      </div>

      {/* Hints */}
      {challenge.hints && challenge.hints.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Lightbulb className="w-4 h-4" />
            {showHints ? "Hide Hints" : "Show Hints"}
          </button>
          <AnimatePresence>
            {showHints && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2"
              >
                {challenge.hints.map((hint, i) => (
                  <div key={i} className="p-2 bg-yellow-50 rounded-lg text-xs text-slate-700">
                    💡 {hint}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Answer Input */}
      {!challenge.is_completed ? (
        <>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full h-24 p-3 border-2 border-slate-200 rounded-lg resize-none focus:border-blue-500 focus:outline-none text-sm mb-3"
          />
          <button
            onClick={submitAnswer}
            disabled={!userAnswer.trim() || isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </button>
        </>
      ) : (
        <div className="p-4 bg-green-100 border-2 border-green-300 rounded-lg text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-semibold text-green-800">Challenge Completed!</p>
          <p className="text-sm text-green-700 mt-1">
            You earned {challenge.user_score} points
          </p>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-slate-900">{stats.total_challenges_completed || 0}</div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{stats.correct_answers || 0}</div>
            <div className="text-xs text-slate-600">Correct</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{Math.round(stats.accuracy || 0)}%</div>
            <div className="text-xs text-slate-600">Accuracy</div>
          </div>
        </div>
      )}
    </div>
  );
}

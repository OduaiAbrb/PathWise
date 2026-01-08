"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Target,
  Clock,
  AlertCircle,
  Flame,
  CheckCircle2,
  X,
  MessageCircle,
  Zap,
  BookOpen,
  Brain,
  RotateCcw,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isInterviewMode?: boolean;
  feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
}

interface UserContext {
  targetRole: string;
  currentSkill: string;
  roadmapProgress: number;
  weakestSkills: string[];
  interviewReadiness: number;
}

/**
 * Personal AI Mentor - World-Class AI System
 * 
 * RENAMED from "AI Study Buddy" to "Personal AI Mentor"
 * 
 * AI MUST ALWAYS KNOW:
 * - user role
 * - job target  
 * - roadmap position
 * - weakest skills
 * - interview readiness
 * 
 * CAPABILITIES:
 * - explain concepts contextually
 * - quiz on current roadmap step
 * - simulate interviews
 * - give strict feedback
 * - track repeated mistakes
 * - recommend next actions
 * 
 * INTERVIEW PRESSURE MODE:
 * - strict interviewer tone
 * - timed responses
 * - follow-up questions
 * - rejection simulation
 */
export default function PersonalAIMentor() {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [interviewTimer, setInterviewTimer] = useState<number | null>(null);
  const [showModes, setShowModes] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user context on mount
  useEffect(() => {
    if (accessToken) {
      fetchUserContext();
    }
  }, [accessToken]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Interview timer
  useEffect(() => {
    if (isInterviewMode && interviewTimer !== null && interviewTimer > 0) {
      timerRef.current = setTimeout(() => {
        setInterviewTimer(interviewTimer - 1);
      }, 1000);
    } else if (interviewTimer === 0) {
      // Time's up!
      handleTimeUp();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [interviewTimer, isInterviewMode]);

  const fetchUserContext = async () => {
    try {
      // Fetch roadmap data
      const response = await fetch(getApiUrl("/api/v1/roadmaps"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        const roadmap = data.data?.[0];
        
        if (roadmap) {
          // Calculate weakest skills
          const allSkills = roadmap.phases?.flatMap((p: any) => 
            p.skills?.map((s: any) => ({
              name: s.name,
              status: s.progress?.status || "not_started",
              importance: s.importance || "important",
            })) || []
          ) || [];

          const weakest = allSkills
            .filter((s: any) => s.status !== "completed" && s.importance === "critical")
            .slice(0, 3)
            .map((s: any) => s.name);

          setUserContext({
            targetRole: roadmap.job_title,
            currentSkill: allSkills.find((s: any) => s.status === "in_progress")?.name || 
                         allSkills.find((s: any) => s.status === "not_started")?.name || "",
            roadmapProgress: roadmap.completion_percentage || 0,
            weakestSkills: weakest,
            interviewReadiness: Math.max(0, (roadmap.completion_percentage || 0) - 15),
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch user context:", error);
    }
  };

  const handleTimeUp = () => {
    const timeUpMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "⏰ **Time's up!**\n\nIn a real interview, you would have been cut off. This is a critical skill - learn to be concise.\n\n**Feedback:** Taking too long to answer shows lack of preparation or confidence. Practice giving structured answers in 60-90 seconds.",
      timestamp: new Date(),
      isInterviewMode: true,
      feedback: {
        score: 4,
        strengths: [],
        improvements: ["Answer faster", "Be more concise", "Use STAR method"],
      },
    };
    setMessages(prev => [...prev, timeUpMessage]);
    setInterviewTimer(null);
  };

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
      isInterviewMode,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setInterviewTimer(null);

    try {
      // Build context-aware prompt
      let systemContext = "";
      if (userContext) {
        systemContext = `\n\nUSER CONTEXT:\n- Target Role: ${userContext.targetRole}\n- Current Skill: ${userContext.currentSkill}\n- Progress: ${userContext.roadmapProgress}%\n- Weakest Skills: ${userContext.weakestSkills.join(", ")}\n- Interview Readiness: ${userContext.interviewReadiness}%`;
      }

      if (isInterviewMode) {
        systemContext += `\n\nINTERVIEW PRESSURE MODE ACTIVE:\n- Be a strict, senior interviewer\n- Ask follow-up questions\n- Give honest, harsh feedback\n- Score responses 1-10\n- Point out weaknesses directly\n- Simulate rejection if answer is poor`;
      }

      const response = await fetch(getApiUrl("/api/v1/study-buddy/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: messageToSend,
          conversation_history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
          context: systemContext,
          mode: isInterviewMode ? "interview" : "mentor",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response || data.data?.response || "I'm here to help you succeed.",
          timestamp: new Date(),
          isInterviewMode,
        };

        setMessages(prev => [...prev, assistantMessage]);

        // In interview mode, start timer for next response
        if (isInterviewMode && !data.response?.includes("Interview session")) {
          setInterviewTimer(90); // 90 seconds to respond
        }
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an issue. Let's try again. What would you like help with?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startInterviewMode = () => {
    setIsInterviewMode(true);
    setShowModes(false);
    
    const introMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `🔥 **Interview Pressure Mode Activated**\n\nI'll now act as a senior ${userContext?.targetRole || "Tech"} interviewer at a top company.\n\n**Rules:**\n- You have 90 seconds to answer each question\n- I will give harsh, honest feedback\n- Follow-up questions will dig deeper\n- Poor answers may result in "rejection"\n\nAre you ready? Let's begin.\n\n---\n\n**Question 1:** ${getInterviewQuestion()}`,
      timestamp: new Date(),
      isInterviewMode: true,
    };

    setMessages(prev => [...prev, introMessage]);
    setInterviewTimer(90);
  };

  const getInterviewQuestion = () => {
    const questions = [
      "Tell me about a challenging technical problem you solved recently. Walk me through your approach.",
      "Design a URL shortening service like bit.ly. What are your initial thoughts?",
      "You discover a critical bug in production that's affecting 10% of users. What do you do?",
      "What's the difference between SQL and NoSQL databases? When would you use each?",
      "How would you optimize a slow database query? Walk me through your process.",
      "Tell me about a time you disagreed with a teammate. How did you handle it?",
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  const exitInterviewMode = () => {
    setIsInterviewMode(false);
    setInterviewTimer(null);
    setShowModes(true);
    
    const exitMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Interview mode ended. I'm back to being your supportive AI Mentor. What would you like to work on?",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, exitMessage]);
  };

  const startMode = (mode: "explain" | "quiz" | "review") => {
    setShowModes(false);
    let message = "";
    
    switch (mode) {
      case "explain":
        message = `Help me understand ${userContext?.currentSkill || "the current topic"} better. Can you explain it with examples?`;
        break;
      case "quiz":
        message = `Quiz me on ${userContext?.currentSkill || "what I'm learning"}. Start with easy questions and increase difficulty.`;
        break;
      case "review":
        message = "I want you to review my progress and tell me honestly where I'm weak and what I need to focus on.";
        break;
    }
    
    sendMessage(message);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isInterviewMode ? "bg-red-100" : "bg-purple-100"
          }`}>
            {isInterviewMode ? (
              <Flame className="w-6 h-6 text-red-600" />
            ) : (
              <Brain className="w-6 h-6 text-purple-600" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isInterviewMode ? "Interview Pressure Mode" : "Personal AI Mentor"}
            </h1>
            <p className="text-sm text-slate-600">
              {isInterviewMode 
                ? "Strict interviewer simulation" 
                : userContext 
                  ? `Helping you become a ${userContext.targetRole}` 
                  : "Your career success partner"}
            </p>
          </div>
        </div>

        {/* Context Badge */}
        {userContext && !isInterviewMode && (
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
              <Target className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700">{userContext.targetRole}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
              <Zap className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700">{userContext.roadmapProgress}% progress</span>
            </div>
          </div>
        )}

        {/* Interview Timer */}
        {isInterviewMode && interviewTimer !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
            interviewTimer <= 30 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
          }`}>
            <Timer className="w-5 h-5" />
            {Math.floor(interviewTimer / 60)}:{(interviewTimer % 60).toString().padStart(2, "0")}
          </div>
        )}

        {isInterviewMode && (
          <button
            onClick={exitInterviewMode}
            className="px-4 py-2 border-2 border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Exit Interview
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && showModes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                I'm your Personal AI Mentor
              </h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                I know your goals, progress, and weaknesses. Let me help you get job-ready faster.
              </p>

              {/* Mode Selection */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <button
                  onClick={() => startMode("explain")}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                >
                  <BookOpen className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold text-slate-900">Explain Concept</h3>
                  <p className="text-sm text-slate-600 mt-1">Deep dive into {userContext?.currentSkill || "any topic"}</p>
                </button>

                <button
                  onClick={() => startMode("quiz")}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <Sparkles className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-slate-900">Quiz Me</h3>
                  <p className="text-sm text-slate-600 mt-1">Test your understanding</p>
                </button>

                <button
                  onClick={() => startMode("review")}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                >
                  <Target className="w-8 h-8 text-emerald-600 mb-2" />
                  <h3 className="font-semibold text-slate-900">Review Progress</h3>
                  <p className="text-sm text-slate-600 mt-1">Honest feedback on gaps</p>
                </button>

                <button
                  onClick={startInterviewMode}
                  className="p-4 rounded-xl border-2 border-red-200 bg-red-50 hover:border-red-500 transition-all text-left group"
                >
                  <Flame className="w-8 h-8 text-red-600 mb-2" />
                  <h3 className="font-semibold text-slate-900">Interview Mode</h3>
                  <p className="text-sm text-slate-600 mt-1">Strict, timed practice</p>
                </button>
              </div>

              {/* Weakest Skills Warning */}
              {userContext?.weakestSkills && userContext.weakestSkills.length > 0 && (
                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-lg mx-auto">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="font-semibold text-amber-800">Focus Areas Detected</p>
                      <p className="text-sm text-amber-700 mt-1">
                        I notice you haven't completed: <strong>{userContext.weakestSkills.join(", ")}</strong>. 
                        These are critical for {userContext.targetRole} interviews.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.isInterviewMode ? "bg-red-100" : "bg-purple-100"
                  }`}>
                    {message.isInterviewMode ? (
                      <Flame className="w-4 h-4 text-red-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                )}
                
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === "user" 
                    ? "bg-blue-600 text-white" 
                    : message.isInterviewMode
                      ? "bg-red-50 border border-red-200 text-slate-900"
                      : "bg-slate-100 text-slate-900"
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  
                  {/* Interview Feedback */}
                  {message.feedback && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold">Score:</span>
                        <span className={`font-bold ${
                          message.feedback.score >= 7 ? "text-emerald-600" :
                          message.feedback.score >= 5 ? "text-amber-600" : "text-red-600"
                        }`}>{message.feedback.score}/10</span>
                      </div>
                      {message.feedback.improvements.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Improve:</span>
                          <ul className="list-disc list-inside text-red-700">
                            {message.feedback.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isInterviewMode ? "Answer the question..." : "Ask me anything about your career journey..."}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-0 bg-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                isInterviewMode 
                  ? "bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300"
                  : "bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-300"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Actions */}
          {!isInterviewMode && messages.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => sendMessage("Give me a harder question")}
                className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-700"
              >
                Harder question
              </button>
              <button
                onClick={() => sendMessage("Explain that simpler")}
                className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-700"
              >
                Explain simpler
              </button>
              <button
                onClick={() => sendMessage("What should I focus on next?")}
                className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-700"
              >
                What's next?
              </button>
              <button
                onClick={startInterviewMode}
                className="px-3 py-1.5 text-sm bg-red-50 border border-red-200 rounded-full hover:bg-red-100 text-red-700 flex items-center gap-1"
              >
                <Flame className="w-3 h-3" />
                Interview Mode
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

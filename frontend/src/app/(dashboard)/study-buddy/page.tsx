"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  User,
  BookOpen,
  Code,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface LearningContext {
  currentPhase: string;
  currentSkill: string;
  targetRole: string;
  skillLevel: string;
}

const quickPrompts = [
  { icon: Code, label: "Explain this concept", prompt: "Can you explain this concept in simple terms with examples?" },
  { icon: HelpCircle, label: "Why is this important?", prompt: "Why is this skill important for my target role?" },
  { icon: Lightbulb, label: "Practice exercise", prompt: "Give me a practice exercise to test my understanding" },
  { icon: BookOpen, label: "Real-world example", prompt: "Show me a real-world example of how this is used" },
];

export default function StudyBuddyPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  // Mock learning context - in production, fetch from API
  const [context] = useState<LearningContext>({
    currentPhase: "Phase 2: Backend Fundamentals",
    currentSkill: "REST APIs",
    targetRole: "Backend Engineer",
    skillLevel: "Intermediate",
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/api/v1/study-buddy/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: content,
          context: {
            current_phase: context.currentPhase,
            current_skill: context.currentSkill,
            target_role: context.targetRole,
            skill_level: context.skillLevel,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.data?.response || data.response || "I'm here to help with your learning journey!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-2 mb-1">AI Study Buddy</h1>
            <p className="text-neutral-500">
              Context-aware AI tutor for your learning journey
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="btn-ghost text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Clear Chat
            </button>
          )}
        </div>

        {/* Learning Context Banner */}
        <div className="mt-4 p-4 bg-neutral-100 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <BookOpen className="w-4 h-4" />
            <span>Currently learning:</span>
            <span className="font-medium text-neutral-900">{context.currentSkill}</span>
            <span className="text-neutral-400">•</span>
            <span>{context.currentPhase}</span>
            <span className="text-neutral-400">•</span>
            <span>Target: {context.targetRole}</span>
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col card p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                How can I help you learn today?
              </h3>
              <p className="text-neutral-500 max-w-md mb-8">
                I know you're learning {context.currentSkill} for your {context.targetRole} goal. 
                Ask me anything about this topic!
              </p>

              {/* Quick Prompts */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => sendMessage(prompt.prompt)}
                    className="flex items-center gap-3 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-left transition-colors"
                  >
                    <prompt.icon className="w-5 h-5 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-700">{prompt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "bg-neutral-900 text-white rounded-2xl rounded-br-md"
                        : "bg-neutral-100 text-neutral-900 rounded-2xl rounded-bl-md"
                    } p-4`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.role === "assistant" && (
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="mt-2 text-xs text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3 h-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-neutral-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-neutral-600" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-neutral-100 rounded-2xl rounded-bl-md p-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-neutral-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${context.currentSkill}...`}
              className="input flex-1"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn-primary px-4"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

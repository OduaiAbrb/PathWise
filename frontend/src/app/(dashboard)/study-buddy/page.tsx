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
  Brain,
  Zap,
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
  roadmapId?: string;
}

export default function StudyBuddyPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [context, setContext] = useState<LearningContext | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  // Fetch user's current learning context from active roadmap
  useEffect(() => {
    fetchLearningContext();
  }, [accessToken]);

  const fetchLearningContext = async () => {
    if (!accessToken) {
      setIsLoadingContext(false);
      setContext({
        currentPhase: "Getting Started",
        currentSkill: "Fundamentals",
        targetRole: "Software Developer",
        skillLevel: "Beginner",
      });
      return;
    }

    try {
      const response = await fetch(getApiUrl("/api/v1/roadmaps/"), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const roadmaps = data.data || [];
        
        if (roadmaps.length > 0) {
          const activeRoadmap = roadmaps[0];
          const phases = activeRoadmap.phases || [];
          
          // Find current phase (first incomplete one)
          let currentPhase = phases[0];
          let currentSkill = "Fundamentals";
          
          for (const phase of phases) {
            const skills = phase.skills || [];
            const incompleteSkill = skills.find((s: any) => s.status !== "completed");
            if (incompleteSkill) {
              currentPhase = phase;
              currentSkill = incompleteSkill.name;
              break;
            }
          }

          setContext({
            currentPhase: currentPhase?.name || "Phase 1",
            currentSkill: currentSkill,
            targetRole: activeRoadmap.target_role || "Software Developer",
            skillLevel: activeRoadmap.skill_level || "Intermediate",
            roadmapId: activeRoadmap.id,
          });
        } else {
          setContext({
            currentPhase: "Getting Started",
            currentSkill: "Programming Fundamentals",
            targetRole: "Software Developer",
            skillLevel: "Beginner",
          });
        }
      } else {
        setContext({
          currentPhase: "Getting Started",
          currentSkill: "Programming Fundamentals",
          targetRole: "Software Developer",
          skillLevel: "Beginner",
        });
      }
    } catch (error) {
      setContext({
        currentPhase: "Getting Started",
        currentSkill: "Programming Fundamentals",
        targetRole: "Software Developer",
        skillLevel: "Beginner",
      });
    } finally {
      setIsLoadingContext(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Context-aware quick prompts that insert the actual current topic
  const getQuickPrompts = () => {
    if (!context) return [];
    
    return [
      {
        icon: Code,
        label: `Explain ${context.currentSkill}`,
        prompt: `Explain ${context.currentSkill} in simple terms with practical examples. I'm learning this as part of becoming a ${context.targetRole} and I'm at a ${context.skillLevel} level.`,
      },
      {
        icon: HelpCircle,
        label: "Why is this important?",
        prompt: `Why is ${context.currentSkill} important for a ${context.targetRole}? What real-world problems does it solve?`,
      },
      {
        icon: Lightbulb,
        label: "Practice exercise",
        prompt: `Give me a hands-on practice exercise to test my understanding of ${context.currentSkill}. Make it appropriate for a ${context.skillLevel} level learner.`,
      },
      {
        icon: BookOpen,
        label: "Real-world example",
        prompt: `Show me a real-world example of how ${context.currentSkill} is used in production at companies. Include code if relevant.`,
      },
      {
        icon: Brain,
        label: "Common mistakes",
        prompt: `What are the most common mistakes people make when learning ${context.currentSkill}? How can I avoid them?`,
      },
      {
        icon: Zap,
        label: "Quick quiz",
        prompt: `Give me 3 quick quiz questions about ${context.currentSkill} to test my understanding. Include answers at the end.`,
      },
    ];
  };

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
          context: context ? {
            current_phase: context.currentPhase,
            current_skill: context.currentSkill,
            target_role: context.targetRole,
            skill_level: context.skillLevel,
            roadmap_id: context.roadmapId,
          } : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response || data.message || "I'm here to help you learn!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Fallback response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: generateFallbackResponse(content),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateFallbackResponse(content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (question: string): string => {
    const skill = context?.currentSkill || "this topic";
    const role = context?.targetRole || "developer";
    
    if (question.toLowerCase().includes("explain")) {
      return `Great question about ${skill}! This is a fundamental concept for any ${role}.\n\n**Key Points:**\n1. Start with understanding the basics and why it exists\n2. Practice with small examples before moving to complex ones\n3. Connect it to real-world use cases\n\nWould you like me to break down any specific aspect of ${skill}?`;
    }
    
    if (question.toLowerCase().includes("practice") || question.toLowerCase().includes("exercise")) {
      return `Here's a practice exercise for ${skill}:\n\n**Exercise:** Build a small project that demonstrates your understanding.\n\n**Steps:**\n1. Start with the simplest implementation\n2. Add one feature at a time\n3. Test each addition\n4. Refactor for clarity\n\nWant me to give you a more specific project idea?`;
    }
    
    return `I understand you're asking about ${skill} as part of your journey to become a ${role}.\n\nThis is an important topic! Here are some tips:\n\n1. **Focus on fundamentals** - Make sure you understand the core concepts\n2. **Practice regularly** - Consistency beats intensity\n3. **Build projects** - Apply what you learn immediately\n\nWhat specific aspect would you like to explore further?`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="heading-2 mb-1">AI Study Buddy</h1>
              <p className="text-neutral-500">
                Your personal tutor that knows your learning path
              </p>
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} className="btn-ghost text-sm">
                <RefreshCw className="w-4 h-4" />
                Clear Chat
              </button>
            )}
          </div>

          {/* Learning Context Banner */}
          {context && !isLoadingContext && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-neutral-50 rounded-xl flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-500">Currently learning</p>
                <p className="font-medium text-neutral-900">
                  {context.currentSkill} • {context.currentPhase}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500">Target Role</p>
                <p className="font-medium text-neutral-900">{context.targetRole}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col card">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  How can I help you learn today?
                </h3>
                <p className="text-neutral-500 mb-6 max-w-md">
                  I know you're working on <strong>{context?.currentSkill}</strong>. 
                  Ask me anything or use the quick prompts below.
                </p>

                {/* Quick Prompts Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
                  {getQuickPrompts().map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt.prompt)}
                      className="p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-left transition-colors group"
                    >
                      <prompt.icon className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 mb-2" />
                      <p className="text-sm font-medium text-neutral-700">{prompt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? "bg-neutral-900"
                            : "bg-neutral-100"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-neutral-600" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-900"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                        {message.role === "assistant" && (
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="mt-2 text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div className="bg-neutral-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Prompts (when chat has messages) */}
          {messages.length > 0 && (
            <div className="px-4 py-2 border-t border-neutral-100">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getQuickPrompts().slice(0, 4).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.prompt)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 rounded-full text-sm text-neutral-600 whitespace-nowrap transition-colors"
                  >
                    <prompt.icon className="w-4 h-4" />
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                placeholder={`Ask about ${context?.currentSkill || "anything"}...`}
                className="input flex-1"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="btn-primary px-4"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

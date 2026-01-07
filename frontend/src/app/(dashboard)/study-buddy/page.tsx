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
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          message: content.trim(),
          conversation_history: messages.map((m) => ({ role: m.role, content: m.content })),
          user_context: context
            ? {
                current_skill: context.currentSkill,
                skill_level: context.skillLevel,
                target_role: context.targetRole,
                roadmap_id: context.roadmapId,
              }
            : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            (data?.data?.response as string) ||
            (data?.response as string) ||
            (data?.message as string) ||
            "I'm here to help you learn!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (response.status === 401 || response.status === 403) {
        // Authentication error - provide smart fallback
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: generateIntelligentResponse(content, context, messages),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Other error - provide context-aware fallback
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: generateIntelligentResponse(content, context, messages),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      // Network error - provide intelligent fallback
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateIntelligentResponse(content, context, messages),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateIntelligentResponse = (question: string, userContext: LearningContext | null, conversationHistory: Message[]): string => {
    const skill = userContext?.currentSkill || "programming";
    const role = userContext?.targetRole || "developer";
    const level = userContext?.skillLevel || "beginner";
    const phase = userContext?.currentPhase || "Getting Started";
    
    // Analyze question intent
    const questionLower = question.toLowerCase();
    
    // Explanation requests
    if (questionLower.includes("explain") || questionLower.includes("what is") || questionLower.includes("how does")) {
      if (skill.toLowerCase().includes("javascript") || skill.toLowerCase().includes("js")) {
        return `Let me explain **${skill}** for your ${role} journey!\n\n**What it is:**\nJavaScript is the programming language of the web. It makes websites interactive and dynamic.\n\n**Why it's important:**\nEvery modern web application uses JavaScript. As a ${role}, you'll use it for:\n• Adding interactivity to web pages\n• Building user interfaces\n• Handling user events (clicks, forms, etc.)\n• Making API calls to servers\n\n**Real example:**\n\`\`\`javascript\n// Make a button respond to clicks\nbutton.addEventListener('click', () => {\n  alert('Hello World!');\n});\n\`\`\`\n\n**Next steps for ${level} level:**\n1. Practice with basic syntax and variables\n2. Learn about functions and objects\n3. Try building a simple calculator\n\nWhat specific part of ${skill} would you like to dive deeper into?`;
      }
      
      if (skill.toLowerCase().includes("react")) {
        return `**React** is a game-changer for ${role}s! Let me break it down:\n\n**What React is:**\nA JavaScript library for building user interfaces, especially web applications. Think of it as building blocks for creating interactive websites.\n\n**Why it matters for your career:**\n• Most companies use React for frontend development\n• It makes complex UIs manageable\n• High demand skill in the job market\n\n**Key concepts (${level} friendly):**\n1. **Components** - Reusable pieces of UI\n2. **Props** - Data passed between components\n3. **State** - Data that can change\n\n**Simple example:**\n\`\`\`jsx\nfunction Welcome() {\n  return <h1>Hello, {role}!</h1>;\n}\n\`\`\`\n\n**Learning path for ${level}s:**\n1. Master JavaScript basics first\n2. Understand HTML/CSS\n3. Build your first React component\n4. Create a simple todo app\n\nReady to start with components, or do you want to review JavaScript fundamentals first?`;
      }
      
      // Generic explanation template
      return `Let me explain **${skill}** in the context of becoming a ${role}:\n\n**Core Concept:**\n${skill} is essential for ${role}s because it helps you build better, more efficient solutions.\n\n**Why it matters:**\n• Industry standard technology\n• Improves your problem-solving toolkit\n• Required for most ${role} positions\n\n**Learning approach for ${level} level:**\n1. **Understand the 'why'** - Why does this technology exist?\n2. **Start small** - Begin with basic examples\n3. **Practice daily** - 15-30 minutes of hands-on work\n4. **Build projects** - Apply concepts immediately\n\n**Common beginner mistakes to avoid:**\n• Trying to learn everything at once\n• Skipping fundamentals\n• Not practicing regularly\n\n**Your next action:**\nSince you're in the "${phase}" phase, I recommend starting with the basics and building one small project.\n\nWhat specific aspect of ${skill} feels most confusing right now?`;
    }
    
    // Practice/exercise requests
    if (questionLower.includes("practice") || questionLower.includes("exercise") || questionLower.includes("project")) {
      return `Perfect! Let's get you practicing **${skill}**. Here's a hands-on exercise for ${level} level:\n\n**🎯 Mini Project: ${skill} Practice**\n\n**What to build:**\nA simple ${skill.includes('JavaScript') ? 'interactive calculator' : skill.includes('React') ? 'personal profile card' : skill.includes('Python') ? 'number guessing game' : 'portfolio project'} that demonstrates ${skill} concepts.\n\n**Step-by-step approach:**\n1. **Setup** (5 mins) - Create your files/environment\n2. **Basic structure** (15 mins) - Get the foundation working\n3. **Core functionality** (20 mins) - Add the main features\n4. **Polish** (10 mins) - Clean up and test\n\n**Success criteria:**\n✅ It works without errors\n✅ You understand each line of code\n✅ You can explain how it works\n\n**Learning goals:**\n• Apply ${skill} concepts practically\n• Build muscle memory\n• Gain confidence\n\n**Time commitment:** 45-60 minutes\n\n**Stuck?** Break it into smaller pieces. Remember, ${level}s should focus on understanding over perfection.\n\nReady to start? What's your preferred development environment?`;
    }
    
    // Default contextual response
    return `I'm here to help you master **${skill}** on your ${role} journey!\n\n**🎯 Since you're working on:**\n• Current focus: ${skill}\n• Learning phase: ${phase}\n• Target role: ${role}\n• Skill level: ${level}\n\n**💡 What I can help with:**\n• **Explain concepts** - Break down complex topics\n• **Provide examples** - Real-world code and applications\n• **Suggest practice** - Hands-on exercises and projects\n• **Answer questions** - Clarify confusing parts\n• **Debug issues** - Help solve problems\n• **Plan learning** - Next steps and priorities\n\n**🚀 Popular questions from ${level} learners:**\n• "How does ${skill} work in real projects?"\n• "What should I build to practice ${skill}?"\n• "Why is ${skill} important for ${role}s?"\n• "Can you explain [specific concept] simply?"\n\n**✨ Pro tip:** The best way to learn ${skill} is through projects. Start small, build regularly, and don't be afraid to make mistakes!\n\nWhat specific aspect of ${skill} would you like to explore right now?`;
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

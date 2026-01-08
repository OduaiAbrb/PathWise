"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Brain,
  Sparkles,
  Send,
  Mic,
  MicOff,
  BookOpen,
  Target,
  TrendingUp,
  Lightbulb,
  Code,
  FileText,
  Video,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  X,
  Minimize2,
  Maximize2,
  Settings,
  HelpCircle,
  Rocket
} from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  type: "user" | "assistant";
  timestamp: Date;
  suggestions?: string[];
  resources?: LearningResource[];
  codeExample?: string;
  rating?: "positive" | "negative" | null;
}

interface LearningResource {
  id: string;
  title: string;
  type: "article" | "video" | "documentation" | "tutorial";
  url: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  rating: number;
}

interface AIPersonality {
  id: string;
  name: string;
  description: string;
  icon: string;
  expertise: string[];
  tone: "friendly" | "professional" | "encouraging" | "technical";
}

const AI_PERSONALITIES: AIPersonality[] = [
  {
    id: "mentor",
    name: "Alex Mentor",
    description: "Experienced developer mentor focusing on best practices and career guidance",
    icon: "🧠",
    expertise: ["System Design", "Architecture", "Career Advice", "Code Review"],
    tone: "professional"
  },
  {
    id: "teacher",
    name: "Sam Teacher",
    description: "Patient educator who breaks down complex concepts into digestible parts",
    icon: "📚",
    expertise: ["Fundamentals", "Step-by-step Learning", "Debugging", "Concepts"],
    tone: "friendly"
  },
  {
    id: "coach",
    name: "Riley Coach",
    description: "Motivational coach helping you stay on track and build confidence",
    icon: "🚀",
    expertise: ["Motivation", "Goal Setting", "Progress Tracking", "Confidence Building"],
    tone: "encouraging"
  },
  {
    id: "expert",
    name: "Dr. Code",
    description: "Technical expert for advanced topics and cutting-edge technologies",
    icon: "⚡",
    expertise: ["Advanced Topics", "New Technologies", "Performance", "Security"],
    tone: "technical"
  }
];

export default function AILearningAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<AIPersonality>(AI_PERSONALITIES[0]);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [contextAware, setContextAware] = useState(true);
  const [learningMode, setLearningMode] = useState<"explain" | "practice" | "review">("explain");

  useEffect(() => {
    if (messages.length === 0) {
      // Welcome message
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        content: `Hi! I'm ${selectedPersonality.name} 👋 ${selectedPersonality.description}. How can I help you learn today?`,
        type: "assistant",
        timestamp: new Date(),
        suggestions: [
          "Explain React hooks",
          "Help me debug this code",
          "What should I learn next?",
          "Review my progress"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedPersonality]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: currentMessage.trim(),
      type: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(userMessage.content);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    
    let content = "";
    let suggestions: string[] = [];
    let resources: LearningResource[] = [];
    let codeExample = "";

    if (input.includes("react") || input.includes("hooks")) {
      content = `Great question about React hooks! ${selectedPersonality.icon} Let me break this down for you:

React hooks are functions that let you "hook into" React state and lifecycle features from functional components. The most common ones are:

• **useState** - Manages component state
• **useEffect** - Handles side effects and lifecycle
• **useContext** - Accesses React context
• **useMemo** - Memoizes expensive calculations

Would you like me to show you a practical example?`;

      suggestions = [
        "Show me useState example",
        "Explain useEffect",
        "What are custom hooks?",
        "Common hook patterns"
      ];

      resources = [
        {
          id: "1",
          title: "React Hooks Official Documentation",
          type: "documentation",
          url: "#",
          difficulty: "intermediate",
          duration: "30 min read",
          rating: 4.9
        },
        {
          id: "2",
          title: "React Hooks Complete Guide",
          type: "video",
          url: "#",
          difficulty: "beginner",
          duration: "45 min",
          rating: 4.8
        }
      ];

      codeExample = `import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`;
    } else if (input.includes("debug") || input.includes("error")) {
      content = `${selectedPersonality.icon} I'd love to help you debug! Here's my systematic approach:

**1. Understand the Error**
• Read the error message carefully
• Note the line number and file
• Check the browser console for details

**2. Common Debugging Steps**
• Use console.log() strategically
• Check variable values at different points
• Verify function parameters and return values
• Test with smaller, isolated examples

**3. Tools That Help**
• Browser DevTools (F12)
• React DevTools extension
• ESLint for code quality
• TypeScript for type safety

What specific error are you encountering?`;

      suggestions = [
        "TypeError: Cannot read property",
        "Component not rendering",
        "State not updating",
        "API call not working"
      ];
    } else if (input.includes("learn next") || input.includes("roadmap")) {
      content = `${selectedPersonality.icon} Based on your current progress, here's what I recommend learning next:

**Immediate Focus Areas:**
• Complete your current JavaScript fundamentals
• Build 2-3 small projects to practice
• Learn Git and version control basics

**Next 2-4 Weeks:**
• React.js for modern front-end development
• Basic Node.js and Express for backend
• CSS frameworks like Tailwind CSS

**Medium-term Goals (1-3 months):**
• Database fundamentals (SQL/NoSQL)
• API design and integration
• Testing basics (Jest, React Testing Library)

Would you like me to create a personalized learning schedule for you?`;

      suggestions = [
        "Create my schedule",
        "Explain why React?",
        "Show project ideas",
        "Track my progress"
      ];
    } else {
      // Default helpful response
      content = `${selectedPersonality.icon} That's an interesting question! I'd be happy to help you with that. Let me provide some guidance based on my expertise in ${selectedPersonality.expertise.join(", ")}.

Could you provide a bit more context about what specifically you'd like to know? This will help me give you the most relevant and useful information.`;

      suggestions = [
        "Explain with examples",
        "Show me best practices",
        "Recommend resources",
        "Help me practice"
      ];
    }

    return {
      id: Date.now().toString(),
      content,
      type: "assistant",
      timestamp: new Date(),
      suggestions,
      resources: resources.length > 0 ? resources : undefined,
      codeExample: codeExample || undefined
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
    sendMessage();
  };

  const rateMessage = (messageId: string, rating: "positive" | "negative") => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // In a real app, this would integrate with Web Speech API
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300 z-50"
      >
        <Brain className="w-8 h-8" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        height: isMinimized ? "60px" : "600px",
        width: isMinimized ? "300px" : "400px"
      }}
      className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{selectedPersonality.icon}</div>
          <div>
            <h3 className="font-semibold text-sm">{selectedPersonality.name}</h3>
            <p className="text-xs text-blue-100">AI Learning Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Settings Panel */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-b border-neutral-200 bg-neutral-50"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-2">AI Personality</label>
                  <select
                    value={selectedPersonality.id}
                    onChange={(e) => {
                      const personality = AI_PERSONALITIES.find(p => p.id === e.target.value);
                      if (personality) setSelectedPersonality(personality);
                    }}
                    className="w-full text-xs border border-neutral-200 rounded-lg px-2 py-1"
                  >
                    {AI_PERSONALITIES.map(personality => (
                      <option key={personality.id} value={personality.id}>
                        {personality.icon} {personality.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-2">Learning Mode</label>
                  <div className="flex gap-1">
                    {[
                      { id: "explain", label: "Explain", icon: BookOpen },
                      { id: "practice", label: "Practice", icon: Target },
                      { id: "review", label: "Review", icon: CheckCircle }
                    ].map((mode) => {
                      const IconComponent = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setLearningMode(mode.id as typeof learningMode)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded text-xs transition-colors ${
                            learningMode === mode.id
                              ? "bg-blue-500 text-white"
                              : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                          }`}
                        >
                          <IconComponent className="w-3 h-3" />
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === "user" 
                    ? "bg-blue-500 text-white" 
                    : "bg-gradient-to-r from-purple-400 to-blue-500 text-white"
                }`}>
                  {message.type === "user" ? "👤" : selectedPersonality.icon}
                </div>
                
                <div className={`max-w-[85%] ${message.type === "user" ? "text-right" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-neutral-100 text-neutral-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Code Example */}
                  {message.codeExample && (
                    <div className="mt-3 bg-neutral-900 text-neutral-100 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                      <pre>{message.codeExample}</pre>
                    </div>
                  )}

                  {/* Resources */}
                  {message.resources && message.resources.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-neutral-600">Recommended Resources:</p>
                      {message.resources.map((resource) => (
                        <div key={resource.id} className="bg-white border border-neutral-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <div className={`p-1 rounded ${
                              resource.type === "video" ? "bg-red-100 text-red-600" :
                              resource.type === "article" ? "bg-blue-100 text-blue-600" :
                              "bg-green-100 text-green-600"
                            }`}>
                              {resource.type === "video" ? <Video className="w-3 h-3" /> :
                               resource.type === "article" ? <FileText className="w-3 h-3" /> :
                               <BookOpen className="w-3 h-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-medium text-neutral-900 truncate">{resource.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  resource.difficulty === "beginner" ? "bg-green-100 text-green-700" :
                                  resource.difficulty === "intermediate" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-red-100 text-red-700"
                                }`}>
                                  {resource.difficulty}
                                </span>
                                <span className="text-xs text-neutral-500">{resource.duration}</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-neutral-500">{resource.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs bg-white border border-neutral-200 rounded-full px-3 py-1 hover:bg-neutral-50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Rating */}
                  {message.type === "assistant" && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => rateMessage(message.id, "positive")}
                        className={`p-1 rounded transition-colors ${
                          message.rating === "positive" ? "text-green-600 bg-green-100" : "text-neutral-400 hover:text-green-600"
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => rateMessage(message.id, "negative")}
                        className={`p-1 rounded transition-colors ${
                          message.rating === "negative" ? "text-red-600 bg-red-100" : "text-neutral-400 hover:text-red-600"
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-neutral-500 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 text-white flex items-center justify-center">
                  {selectedPersonality.icon}
                </div>
                <div className="bg-neutral-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask me anything about coding..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={toggleVoiceInput}
                className={`p-2 rounded-lg transition-colors ${
                  isListening ? "bg-red-500 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { getApiUrl } from "@/lib/fetch-api";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/fetch-api";
import { Send, Mic, MicOff, Lightbulb, Code, BookOpen, HelpCircle } from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";
import { Button, Card, CardContent } from "@/components/ui";
import { getApiUrl } from "@/lib/fetch-api";
import toast from "react-hot-toast";
import { getApiUrl } from "@/lib/fetch-api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function StudyBuddyPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI Study Buddy. I can help you understand concepts, debug code, generate quizzes, and more. What would you like to learn today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
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
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          message: input,
          conversation_history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      icon: Lightbulb,
      label: "Explain a concept",
      prompt: "Can you explain ",
    },
    {
      icon: Code,
      label: "Debug my code",
      prompt: "I have a bug in my code: ",
    },
    {
      icon: BookOpen,
      label: "Generate a quiz",
      prompt: "Generate a quiz about ",
    },
    {
      icon: HelpCircle,
      label: "Ask a question",
      prompt: "I have a question: ",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">AI Study Buddy</h1>
          <p className="text-dark-400">Your personal learning assistant, available 24/7</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(action.prompt)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-dark-800/50 hover:bg-dark-700 transition-colors text-left"
                    >
                      <action.icon className="w-5 h-5 text-primary-400" />
                      <span className="text-dark-300 text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-dark-900/50 border-dark-800 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary-500 text-white"
                          : "bg-dark-800 text-dark-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-2 opacity-60">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-dark-800 rounded-lg p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-dark-800 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-dark-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => setIsListening(!isListening)}
                    variant={isListening ? "primary" : "secondary"}
                    className="px-4"
                  >
                    {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  Brain,
  Database,
  Shield,
  ChevronDown,
  ChevronUp,
  Eye,
  Lock,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface TransparencyPanelProps {
  context?: "roadmap" | "ai-mentor" | "projects" | "general";
}

export default function TransparencyPanel({ context = "general" }: TransparencyPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const contextInfo = {
    roadmap: {
      title: "How Your Roadmap Works",
      icon: Sparkles,
      items: [
        {
          icon: Brain,
          title: "AI-Powered Generation",
          description: "We use GPT-4 to analyze your target role and create a personalized learning path based on real job requirements.",
        },
        {
          icon: Database,
          title: "What Data We Use",
          description: "Your target role, experience level, learning preferences, and available time. We don't store your job descriptions.",
        },
        {
          icon: Eye,
          title: "What We Show You",
          description: "Skills are ranked by interview frequency (how often they appear in real interviews). Resources are verified and free.",
        },
        {
          icon: Lock,
          title: "What We DON'T Guess",
          description: "We don't make up statistics. Interview frequency is based on aggregated job posting data. If we're unsure, we say so.",
        },
      ],
    },
    "ai-mentor": {
      title: "How AI Mentor Works",
      icon: Brain,
      items: [
        {
          icon: Brain,
          title: "Context-Aware Responses",
          description: "The AI knows your current role, roadmap progress, and weak areas to give relevant advice.",
        },
        {
          icon: Database,
          title: "What Data We Use",
          description: "Your target role, current skill, roadmap progress, and conversation history (last 10 messages only).",
        },
        {
          icon: Eye,
          title: "Interview Mode",
          description: "Simulates real interview pressure with timed responses and honest feedback. Scores are relative, not absolute.",
        },
        {
          icon: Lock,
          title: "Limitations",
          description: "AI can make mistakes. Always verify technical details with official documentation. We can't guarantee interview success.",
        },
      ],
    },
    projects: {
      title: "How Project Generation Works",
      icon: Sparkles,
      items: [
        {
          icon: Brain,
          title: "AI-Generated Ideas",
          description: "Projects are tailored to your skills and difficulty level. Each includes resume bullets and interview talking points.",
        },
        {
          icon: Database,
          title: "What Data We Use",
          description: "Your target role, current skills, difficulty preference, and any custom prompts you provide.",
        },
        {
          icon: Eye,
          title: "What You Get",
          description: "Detailed project specs with features, requirements, and implementation steps. All designed to impress employers.",
        },
        {
          icon: Lock,
          title: "What We DON'T Do",
          description: "We don't write the code for you. The value is in building it yourself and learning along the way.",
        },
      ],
    },
    general: {
      title: "How PathWise Uses AI",
      icon: Shield,
      items: [
        {
          icon: Brain,
          title: "AI Technologies",
          description: "We use OpenAI's GPT-4 for roadmap generation, project ideas, and mentoring conversations.",
        },
        {
          icon: Database,
          title: "Your Data",
          description: "We store your account info, roadmaps, and progress. We don't sell or share your data with third parties.",
        },
        {
          icon: Eye,
          title: "Transparency",
          description: "We show you exactly what data influences AI decisions. No hidden algorithms or unexplained recommendations.",
        },
        {
          icon: Lock,
          title: "Security",
          description: "All data is encrypted in transit and at rest. We follow industry best practices for data protection.",
        },
      ],
    },
  };

  const info = contextInfo[context];
  const IconComponent = info.icon;

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="font-medium text-neutral-900 text-sm">{info.title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-neutral-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-500" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-neutral-100 pt-3">
              {info.items.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-neutral-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-3.5 h-3.5 text-neutral-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900">{item.title}</h4>
                    <p className="text-xs text-neutral-600 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
              
              <div className="pt-2 mt-2 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  Questions? Contact support@pathwise.dev
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

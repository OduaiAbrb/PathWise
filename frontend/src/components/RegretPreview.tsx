"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ThumbsDown, Clock, Users, Brain, Code } from "lucide-react";

interface RegretPreviewProps {
  targetRole: string;
}

/**
 * Regret Preview - Show what users will hate about a role
 * Builds trust through honesty
 */
export default function RegretPreview({ targetRole }: RegretPreviewProps) {
  // Role-specific pain points
  const regretData: Record<string, {
    dailyPains: string[];
    unexpectedRealities: string[];
    dealbreakers: string[];
  }> = {
    "Backend Engineer": {
      dailyPains: [
        "Debugging production issues at 2am",
        "Endless code reviews and merge conflicts",
        "Dealing with legacy code from 10 years ago"
      ],
      unexpectedRealities: [
        "80% of your time is maintaining existing code, not building new features",
        "You'll spend more time in meetings than coding",
        "Performance optimization is tedious, not exciting"
      ],
      dealbreakers: [
        "If you hate being on-call",
        "If you need immediate visual feedback",
        "If you dislike reading documentation"
      ]
    },
    "Frontend Developer": {
      dailyPains: [
        "Browser compatibility nightmares",
        "Design changes every week",
        "Pixel-perfect alignment debates"
      ],
      unexpectedRealities: [
        "Designers will change their minds constantly",
        "You'll argue about 2px more than you'd expect",
        "Framework fatigue is real - new one every 6 months"
      ],
      dealbreakers: [
        "If you hate visual details",
        "If you dislike user feedback",
        "If you want work-life balance (fast-paced updates)"
      ]
    },
    "Full Stack Developer": {
      dailyPains: [
        "Context switching between frontend and backend hourly",
        "Being expected to know everything",
        "Never feeling like an expert at anything"
      ],
      unexpectedRealities: [
        "You're always the fallback person for every task",
        "Depth > breadth, but you're stuck with breadth",
        "You'll fix bugs in code you didn't write"
      ],
      dealbreakers: [
        "If you prefer deep expertise",
        "If you hate multitasking",
        "If you want clear boundaries"
      ]
    },
    "Data Analyst": {
      dailyPains: [
        "Cleaning messy data for hours",
        "Stakeholders changing requirements mid-project",
        "Explaining why correlation ≠ causation repeatedly"
      ],
      unexpectedRealities: [
        "90% data cleaning, 10% actual analysis",
        "Your insights will often be ignored",
        "Excel will haunt your dreams"
      ],
      dealbreakers: [
        "If you hate repetitive tasks",
        "If you need fast feedback",
        "If you dislike politics"
      ]
    },
    "DevOps Engineer": {
      dailyPains: [
        "Getting blamed when anything breaks",
        "Being woken up for production incidents",
        "Dealing with developers who don't understand infrastructure"
      ],
      unexpectedRealities: [
        "You're the glue that nobody sees until it breaks",
        "Automation takes 10x longer than doing it manually once",
        "You'll be on-call more than you think"
      ],
      dealbreakers: [
        "If you hate being always available",
        "If you want credit for your work",
        "If you dislike high-pressure situations"
      ]
    }
  };

  const roleData = regretData[targetRole] || regretData["Backend Engineer"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            Regret Preview: {targetRole}
          </h3>
          <p className="text-sm text-slate-600">
            What you'll actually hate (so you know what you're getting into)
          </p>
        </div>
      </div>

      {/* Daily Pains */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ThumbsDown className="w-4 h-4 text-red-600" />
          <h4 className="font-semibold text-slate-900 text-sm">Daily Pains</h4>
        </div>
        <div className="space-y-2">
          {roleData.dailyPains.map((pain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 text-sm text-slate-700"
            >
              <span className="text-red-500 flex-shrink-0">•</span>
              <span>{pain}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Unexpected Realities */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-amber-600" />
          <h4 className="font-semibold text-slate-900 text-sm">Unexpected Realities</h4>
        </div>
        <div className="space-y-2">
          {roleData.unexpectedRealities.map((reality, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-3 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg"
            >
              <p className="text-sm text-amber-900">{reality}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dealbreakers */}
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h4 className="font-semibold text-red-900">Don't Choose This Role If...</h4>
        </div>
        <div className="space-y-2">
          {roleData.dealbreakers.map((dealbreaker, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full flex-shrink-0" />
              <span className="text-sm text-red-800 font-medium">{dealbreaker}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust Statement */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-slate-500 mt-4 text-center italic"
      >
        We show you the ugly truth. If you're still excited, you're in the right place.
      </motion.p>
    </div>
  );
}

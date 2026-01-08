"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, HelpCircle, ArrowRight, Sparkles } from "lucide-react";

/**
 * PathWise Landing Page - Entry Experience (Completely Rebuilt)
 * 
 * PRODUCT NORTH STAR:
 * PathWise exists to solve ONE problem:
 * People don't know what to learn, in what order, or when they are actually ready for jobs.
 * 
 * This is NOT a demo, NOT an AI toy, NOT a dashboard with features.
 * This IS a career outcome engine.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 35 C8 35 12 28 16 22 C20 16 16 12 20 8 L24 4 L28 8 L24 12" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 38 L18 38 C22 38 24 34 22 30 C20 26 24 22 22 18" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <circle cx="10" cy="32" r="3" fill="#0f172a"/>
          </svg>
          <span className="text-3xl font-bold text-slate-900">PathWise</span>
        </div>

        {/* Main Question - ONE clear question */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-sm text-blue-700 font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Career Outcome Engine
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight"
          >
            Do you already know what job role you're aiming for?
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-slate-600 max-w-lg mx-auto"
          >
            PathWise turns confusion into clarity, learning into readiness, and effort into confidence.
          </motion.p>
        </div>

        {/* Two Options - No distractions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Flow A: User knows */}
          <button
            onClick={() => router.push("/onboarding?flow=knows")}
            className="group relative p-8 rounded-2xl border-2 border-slate-200 bg-white hover:border-emerald-500 hover:shadow-lg transition-all duration-300 text-left"
            data-testid="flow-knows-button"
          >
            <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-3 pr-8">
              Yes, I know my target role
            </h3>
            
            <p className="text-slate-600 mb-4">
              I have a specific role in mind like Backend Engineer, Data Scientist, or DevOps Engineer.
            </p>
            
            <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
              Build my roadmap
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Flow B: Career discovery */}
          <button
            onClick={() => router.push("/onboarding?flow=discovery")}
            className="group relative p-8 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg transition-all duration-300 text-left"
            data-testid="flow-discovery-button"
          >
            <div className="absolute top-4 right-4 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <HelpCircle className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-3 pr-8">
              No, I need guidance
            </h3>
            
            <p className="text-slate-600 mb-4">
              I'm in IT/tech but unsure which role fits me best. Help me discover my path.
            </p>
            
            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
              Discover my path
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </motion.div>

        {/* Trust Signal */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-slate-500"
        >
          This choice doesn't lock you in. You can always explore other roles later.
        </motion.p>
      </motion.div>
    </div>
  );
}

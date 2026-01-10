"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Zap, Target, TrendingUp } from "lucide-react";

/**
 * PathWise Landing Page - Marketing Site
 * 
 * FLOW: Landing Page → Login/Signup → Onboarding → Dashboard
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 35 C8 35 12 28 16 22 C20 16 16 12 20 8 L24 4 L28 8 L24 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 38 L18 38 C22 38 24 34 22 30 C20 26 24 22 22 18" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <circle cx="10" cy="32" r="3" fill="white"/>
            </svg>
            <span className="text-2xl font-bold text-white">PathWise</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-white hover:text-gray-300 transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center p-6 pt-24">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm text-white font-medium mb-8 border border-white/20">
              <Sparkles className="w-4 h-4" />
              Career Outcome Engine
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Know <span className="underline">exactly</span> what to learn,<br />
              <span className="underline">when you're ready</span> for jobs
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
              PathWise turns confusion into clarity, learning into readiness, and effort into confidence. 
              Get a personalized roadmap, track real progress, and know your actual job readiness.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105 flex items-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-transparent text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all border-2 border-white"
              >
                See How It Works
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>No guessing what to learn</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Real readiness scores</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Interview-focused</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 px-6 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-xl text-gray-400">
              Stop guessing. Start progressing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/20"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI-Generated Roadmaps</h3>
              <p className="text-gray-400 mb-4">
                Get a personalized learning path with 4-6 phases, 5-8 skills per phase, and 5-8 high-quality resources per skill. Know exactly what to learn and in what order.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Interview frequency for every skill
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Why each skill matters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Real time estimates
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/20"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Honest Readiness Scores</h3>
              <p className="text-gray-400 mb-4">
                See your actual technical readiness vs interview confidence. No sugar-coating. Know if you're overconfident or underconfident before applying.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Gap detection & warnings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Skill gap reality check
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Compared against real jobs
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/20"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Interview Preparation</h3>
              <p className="text-gray-400 mb-4">
                Practice with AI-generated interview questions. Get real-time evaluation with scores and feedback. Build confidence before the real thing.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Coding, system design, behavioral
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  AI evaluation & feedback
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Track improvement over time
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Know Your True Readiness?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join thousands of developers who stopped guessing and started progressing.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-xl font-bold text-xl hover:bg-gray-200 transition-all hover:scale-105"
          >
            Start Free Today
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="text-sm text-gray-500 mt-6">
            No credit card required · Free tier available
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 PathWise. Built for developers, by developers.</p>
        </div>
      </footer>
    </div>
  );
}

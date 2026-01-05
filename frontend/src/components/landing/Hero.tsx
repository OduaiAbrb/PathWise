"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import {
  ArrowRight,
  Play,
  Zap,
  Target,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const stats = [
  { value: "10,000+", label: "Roadmaps Generated" },
  { value: "85%", label: "Job Landing Rate" },
  { value: "4.9/5", label: "User Rating" },
  { value: "50+", label: "Industries Covered" },
];

const trustedBy = [
  "Google",
  "Meta",
  "Amazon",
  "Microsoft",
  "Netflix",
  "Stripe",
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dark-950">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-500/10 rounded-full blur-[200px]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="info" className="mb-6">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered Career Acceleration
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Transform Any Job Description
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
              Into Your Career Roadmap
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-lg sm:text-xl text-dark-400 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Stop guessing what to learn. Paste any job posting and get a personalized,
            phase-by-phase learning path with curated resources, projects, and AI guidance
            to land your dream role.
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {[
              { icon: Target, text: "Job-Specific Learning" },
              { icon: TrendingUp, text: "Progress Tracking" },
              { icon: CheckCircle2, text: "Skill Gap Analysis" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-dark-300 text-sm"
              >
                <item.icon className="w-4 h-4 text-primary-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/signup">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Generate Your Roadmap Free
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Play className="w-5 h-5" />}
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-dark-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Trusted By */}
          <motion.div
            className="border-t border-dark-800/50 pt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-sm text-dark-500 mb-6">
              Trusted by engineers and hiring managers at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {trustedBy.map((company) => (
                <span
                  key={company}
                  className="text-dark-600 font-semibold text-lg tracking-wide hover:text-dark-400 transition-colors"
                >
                  {company}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-950 to-transparent" />
    </section>
  );
}

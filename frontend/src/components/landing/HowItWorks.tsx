"use client";

import { motion } from "framer-motion";
import { ClipboardPaste, Cpu, Route, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardPaste,
    title: "Paste Your Dream Job",
    description:
      "Copy any job description from LinkedIn, Indeed, or company career pages. Our AI understands all formats and extracts every requirement.",
    color: "primary",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Analyzes Requirements",
    description:
      "In seconds, our AI identifies required skills, tools, and frameworks—including implicit requirements most candidates miss.",
    color: "secondary",
  },
  {
    number: "03",
    icon: Route,
    title: "Get Your Custom Roadmap",
    description:
      "Receive a phase-by-phase learning path with time estimates, curated resources, project ideas, and dependency ordering.",
    color: "accent",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Track & Land the Job",
    description:
      "Follow your roadmap, track progress, get AI assistance, and use our job scanner to apply when you're ready.",
    color: "purple",
  },
];

const colorMap = {
  primary: {
    bg: "bg-primary-500",
    text: "text-primary-400",
    border: "border-primary-500/30",
    glow: "shadow-primary-500/20",
  },
  secondary: {
    bg: "bg-secondary-500",
    text: "text-secondary-400",
    border: "border-secondary-500/30",
    glow: "shadow-secondary-500/20",
  },
  accent: {
    bg: "bg-accent-500",
    text: "text-accent-400",
    border: "border-accent-500/30",
    glow: "shadow-accent-500/20",
  },
  purple: {
    bg: "bg-purple-500",
    text: "text-purple-400",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/20",
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-dark-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How PathWise{" "}
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Works
            </span>
          </motion.h2>
          <motion.p
            className="text-lg text-dark-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            From job posting to job offer in four simple steps
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 opacity-20" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const colors = colorMap[step.color as keyof typeof colorMap];
              return (
                <motion.div
                  key={step.number}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  {/* Card */}
                  <div
                    className={`relative bg-dark-900/80 backdrop-blur-sm border ${colors.border} rounded-2xl p-6 h-full`}
                  >
                    {/* Step number */}
                    <div
                      className={`absolute -top-4 -left-4 w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center shadow-lg ${colors.glow}`}
                    >
                      <span className="text-white font-bold text-sm">
                        {step.number}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="mb-4 pt-2">
                      <step.icon className={`w-8 h-8 ${colors.text}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-dark-400 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow connector - mobile/tablet */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center my-4">
                      <div className={`w-0.5 h-8 ${colors.bg} opacity-30`} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Demo Preview */}
        <motion.div
          className="mt-20 relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative bg-dark-900/50 backdrop-blur-sm border border-dark-800 rounded-3xl p-4 md:p-8 overflow-hidden">
            {/* Mock UI preview */}
            <div className="bg-dark-950 rounded-2xl p-6 border border-dark-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-dark-800 rounded w-2/3" />
                <div className="h-4 bg-dark-800 rounded w-1/2" />
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="h-24 bg-gradient-to-br from-primary-500/20 to-primary-500/5 rounded-xl border border-primary-500/20" />
                  <div className="h-24 bg-gradient-to-br from-secondary-500/20 to-secondary-500/5 rounded-xl border border-secondary-500/20" />
                  <div className="h-24 bg-gradient-to-br from-accent-500/20 to-accent-500/5 rounded-xl border border-accent-500/20" />
                </div>
                <div className="h-32 bg-dark-800/50 rounded-xl mt-4" />
              </div>
            </div>

            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

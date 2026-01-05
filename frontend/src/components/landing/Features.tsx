"use client";

import { motion } from "framer-motion";
import {
  Map,
  Brain,
  BarChart3,
  MessageSquare,
  FileSearch,
  Briefcase,
  BookOpen,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Map,
    title: "AI-Powered Roadmaps",
    description:
      "Paste any job description and get a personalized learning path with phases, timelines, and curated resources tailored to your skill level.",
    color: "from-primary-500 to-primary-600",
  },
  {
    icon: Brain,
    title: "Smart Skill Extraction",
    description:
      "Our AI analyzes job postings to identify required skills, tools, and frameworks—including implicit requirements that aren't explicitly listed.",
    color: "from-secondary-500 to-secondary-600",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Visual dashboard showing completion percentage, streaks, time invested, and milestone celebrations to keep you motivated.",
    color: "from-accent-500 to-accent-600",
  },
  {
    icon: MessageSquare,
    title: "AI Q&A Assistant",
    description:
      "Ask questions specific to your roadmap like 'Why does this role need Kafka?' and get industry-aware, contextual answers.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: FileSearch,
    title: "Resume Gap Analyzer",
    description:
      "Upload your resume to see which skills you have, which are missing, and get specific suggestions to improve your application.",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: Briefcase,
    title: "Job Scanner",
    description:
      "Automatically scan job boards to find positions where you're 70%+ qualified, with alerts for new matches as you learn.",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: BookOpen,
    title: "Curated Resources",
    description:
      "10,000+ quality-scored learning resources including free videos, articles, docs, and courses—no redundant content.",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Users,
    title: "Portfolio Projects",
    description:
      "AI-generated project ideas aligned with job requirements, complete with step-by-step guidance and assessment rubrics.",
    color: "from-emerald-500 to-emerald-600",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
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
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Land Your Dream Job
            </span>
          </motion.h2>
          <motion.p
            className="text-lg text-dark-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            From skill analysis to job matching, PathWise guides your entire
            career transition with AI-powered precision.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative bg-dark-900/50 backdrop-blur-sm border border-dark-800 rounded-2xl p-6 hover:border-dark-700 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-dark-400 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

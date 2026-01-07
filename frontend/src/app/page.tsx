"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Sparkles,
  Target,
  BookOpen,
  Zap,
  Users,
  BarChart3,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  // Simulate skill extraction for demo
  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
    if (value.length > 100) {
      setIsExtracting(true);
      setTimeout(() => {
        const demoSkills = [
          "React",
          "TypeScript",
          "Node.js",
          "PostgreSQL",
          "REST APIs",
          "Git",
        ];
        setExtractedSkills(demoSkills.slice(0, Math.min(6, Math.floor(value.length / 50))));
        setIsExtracting(false);
      }, 800);
    } else {
      setExtractedSkills([]);
    }
  };

  const handleGetStarted = () => {
    if (jobDescription.length > 50) {
      localStorage.setItem("pendingJobDescription", jobDescription);
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 35 C8 35 12 28 16 22 C20 16 16 12 20 8 L24 4 L28 8 L24 12" stroke="#171717" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 38 L18 38 C22 38 24 34 22 30 C20 26 24 22 22 18" stroke="#171717" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <circle cx="10" cy="32" r="3" fill="#171717"/>
              </svg>
              <span className="text-xl font-semibold text-neutral-900">PathWise</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <div className="relative group">
                <button className="nav-link flex items-center gap-1">
                  Product <ChevronDown className="w-4 h-4" />
                </button>
                <div className="dropdown">
                  <Link href="/features" className="dropdown-item">Features</Link>
                  <Link href="/how-it-works" className="dropdown-item">How It Works</Link>
                  <Link href="/pricing" className="dropdown-item">Pricing</Link>
                </div>
              </div>
              <Link href="/about" className="nav-link">About</Link>
              <Link href="/blog" className="nav-link">Resources</Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="nav-link">Sign In</Link>
              <Link href="/login" className="btn-primary text-sm py-2.5 px-5">
                Get Started Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-neutral-100 py-4"
          >
            <div className="container-wide space-y-4">
              <Link href="/features" className="block py-2 nav-link">Features</Link>
              <Link href="/pricing" className="block py-2 nav-link">Pricing</Link>
              <Link href="/about" className="block py-2 nav-link">About</Link>
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <Link href="/login" className="block py-2 nav-link">Sign In</Link>
                <Link href="/login" className="btn-primary w-full justify-center">
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container-tight">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full text-sm text-neutral-600 mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Career Acceleration
            </div>
            <h1 className="heading-1 mb-6 text-balance">
              Paste a Job Description.
              <br />
              <span className="text-neutral-500">Get Your Custom Learning Roadmap.</span>
            </h1>
            <p className="body-large max-w-2xl mx-auto mb-8">
              Stop guessing what to learn. PathWise analyzes job requirements and creates 
              a personalized learning path with curated resources, projects, and milestones.
            </p>
          </motion.div>

          {/* Job Description Input */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div className="card shadow-medium p-6 md:p-8">
              <label className="label">Paste a job description to see the magic</label>
              <textarea
                value={jobDescription}
                onChange={(e) => handleJobDescriptionChange(e.target.value)}
                placeholder="Paste the full job description here... We'll extract the key skills and create your personalized roadmap."
                rows={5}
                className="input resize-none mb-4"
              />

              {/* Extracted Skills Preview */}
              {extractedSkills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4 p-4 bg-neutral-50 rounded-xl"
                >
                  <p className="text-sm font-medium text-neutral-700 mb-3">
                    Key skills detected:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {extractedSkills.map((skill, i) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="badge-primary"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {isExtracting && (
                <div className="mb-4 p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                    Analyzing job description...
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGetStarted}
                  className="btn-primary flex-1 justify-center"
                >
                  Generate My Roadmap Free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a href="#how-it-works" className="btn-secondary justify-center">
                  See How It Works
                </a>
              </div>
            </div>

            <p className="text-center text-sm text-neutral-500 mt-4">
              No credit card required. Start learning in minutes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section bg-neutral-50">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 mb-4">How PathWise Works</h2>
            <p className="body-large">Three simple steps to your personalized learning journey</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: "01",
                icon: Target,
                title: "Paste Your Target Role",
                description: "Copy any job description or describe your dream role. Our AI extracts the exact skills employers want.",
              },
              {
                step: "02",
                icon: Zap,
                title: "Get Your Custom Roadmap",
                description: "Receive a personalized learning path with phases, milestones, and curated resources matched to your level.",
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Track & Achieve",
                description: "Follow your daily tasks, build portfolio projects, and watch your job-readiness score climb.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-900 text-white rounded-2xl mb-6">
                  <item.icon className="w-7 h-7" />
                </div>
                <div className="text-sm font-medium text-neutral-400 mb-2">{item.step}</div>
                <h3 className="heading-3 mb-3">{item.title}</h3>
                <p className="body">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 mb-4">Everything You Need to Land Your Dream Job</h2>
            <p className="body-large">Powerful tools designed for serious career changers</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Job-Readiness Score",
                description: "See exactly how prepared you are with a transparent percentage breakdown of skills, projects, and interview readiness.",
              },
              {
                icon: Zap,
                title: "Daily Next Action",
                description: "No more decision fatigue. Get one focused task each day with estimated time and the best resource to use.",
              },
              {
                icon: BookOpen,
                title: "Curated Resources",
                description: "Hand-picked YouTube videos, courses, and articles. Each resource explains why it's credible and relevant.",
              },
              {
                icon: Sparkles,
                title: "AI Study Buddy",
                description: "Context-aware AI that knows your target role and current phase. Get explanations tailored to your exact needs.",
              },
              {
                icon: Users,
                title: "Portfolio Projects",
                description: "Every phase includes portfolio-ready projects with README templates, resume bullet points, and GitHub structure.",
              },
              {
                icon: BarChart3,
                title: "JD Comparison",
                description: "Save multiple job descriptions and see which skills appear most often. Focus on what actually matters.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card-hover"
              >
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-neutral-700" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="body">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section bg-neutral-50">
        <div className="container-tight">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 mb-4">Simple, Transparent Pricing</h2>
            <p className="body-large">Start free, upgrade when you're ready</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">Free</h3>
                <p className="text-sm text-neutral-500">Perfect to get started</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">$0</span>
                <span className="text-neutral-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["1 active roadmap", "Basic AI chat", "Community resources", "Progress tracking"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-neutral-600">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn-secondary w-full justify-center">
                Get Started
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card border-2 border-neutral-900 relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-neutral-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">Pro</h3>
                <p className="text-sm text-neutral-500">For serious job seekers</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">$19</span>
                <span className="text-neutral-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited roadmaps",
                  "Advanced AI Study Buddy",
                  "JD comparison & analysis",
                  "Portfolio project templates",
                  "Weekly readiness reports",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-neutral-600">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn-primary w-full justify-center">
                Start Pro Trial
              </Link>
            </motion.div>

            {/* Lifetime */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">Lifetime</h3>
                <p className="text-sm text-neutral-500">One-time payment</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">$149</span>
                <span className="text-neutral-500"> once</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Pro",
                  "Lifetime access",
                  "AI mock interviews",
                  "1-on-1 onboarding call",
                  "Early access to features",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-neutral-600">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn-secondary w-full justify-center">
                Get Lifetime Access
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container-tight">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 mb-4">Trusted by Career Changers</h2>
            <p className="body-large">Real results from real users</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote: "PathWise helped me transition from marketing to product management in 4 months. The roadmap was exactly what I needed.",
                name: "Sarah Chen",
                role: "Product Manager at Stripe",
              },
              {
                quote: "The job-readiness score kept me motivated. Seeing my progress go from 23% to 89% made the journey feel achievable.",
                name: "Marcus Johnson",
                role: "Backend Engineer at Shopify",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                <p className="text-lg text-neutral-700 mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                  <p className="text-sm text-neutral-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-neutral-900">
        <div className="container-tight text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-2 text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="body-large text-neutral-400 mb-8">
              Join thousands of career changers who've found their path.
            </p>
            <Link href="/login" className="btn bg-white text-neutral-900 hover:bg-neutral-100 shadow-strong">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-200">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 35 C8 35 12 28 16 22 C20 16 16 12 20 8 L24 4 L28 8 L24 12" stroke="#171717" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 38 L18 38 C22 38 24 34 22 30 C20 26 24 22 22 18" stroke="#171717" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <circle cx="10" cy="32" r="3" fill="#171717"/>
              </svg>
              <span className="font-semibold text-neutral-900">PathWise</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-neutral-500">
              <Link href="/privacy" className="hover:text-neutral-900">Privacy</Link>
              <Link href="/terms" className="hover:text-neutral-900">Terms</Link>
              <Link href="/support" className="hover:text-neutral-900">Support</Link>
            </div>
            <p className="text-sm text-neutral-500">
              © 2024 PathWise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

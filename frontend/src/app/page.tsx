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
  Compass,
  Play,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

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
            <Link href="/" className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 35 C8 35 12 28 16 22 C20 16 16 12 20 8 L24 4 L28 8 L24 12" stroke="#171717" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 38 L18 38 C22 38 24 34 22 30 C20 26 24 22 22 18" stroke="#171717" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <circle cx="10" cy="32" r="3" fill="#171717"/>
              </svg>
              <span className="text-xl font-semibold text-neutral-900">PathWise</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="nav-link">Features</Link>
              <Link href="#how-it-works" className="nav-link">How It Works</Link>
              <Link href="#pricing" className="nav-link">Pricing</Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="nav-link">Sign In</Link>
              <Link href="/login" className="btn-primary text-sm py-2.5 px-5">
                Get Started Free
              </Link>
            </div>

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
            className="md:hidden bg-white border-t border-neutral-100 p-4"
          >
            <div className="flex flex-col gap-4">
              <Link href="#features" className="nav-link">Features</Link>
              <Link href="#how-it-works" className="nav-link">How It Works</Link>
              <Link href="#pricing" className="nav-link">Pricing</Link>
              <hr className="border-neutral-200" />
              <Link href="/login" className="nav-link">Sign In</Link>
              <Link href="/login" className="btn-primary justify-center">
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full text-sm text-neutral-600 mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Career Transformation
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
                Your Dream Job,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-500">
                  Mapped Out.
                </span>
              </h1>
              
              <p className="text-xl text-neutral-600 mb-8 max-w-lg">
                Turn any job description into a step-by-step learning path. 
                Know exactly what to learn, build real projects, and track your progress to job-ready.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleGetStarted}
                  className="btn-primary text-lg py-4 px-8"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link
                  href="/login?discover=true"
                  className="btn-secondary text-lg py-4 px-8"
                >
                  <Compass className="w-5 h-5" />
                  Not Sure? Discover Your Path
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Free to start
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  AI-powered
                </div>
              </div>
            </motion.div>

            {/* Right: JD Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="card p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-sm text-neutral-400">Try it now</span>
                </div>

                <label className="label">Paste a Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => handleJobDescriptionChange(e.target.value)}
                  placeholder="Paste any job description here and watch the magic happen..."
                  className="input min-h-[180px] resize-none mb-4"
                />

                {/* Skill Extraction Preview */}
                {(extractedSkills.length > 0 || isExtracting) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4"
                  >
                    <p className="text-sm text-neutral-500 mb-2">
                      {isExtracting ? "Extracting skills..." : "Skills detected:"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {isExtracting ? (
                        <div className="flex gap-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-6 w-16 bg-neutral-200 rounded-full animate-pulse"
                            />
                          ))}
                        </div>
                      ) : (
                        extractedSkills.map((skill) => (
                          <span key={skill} className="badge-success">
                            {skill}
                          </span>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={handleGetStarted}
                  disabled={jobDescription.length < 50}
                  className="btn-primary w-full justify-center"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate My Roadmap
                </button>

                <p className="text-center text-xs text-neutral-400 mt-3">
                  Or{" "}
                  <Link href="/login?discover=true" className="text-neutral-600 hover:underline">
                    let us help you find your career path
                  </Link>
                </p>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">85%</p>
                    <p className="text-xs text-neutral-500">Land jobs faster</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">10K+</p>
                    <p className="text-xs text-neutral-500">Career changers</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-neutral-50">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 mb-4">How PathWise Works</h2>
            <p className="body-large max-w-2xl mx-auto">
              From job description to job-ready in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Paste Your Target JD",
                description: "Drop in any job description. Our AI extracts the exact skills employers want.",
                icon: Target,
              },
              {
                step: "02",
                title: "Get Your Roadmap",
                description: "Receive a personalized learning path with resources, projects, and milestones.",
                icon: BookOpen,
              },
              {
                step: "03",
                title: "Track & Achieve",
                description: "Follow your roadmap, build portfolio projects, and track your job-readiness score.",
                icon: BarChart3,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="card h-full">
                  <span className="text-5xl font-bold text-neutral-100">{item.step}</span>
                  <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mb-4 -mt-6">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">{item.title}</h3>
                  <p className="text-neutral-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 mb-4">Everything You Need to Succeed</h2>
            <p className="body-large max-w-2xl mx-auto">
              More than a roadmap – a complete career transformation platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "AI Study Buddy",
                description: "Context-aware AI tutor that knows your learning path and answers questions with relevant examples.",
              },
              {
                icon: Target,
                title: "Job-Readiness Score",
                description: "Real-time score showing how prepared you are for your target role based on skills and projects.",
              },
              {
                icon: Zap,
                title: "Next Best Action",
                description: "Never wonder what to do next. Get daily tasks optimized for your progress and schedule.",
              },
              {
                icon: BookOpen,
                title: "Portfolio Projects",
                description: "AI-generated project ideas with problem statements, tech stacks, and resume bullet points.",
              },
              {
                icon: Users,
                title: "Study Groups",
                description: "Join peers learning the same skills. Weekly sessions, accountability, and networking.",
              },
              {
                icon: BarChart3,
                title: "Progress Analytics",
                description: "Track time spent, skills completed, and see your growth over time with detailed insights.",
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
                <p className="text-neutral-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Undecided Users */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="container-wide text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Compass className="w-16 h-16 mx-auto mb-6 text-neutral-400" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Not Sure Which Career Path to Take?
            </h2>
            <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
              Answer a few questions about your interests and work style. 
              We'll recommend the best tech careers for you with salary data and time-to-job estimates.
            </p>
            <Link
              href="/login?discover=true"
              className="btn bg-white text-neutral-900 hover:bg-neutral-100 text-lg py-4 px-8 inline-flex"
            >
              <Compass className="w-5 h-5" />
              Discover Your Career Path
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-neutral-50">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 mb-4">Simple, Transparent Pricing</h2>
            <p className="body-large">Start free, upgrade when you're ready</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                description: "Perfect for getting started",
                features: [
                  "1 active roadmap",
                  "Basic AI chat (10/day)",
                  "Community resources",
                  "Progress tracking",
                ],
                cta: "Get Started",
                popular: false,
              },
              {
                name: "Pro",
                price: "$19",
                period: "/month",
                description: "For serious career changers",
                features: [
                  "Unlimited roadmaps",
                  "Unlimited AI chat",
                  "Portfolio project generator",
                  "Resume scanner & optimizer",
                  "Study groups access",
                  "Priority support",
                ],
                cta: "Start Pro Trial",
                popular: true,
              },
              {
                name: "Lifetime",
                price: "$149",
                period: "one-time",
                description: "Best value for committed learners",
                features: [
                  "Everything in Pro",
                  "Lifetime access",
                  "1-on-1 mentor session",
                  "Mock interview prep",
                  "Certificate of completion",
                  "Early access to features",
                ],
                cta: "Get Lifetime Access",
                popular: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card ${plan.popular ? "ring-2 ring-neutral-900 relative" : ""}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-neutral-900">{plan.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold text-neutral-900">{plan.price}</span>
                  <span className="text-neutral-500">{plan.period}</span>
                </div>
                <p className="text-neutral-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`btn w-full justify-center ${
                    plan.popular ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container-wide text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-2 mb-4">Ready to Transform Your Career?</h2>
            <p className="body-large mb-8 max-w-2xl mx-auto">
              Join thousands of career changers who've found their path with PathWise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="btn-primary text-lg py-4 px-8">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login?discover=true" className="btn-secondary text-lg py-4 px-8">
                <Compass className="w-5 h-5" />
                Discover Your Path
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container-wide">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 35 C8 35 12 28 16 22 C20 16 16 12 20 8 L24 4 L28 8 L24 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 38 L18 38 C22 38 24 34 22 30 C20 26 24 22 22 18" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <circle cx="10" cy="32" r="3" fill="white"/>
                </svg>
                <span className="text-xl font-semibold">PathWise</span>
              </div>
              <p className="text-neutral-400 text-sm">
                Your AI-powered career transformation platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">Roadmaps</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-sm text-neutral-400">
            © {new Date().getFullYear()} PathWise. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

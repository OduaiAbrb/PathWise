"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Github,
  ExternalLink,
  Clock,
  Target,
  CheckCircle2,
  Plus,
  Sparkles,
  FileText,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface Project {
  id: string;
  title: string;
  description: string;
  problemStatement: string;
  skills: string[];
  techStack: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  status: "not_started" | "in_progress" | "completed";
  githubUrl?: string;
  readmeTemplate: string;
  resumeBullets: string[];
  learningOutcomes: string[];
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<"all" | "not_started" | "in_progress" | "completed">("all");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    if (accessToken) {
      fetchProjects();
    }
  }, [accessToken]);

  const fetchProjects = async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl("/api/v1/projects/list"), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      } else {
        // Generate sample projects based on common roadmap skills
        setProjects(getSampleProjects());
      }
    } catch (error) {
      setProjects(getSampleProjects());
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleProjects = (): Project[] => {
    return [
      {
        id: "1",
        title: "RESTful Task Management API",
        description: "Build a complete REST API for managing tasks with authentication, CRUD operations, and proper error handling.",
        problemStatement: "Create a backend API that allows users to manage their tasks. Include user authentication, task categories, due dates, and priority levels. Implement proper validation and error responses.",
        skills: ["REST APIs", "Authentication", "Database Design"],
        techStack: ["Python", "FastAPI", "PostgreSQL", "JWT"],
        difficulty: "intermediate",
        estimatedHours: 15,
        status: "not_started",
        readmeTemplate: `# Task Management API

## Overview
A RESTful API for managing tasks with user authentication.

## Features
- User registration and login with JWT
- CRUD operations for tasks
- Task categories and priorities
- Due date tracking

## Tech Stack
- Python 3.9+
- FastAPI
- PostgreSQL
- SQLAlchemy

## Getting Started
\`\`\`bash
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\`

## API Endpoints
- POST /auth/register
- POST /auth/login
- GET /tasks
- POST /tasks
- PUT /tasks/{id}
- DELETE /tasks/{id}`,
        resumeBullets: [
          "Designed and implemented a RESTful API with 10+ endpoints handling user authentication and task management",
          "Built secure JWT-based authentication system with refresh token rotation",
          "Implemented database schema with SQLAlchemy ORM, achieving 95% test coverage",
        ],
        learningOutcomes: [
          "Understand REST API design principles",
          "Implement JWT authentication",
          "Design relational database schemas",
          "Write comprehensive API tests",
        ],
      },
      {
        id: "2",
        title: "Real-time Chat Application",
        description: "Build a real-time chat app with WebSockets, user presence, and message history.",
        problemStatement: "Create a chat application where users can join rooms, send messages in real-time, see who's online, and view message history. Handle connection drops gracefully.",
        skills: ["WebSockets", "Real-time Systems", "Frontend"],
        techStack: ["React", "Node.js", "Socket.io", "Redis"],
        difficulty: "intermediate",
        estimatedHours: 20,
        status: "not_started",
        readmeTemplate: `# Real-time Chat App

## Overview
A real-time chat application with rooms and presence.

## Features
- Real-time messaging with WebSockets
- Multiple chat rooms
- User presence indicators
- Message history

## Tech Stack
- React + TypeScript
- Node.js + Express
- Socket.io
- Redis for pub/sub`,
        resumeBullets: [
          "Built real-time chat application supporting 100+ concurrent users with WebSocket connections",
          "Implemented Redis pub/sub for horizontal scaling across multiple server instances",
          "Designed responsive UI with React, achieving 90+ Lighthouse performance score",
        ],
        learningOutcomes: [
          "Implement WebSocket communication",
          "Handle real-time state synchronization",
          "Scale real-time applications with Redis",
        ],
      },
      {
        id: "3",
        title: "E-commerce Product Catalog",
        description: "Build a product catalog with search, filtering, pagination, and shopping cart functionality.",
        problemStatement: "Create a product catalog that allows users to browse products, search by name, filter by category and price, add items to cart, and proceed to checkout. Optimize for performance with large datasets.",
        skills: ["Database Queries", "Caching", "Frontend State"],
        techStack: ["Next.js", "PostgreSQL", "Redis", "Stripe"],
        difficulty: "advanced",
        estimatedHours: 25,
        status: "not_started",
        readmeTemplate: `# E-commerce Catalog

## Overview
A performant product catalog with search and cart.

## Features
- Full-text search
- Category and price filters
- Shopping cart with persistence
- Stripe checkout integration

## Tech Stack
- Next.js 14
- PostgreSQL with full-text search
- Redis caching
- Stripe API`,
        resumeBullets: [
          "Developed e-commerce platform handling 10,000+ products with sub-100ms search response times",
          "Implemented Redis caching layer reducing database load by 70%",
          "Integrated Stripe payment processing with webhook handling for order fulfillment",
        ],
        learningOutcomes: [
          "Optimize database queries for large datasets",
          "Implement caching strategies",
          "Integrate payment processing",
          "Handle complex frontend state",
        ],
      },
    ];
  };

  const getRandomProjectTemplate = (): Project => {
    const templates: Project[] = [
      {
        id: Date.now().toString(),
        title: "Real-Time Chat Application",
        description: "Build a full-stack chat app with WebSocket support, user authentication, and message history.",
        problemStatement: "Create a chat application where users can join rooms, send messages in real-time, see typing indicators, and view message history. Include user presence and online status.",
        skills: ["WebSockets", "Real-Time Apps", "Full-Stack Development"],
        techStack: ["React", "Socket.io", "Node.js", "MongoDB"],
        difficulty: "intermediate",
        estimatedHours: 20,
        status: "not_started",
        readmeTemplate: `# Real-Time Chat Application\n\n## Overview\nFull-stack chat with WebSocket support.\n\n## Features\n- Real-time messaging\n- User authentication\n- Chat rooms\n- Typing indicators`,
        resumeBullets: [
          "Built real-time chat application serving 500+ concurrent users using Socket.io",
          "Implemented WebSocket connections reducing message latency to <100ms",
          "Designed MongoDB schema handling 10,000+ messages daily with optimized queries",
        ],
        learningOutcomes: ["WebSocket programming", "Real-time data synchronization", "Chat UX patterns"],
      },
      {
        id: Date.now().toString(),
        title: "E-Commerce Product Dashboard",
        description: "Create an admin dashboard for managing products, orders, and analytics with charts and data visualization.",
        problemStatement: "Build a comprehensive dashboard for e-commerce store owners to manage inventory, track orders, view sales analytics, and generate reports.",
        skills: ["Data Visualization", "Admin Panels", "State Management"],
        techStack: ["React", "TypeScript", "Chart.js", "REST API"],
        difficulty: "intermediate",
        estimatedHours: 16,
        status: "not_started",
        readmeTemplate: `# E-Commerce Dashboard\n\n## Overview\nAdmin panel for e-commerce management.\n\n## Features\n- Product CRUD operations\n- Order tracking\n- Sales analytics\n- Inventory management`,
        resumeBullets: [
          "Developed admin dashboard reducing product management time by 60%",
          "Implemented interactive charts visualizing $50K+ monthly revenue trends",
          "Built inventory system tracking 1,000+ SKUs with low-stock alerts",
        ],
        learningOutcomes: ["Data visualization", "Complex state management", "Admin panel design"],
      },
      {
        id: Date.now().toString(),
        title: "AI-Powered Content Summarizer",
        description: "Build a web app that uses AI to summarize articles, documents, and web pages into concise bullet points.",
        problemStatement: "Create an application that takes long-form content and generates accurate summaries. Support multiple content sources (URL, PDF, text) and adjustable summary lengths.",
        skills: ["AI Integration", "API Design", "Text Processing"],
        techStack: ["Python", "OpenAI API", "FastAPI", "React"],
        difficulty: "advanced",
        estimatedHours: 22,
        status: "not_started",
        readmeTemplate: `# AI Content Summarizer\n\n## Overview\nAI-powered tool for content summarization.\n\n## Features\n- Multi-source input (URL, PDF, text)\n- Adjustable summary length\n- Bullet point generation\n- Key insights extraction`,
        resumeBullets: [
          "Integrated OpenAI GPT-4 API processing 1,000+ documents monthly",
          "Built web scraping pipeline extracting content from 50+ news sources",
          "Achieved 95% user satisfaction with summary accuracy and relevance",
        ],
        learningOutcomes: ["AI API integration", "Text processing", "Prompt engineering"],
      },
      {
        id: Date.now().toString(),
        title: "Task Automation CLI Tool",
        description: "Develop a command-line tool that automates repetitive development tasks like file generation, git workflows, and deployment scripts.",
        problemStatement: "Create a CLI that developers can use to scaffold projects, automate git operations, run tests, and deploy applications with simple commands.",
        skills: ["CLI Development", "DevOps", "Scripting"],
        techStack: ["Python", "Click", "Git", "Docker"],
        difficulty: "intermediate",
        estimatedHours: 14,
        status: "not_started",
        readmeTemplate: `# Task Automation CLI\n\n## Overview\nCLI tool for automating development workflows.\n\n## Features\n- Project scaffolding\n- Git workflow automation\n- Test runners\n- Deployment scripts`,
        resumeBullets: [
          "Created CLI tool reducing project setup time from 2 hours to 5 minutes",
          "Automated git workflows saving developers 10+ hours weekly",
          "Built deployment scripts deploying to AWS with zero-downtime",
        ],
        learningOutcomes: ["CLI design patterns", "Process automation", "Developer tooling"],
      },
      {
        id: Date.now().toString(),
        title: "Fitness Tracker Progressive Web App",
        description: "Build a PWA that tracks workouts, nutrition, and progress with offline support and push notifications.",
        problemStatement: "Create a mobile-first fitness app that works offline, syncs data when online, sends workout reminders, and visualizes progress over time.",
        skills: ["PWA", "Offline-First", "Mobile Development"],
        techStack: ["React", "Service Workers", "IndexedDB", "Push API"],
        difficulty: "advanced",
        estimatedHours: 24,
        status: "not_started",
        readmeTemplate: `# Fitness Tracker PWA\n\n## Overview\nOffline-capable fitness tracking application.\n\n## Features\n- Workout logging\n- Nutrition tracking\n- Progress charts\n- Push notifications\n- Offline support`,
        resumeBullets: [
          "Developed PWA with offline-first architecture serving 2,000+ active users",
          "Implemented Service Workers enabling 100% offline functionality",
          "Built push notification system achieving 40% weekly engagement rate",
        ],
        learningOutcomes: ["PWA architecture", "Offline data sync", "Service Workers"],
      },
      {
        id: Date.now().toString(),
        title: "Code Snippet Manager",
        description: "Create a personal knowledge base for storing, organizing, and sharing code snippets with syntax highlighting and tagging.",
        problemStatement: "Build a tool where developers can save useful code snippets, organize them by language and tags, search quickly, and share collections publicly.",
        skills: ["CRUD Operations", "Search", "Syntax Highlighting"],
        techStack: ["Next.js", "PostgreSQL", "Prism.js", "Tailwind CSS"],
        difficulty: "beginner",
        estimatedHours: 12,
        status: "not_started",
        readmeTemplate: `# Code Snippet Manager\n\n## Overview\nOrganize and share code snippets efficiently.\n\n## Features\n- Snippet CRUD\n- Syntax highlighting\n- Tag organization\n- Full-text search\n- Public sharing`,
        resumeBullets: [
          "Built snippet manager organizing 500+ code examples across 15 languages",
          "Implemented full-text search returning results in <200ms",
          "Designed tag system enabling multi-dimensional snippet categorization",
        ],
        learningOutcomes: ["Database design", "Search implementation", "Code syntax highlighting"],
      },
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  };

  const generateProject = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/projects/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setProjects((prev) => [data.data, ...prev]);
        }
      } else {
        // Generate a random unique project
        const newProject = getRandomProjectTemplate();
        setProjects((prev) => [newProject, ...prev]);
      }
    } catch (error) {
      console.error("Failed to generate project:", error);
      // Still generate a random project on error
      const newProject = getRandomProjectTemplate();
      setProjects((prev) => [newProject, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateProjectStatus = async (projectId: string, status: Project["status"]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status } : p))
    );

    try {
      await fetch(getApiUrl(`/api/v1/projects/${projectId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const updateProjectGithub = async (projectId: string, githubUrl: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, githubUrl } : p))
    );

    try {
      await fetch(getApiUrl(`/api/v1/projects/${projectId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ github_url: githubUrl }),
      });
    } catch (error) {
      console.error("Failed to update GitHub URL:", error);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProjects = projects.filter(
    (p) => filter === "all" || p.status === filter
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-amber-100 text-amber-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Target className="w-5 h-5 text-neutral-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="heading-2 mb-2">Portfolio Projects</h1>
            <p className="body-large">
              Build projects that showcase your skills to employers
            </p>
          </div>
          <button
            onClick={generateProject}
            disabled={isGenerating}
            className="btn-primary"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Project
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6"
      >
        {[
          { value: "all", label: "All" },
          { value: "not_started", label: "Not Started" },
          { value: "in_progress", label: "In Progress" },
          { value: "completed", label: "Completed" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Projects List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-neutral-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
              <div className="h-4 bg-neutral-200 rounded w-2/3 mb-4" />
              <div className="flex gap-2">
                <div className="h-6 bg-neutral-200 rounded w-16" />
                <div className="h-6 bg-neutral-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="space-y-4">
          {filteredProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-lg">{project.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </span>
                      <span className="text-sm text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.estimatedHours}h
                      </span>
                    </div>
                  </div>
                </div>
                {getStatusIcon(project.status)}
              </div>

              <p className="text-neutral-600 mb-4">{project.description}</p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(project.techStack || []).map((tech) => (
                  <span key={tech} className="badge-neutral text-xs">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Expandable Details */}
              <button
                onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
              >
                {expandedProject === project.id ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    View Problem Statement, README & Resume Bullets
                  </>
                )}
              </button>

              {expandedProject === project.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 mb-4"
                >
                  {/* Problem Statement */}
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <h4 className="font-medium text-neutral-900 mb-2">Problem Statement</h4>
                    <p className="text-sm text-neutral-600">{project.problemStatement}</p>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <h4 className="font-medium text-neutral-900 mb-2">What You'll Learn</h4>
                    <ul className="space-y-1">
                      {(project.learningOutcomes || []).map((outcome, i) => (
                        <li key={i} className="text-sm text-neutral-600 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resume Bullets */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-neutral-900">Resume Bullet Points</h4>
                      <button
                        onClick={() => copyToClipboard((project.resumeBullets || []).join("\n• "), `resume-${project.id}`)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {copiedId === `resume-${project.id}` ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy All
                          </>
                        )}
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {(project.resumeBullets || []).map((bullet, i) => (
                        <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* README Template */}
                  <div className="p-4 bg-neutral-900 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">README Template</h4>
                      <button
                        onClick={() => copyToClipboard(project.readmeTemplate, `readme-${project.id}`)}
                        className="text-sm text-neutral-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedId === `readme-${project.id}` ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-sm text-neutral-300 overflow-x-auto whitespace-pre-wrap font-mono">
                      {project.readmeTemplate}
                    </pre>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-neutral-200">
                <select
                  value={project.status}
                  onChange={(e) => updateProjectStatus(project.id, e.target.value as Project["status"])}
                  className="text-sm bg-neutral-100 border-0 rounded-lg px-3 py-2 focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-sm py-2"
                  >
                    <Github className="w-4 h-4" />
                    View Code
                  </a>
                )}

                <button
                  onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                  className="btn-ghost text-sm py-2 ml-auto"
                >
                  <FileText className="w-4 h-4" />
                  {expandedProject === project.id ? "Hide" : "Details"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Code className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No projects yet
          </h3>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            Generate AI-powered project ideas based on your learning roadmap
          </p>
          <button
            onClick={generateProject}
            disabled={isGenerating}
            className="btn-primary inline-flex"
          >
            <Sparkles className="w-5 h-5" />
            Generate Your First Project
          </button>
        </motion.div>
      )}

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 bg-neutral-50 rounded-2xl"
      >
        <h3 className="font-semibold text-neutral-900 mb-4">Portfolio Tips</h3>
        <ul className="space-y-3 text-sm text-neutral-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            Each project includes a README template with sections employers look for
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            Resume bullet points are generated to help you describe your work with impact
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            Projects are matched to skills from your target job descriptions
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            Complete 2-3 projects to have a strong portfolio for job applications
          </li>
        </ul>
      </motion.div>
    </div>
  );
}

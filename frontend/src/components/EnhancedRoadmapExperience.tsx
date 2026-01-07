"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Save,
  X,
  Plus,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  PlayCircle,
  BarChart3,
  Lightbulb,
  FileText,
  Link,
  Star,
  TrendingUp,
  Award,
  Users,
  BookOpen,
  Code,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Settings,
  Filter,
  Search,
  Download,
  Share2
} from "lucide-react";

interface Skill {
  id: string;
  name: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
  estimatedHours: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  resources: Array<{
    title: string;
    type: "video" | "article" | "course" | "documentation";
    url: string;
    duration: string;
  }>;
  projects: string[];
  learningObjectives: string[];
}

interface Phase {
  id: string;
  name: string;
  description: string;
  estimatedWeeks: number;
  skills: Skill[];
  milestones: string[];
  isExpanded: boolean;
}

interface ProjectSuggestion {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  skillsUsed: string[];
  techStack: string[];
  githubStars?: number;
  realWorldRelevance: number;
}

interface EnhancedRoadmapExperienceProps {
  roadmapId: string;
  jobTitle?: string;
  originalJobDescription?: string;
}

export default function EnhancedRoadmapExperience({
  roadmapId,
  jobTitle = "Full Stack Developer",
  originalJobDescription = ""
}: EnhancedRoadmapExperienceProps) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [showTimelineView, setShowTimelineView] = useState(false);
  const [projectSuggestions, setProjectSuggestions] = useState<ProjectSuggestion[]>([]);
  const [jobDescriptionComparison, setJobDescriptionComparison] = useState<any>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "not_started" | "in_progress" | "completed">("all");

  // Initialize with enhanced mock data
  useEffect(() => {
    const mockPhases: Phase[] = [
      {
        id: "phase-1",
        name: "Foundation & Frontend Mastery",
        description: "Build solid fundamentals in web development and modern frontend technologies",
        estimatedWeeks: 8,
        isExpanded: true,
        milestones: ["Complete first React project", "Deploy live application", "Pass frontend assessment"],
        skills: [
          {
            id: "skill-1",
            name: "Advanced JavaScript",
            description: "Master ES6+, async programming, and modern JavaScript patterns",
            status: "completed",
            estimatedHours: 40,
            difficulty: "intermediate",
            prerequisites: ["Basic JavaScript", "HTML/CSS"],
            resources: [
              {
                title: "JavaScript: The Advanced Concepts",
                type: "course",
                url: "https://www.udemy.com/course/advanced-javascript-concepts/",
                duration: "25 hours"
              }
            ],
            projects: ["Build a weather app", "Create a task manager"],
            learningObjectives: ["Closures", "Promises", "Async/Await", "Prototypes"]
          },
          {
            id: "skill-2",
            name: "React & Modern Frontend",
            description: "Build dynamic user interfaces with React, hooks, and state management",
            status: "in_progress",
            estimatedHours: 50,
            difficulty: "intermediate",
            prerequisites: ["JavaScript", "HTML/CSS"],
            resources: [
              {
                title: "React Complete Guide",
                type: "course",
                url: "https://react.dev/learn",
                duration: "30 hours"
              }
            ],
            projects: ["E-commerce frontend", "Social media dashboard"],
            learningObjectives: ["Components", "Hooks", "State Management", "Routing"]
          }
        ]
      },
      {
        id: "phase-2",
        name: "Backend & Database Development",
        description: "Master server-side development, APIs, and database management",
        estimatedWeeks: 10,
        isExpanded: false,
        milestones: ["Build REST API", "Deploy backend service", "Database optimization"],
        skills: [
          {
            id: "skill-3",
            name: "Node.js & Express",
            description: "Build scalable backend services and RESTful APIs",
            status: "not_started",
            estimatedHours: 45,
            difficulty: "intermediate",
            prerequisites: ["JavaScript", "HTTP basics"],
            resources: [],
            projects: ["API for e-commerce", "Authentication service"],
            learningObjectives: ["Server setup", "Middleware", "Authentication", "Error handling"]
          }
        ]
      }
    ];

    const mockProjects: ProjectSuggestion[] = [
      {
        id: "project-1",
        title: "Full-Stack E-commerce Platform",
        description: "Build a complete e-commerce solution with React frontend, Node.js backend, and payment integration",
        difficulty: "advanced",
        estimatedTime: "4-6 weeks",
        skillsUsed: ["React", "Node.js", "MongoDB", "Payment APIs"],
        techStack: ["React", "Express", "MongoDB", "Stripe", "JWT"],
        githubStars: 1234,
        realWorldRelevance: 95
      },
      {
        id: "project-2",
        title: "Real-Time Chat Application",
        description: "Create a real-time messaging app with Socket.io, user authentication, and file sharing",
        difficulty: "intermediate",
        estimatedTime: "2-3 weeks",
        skillsUsed: ["React", "Socket.io", "Node.js", "MongoDB"],
        techStack: ["React", "Socket.io", "Express", "MongoDB"],
        realWorldRelevance: 88
      }
    ];

    setPhases(mockPhases);
    setProjectSuggestions(mockProjects);
  }, [roadmapId]);

  const togglePhaseExpansion = (phaseId: string) => {
    setPhases(prev => prev.map(phase =>
      phase.id === phaseId ? { ...phase, isExpanded: !phase.isExpanded } : phase
    ));
  };

  const updateSkillStatus = (skillId: string, newStatus: "not_started" | "in_progress" | "completed") => {
    setPhases(prev => prev.map(phase => ({
      ...phase,
      skills: phase.skills.map(skill =>
        skill.id === skillId ? { ...skill, status: newStatus } : skill
      )
    })));
  };

  const startSkillEdit = (skillId: string) => {
    setEditingSkill(skillId);
  };

  const saveSkillEdit = (skillId: string, updatedSkill: Partial<Skill>) => {
    setPhases(prev => prev.map(phase => ({
      ...phase,
      skills: phase.skills.map(skill =>
        skill.id === skillId ? { ...skill, ...updatedSkill } : skill
      )
    })));
    setEditingSkill(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "not_started": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-600 bg-green-50";
      case "intermediate": return "text-yellow-600 bg-yellow-50";
      case "advanced": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const filteredPhases = phases.map(phase => ({
    ...phase,
    skills: phase.skills.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           skill.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterBy === "all" || skill.status === filterBy;
      return matchesSearch && matchesFilter;
    })
  }));

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{jobTitle} Roadmap</h1>
          <p className="text-neutral-600 mt-2">Interactive learning path with real-time progress tracking</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTimelineView(!showTimelineView)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showTimelineView 
                ? "bg-neutral-900 text-white" 
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            {showTimelineView ? "List View" : "Timeline View"}
          </button>
          
          <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors">
            <Share2 className="w-4 h-4 inline mr-2" />
            Share Progress
          </button>
          
          <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors">
            <Download className="w-4 h-4 inline mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search skills, projects, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900"
          >
            <option value="all">All Skills</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Roadmap Phases */}
      <div className="space-y-6">
        {filteredPhases.map((phase, phaseIndex) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: phaseIndex * 0.1 }}
            className="card p-6"
          >
            {/* Phase Header */}
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => togglePhaseExpansion(phase.id)}
            >
              <div className="flex items-center gap-4">
                {phase.isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">{phase.name}</h2>
                  <p className="text-neutral-600 text-sm">{phase.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-500">
                  {phase.estimatedWeeks} weeks • {phase.skills.length} skills
                </span>
                <div className="w-20 h-2 bg-neutral-200 rounded-full">
                  <div 
                    className="h-2 bg-green-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(phase.skills.filter(s => s.status === "completed").length / phase.skills.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Phase Content */}
            <AnimatePresence>
              {phase.isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 space-y-4"
                >
                  {/* Milestones */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Phase Milestones</h3>
                    <ul className="space-y-1">
                      {phase.milestones.map((milestone, idx) => (
                        <li key={idx} className="text-sm text-blue-700 flex items-center gap-2">
                          <Target className="w-3 h-3" />
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills */}
                  <div className="space-y-4">
                    {phase.skills.map((skill) => (
                      <motion.div
                        key={skill.id}
                        layout
                        className="border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <button
                                onClick={() => {
                                  const statusOrder: Array<"not_started" | "in_progress" | "completed"> = 
                                    ["not_started", "in_progress", "completed"];
                                  const currentIndex = statusOrder.indexOf(skill.status);
                                  const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
                                  updateSkillStatus(skill.id, nextStatus);
                                }}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  skill.status === "completed" 
                                    ? "bg-green-500 border-green-500 text-white" 
                                    : skill.status === "in_progress"
                                    ? "bg-blue-500 border-blue-500 text-white"
                                    : "border-neutral-300 hover:border-neutral-400"
                                }`}
                              >
                                {skill.status === "completed" && <CheckCircle className="w-4 h-4" />}
                                {skill.status === "in_progress" && <PlayCircle className="w-4 h-4" />}
                              </button>
                              
                              <h3 className="font-medium text-neutral-900">{skill.name}</h3>
                              
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(skill.difficulty)}`}>
                                {skill.difficulty}
                              </span>
                              
                              <span className="text-xs text-neutral-500">{skill.estimatedHours}h</span>
                            </div>
                            
                            <p className="text-sm text-neutral-600 mb-3">{skill.description}</p>
                            
                            {/* Learning Objectives */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {skill.learningObjectives.map((objective, idx) => (
                                <span key={idx} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                                  {objective}
                                </span>
                              ))}
                            </div>
                            
                            {/* Projects */}
                            {skill.projects.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-neutral-600">
                                <Code className="w-4 h-4" />
                                <span>Projects: {skill.projects.join(", ")}</span>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => startSkillEdit(skill.id)}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Project Suggestions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Recommended Projects
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {projectSuggestions.map((project) => (
            <div key={project.id} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-neutral-900">{project.title}</h3>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">{project.realWorldRelevance}% relevant</span>
                </div>
              </div>
              
              <p className="text-sm text-neutral-600 mb-3">{project.description}</p>
              
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                <span className={`px-2 py-1 rounded ${getDifficultyColor(project.difficulty)}`}>
                  {project.difficulty}
                </span>
                <span>{project.estimatedTime}</span>
                {project.githubStars && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {project.githubStars}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {project.techStack.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

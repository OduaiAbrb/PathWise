"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Trophy,
  Star,
  Certificate,
  Download,
  Share2,
  ExternalLink,
  Code,
  Eye,
  Github,
  Globe,
  Calendar,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Target,
  Zap,
  BookOpen,
  FileText,
  Image,
  Video,
  Plus,
  Edit3,
  Settings,
  Upload,
  X,
  Medal,
  Sparkles
} from "lucide-react";

interface Certification {
  id: string;
  title: string;
  description: string;
  issuer: string;
  dateEarned: Date;
  validUntil?: Date;
  credentialId: string;
  skills: string[];
  level: "beginner" | "intermediate" | "advanced" | "expert";
  verificationUrl?: string;
  badgeUrl: string;
  isVerified: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: "web" | "mobile" | "desktop" | "ai" | "data" | "blockchain";
  status: "completed" | "in-progress" | "planning";
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  dateCreated: Date;
  lastUpdated: Date;
  likes: number;
  views: number;
  featured: boolean;
}

interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
  category: string;
  certifications: string[];
  projectsUsed: string[];
  endorsements: number;
  lastAssessed: Date;
}

interface Portfolio {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  title: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  email: string;
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  achievements: Achievement[];
  isPublic: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateEarned: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: "learning" | "projects" | "community" | "streak" | "skill";
}

export default function CertificationPortfolioSystem() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [activeTab, setActiveTab] = useState<"certifications" | "projects" | "skills" | "achievements">("certifications");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemType, setNewItemType] = useState<"project" | "certification">("project");

  useEffect(() => {
    // Initialize with sample portfolio data
    const samplePortfolio: Portfolio = {
      id: "user-portfolio",
      name: "Alex Johnson",
      bio: "Full-stack developer passionate about creating innovative web applications and learning new technologies. Experienced in React, Node.js, Python, and cloud platforms.",
      avatar: "👨‍💻",
      title: "Senior Full-Stack Developer",
      location: "San Francisco, CA",
      website: "https://alexjohnson.dev",
      linkedin: "https://linkedin.com/in/alexjohnson",
      github: "https://github.com/alexjohnson",
      email: "alex@example.com",
      isPublic: true,
      skills: [
        {
          id: "1",
          name: "React",
          level: 92,
          category: "Frontend",
          certifications: ["react-cert-1"],
          projectsUsed: ["1", "2", "3"],
          endorsements: 24,
          lastAssessed: new Date(2024, 0, 15)
        },
        {
          id: "2",
          name: "Node.js",
          level: 88,
          category: "Backend",
          certifications: ["nodejs-cert-1"],
          projectsUsed: ["1", "2"],
          endorsements: 18,
          lastAssessed: new Date(2024, 0, 10)
        },
        {
          id: "3",
          name: "Python",
          level: 85,
          category: "Backend",
          certifications: ["python-cert-1"],
          projectsUsed: ["4"],
          endorsements: 22,
          lastAssessed: new Date(2024, 1, 5)
        },
        {
          id: "4",
          name: "AWS",
          level: 76,
          category: "Cloud",
          certifications: ["aws-cert-1"],
          projectsUsed: ["1", "2"],
          endorsements: 15,
          lastAssessed: new Date(2024, 1, 1)
        }
      ],
      certifications: [
        {
          id: "react-cert-1",
          title: "React Professional Developer",
          description: "Advanced React certification covering hooks, context, performance optimization, and testing.",
          issuer: "PathWise Academy",
          dateEarned: new Date(2024, 0, 15),
          validUntil: new Date(2026, 0, 15),
          credentialId: "PWA-REACT-2024-001",
          skills: ["React", "JavaScript", "Testing"],
          level: "advanced",
          badgeUrl: "/badges/react-pro.svg",
          isVerified: true,
          verificationUrl: "https://pathwise.com/verify/PWA-REACT-2024-001"
        },
        {
          id: "aws-cert-1",
          title: "AWS Solutions Architect Associate",
          description: "Comprehensive cloud architecture and services certification for AWS platform.",
          issuer: "Amazon Web Services",
          dateEarned: new Date(2023, 11, 20),
          validUntil: new Date(2026, 11, 20),
          credentialId: "AWS-SAA-2023-789",
          skills: ["AWS", "Cloud Architecture", "DevOps"],
          level: "intermediate",
          badgeUrl: "/badges/aws-saa.svg",
          isVerified: true,
          verificationUrl: "https://aws.amazon.com/verification/AWS-SAA-2023-789"
        },
        {
          id: "nodejs-cert-1",
          title: "Node.js Backend Specialist",
          description: "Expert-level Node.js certification covering APIs, databases, authentication, and deployment.",
          issuer: "Node.js Foundation",
          dateEarned: new Date(2024, 1, 10),
          credentialId: "NJS-BS-2024-456",
          skills: ["Node.js", "Express", "MongoDB", "API Development"],
          level: "expert",
          badgeUrl: "/badges/nodejs-expert.svg",
          isVerified: true
        }
      ],
      projects: [
        {
          id: "1",
          title: "E-commerce Platform",
          description: "Full-stack e-commerce solution built with React, Node.js, and AWS. Features include user authentication, payment processing, inventory management, and real-time analytics.",
          technologies: ["React", "Node.js", "MongoDB", "AWS", "Stripe", "Redis"],
          category: "web",
          status: "completed",
          githubUrl: "https://github.com/alexjohnson/ecommerce-platform",
          liveUrl: "https://shop.alexjohnson.dev",
          imageUrl: "/projects/ecommerce-preview.jpg",
          dateCreated: new Date(2023, 10, 1),
          lastUpdated: new Date(2024, 0, 15),
          likes: 127,
          views: 2341,
          featured: true
        },
        {
          id: "2",
          title: "Task Management API",
          description: "RESTful API for task management with team collaboration features, built using Node.js and Express with PostgreSQL database.",
          technologies: ["Node.js", "Express", "PostgreSQL", "JWT", "Docker"],
          category: "web",
          status: "completed",
          githubUrl: "https://github.com/alexjohnson/task-api",
          dateCreated: new Date(2023, 8, 15),
          lastUpdated: new Date(2023, 11, 30),
          likes: 89,
          views: 1456,
          featured: false
        },
        {
          id: "3",
          title: "React Component Library",
          description: "Reusable React component library with TypeScript, Storybook, and automated testing. Published to npm with comprehensive documentation.",
          technologies: ["React", "TypeScript", "Storybook", "Jest", "Rollup"],
          category: "web",
          status: "completed",
          githubUrl: "https://github.com/alexjohnson/react-components",
          liveUrl: "https://components.alexjohnson.dev",
          dateCreated: new Date(2024, 0, 5),
          lastUpdated: new Date(2024, 1, 20),
          likes: 203,
          views: 3127,
          featured: true
        },
        {
          id: "4",
          title: "ML Model Training Dashboard",
          description: "Python-based dashboard for monitoring and managing machine learning model training workflows with real-time metrics visualization.",
          technologies: ["Python", "Flask", "TensorFlow", "PostgreSQL", "Chart.js"],
          category: "ai",
          status: "in-progress",
          githubUrl: "https://github.com/alexjohnson/ml-dashboard",
          dateCreated: new Date(2024, 1, 1),
          lastUpdated: new Date(2024, 1, 25),
          likes: 45,
          views: 672,
          featured: false
        }
      ],
      achievements: [
        {
          id: "1",
          title: "Learning Streak Master",
          description: "Maintained a 100-day learning streak",
          icon: "🔥",
          dateEarned: new Date(2024, 0, 20),
          rarity: "epic",
          category: "streak"
        },
        {
          id: "2",
          title: "Code Contributor",
          description: "Made 50+ open source contributions",
          icon: "🌟",
          dateEarned: new Date(2024, 1, 1),
          rarity: "rare",
          category: "community"
        },
        {
          id: "3",
          title: "Project Pioneer",
          description: "Completed first full-stack project",
          icon: "🚀",
          dateEarned: new Date(2023, 10, 15),
          rarity: "common",
          category: "projects"
        }
      ]
    };

    setPortfolio(samplePortfolio);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "text-yellow-500 bg-yellow-50 border-yellow-200";
      case "epic": return "text-purple-500 bg-purple-50 border-purple-200";
      case "rare": return "text-blue-500 bg-blue-50 border-blue-200";
      case "common": return "text-gray-500 bg-gray-50 border-gray-200";
      default: return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "expert": return "text-red-600 bg-red-100";
      case "advanced": return "text-purple-600 bg-purple-100";
      case "intermediate": return "text-blue-600 bg-blue-100";
      case "beginner": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100";
      case "in-progress": return "text-yellow-600 bg-yellow-100";
      case "planning": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (!portfolio) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Portfolio Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <div className="px-8 pb-6">
          <div className="flex items-end gap-6 -mt-16">
            <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-5xl">
              {portfolio.avatar}
            </div>
            <div className="flex-1 pt-20">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{portfolio.name}</h1>
                  <p className="text-xl text-gray-600">{portfolio.title}</p>
                  <p className="text-gray-500 mt-1">{portfolio.location}</p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? "Save Profile" : "Edit Profile"}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-gray-700 text-lg leading-relaxed max-w-3xl">{portfolio.bio}</p>
            
            <div className="flex items-center gap-6 mt-4">
              {portfolio.website && (
                <a href={portfolio.website} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
              {portfolio.github && (
                <a href={portfolio.github} className="flex items-center gap-2 text-gray-600 hover:text-gray-700">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {portfolio.linkedin && (
                <a href={portfolio.linkedin} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <ExternalLink className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {[
          { id: "certifications", label: "Certifications", icon: Award, count: portfolio.certifications.length },
          { id: "projects", label: "Projects", icon: Code, count: portfolio.projects.length },
          { id: "skills", label: "Skills", icon: Target, count: portfolio.skills.length },
          { id: "achievements", label: "Achievements", icon: Trophy, count: portfolio.achievements.length }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {/* Certifications Tab */}
        {activeTab === "certifications" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Certifications</h2>
              <p className="text-gray-600 text-sm">
                Earn certifications by completing roadmaps, projects, and learning milestones. 
                All certifications are automatically generated and verified by PathWise.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {portfolio.certifications.map((cert) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                        {cert.isVerified && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">by {cert.issuer}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(cert.level)}`}>
                          {cert.level}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {cert.skills.map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Earned: {cert.dateEarned.toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Share2 className="w-4 h-4" />
                          </button>
                          {cert.verificationUrl && (
                            <button className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
              <button
                onClick={() => {
                  setNewItemType("project");
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {portfolio.projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  {project.imageUrl && (
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      <Image className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <div className="flex items-center gap-2">
                        {project.featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {project.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {project.likes}
                        </span>
                      </div>
                      <span className="text-gray-400">
                        {project.lastUpdated.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {portfolio.skills.map((skill) => (
                <div key={skill.id} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                    <span className="text-2xl font-bold text-blue-600">{skill.level}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                    />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{skill.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Projects Used:</span>
                      <span className="font-medium">{skill.projectsUsed.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Endorsements:</span>
                      <span className="font-medium">{skill.endorsements}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Assessed:</span>
                      <span className="font-medium">{skill.lastAssessed.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Achievements & Badges</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {portfolio.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`border-2 rounded-xl p-6 text-center ${getRarityColor(achievement.rarity)}`}
                >
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </span>
                    <span className="text-gray-500">
                      {achievement.dateEarned.toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

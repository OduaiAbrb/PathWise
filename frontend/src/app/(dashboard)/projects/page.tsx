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
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface Project {
  id: string;
  title: string;
  description: string;
  skills: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_hours: number;
  status: "not_started" | "in_progress" | "completed";
  github_url?: string;
  readme_template?: string;
  resume_bullets?: string[];
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<"all" | "not_started" | "in_progress" | "completed">("all");
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    fetchProjects();
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
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
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
        await fetchProjects();
      }
    } catch (error) {
      console.error("Failed to generate project:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateProjectStatus = async (projectId: string, status: Project["status"]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status } : p))
    );

    try {
      await fetch(getApiUrl(`/api/v1/projects/${projectId}/status`), {
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

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
        <div className="grid md:grid-cols-2 gap-6">
          {filteredProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{project.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(project.difficulty)}`}>
                      {project.difficulty}
                    </span>
                  </div>
                </div>
                {getStatusIcon(project.status)}
              </div>

              <p className="text-sm text-neutral-600 mb-4">{project.description}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.skills?.map((skill) => (
                  <span key={skill} className="badge-neutral text-xs">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {project.estimated_hours}h
                </span>
              </div>

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

                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-sm py-2"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}

                <button className="btn-ghost text-sm py-2 ml-auto">
                  <FileText className="w-4 h-4" />
                  README
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
            Resume bullet points are generated to help you describe your work
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            Projects are matched to skills from your target job descriptions
          </li>
        </ul>
      </motion.div>
    </div>
  );
}

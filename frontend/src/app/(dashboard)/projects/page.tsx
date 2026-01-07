"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Plus, Code, Rocket, CheckCircle, Clock, Github } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import toast from "react-hot-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tech_stack: string[];
  status: string;
  completion_percentage: number;
  github_url: string | null;
  created_at: string;
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [skills, setSkills] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [isGenerating, setIsGenerating] = useState(false);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    fetchProjects();
  }, [accessToken]);

  const fetchProjects = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch("/api/v1/projects/list", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const generateProject = async () => {
    if (!skills.trim()) {
      toast.error("Please enter skills to practice");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/v1/projects/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          skills: skills.split(",").map((s) => s.trim()),
          difficulty,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      toast.success("Project generated!");
      setShowGenerator(false);
      setSkills("");
      fetchProjects();
    } catch (error) {
      toast.error("Failed to generate project");
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "in_progress":
        return "text-primary-400";
      default:
        return "text-dark-500";
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner":
        return "success";
      case "intermediate":
        return "warning";
      case "advanced":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Projects</h1>
            <p className="text-dark-400">Build real-world projects to master your skills</p>
          </div>
          <Button onClick={() => setShowGenerator(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Generate Project
          </Button>
        </motion.div>

        {showGenerator && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Generate New Project</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-dark-400 text-sm mb-2 block">
                      Skills to Practice (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="React, Node.js, MongoDB"
                      className="w-full bg-dark-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-dark-400 text-sm mb-2 block">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-dark-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={generateProject} disabled={isGenerating}>
                      <Rocket className="w-4 h-4 mr-2" />
                      {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowGenerator(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-dark-900/50 border-dark-800 h-full hover:border-primary-500/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">{project.title}</h3>
                      <p className="text-dark-400 text-sm line-clamp-2">{project.description}</p>
                    </div>
                    <Badge variant={getDifficultyColor(project.difficulty)}>
                      {project.difficulty}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech_stack.slice(0, 3).map((tech, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.tech_stack.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.tech_stack.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-400">Progress</span>
                      <span className="text-white font-medium">{project.completion_percentage}%</span>
                    </div>
                    <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                        style={{ width: `${project.completion_percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {project.status === "completed" ? (
                          <CheckCircle className={`w-4 h-4 ${getStatusColor(project.status)}`} />
                        ) : (
                          <Clock className={`w-4 h-4 ${getStatusColor(project.status)}`} />
                        )}
                        <span className={`text-sm ${getStatusColor(project.status)}`}>
                          {project.status.replace("_", " ")}
                        </span>
                      </div>
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-dark-400 hover:text-white transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {projects.length === 0 && !showGenerator && (
            <div className="col-span-full text-center py-12">
              <Code className="w-16 h-16 text-dark-700 mx-auto mb-4" />
              <p className="text-dark-400 mb-4">No projects yet. Generate your first project!</p>
              <Button onClick={() => setShowGenerator(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Generate Project
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Upload, FileText, Target, Zap, Download, CheckCircle } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import toast from "react-hot-toast";

interface Resume {
  id: string;
  filename: string;
  is_primary: boolean;
  skills_count: number;
  experience_years: number | null;
  created_at: string;
}

export default function ResumeScannerPage() {
  const { data: session } = useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [skillGap, setSkillGap] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    fetchResumes();
  }, [accessToken]);

  const fetchResumes = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch("/api/v1/resume/list", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setResumes(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("is_primary", "true");

    try {
      const response = await fetch("/api/v1/resume/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      toast.success("Resume uploaded successfully!");
      setSelectedResume(data.data.id);
      fetchResumes();
    } catch (error) {
      toast.error("Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeResume = async () => {
    if (!selectedResume) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("resume_id", selectedResume);

    try {
      const response = await fetch("/api/v1/resume/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setAnalysis(data.data);
      toast.success("Resume analyzed!");
    } catch (error) {
      toast.error("Failed to analyze resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateSkillGap = async () => {
    if (!selectedResume || !jobDescription) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("resume_id", selectedResume);
    formData.append("job_description", jobDescription);

    try {
      const response = await fetch("/api/v1/resume/skill-gap", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Skill gap analysis failed");

      const data = await response.json();
      setSkillGap(data.data);
      toast.success("Skill gap calculated!");
    } catch (error) {
      toast.error("Failed to calculate skill gap");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Resume Scanner</h1>
          <p className="text-dark-400">Upload your resume and get AI-powered insights</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload & Resume List */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Upload Resume</h3>
                <label className="block">
                  <div className="border-2 border-dashed border-dark-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
                    <Upload className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                    <p className="text-dark-400 text-sm mb-2">
                      {isUploading ? "Uploading..." : "Click to upload PDF"}
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                </label>
              </CardContent>
            </Card>

            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Your Resumes</h3>
                <div className="space-y-2">
                  {resumes.map((resume) => (
                    <button
                      key={resume.id}
                      onClick={() => setSelectedResume(resume.id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedResume === resume.id
                          ? "bg-primary-500/20 border border-primary-500"
                          : "bg-dark-800/50 hover:bg-dark-700"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-primary-400 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{resume.filename}</p>
                          <p className="text-dark-500 text-xs">
                            {resume.skills_count} skills • {resume.experience_years || 0} years
                          </p>
                        </div>
                        {resume.is_primary && (
                          <Badge variant="primary" className="text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Area */}
          <div className="lg:col-span-2 space-y-6">
            {selectedResume && (
              <>
                <Card className="bg-dark-900/50 border-dark-800">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={analyzeResume} disabled={isAnalyzing} className="w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Analyze Resume
                      </Button>
                      <Button variant="secondary" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Optimize for ATS
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {analysis && (
                  <Card className="bg-dark-900/50 border-dark-800">
                    <CardContent className="p-6">
                      <h3 className="text-white font-semibold mb-4">Analysis Results</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-dark-400 text-sm mb-2">Skills Detected</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.skills?.slice(0, 10).map((skill: any, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-dark-400 text-sm mb-2">Strengths</p>
                          <ul className="space-y-1">
                            {analysis.strengths?.map((strength: string, idx: number) => (
                              <li key={idx} className="text-dark-300 text-sm flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-dark-900/50 border-dark-800">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold mb-4">Skill Gap Analysis</h3>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste job description here..."
                      className="w-full h-32 bg-dark-800 text-white rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                    />
                    <Button onClick={calculateSkillGap} disabled={!jobDescription || isAnalyzing}>
                      <Target className="w-4 h-4 mr-2" />
                      Calculate Skill Gap
                    </Button>

                    {skillGap && (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-dark-400">Match Score</span>
                          <span className="text-2xl font-bold text-white">
                            {skillGap.overall_match_percentage}%
                          </span>
                        </div>
                        <div>
                          <p className="text-dark-400 text-sm mb-2">Missing Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {skillGap.missing_skills?.map((skill: string, idx: number) => (
                              <Badge key={idx} variant="accent">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

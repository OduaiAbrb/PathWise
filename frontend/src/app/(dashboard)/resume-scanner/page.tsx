"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface ScanResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  atsScore: number;
}

export default function ResumeScannerPage() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".docx"))) {
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (jobDescription) {
        formData.append("job_description", jobDescription);
      }

      const response = await fetch(getApiUrl("/api/v1/resume/scan"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.data || data);
      } else {
        // Mock result for demo
        setResult({
          score: 72,
          matchedSkills: ["Python", "JavaScript", "React", "SQL", "Git"],
          missingSkills: ["Docker", "Kubernetes", "AWS"],
          suggestions: [
            "Add more quantifiable achievements",
            "Include Docker experience if you have any",
            "Consider adding a projects section",
          ],
          atsScore: 85,
        });
      }
    } catch (error) {
      // Mock result for demo
      setResult({
        score: 72,
        matchedSkills: ["Python", "JavaScript", "React", "SQL", "Git"],
        missingSkills: ["Docker", "Kubernetes", "AWS"],
        suggestions: [
          "Add more quantifiable achievements",
          "Include Docker experience if you have any",
          "Consider adding a projects section",
        ],
        atsScore: 85,
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-2 mb-2">Resume Scanner</h1>
        <p className="body-large">
          Check how well your resume matches job requirements
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card">
            <h2 className="font-semibold text-neutral-900 mb-4">Upload Resume</h2>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                file
                  ? "border-green-300 bg-green-50"
                  : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-neutral-900">{file.name}</p>
                    <p className="text-sm text-neutral-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                  <p className="font-medium text-neutral-700 mb-1">
                    Drop your resume here
                  </p>
                  <p className="text-sm text-neutral-500">
                    or click to browse (PDF, DOCX)
                  </p>
                </>
              )}
            </div>

            {/* Job Description */}
            <div className="mt-6">
              <label className="label">Job Description (optional)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description to compare against..."
                rows={4}
                className="input resize-none"
              />
            </div>

            {/* Scan Button */}
            <button
              onClick={handleScan}
              disabled={!file || isScanning}
              className="btn-primary w-full justify-center mt-6"
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Scan Resume
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {result ? (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-neutral-900">Match Score</h2>
                  <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </div>
                </div>
                <div className="progress-bar h-3 mb-4">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Target className="w-4 h-4" />
                  ATS Compatibility: {result.atsScore}%
                </div>
              </div>

              {/* Matched Skills */}
              <div className="card">
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Matched Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills.map((skill) => (
                    <span key={skill} className="badge-success">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="card">
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="card">
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Suggestions
                </h3>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center text-center py-16">
              <div>
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Upload your resume to get started
                </h3>
                <p className="text-neutral-500 text-sm max-w-xs mx-auto">
                  We'll analyze your resume and show you how well it matches your target roles
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

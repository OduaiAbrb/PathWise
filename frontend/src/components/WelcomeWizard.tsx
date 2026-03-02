"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";
import {
    Sparkles,
    FileText,
    Upload,
    ArrowRight,
    Target,
    Clock,
    Brain,
    Rocket,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Briefcase,
    Zap,
} from "lucide-react";

interface WelcomeWizardProps {
    onComplete: () => void;
}

export default function WelcomeWizard({ onComplete }: WelcomeWizardProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const accessToken = (session as { accessToken?: string })?.accessToken;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(0);
    const [jdText, setJdText] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");

    const userName = session?.user?.name?.split(" ")[0] || "there";

    const handleGenerateRoadmap = async () => {
        if (!jdText.trim()) {
            setError("Please paste a job description first");
            return;
        }
        if (!accessToken) {
            setError("Please sign in to continue");
            return;
        }

        setIsGenerating(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("job_description", jdText);
            formData.append("skill_level", "beginner");
            formData.append("industry", "technology");
            if (resumeFile) {
                formData.append("resume", resumeFile);
            }

            const response = await fetch(getApiUrl("/api/v1/roadmaps/generate"), {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.detail || "Failed to generate roadmap");
            }

            const data = await response.json();
            // Move to success step
            setStep(3);

            // After 2.5 seconds, redirect to dashboard
            setTimeout(() => {
                onComplete();
            }, 2500);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const steps = [
        // Step 0: Welcome
        <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="text-center max-w-2xl mx-auto"
        >
            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-8"
            >
                <Rocket className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-5xl font-black text-black mb-4">
                Welcome, {userName}! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-3">
                PathWise turns any job description into a <strong>personalized learning roadmap</strong>.
            </p>
            <p className="text-lg text-gray-500 mb-10">
                No generic courses. No guessing. Just the fastest path to your dream job.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
                {[
                    { icon: FileText, label: "Paste a JD", time: "30 sec" },
                    { icon: Brain, label: "AI analyzes", time: "~1 min" },
                    { icon: Target, label: "Start learning", time: "Now" },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.15 }}
                        className="text-center"
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <item.icon className="w-6 h-6 text-black" />
                        </div>
                        <p className="text-sm font-bold text-black">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                    </motion.div>
                ))}
            </div>

            <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(1)}
                className="px-10 py-5 bg-black text-white font-black text-xl rounded-2xl hover:shadow-2xl transition-all inline-flex items-center gap-3 group"
            >
                Let&apos;s Go
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>
        </motion.div>,

        // Step 1: Paste Job Description
        <motion.div
            key="paste-jd"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="max-w-3xl mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-black text-black mb-2">
                    Paste your dream job description
                </h2>
                <p className="text-gray-600">
                    Find a job posting on LinkedIn, Indeed, or anywhere — copy-paste the description below.
                </p>
            </div>

            <div className="relative">
                <textarea
                    value={jdText}
                    onChange={(e) => { setJdText(e.target.value); setError(""); }}
                    placeholder={`e.g. "We're looking for a Frontend Developer with experience in React, TypeScript, and Node.js. You'll build user interfaces, collaborate with designers, and optimize performance..."`}
                    className="w-full h-64 p-6 bg-white border-4 border-black rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-black/20 resize-none text-lg"
                />
                <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                    {jdText.length} characters
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-3 text-red-600"
                >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </motion.div>
            )}

            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setStep(0)}
                    className="px-6 py-3 text-gray-500 font-semibold hover:text-black transition-colors"
                >
                    ← Back
                </button>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                        if (!jdText.trim()) {
                            setError("Please paste a job description");
                            return;
                        }
                        setStep(2);
                    }}
                    className="px-8 py-4 bg-black text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
                >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                </motion.button>
            </div>
        </motion.div>,

        // Step 2: Optional Resume + Generate
        <motion.div
            key="resume-generate"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="max-w-3xl mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-black text-black mb-2">
                    {resumeFile ? "Resume attached! 📎" : "Upload your resume (optional)"}
                </h2>
                <p className="text-gray-600">
                    Uploading your resume lets AI identify gaps more accurately. Skip if you don&apos;t have one ready.
                </p>
            </div>

            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-gray-300 hover:border-black rounded-2xl p-10 text-center cursor-pointer transition-colors group"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files?.[0]) setResumeFile(e.target.files[0]);
                    }}
                />
                {resumeFile ? (
                    <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <p className="text-lg font-bold text-black">{resumeFile.name}</p>
                    </div>
                ) : (
                    <>
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-black transition-colors" />
                        <p className="text-gray-500 group-hover:text-black transition-colors font-medium">
                            Click to upload PDF or DOCX
                        </p>
                    </>
                )}
            </div>

            {/* Job Description Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Your Job Description</p>
                <p className="text-sm text-gray-700 line-clamp-3">{jdText}</p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-3 text-red-600"
                >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </motion.div>
            )}

            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 text-gray-500 font-semibold hover:text-black transition-colors"
                >
                    ← Back
                </button>
                <motion.button
                    whileHover={!isGenerating ? { scale: 1.05, y: -2 } : {}}
                    whileTap={!isGenerating ? { scale: 0.95 } : {}}
                    onClick={handleGenerateRoadmap}
                    disabled={isGenerating}
                    className={`px-10 py-5 font-black text-xl rounded-2xl transition-all flex items-center gap-3 ${isGenerating
                            ? "bg-gray-400 text-white cursor-wait"
                            : "bg-black text-white hover:shadow-2xl"
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            AI is building your roadmap...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6" />
                            Generate My Roadmap
                        </>
                    )}
                </motion.button>
            </div>
        </motion.div>,

        // Step 3: Success
        <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg mx-auto"
        >
            <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5 }}
                className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-8"
            >
                <CheckCircle2 className="w-14 h-14 text-white" />
            </motion.div>
            <h2 className="text-5xl font-black text-black mb-4">You&apos;re all set! 🚀</h2>
            <p className="text-xl text-gray-600 mb-4">
                Your personalized roadmap is ready. Let&apos;s start your first skill.
            </p>
            <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-gray-400 flex items-center justify-center gap-2"
            >
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading your dashboard...
            </motion.div>
        </motion.div>,
    ];

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            {/* Progress indicator */}
            {step < 3 && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
                    <motion.div
                        animate={{ width: `${((step + 1) / 3) * 100}%` }}
                        className="h-full bg-black"
                        transition={{ type: "spring", stiffness: 100 }}
                    />
                </div>
            )}

            <AnimatePresence mode="wait">
                {steps[step]}
            </AnimatePresence>
        </div>
    );
}

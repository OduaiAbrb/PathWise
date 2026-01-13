"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Brain,
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Volume2,
  Settings,
  X,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface InterviewQuestion {
  id: string;
  question: string;
  category: "behavioral" | "technical" | "situational";
  timeLimit: number;
  tips: string[];
}

interface InterviewFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
}

const MOCK_QUESTIONS: InterviewQuestion[] = [
  {
    id: "1",
    question: "Tell me about yourself and your background in software development.",
    category: "behavioral",
    timeLimit: 120,
    tips: ["Keep it under 2 minutes", "Focus on relevant experience", "End with why you're interested in this role"],
  },
  {
    id: "2",
    question: "Describe a challenging bug you encountered and how you solved it.",
    category: "technical",
    timeLimit: 180,
    tips: ["Use the STAR method", "Be specific about technologies", "Explain your debugging process"],
  },
  {
    id: "3",
    question: "How would you design a URL shortening service like bit.ly?",
    category: "technical",
    timeLimit: 300,
    tips: ["Start with requirements", "Discuss trade-offs", "Consider scalability"],
  },
  {
    id: "4",
    question: "Tell me about a time you had to work with a difficult team member.",
    category: "situational",
    timeLimit: 180,
    tips: ["Focus on the resolution", "Show empathy", "Highlight what you learned"],
  },
];

export default function VideoInterviewPage() {
  const { data: session } = useSession();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [phase, setPhase] = useState<"setup" | "practice" | "answering" | "feedback">("setup");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  // Request camera/mic access
  const setupMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setCameraEnabled(true);
      setMicEnabled(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Failed to access camera/mic:", error);
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setCameraEnabled(!cameraEnabled);
    }
  };

  // Toggle microphone
  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  // Start practice session
  const startPractice = () => {
    setPhase("practice");
    setCurrentQuestion(MOCK_QUESTIONS[0]);
    setQuestionIndex(0);
  };

  // Start answering
  const startAnswering = () => {
    if (!currentQuestion) return;
    
    setPhase("answering");
    setTimeRemaining(currentQuestion.timeLimit);
    setIsRecording(true);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopAnswering();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Stop answering
  const stopAnswering = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Generate mock feedback
    setFeedback({
      score: 70 + Math.floor(Math.random() * 20),
      strengths: [
        "Good eye contact with camera",
        "Clear articulation of the problem",
        "Showed structured thinking",
      ],
      improvements: [
        "Consider using more specific examples",
        "Try to be more concise - aim for 80% of time limit",
        "Add more quantifiable metrics to your answer",
      ],
      sampleAnswer: "A strong answer would include: specific context, your actions, measurable results, and what you learned...",
    });
    
    setPhase("feedback");
  };

  // Next question
  const nextQuestion = () => {
    const nextIndex = questionIndex + 1;
    if (nextIndex < MOCK_QUESTIONS.length) {
      setQuestionIndex(nextIndex);
      setCurrentQuestion(MOCK_QUESTIONS[nextIndex]);
      setFeedback(null);
      setPhase("practice");
    } else {
      // End of interview
      setPhase("setup");
      setCurrentQuestion(null);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Video className="w-8 h-8 text-neutral-900" />
          <h1 className="text-3xl font-bold text-neutral-900">Mock Video Interview</h1>
        </div>
        <p className="text-neutral-600">
          Practice answering interview questions with AI feedback on your delivery and content.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Preview */}
        <div className="lg:col-span-2">
          <div className="bg-neutral-900 rounded-2xl overflow-hidden aspect-video relative">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!cameraEnabled ? "hidden" : ""}`}
              />
            ) : null}
            
            {!cameraEnabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
                  <p className="text-neutral-400">Camera is off</p>
                </div>
              </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-full">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording</span>
              </div>
            )}

            {/* Timer */}
            {phase === "answering" && (
              <div className={`absolute top-4 right-4 px-4 py-2 rounded-xl font-mono text-xl font-bold ${
                timeRemaining <= 30 ? "bg-red-600 text-white" : "bg-white text-neutral-900"
              }`}>
                <Clock className="w-5 h-5 inline mr-2" />
                {formatTime(timeRemaining)}
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full transition-colors ${
                  cameraEnabled ? "bg-white text-neutral-900" : "bg-red-600 text-white"
                }`}
              >
                {cameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
              <button
                onClick={toggleMic}
                className={`p-3 rounded-full transition-colors ${
                  micEnabled ? "bg-white text-neutral-900" : "bg-red-600 text-white"
                }`}
              >
                {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              {phase === "practice" && (
                <button
                  onClick={startAnswering}
                  className="px-6 py-3 bg-green-600 text-white rounded-full font-medium flex items-center gap-2 hover:bg-green-700"
                >
                  <Play className="w-5 h-5" />
                  Start Answer
                </button>
              )}
              {phase === "answering" && (
                <button
                  onClick={stopAnswering}
                  className="px-6 py-3 bg-red-600 text-white rounded-full font-medium flex items-center gap-2 hover:bg-red-700"
                >
                  <Pause className="w-5 h-5" />
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Setup Phase */}
          {phase === "setup" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border-2 border-neutral-200 rounded-2xl p-6"
            >
              <h2 className="font-semibold text-neutral-900 mb-4">Get Ready</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  {cameraEnabled ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <span>Camera access</span>
                </div>
                <div className="flex items-center gap-3">
                  {micEnabled ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <span>Microphone access</span>
                </div>
              </div>

              {!stream ? (
                <button
                  onClick={setupMedia}
                  className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-neutral-800"
                >
                  Enable Camera & Mic
                </button>
              ) : (
                <button
                  onClick={startPractice}
                  className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Practice Interview
                </button>
              )}

              <p className="text-xs text-neutral-500 mt-4 text-center">
                Your video is not stored. All processing happens locally.
              </p>
            </motion.div>
          )}

          {/* Question Display */}
          {(phase === "practice" || phase === "answering") && currentQuestion && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border-2 border-neutral-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentQuestion.category === "behavioral" ? "bg-blue-100 text-blue-700" :
                  currentQuestion.category === "technical" ? "bg-purple-100 text-purple-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {currentQuestion.category}
                </span>
                <span className="text-sm text-neutral-500">
                  Question {questionIndex + 1}/{MOCK_QUESTIONS.length}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {currentQuestion.question}
              </h3>

              <div className="bg-neutral-50 rounded-xl p-4">
                <h4 className="font-medium text-neutral-700 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Tips
                </h4>
                <ul className="space-y-1 text-sm text-neutral-600">
                  {currentQuestion.tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
                <Clock className="w-4 h-4" />
                <span>Time limit: {formatTime(currentQuestion.timeLimit)}</span>
              </div>
            </motion.div>
          )}

          {/* Feedback Display */}
          {phase === "feedback" && feedback && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border-2 border-neutral-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-900">AI Feedback</h2>
                <div className={`text-2xl font-bold ${
                  feedback.score >= 80 ? "text-green-600" :
                  feedback.score >= 60 ? "text-amber-600" : "text-red-600"
                }`}>
                  {feedback.score}%
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">✓ Strengths</h4>
                  <ul className="space-y-1 text-sm">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-neutral-600">• {s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-amber-700 mb-2">→ Improvements</h4>
                  <ul className="space-y-1 text-sm">
                    {feedback.improvements.map((s, i) => (
                      <li key={i} className="text-neutral-600">• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setFeedback(null);
                    setPhase("practice");
                  }}
                  className="flex-1 py-2 border-2 border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </button>
                <button
                  onClick={nextQuestion}
                  className="flex-1 py-2 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 flex items-center justify-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

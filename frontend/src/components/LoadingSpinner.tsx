"use client";

import { motion } from "framer-motion";
import { Loader2, Sparkles, Target, Code, Brain } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  type?: "default" | "generating" | "analyzing" | "learning";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const loadingTexts = {
  default: "Loading...",
  generating: "Generating your roadmap...",
  analyzing: "Analyzing your progress...", 
  learning: "Preparing learning materials...",
};

const icons = {
  default: Loader2,
  generating: Sparkles,
  analyzing: Target,
  learning: Brain,
};

export default function LoadingSpinner({ 
  size = "md", 
  text,
  type = "default" 
}: LoadingSpinnerProps) {
  const IconComponent = icons[type];
  const displayText = text || loadingTexts[type];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizeClasses[size]} text-blue-600`}
      >
        <IconComponent className="w-full h-full" />
      </motion.div>
      
      {displayText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-sm font-medium text-slate-600"
        >
          {displayText}
        </motion.p>
      )}
    </div>
  );
}

export function PageLoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <LoadingSpinner size="xl" text={text} type="default" />
    </div>
  );
}

export function CardLoadingSkeleton() {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function FormLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  );
}

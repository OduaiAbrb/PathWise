"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className = "", 
  variant = "rectangular",
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = "bg-neutral-200 animate-pulse";
  
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
    card: "rounded-2xl",
  };

  const style: React.CSSProperties = {
    width: width || "100%",
    height: height || (variant === "text" ? "1rem" : "auto"),
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses.text} ${className}`}
            style={{ 
              ...style, 
              width: i === lines - 1 ? "75%" : "100%" 
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton patterns
export function SkeletonCard() {
  return (
    <div className="border border-neutral-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  );
}

export function SkeletonRoadmap() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={300} />
        </div>
        <Skeleton variant="rectangular" width={120} height={40} />
      </div>
      
      {/* Progress bar */}
      <Skeleton variant="rectangular" height={8} className="rounded-full" />
      
      {/* Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Timeline */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1 space-y-1">
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="50%" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-4">
          <Skeleton variant="card" height={200} />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton variant="card" height={100} />
            <Skeleton variant="card" height={100} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-black p-6 rounded-none">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton variant="text" width={250} height={36} className="bg-neutral-700" />
            <Skeleton variant="text" width={180} className="bg-neutral-700" />
          </div>
          <div className="flex gap-3">
            <Skeleton variant="rectangular" width={140} height={44} className="bg-neutral-700" />
            <Skeleton variant="rectangular" width={140} height={44} className="bg-neutral-700" />
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-2 border-black p-6">
            <Skeleton variant="text" width={80} height={48} />
            <Skeleton variant="text" width={100} className="mt-2" />
          </div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
        <div className="lg:col-span-2">
          <Skeleton variant="card" height={400} />
        </div>
        <div className="space-y-4">
          <Skeleton variant="card" height={180} />
          <Skeleton variant="card" height={180} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-neutral-200 rounded-xl">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </div>
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      ))}
    </div>
  );
}

// Loading overlay with step progress
interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 border-4 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-8"
        />
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: index <= currentStep ? 1 : 0.3,
                x: 0 
              }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 ${
                index < currentStep ? "text-green-600" :
                index === currentStep ? "text-black font-semibold" :
                "text-neutral-400"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                index < currentStep ? "bg-green-600 text-white" :
                index === currentStep ? "bg-black text-white" :
                "bg-neutral-200"
              }`}>
                {index < currentStep ? "✓" : index + 1}
              </div>
              <span>{step}</span>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8">
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-black rounded-full"
            />
          </div>
          <p className="text-sm text-neutral-500 mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
}

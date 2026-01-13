"use client";

import dynamic from "next/dynamic";
import { SkeletonCard, SkeletonList } from "@/components/ui/Skeleton";

// Lazy load heavy components with loading skeletons
export const LazyPersonalAIMentor = dynamic(
  () => import("@/components/PersonalAIMentor"),
  {
    loading: () => (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="w-40 h-6 bg-neutral-200 rounded animate-pulse" />
            <div className="w-60 h-4 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 h-[500px] animate-pulse" />
      </div>
    ),
    ssr: false,
  }
);

export const LazyRoadmapV2 = dynamic(
  () => import("@/components/RoadmapV2"),
  {
    loading: () => (
      <div className="p-6">
        <SkeletonCard />
      </div>
    ),
    ssr: false,
  }
);

export const LazyRoadmapTimeline = dynamic(
  () => import("@/components/RoadmapTimeline"),
  {
    loading: () => (
      <div className="p-6">
        <SkeletonList count={4} />
      </div>
    ),
    ssr: false,
  }
);

export const LazyPortfolioGenerator = dynamic(
  () => import("@/components/PortfolioGenerator").catch(() => {
    return { default: () => <div>Portfolio Generator not available</div> };
  }),
  {
    loading: () => (
      <div className="max-w-4xl mx-auto p-6">
        <SkeletonCard />
      </div>
    ),
    ssr: false,
  }
);

export const LazyInterviewSimulator = dynamic(
  () => import("@/components/InterviewSimulator").catch(() => {
    return { default: () => <div>Interview Simulator not available</div> };
  }),
  {
    loading: () => (
      <div className="max-w-4xl mx-auto p-6">
        <div className="h-[400px] bg-neutral-100 rounded-2xl animate-pulse" />
      </div>
    ),
    ssr: false,
  }
);

// Export a utility function for lazy loading any component
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  LoadingComponent?: React.ReactNode
) {
  return dynamic(importFn, {
    loading: () => (LoadingComponent || <SkeletonCard />) as React.ReactElement,
    ssr: false,
  });
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Roadmap, Progress, ChatMessage } from "./types";

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Current roadmap
  currentRoadmap: Roadmap | null;
  setCurrentRoadmap: (roadmap: Roadmap | null) => void;

  // Progress tracking
  progress: Progress[];
  setProgress: (progress: Progress[]) => void;
  updateSkillProgress: (skillId: string, status: Progress["status"]) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;

  // UI state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Onboarding
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),

      // Current roadmap
      currentRoadmap: null,
      setCurrentRoadmap: (roadmap) => set({ currentRoadmap: roadmap }),

      // Progress tracking
      progress: [],
      setProgress: (progress) => set({ progress }),
      updateSkillProgress: (skillId, status) =>
        set((state) => ({
          progress: state.progress.map((p) =>
            p.skillId === skillId ? { ...p, status } : p
          ),
        })),

      // Chat
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      clearChatMessages: () => set({ chatMessages: [] }),

      // UI state
      isSidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // Onboarding
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (completed) =>
        set({ hasCompletedOnboarding: completed }),
    }),
    {
      name: "pathwise-storage",
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);

"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

const defaultShortcuts: ShortcutConfig[] = [
  { key: "d", ctrl: true, action: () => {}, description: "Go to Dashboard" },
  { key: "r", ctrl: true, action: () => {}, description: "Go to Roadmap" },
  { key: "p", ctrl: true, action: () => {}, description: "Go to Projects" },
  { key: "m", ctrl: true, action: () => {}, description: "Open AI Mentor" },
  { key: "?", shift: true, action: () => {}, description: "Show keyboard shortcuts" },
];

export function useKeyboardShortcuts(customShortcuts?: ShortcutConfig[]) {
  const router = useRouter();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement)?.isContentEditable
    ) {
      return;
    }

    const shortcuts = customShortcuts || [
      { key: "d", ctrl: true, action: () => router.push("/dashboard"), description: "Dashboard" },
      { key: "r", ctrl: true, action: () => router.push("/roadmap"), description: "Roadmap" },
      { key: "p", ctrl: true, action: () => router.push("/projects"), description: "Projects" },
      { key: "m", ctrl: true, action: () => router.push("/study-buddy"), description: "AI Mentor" },
      { key: "g", ctrl: true, action: () => router.push("/groups"), description: "Study Groups" },
      { key: "j", action: () => navigateList("next"), description: "Next item" },
      { key: "k", action: () => navigateList("prev"), description: "Previous item" },
      { key: "Enter", action: () => activateCurrentItem(), description: "Select item" },
      { key: "Escape", action: () => closeModal(), description: "Close modal" },
    ];

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [router, customShortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Helper functions for list navigation
function navigateList(direction: "next" | "prev") {
  const focusableItems = document.querySelectorAll('[data-keyboard-nav="true"]');
  const currentIndex = Array.from(focusableItems).findIndex(
    (item) => item === document.activeElement
  );

  let nextIndex: number;
  if (direction === "next") {
    nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
  } else {
    nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
  }

  (focusableItems[nextIndex] as HTMLElement)?.focus();
}

function activateCurrentItem() {
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement?.hasAttribute("data-keyboard-nav")) {
    activeElement.click();
  }
}

function closeModal() {
  const closeButton = document.querySelector('[data-modal-close="true"]') as HTMLElement;
  closeButton?.click();
}

// Keyboard shortcuts help modal content
export const keyboardShortcutsHelp = [
  { category: "Navigation", shortcuts: [
    { keys: ["Ctrl", "D"], description: "Go to Dashboard" },
    { keys: ["Ctrl", "R"], description: "Go to Roadmap" },
    { keys: ["Ctrl", "P"], description: "Go to Projects" },
    { keys: ["Ctrl", "M"], description: "Open AI Mentor" },
    { keys: ["Ctrl", "G"], description: "Study Groups" },
  ]},
  { category: "Lists", shortcuts: [
    { keys: ["J"], description: "Next item" },
    { keys: ["K"], description: "Previous item" },
    { keys: ["Enter"], description: "Select/activate item" },
  ]},
  { category: "General", shortcuts: [
    { keys: ["Esc"], description: "Close modal/panel" },
    { keys: ["?"], description: "Show this help" },
  ]},
];

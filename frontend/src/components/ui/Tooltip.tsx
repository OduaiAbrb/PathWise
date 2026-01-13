"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  children: ReactNode;
  content: string;
  shortcut?: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export default function Tooltip({
  children,
  content,
  shortcut,
  position = "top",
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-neutral-900",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-neutral-900",
    left: "left-full top-1/2 -translate-y-1/2 border-l-neutral-900",
    right: "right-full top-1/2 -translate-y-1/2 border-r-neutral-900",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-50 ${positionClasses[position]}`}
          >
            <div className="bg-neutral-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-2">
              <span>{content}</span>
              {shortcut && (
                <kbd className="px-1.5 py-0.5 bg-neutral-700 rounded text-[10px] font-mono">
                  {shortcut}
                </kbd>
              )}
            </div>
            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick Action Button with built-in tooltip
interface QuickActionProps {
  icon: ReactNode;
  label: string;
  description: string;
  shortcut?: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
}

export function QuickAction({
  icon,
  label,
  description,
  shortcut,
  onClick,
  variant = "secondary",
}: QuickActionProps) {
  const variantClasses = {
    primary: "bg-black text-white hover:bg-neutral-800",
    secondary: "bg-white border-2 border-neutral-200 text-neutral-900 hover:border-black",
    ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
  };

  return (
    <Tooltip content={description} shortcut={shortcut}>
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${variantClasses[variant]}`}
        data-keyboard-nav="true"
      >
        {icon}
        <span>{label}</span>
      </button>
    </Tooltip>
  );
}

// Keyboard shortcut badge
export function ShortcutBadge({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <span key={i} className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-xs font-mono text-neutral-600">
            {key}
          </kbd>
          {i < keys.length - 1 && <span className="text-neutral-400 mx-0.5">+</span>}
        </span>
      ))}
    </div>
  );
}

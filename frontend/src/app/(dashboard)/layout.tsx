"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Map,
  Lightbulb,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Brain,
  Users,
  Briefcase,
  MessageSquare,
  Zap,
  Award,
} from "lucide-react";
import NotificationSystem from "@/components/NotificationSystem";

/**
 * Dashboard Layout - Streamlined Navigation
 * 
 * REMOVED weak features:
 * - Resume Scanner (hidden until exceptional)
 * - Mentors (hidden until deeply integrated)
 * - Standalone Scheduler (hidden)
 * - Shallow community features (hidden)
 * 
 * KEPT core features:
 * - Dashboard (Today's Mission)
 * - Roadmap
 * - Projects
 * - AI Mentor (renamed from Study Buddy)
 * - Study Groups (if valuable)
 */

// Streamlined navigation - only essential items
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Today's Mission" },
  { href: "/roadmap/new", label: "Roadmap", icon: Map, description: "Your learning path" },
  { href: "/interview", label: "Interview Prep", icon: MessageSquare, description: "Practice interviews" },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase, description: "Showcase your work" },
  { href: "/study-buddy", label: "AI Mentor", icon: Brain, description: "Personal guidance" },
];

// Secondary items (collapsed by default)
const secondaryItems = [
  { href: "/partners", label: "Find Partner", icon: Users, description: "Accountability buddy" },
  { href: "/projects", label: "Projects", icon: Lightbulb, description: "Build proof" },
  { href: "/groups", label: "Study Groups", icon: Users, description: "Community" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              data-testid="mobile-menu-btn"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 35 C8 35 12 28 16 22 C20 16 16 12 20 8 L24 4 L28 8 L24 12" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 38 L18 38 C22 38 24 34 22 30 C20 26 24 22 22 18" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <circle cx="10" cy="32" r="3" fill="#0f172a"/>
              </svg>
              <span className="text-lg font-bold text-slate-900 hidden sm:block">PathWise</span>
            </Link>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-3">
            <NotificationSystem />
            
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {session.user?.name?.[0] || "U"}
                  </span>
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">
                  {session.user?.name?.split(" ")[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col py-6">
          {/* Main Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Core
            </p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <item.icon className="w-5 h-5" />
                <div>
                  <span>{item.label}</span>
                  {!isActive(item.href) && (
                    <p className="text-xs text-slate-500 font-normal">{item.description}</p>
                  )}
                </div>
              </Link>
            ))}

            {/* Secondary Items Toggle */}
            <button
              onClick={() => setShowSecondary(!showSecondary)}
              className="w-full flex items-center justify-between px-3 py-2 mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600"
            >
              More
              <ChevronDown className={`w-4 h-4 transition-transform ${showSecondary ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showSecondary && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {secondaryItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* Bottom Actions */}
          <div className="px-3 pt-4 border-t border-slate-200 space-y-1">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive("/settings")
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

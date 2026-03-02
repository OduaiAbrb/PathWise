"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import {
  LayoutDashboard,
  Map,
  Lightbulb,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,

  Bell,
  Brain,
  Users,
  Briefcase,
  MessageSquare,
  Zap,
  Award,
  FileText,
  ClipboardList,
  BookOpen,
  Crown,
  Trophy,
  Video,
  Building2,
  Shield,
} from "lucide-react";
import NotificationSystem from "@/components/NotificationSystem";
import { ThemeToggle } from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import NotificationBanner from "@/components/NotificationBanner";

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

// Streamlined navigation - organized into logical groups
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Roadmap & Stats" },
  { href: "/interview", label: "Interview Prep", icon: MessageSquare, description: "Practice interviews" },
  { href: "/study-buddy", label: "AI Mentor", icon: Brain, description: "Personal guidance" },
];

// Career tools
const careerItems = [
  { href: "/jobs", label: "Job Board", icon: Briefcase, description: "Find opportunities" },
  { href: "/applications", label: "Applications", icon: ClipboardList, description: "Track applications" },
  { href: "/job-tracker", label: "Job Tracker", icon: ClipboardList, description: "Pipeline view" },
  { href: "/jd-analyzer", label: "JD Analyzer", icon: FileText, description: "Analyze job descriptions" },
  { href: "/resume-scanner", label: "Resume Scanner", icon: FileText, description: "Optimize your resume" },
  { href: "/portfolio", label: "Portfolio", icon: Award, description: "Showcase your work" },
];

// Learning & growth
const learningItems = [
  { href: "/roadmap", label: "Roadmap", icon: Map, description: "Your learning path" },
  { href: "/projects", label: "Projects", icon: Lightbulb, description: "Build proof" },
  { href: "/challenges", label: "Challenges", icon: Zap, description: "Daily challenges" },
  { href: "/resources", label: "Resources", icon: BookOpen, description: "Learning materials" },
  { href: "/achievements", label: "Achievements", icon: Trophy, description: "Your badges" },
];

// Community
const communityItems = [
  { href: "/groups", label: "Study Groups", icon: Users, description: "Collaborative learning" },
  { href: "/mentors", label: "Mentors", icon: Users, description: "Connect with experts" },
  { href: "/partners", label: "Partners", icon: Shield, description: "Accountability" },
  { href: "/success-stories", label: "Success Stories", icon: Award, description: "Career journeys" },
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200 dark:bg-neutral-900 dark:border-neutral-800">
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
                <path d="M8 35 C8 35 12 28 16 22 C20 16 16 12 20 8 L24 4 L28 8 L24 12" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 38 L18 38 C22 38 24 34 22 30 C20 26 24 22 22 18" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="10" cy="32" r="3" fill="#0f172a" />
              </svg>
              <span className="text-lg font-bold text-slate-900 hidden sm:block">PathWise</span>
            </Link>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <NotificationSystem />

            <Link
              href="/profile"
              className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-neutral-700 hover:opacity-80 transition-opacity cursor-pointer"
            >
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full ring-2 ring-transparent hover:ring-primary-500 transition-all"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 dark:bg-neutral-700 rounded-full flex items-center justify-center ring-2 ring-transparent hover:ring-primary-500 transition-all">
                  <span className="text-sm font-medium text-black dark:text-white">
                    {session.user?.name?.[0] || "U"}
                  </span>
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {session.user?.name?.split(" ")[0]}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 dark:bg-neutral-900 dark:border-neutral-800 z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Main Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
              Core
            </p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(item.href)
                  ? "bg-black text-white shadow-lg dark:bg-white dark:text-black"
                  : "text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Career Tools */}
            <p className="px-3 pt-4 text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
              Career Tools
            </p>
            {careerItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive(item.href)
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                  : "text-slate-600 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}

            {/* Learning & Growth */}
            <p className="px-3 pt-4 text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
              Learning
            </p>
            {learningItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive(item.href)
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                  : "text-slate-600 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}

            {/* Community */}
            <p className="px-3 pt-4 text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
              Community
            </p>
            {communityItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive(item.href)
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                  : "text-slate-600 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="px-3 pt-4 border-t border-slate-200 dark:border-neutral-800 space-y-1">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive("/settings")
                ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                : "text-slate-600 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
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
        <NotificationBanner />
      </main>
    </div>
  );
}

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
  Calendar,
  Users,
  UserCircle,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  BarChart3,
  Code,
  Search,
  Award,
  Brain,
  Zap,
} from "lucide-react";
import NotificationSystem from "@/components/NotificationSystem";

// Navigation structure - streamlined, focused on career outcomes
const navGroups = [
  {
    label: "Core",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/roadmap/new", label: "Roadmap", icon: Map },
      { href: "/projects", label: "Projects", icon: Lightbulb },
      { href: "/study-buddy", label: "AI Mentor", icon: Bot },
      { href: "/portfolio", label: "Portfolio", icon: Award },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/groups", label: "Study Groups", icon: Users },
      { href: "/search", label: "Resources", icon: Search },
    ],
  },
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Learn"]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label)
        ? prev.filter((g) => g !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-neutral-200">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Left: Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-neutral-600" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 35 C8 35 12 28 16 22 C20 16 16 12 20 8 L24 4 L28 8 L24 12" stroke="#171717" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 38 L18 38 C22 38 24 34 22 30 C20 26 24 22 22 18" stroke="#171717" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <circle cx="10" cy="32" r="3" fill="#171717"/>
              </svg>
              <span className="text-lg font-semibold text-neutral-900 hidden sm:block">PathWise</span>
            </Link>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-3">
            <NotificationSystem />
            
            <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-neutral-600">
                    {session.user?.name?.[0] || "U"}
                  </span>
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-neutral-900">
                  {session.user?.name?.split(" ")[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-neutral-200 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col py-6">
          {/* Navigation Groups */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-4">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider hover:text-neutral-600"
                >
                  {group.label}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedGroups.includes(group.label) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedGroups.includes(group.label) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive(item.href)
                              ? "bg-neutral-900 text-white"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="px-3 pt-4 border-t border-neutral-200 space-y-1">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/settings")
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
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

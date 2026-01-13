"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Building2,
  Target,
  Clock,
  Users,
  Brain,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Star,
  TrendingUp,
  MessageSquare,
  Code,
  FileText,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface Company {
  id: string;
  name: string;
  logo: string;
  difficulty: "Medium" | "Hard" | "Very Hard";
  interviewRounds: number;
  avgSalary: string;
  interviewFocus: string[];
  isPremium: boolean;
}

const COMPANIES: Company[] = [
  {
    id: "google",
    name: "Google",
    logo: "🔍",
    difficulty: "Very Hard",
    interviewRounds: 5,
    avgSalary: "$180k - $350k",
    interviewFocus: ["System Design", "Algorithms", "Behavioral"],
    isPremium: false,
  },
  {
    id: "meta",
    name: "Meta",
    logo: "📘",
    difficulty: "Very Hard",
    interviewRounds: 4,
    avgSalary: "$170k - $320k",
    interviewFocus: ["Coding", "System Design", "Product Sense"],
    isPremium: false,
  },
  {
    id: "amazon",
    name: "Amazon",
    logo: "📦",
    difficulty: "Hard",
    interviewRounds: 5,
    avgSalary: "$150k - $280k",
    interviewFocus: ["Leadership Principles", "System Design", "Coding"],
    isPremium: false,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    logo: "🪟",
    difficulty: "Hard",
    interviewRounds: 4,
    avgSalary: "$140k - $260k",
    interviewFocus: ["Coding", "System Design", "Behavioral"],
    isPremium: false,
  },
  {
    id: "apple",
    name: "Apple",
    logo: "🍎",
    difficulty: "Very Hard",
    interviewRounds: 5,
    avgSalary: "$160k - $300k",
    interviewFocus: ["Technical Deep Dive", "System Design", "Culture Fit"],
    isPremium: true,
  },
  {
    id: "netflix",
    name: "Netflix",
    logo: "🎬",
    difficulty: "Very Hard",
    interviewRounds: 4,
    avgSalary: "$200k - $400k",
    interviewFocus: ["Culture Fit", "Technical Excellence", "Impact"],
    isPremium: true,
  },
  {
    id: "stripe",
    name: "Stripe",
    logo: "💳",
    difficulty: "Hard",
    interviewRounds: 5,
    avgSalary: "$180k - $350k",
    interviewFocus: ["Coding", "System Design", "API Design"],
    isPremium: true,
  },
  {
    id: "airbnb",
    name: "Airbnb",
    logo: "🏠",
    difficulty: "Hard",
    interviewRounds: 5,
    avgSalary: "$160k - $300k",
    interviewFocus: ["Coding", "System Design", "Cross-functional"],
    isPremium: true,
  },
];

export default function CompanyPrepPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const startPrep = async (company: Company) => {
    if (company.isPremium) {
      router.push("/pricing");
      return;
    }
    
    setSelectedCompany(company);
    setIsLoading(true);
    
    // Simulate loading then navigate to interview prep
    setTimeout(() => {
      router.push(`/interview?company=${company.id}`);
    }, 1500);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Medium": return "text-amber-600 bg-amber-50";
      case "Hard": return "text-orange-600 bg-orange-50";
      case "Very Hard": return "text-red-600 bg-red-50";
      default: return "text-neutral-600 bg-neutral-50";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-neutral-900" />
          <h1 className="text-3xl font-bold text-neutral-900">
            Company-Specific Interview Prep
          </h1>
        </div>
        <p className="text-neutral-600 max-w-2xl">
          Prepare for interviews at top tech companies with tailored questions, 
          company culture insights, and interview process breakdowns.
        </p>
      </motion.div>

      {/* Company Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COMPANIES.map((company, index) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg ${
              selectedCompany?.id === company.id
                ? "border-black shadow-lg"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
            onClick={() => !isLoading && startPrep(company)}
          >
            {/* Premium Badge */}
            {company.isPremium && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-medium rounded-full">
                  <Star className="w-3 h-3" />
                  Premium
                </div>
              </div>
            )}

            {/* Company Logo & Name */}
            <div className="text-4xl mb-3">{company.logo}</div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              {company.name}
            </h3>

            {/* Difficulty */}
            <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${getDifficultyColor(company.difficulty)}`}>
              {company.difficulty}
            </div>

            {/* Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <Users className="w-4 h-4" />
                <span>{company.interviewRounds} rounds</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <TrendingUp className="w-4 h-4" />
                <span>{company.avgSalary}</span>
              </div>
            </div>

            {/* Focus Areas */}
            <div className="mt-3 flex flex-wrap gap-1">
              {company.interviewFocus.slice(0, 2).map((focus) => (
                <span
                  key={focus}
                  className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded"
                >
                  {focus}
                </span>
              ))}
            </div>

            {/* Action */}
            <div className="mt-4 pt-3 border-t border-neutral-100">
              {isLoading && selectedCompany?.id === company.id ? (
                <div className="flex items-center gap-2 text-neutral-600">
                  <div className="w-4 h-4 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
                  <span className="text-sm">Loading prep...</span>
                </div>
              ) : company.isPremium ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Unlock with Pro</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-black font-medium">
                  <span className="text-sm">Start Prep</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* What You Get Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 bg-neutral-50 rounded-2xl p-8"
      >
        <h2 className="text-xl font-bold text-neutral-900 mb-6 text-center">
          What's Included in Company Prep
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              icon: MessageSquare,
              title: "Interview Questions",
              description: "Real questions from recent interviews at this company",
            },
            {
              icon: Brain,
              title: "Culture Insights",
              description: "What the company values and how to demonstrate fit",
            },
            {
              icon: Code,
              title: "Coding Patterns",
              description: "Common problem types and patterns they test",
            },
            {
              icon: FileText,
              title: "Process Guide",
              description: "Round-by-round breakdown of what to expect",
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="w-12 h-12 bg-white border-2 border-neutral-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-neutral-700" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">{item.title}</h3>
              <p className="text-sm text-neutral-600">{item.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

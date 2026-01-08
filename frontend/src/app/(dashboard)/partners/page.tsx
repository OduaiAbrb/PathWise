"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Target, TrendingUp, MessageCircle, Calendar, Award, Search } from "lucide-react";

export default function AccountabilityPartnersPage() {
  const [isSearching, setIsSearching] = useState(false);

  const potentialMatches = [
    {
      id: "1",
      name: "Sarah Chen",
      role: "Backend Engineer",
      level: "Intermediate",
      similarity: 94,
      progress: 67,
      streak: 15,
      goals: ["System Design", "AWS", "Microservices"],
    },
    {
      id: "2",
      name: "Marcus Rodriguez",
      role: "Backend Engineer",
      level: "Intermediate",
      similarity: 89,
      progress: 72,
      streak: 23,
      goals: ["Python", "Django", "PostgreSQL"],
    },
    {
      id: "3",
      name: "Priya Patel",
      role: "Full Stack",
      level: "Beginner",
      similarity: 85,
      progress: 45,
      streak: 8,
      goals: ["React", "Node.js", "API Design"],
    },
  ];

  const findMatches = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Find Your Accountability Partner
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Match with learners on similar career paths. Hold each other accountable, share
          progress, and succeed together.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Shared Goals</h3>
          <p className="text-sm text-slate-600">
            Match with people targeting the same roles and skills
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Weekly Check-ins</h3>
          <p className="text-sm text-slate-600">
            Regular progress reviews keep you both on track
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Higher Success</h3>
          <p className="text-sm text-slate-600">
            Accountability partners have 2.5x higher completion rates
          </p>
        </div>
      </div>

      {/* Find Match Button */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-8 text-center">
        <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to Find Your Match?</h2>
        <p className="text-slate-600 mb-6 max-w-lg mx-auto">
          We'll match you with learners on similar roadmaps based on target role, experience
          level, and learning pace.
        </p>
        <button
          onClick={findMatches}
          disabled={isSearching}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
        >
          {isSearching ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Finding Matches...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Find My Match
            </>
          )}
        </button>
      </div>

      {/* Potential Matches */}
      {!isSearching && potentialMatches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recommended Matches</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {potentialMatches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-300 p-6 transition-all"
              >
                {/* Profile */}
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">
                      {match.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{match.name}</h3>
                  <p className="text-sm text-slate-600">{match.role}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {match.similarity}% Match
                  </span>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-slate-900">{match.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${match.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Streak</span>
                    <span className="font-semibold text-orange-600 flex items-center gap-1">
                      🔥 {match.streak} days
                    </span>
                  </div>
                </div>

                {/* Goals */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Current Goals
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {match.goals.map((goal, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
                  Send Partner Request
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              1
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Get Matched</h3>
            <p className="text-sm text-slate-600">
              AI matches you with compatible learners based on goals and pace
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              2
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Connect</h3>
            <p className="text-sm text-slate-600">
              Send requests, chat, and set shared learning goals
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              3
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Weekly Check-ins</h3>
            <p className="text-sm text-slate-600">
              Review progress together every week and stay accountable
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              4
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Succeed Together</h3>
            <p className="text-sm text-slate-600">
              Celebrate wins and land jobs faster with mutual support
            </p>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-2">Join 1,247 Active Partnerships</h2>
        <p className="text-blue-100 mb-6">
          PathWise users with accountability partners are 2.5x more likely to complete their
          roadmaps
        </p>
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div>
            <div className="text-4xl font-bold">94%</div>
            <div className="text-sm text-blue-100">Check-in Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold">2.5x</div>
            <div className="text-sm text-blue-100">Higher Success</div>
          </div>
          <div>
            <div className="text-4xl font-bold">18</div>
            <div className="text-sm text-blue-100">Days Avg Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}

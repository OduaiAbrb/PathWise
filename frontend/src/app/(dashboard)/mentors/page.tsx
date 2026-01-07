"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle,
  Star,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  ExternalLink,
  Clock,
  X,
  CheckCircle2,
} from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  rating: number;
  reviews: number;
  hourlyRate: number;
  available: boolean;
  bio: string;
  image?: string;
}

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [applicationData, setApplicationData] = useState({
    expertise: "",
    experience: "",
    bio: "",
    linkedin: "",
  });
  const [mentors] = useState<Mentor[]>([
    {
      id: "1",
      name: "Sarah Chen",
      title: "Senior Software Engineer",
      company: "Google",
      expertise: ["System Design", "Backend", "Python"],
      rating: 4.9,
      reviews: 47,
      hourlyRate: 120,
      available: true,
      bio: "10+ years building scalable systems. I help engineers prepare for FAANG interviews.",
    },
    {
      id: "2",
      name: "Marcus Johnson",
      title: "Engineering Manager",
      company: "Stripe",
      expertise: ["Career Growth", "Leadership", "Backend"],
      rating: 4.8,
      reviews: 32,
      hourlyRate: 150,
      available: true,
      bio: "Former IC turned manager. I coach engineers on career transitions and leadership.",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      title: "Staff Engineer",
      company: "Netflix",
      expertise: ["Frontend", "React", "TypeScript"],
      rating: 4.9,
      reviews: 58,
      hourlyRate: 100,
      available: false,
      bio: "Passionate about frontend architecture and mentoring junior developers.",
    },
    {
      id: "4",
      name: "David Kim",
      title: "Principal Engineer",
      company: "Amazon",
      expertise: ["AWS", "DevOps", "System Design"],
      rating: 4.7,
      reviews: 24,
      hourlyRate: 140,
      available: true,
      bio: "Cloud architecture expert. I help teams design and scale their infrastructure.",
    },
  ]);

  const expertiseOptions = ["System Design", "Backend", "Frontend", "DevOps", "Career Growth", "Leadership"];

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesExpertise = !selectedExpertise || mentor.expertise.includes(selectedExpertise);
    return matchesSearch && matchesExpertise;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-2 mb-2">Find a Mentor</h1>
        <p className="body-large">Get personalized guidance from industry experts</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or expertise..."
              className="input pl-12"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedExpertise(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !selectedExpertise
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            All
          </button>
          {expertiseOptions.map((exp) => (
            <button
              key={exp}
              onClick={() => setSelectedExpertise(exp)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedExpertise === exp
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {exp}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Mentors Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredMentors.map((mentor, i) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="card-hover"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-10 h-10 text-neutral-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{mentor.name}</h3>
                    <p className="text-sm text-neutral-600">{mentor.title}</p>
                    <p className="text-sm text-neutral-500">{mentor.company}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    mentor.available
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}>
                    {mentor.available ? "Available" : "Busy"}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-neutral-600 mb-4">{mentor.bio}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.expertise.map((exp) => (
                <span key={exp} className="badge-neutral text-xs">
                  {exp}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {mentor.rating} ({mentor.reviews})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                ${mentor.hourlyRate}/hr
              </span>
            </div>

            <div className="flex gap-2 pt-4 border-t border-neutral-200">
              <button
                onClick={() => {
                  setSelectedMentor(mentor);
                  setShowBookingModal(true);
                }}
                disabled={!mentor.available}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Book Session
              </button>
              <button 
                onClick={() => alert("Chat feature coming soon!")}
                className="inline-flex items-center justify-center p-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-600 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-semibold text-neutral-900 mb-2">No mentors found</h3>
          <p className="text-neutral-500">Try adjusting your search or filters</p>
        </motion.div>
      )}

      {/* Become a Mentor CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 bg-neutral-900 text-white rounded-2xl text-center"
      >
        <h3 className="text-xl font-semibold mb-2">Want to become a mentor?</h3>
        <p className="text-neutral-400 mb-4">
          Share your expertise and help others grow in their careers
        </p>
        <button 
          onClick={() => setShowApplyModal(true)}
          className="btn bg-white text-neutral-900 hover:bg-neutral-100"
        >
          Apply to Mentor
          <ExternalLink className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Apply to Mentor Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowApplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {applicationSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2">Application Submitted!</h2>
                  <p className="text-neutral-600 mb-6">
                    We'll review your application and get back to you within 3-5 business days.
                  </p>
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setApplicationSubmitted(false);
                    }}
                    className="btn-primary"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-neutral-900">Apply to Become a Mentor</h2>
                    <button
                      onClick={() => setShowApplyModal(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Area of Expertise
                      </label>
                      <select
                        value={applicationData.expertise}
                        onChange={(e) => setApplicationData({ ...applicationData, expertise: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      >
                        <option value="">Select your expertise</option>
                        <option value="System Design">System Design</option>
                        <option value="Backend Development">Backend Development</option>
                        <option value="Frontend Development">Frontend Development</option>
                        <option value="DevOps & Cloud">DevOps & Cloud</option>
                        <option value="Career Growth">Career Growth</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Data Science">Data Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Years of Experience
                      </label>
                      <select
                        value={applicationData.experience}
                        onChange={(e) => setApplicationData({ ...applicationData, experience: e.target.value })}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      >
                        <option value="">Select experience</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-8">5-8 years</option>
                        <option value="8-12">8-12 years</option>
                        <option value="12+">12+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Short Bio
                      </label>
                      <textarea
                        value={applicationData.bio}
                        onChange={(e) => setApplicationData({ ...applicationData, bio: e.target.value })}
                        placeholder="Tell us about your experience and why you want to mentor..."
                        rows={4}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        LinkedIn Profile (optional)
                      </label>
                      <input
                        type="url"
                        value={applicationData.linkedin}
                        onChange={(e) => setApplicationData({ ...applicationData, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowApplyModal(false)}
                      className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setApplicationSubmitted(true)}
                      disabled={!applicationData.expertise || !applicationData.experience || !applicationData.bio}
                      className="flex-1 btn-primary"
                    >
                      Submit Application
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              {bookingConfirmed ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2">Session Booked!</h2>
                  <p className="text-neutral-600 mb-6">
                    Your session with {selectedMentor.name} has been confirmed. You'll receive a calendar invite shortly.
                  </p>
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setBookingConfirmed(false);
                      setSelectedMentor(null);
                    }}
                    className="btn-primary"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-neutral-900">Book a Session</h2>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl mb-6">
                    <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center">
                      <UserCircle className="w-8 h-8 text-neutral-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{selectedMentor.name}</p>
                      <p className="text-sm text-neutral-600">{selectedMentor.title}</p>
                      <p className="text-sm text-neutral-500">${selectedMentor.hourlyRate}/hour</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Select Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Select Time
                      </label>
                      <select className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent">
                        <option value="">Choose a time slot</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        What would you like to discuss?
                      </label>
                      <textarea
                        placeholder="Brief description of topics you'd like to cover..."
                        rows={3}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setBookingConfirmed(true)}
                      className="flex-1 btn-primary"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Send, CheckCircle2 } from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface ReportBrokenLinkProps {
  resourceId: string;
  resourceUrl: string;
  resourceTitle: string;
  accessToken: string;
  onClose?: () => void;
}

export default function ReportBrokenLink({
  resourceId,
  resourceUrl,
  resourceTitle,
  accessToken,
  onClose,
}: ReportBrokenLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState("broken_link");
  const [description, setDescription] = useState("");
  const [suggestedUrl, setSuggestedUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl("/api/v1/resources/report"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          resource_id: resourceId,
          resource_url: resourceUrl,
          report_type: reportType,
          description: description || undefined,
          suggested_replacement_url: suggestedUrl || undefined,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSubmitted(false);
          onClose?.();
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
      >
        <AlertTriangle className="w-3 h-3" />
        Report Issue
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {isSubmitted ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-black mb-2">Thank You!</h3>
                  <p className="text-gray-600">
                    Your report has been submitted. We'll review it shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-black">Report Resource Issue</h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Resource:</p>
                      <p className="font-medium text-black truncate">{resourceTitle}</p>
                      <p className="text-xs text-gray-400 truncate">{resourceUrl}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issue Type
                      </label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-black outline-none"
                      >
                        <option value="broken_link">Broken Link (404)</option>
                        <option value="outdated">Outdated Content</option>
                        <option value="inappropriate">Inappropriate Content</option>
                        <option value="other">Other Issue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-black outline-none resize-none"
                        rows={2}
                        placeholder="Tell us more about the issue..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suggest Replacement URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={suggestedUrl}
                        onChange={(e) => setSuggestedUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-black outline-none"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit Report
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

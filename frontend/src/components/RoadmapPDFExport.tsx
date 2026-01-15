"use client";

import { useState } from "react";
import { FileText, Download, Printer } from "lucide-react";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";

interface RoadmapPDFExportProps {
  roadmapId?: string;
  onExport?: () => void;
}

export function RoadmapPDFExport({ roadmapId, onExport }: RoadmapPDFExportProps) {
  const { data: session } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const accessToken = (session as any)?.accessToken;

  const generatePDF = async () => {
    if (!accessToken) return;

    setIsGenerating(true);
    try {
      // Fetch roadmap data
      const response = await fetch(getApiUrl(`/api/v1/roadmaps/${roadmapId || 'current'}`), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roadmap');
      }

      const roadmapData = await response.json();
      const roadmap = roadmapData.data;

      // Generate PDF content
      const pdfContent = generatePDFContent(roadmap);
      
      // Create and download PDF
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      onExport?.();
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFContent = (roadmap: any): string => {
    const currentDate = new Date().toLocaleDateString();
    const userName = session?.user?.name || 'PathWise User';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${roadmap.title} - Learning Roadmap</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #333; }
        .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: bold; margin: 0; }
        .subtitle { font-size: 16px; color: #666; margin: 5px 0; }
        .meta { font-size: 14px; color: #888; margin-top: 10px; }
        .phase { margin: 30px 0; page-break-inside: avoid; }
        .phase-title { font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 15px; }
        .skill { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .skill-name { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
        .skill-description { font-size: 14px; color: #666; margin-bottom: 10px; }
        .skill-resources { font-size: 13px; }
        .resource { margin: 5px 0; padding-left: 20px; }
        .progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; margin: 10px 0; }
        .progress-fill { height: 100%; background: #10b981; border-radius: 4px; }
        .stats { display: flex; justify-content: space-between; margin: 20px 0; }
        .stat { text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
        .stat-label { font-size: 12px; color: #666; }
        @media print {
            body { margin: 20px; }
            .phase { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${roadmap.title || 'Learning Roadmap'}</h1>
        <p class="subtitle">${roadmap.description || 'Personalized learning path'}</p>
        <div class="meta">
            Generated for: ${userName} • Date: ${currentDate} • Target Role: ${roadmap.targetRole || 'Developer'}
        </div>
    </div>

    <div class="stats">
        <div class="stat">
            <div class="stat-number">${roadmap.phases?.length || 0}</div>
            <div class="stat-label">Learning Phases</div>
        </div>
        <div class="stat">
            <div class="stat-number">${roadmap.totalSkills || 0}</div>
            <div class="stat-label">Total Skills</div>
        </div>
        <div class="stat">
            <div class="stat-number">${roadmap.estimatedWeeks || 0}</div>
            <div class="stat-label">Estimated Weeks</div>
        </div>
        <div class="stat">
            <div class="stat-number">${Math.round((roadmap.completedSkills / roadmap.totalSkills) * 100) || 0}%</div>
            <div class="stat-label">Progress</div>
        </div>
    </div>

    ${(roadmap.phases || []).map((phase: any, index: number) => `
        <div class="phase">
            <h2 class="phase-title">Phase ${index + 1}: ${phase.title}</h2>
            <p style="margin-bottom: 20px; color: #666;">${phase.description}</p>
            
            ${(phase.skills || []).map((skill: any) => `
                <div class="skill">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-description">${skill.description}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${skill.progress || 0}%;"></div>
                    </div>
                    <div class="skill-resources">
                        <strong>Key Resources:</strong>
                        ${(skill.resources || []).map((resource: any) => `
                            <div class="resource">• ${resource.title} (${resource.type})</div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('')}

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #888;">
        <p>Generated by PathWise - Your Career Outcome Machine</p>
        <p>Visit pathwise.app to continue your learning journey</p>
    </div>
</body>
</html>`;
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {isGenerating ? (
        <>
          <Download className="w-4 h-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Export Roadmap PDF
        </>
      )}
    </button>
  );
}

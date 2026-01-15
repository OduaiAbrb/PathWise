"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Calendar, TrendingUp, Target } from "lucide-react";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";

interface ExportStatsProps {
  onExport?: () => void;
}

export function ExportStats({ onExport }: ExportStatsProps) {
  const { data: session } = useSession();
  const [isExporting, setIsExporting] = useState(false);
  const accessToken = (session as any)?.accessToken;

  const exportToCSV = async (dataType: 'all' | 'progress' | 'projects' | 'gamification') => {
    if (!accessToken) return;

    setIsExporting(true);
    try {
      let data: any[] = [];
      let filename = '';

      switch (dataType) {
        case 'all':
          // Fetch all user data
          const [progressRes, projectsRes, statsRes] = await Promise.all([
            fetch(getApiUrl("/api/v1/progress/export"), { headers: { Authorization: `Bearer ${accessToken}` } }),
            fetch(getApiUrl("/api/v1/projects/export"), { headers: { Authorization: `Bearer ${accessToken}` } }),
            fetch(getApiUrl("/api/v1/gamification/export"), { headers: { Authorization: `Bearer ${accessToken}` } })
          ]);

          const progressData = progressRes.ok ? await progressRes.json() : { data: [] };
          const projectsData = projectsRes.ok ? await projectsRes.json() : { data: [] };
          const statsData = statsRes.ok ? await statsRes.json() : { data: [] };

          data = [
            { type: 'Progress', ...progressData.data },
            { type: 'Projects', ...projectsData.data },
            { type: 'Statistics', ...statsData.data }
          ];
          filename = 'pathwise_complete_export';
          break;

        case 'progress':
          const response = await fetch(getApiUrl("/api/v1/progress/export"), {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (response.ok) {
            const result = await response.json();
            data = result.data || [];
          }
          filename = 'pathwise_progress';
          break;

        case 'projects':
          const projectResponse = await fetch(getApiUrl("/api/v1/projects/export"), {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (projectResponse.ok) {
            const result = await projectResponse.json();
            data = result.data || [];
          }
          filename = 'pathwise_projects';
          break;

        case 'gamification':
          const statsResponse = await fetch(getApiUrl("/api/v1/gamification/export"), {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (statsResponse.ok) {
            const result = await statsResponse.json();
            data = result.data || [];
          }
          filename = 'pathwise_stats';
          break;
      }

      // Convert to CSV
      if (data.length > 0) {
        const csvContent = convertToCSV(data);
        downloadCSV(csvContent, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        onExport?.();
      }

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (!data.length) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => exportToCSV('all')}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-sm font-medium">Complete Export</span>
        </button>

        <button
          onClick={() => exportToCSV('progress')}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-medium">Learning Progress</span>
        </button>

        <button
          onClick={() => exportToCSV('projects')}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <Target className="w-5 h-5" />
          <span className="text-sm font-medium">Projects Data</span>
        </button>

        <button
          onClick={() => exportToCSV('gamification')}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">Stats & XP</span>
        </button>
      </div>

      {isExporting && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <Download className="w-4 h-4 animate-bounce" />
            Preparing your export...
          </div>
        </div>
      )}
    </div>
  );
}

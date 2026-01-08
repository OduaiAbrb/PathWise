"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Save,
  Download,
  Upload,
  Share2,
  GitBranch,
  GitCommit,
  GitMerge,
  Users,
  Settings,
  Search,
  Copy,
  Maximize2,
  Minimize2,
  Terminal,
  FileText,
  Folder,
  Plus,
  X,
  Check,
  AlertCircle,
  Lightbulb,
  Zap,
  Code2
} from "lucide-react";

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  lastModified: Date;
  isUnsaved: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  cursor: { line: number; column: number };
  color: string;
  isActive: boolean;
}

interface GitStatus {
  branch: string;
  commits: number;
  changes: number;
  status: "clean" | "modified" | "staged";
}

interface Suggestion {
  text: string;
  type: "function" | "variable" | "keyword" | "snippet";
  description: string;
}

export default function AdvancedCodeEditor() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [gitStatus, setGitStatus] = useState<GitStatus>({
    branch: "main",
    commits: 0,
    changes: 3,
    status: "modified"
  });
  const [showTerminal, setShowTerminal] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Initialize with sample files
    const sampleFiles: CodeFile[] = [
      {
        id: "1",
        name: "Main.java",
        language: "java",
        content: `public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to PathWise!");
        
        // Example: Array operations
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        
        for (int num : numbers) {
            sum += num;
        }
        
        System.out.println("Sum: " + sum);
    }
}`,
        lastModified: new Date(),
        isUnsaved: false
      },
      {
        id: "2",
        name: "app.py",
        language: "python",
        content: `def main():
    """PathWise Python Example"""
    print("Welcome to PathWise!")
    
    # Example: List comprehension
    numbers = [1, 2, 3, 4, 5]
    squared = [n**2 for n in numbers]
    
    print(f"Squared numbers: {squared}")
    
    # Example: Dictionary operations
    student = {
        "name": "Alex",
        "grade": "A",
        "courses": ["Python", "JavaScript", "C++"]
    }
    
    print(f"Student: {student['name']}")

if __name__ == "__main__":
    main()`,
        lastModified: new Date(Date.now() - 100000),
        isUnsaved: false
      },
      {
        id: "3",
        name: "main.cpp",
        language: "cpp",
        content: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    cout << "Welcome to PathWise!" << endl;
    
    // Example: Vector operations
    vector<int> numbers = {1, 2, 3, 4, 5};
    int sum = 0;
    
    for (int num : numbers) {
        sum += num;
    }
    
    cout << "Sum: " << sum << endl;
    
    return 0;
}`,
        lastModified: new Date(Date.now() - 200000),
        isUnsaved: false
      },
      {
        id: "4",
        name: "Program.cs",
        language: "csharp",
        content: `using System;
using System.Linq;
using System.Collections.Generic;

namespace PathWise
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Welcome to PathWise!");
            
            // Example: LINQ operations
            var numbers = new List<int> { 1, 2, 3, 4, 5 };
            var sum = numbers.Sum();
            var squared = numbers.Select(n => n * n).ToList();
            
            Console.WriteLine($"Sum: {sum}");
            Console.WriteLine($"Squared: {string.Join(", ", squared)}");
        }
    }
}`,
        lastModified: new Date(Date.now() - 250000),
        isUnsaved: false
      },
      {
        id: "5",
        name: "app.js",
        language: "javascript",
        content: `// PathWise JavaScript Example
console.log("Welcome to PathWise!");

// Example: Array methods
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, num) => acc + num, 0);
const squared = numbers.map(n => n ** 2);

console.log("Sum:", sum);
console.log("Squared:", squared);

// Example: Async/await
async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Export for use in other modules
export { fetchData };`,
        lastModified: new Date(Date.now() - 300000),
        isUnsaved: false
      }
    ];

    const sampleCollaborators: Collaborator[] = [
      {
        id: "1",
        name: "Sarah Chen",
        avatar: "👩‍💻",
        cursor: { line: 8, column: 15 },
        color: "#3B82F6",
        isActive: true
      },
      {
        id: "2", 
        name: "Mike Rodriguez",
        avatar: "👨‍💻",
        cursor: { line: 12, column: 8 },
        color: "#10B981",
        isActive: true
      }
    ];

    setFiles(sampleFiles);
    setActiveFileId("1");
    setCollaborators(sampleCollaborators);
  }, []);

  const activeFile = files.find(f => f.id === activeFileId);

  const handleCodeChange = (content: string) => {
    setFiles(prev => prev.map(file => 
      file.id === activeFileId 
        ? { ...file, content, isUnsaved: true, lastModified: new Date() }
        : file
    ));
    
    // Trigger autocomplete suggestions
    triggerAutocomplete(content);
  };

  const triggerAutocomplete = (content: string) => {
    const currentWord = getCurrentWord(content);
    if (currentWord.length >= 2) {
      const mockSuggestions: Suggestion[] = [
        { text: "useState", type: "function", description: "React hook for state management" },
        { text: "useEffect", type: "function", description: "React hook for side effects" },
        { text: "console.log", type: "function", description: "Log to browser console" },
        { text: "const", type: "keyword", description: "Declare a constant variable" },
        { text: "function", type: "keyword", description: "Declare a function" }
      ].filter(s => s.text.toLowerCase().includes(currentWord.toLowerCase()));
      
      setSuggestions(mockSuggestions);
      setShowSuggestions(mockSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const getCurrentWord = (content: string): string => {
    // Simple implementation - in real app would use cursor position
    const words = content.split(/\s+/);
    return words[words.length - 1] || "";
  };

  const saveFile = () => {
    if (!activeFile) return;
    setFiles(prev => prev.map(file => 
      file.id === activeFileId ? { ...file, isUnsaved: false } : file
    ));
  };

  const createNewFile = () => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: "Untitled.js",
      language: "javascript",
      content: "// New file\n",
      lastModified: new Date(),
      isUnsaved: true
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const runCode = () => {
    // Mock code execution
    console.log("Running code:", activeFile?.content);
  };

  const commitChanges = () => {
    setGitStatus(prev => ({
      ...prev,
      commits: prev.commits + 1,
      changes: 0,
      status: "clean"
    }));
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case "typescript": return "text-blue-600";
      case "javascript": return "text-yellow-600";
      case "python": return "text-green-600";
      case "css": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50" : "h-[600px]"} bg-gray-900 text-white flex flex-col rounded-lg overflow-hidden`}>
      {/* Header Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">PathWise Code Editor</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={saveFile}
              disabled={!activeFile?.isUnsaved}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            
            <button
              onClick={runCode}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-md text-sm transition-colors"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
            
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Git Status */}
          <div className="flex items-center gap-2 text-sm">
            <GitBranch className="w-4 h-4" />
            <span>{gitStatus.branch}</span>
            {gitStatus.changes > 0 && (
              <span className="bg-orange-600 text-white px-2 py-0.5 rounded text-xs">
                {gitStatus.changes}
              </span>
            )}
          </div>

          {/* Collaborators */}
          <div className="flex items-center gap-1">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: collaborator.color }}
                title={collaborator.name}
              >
                {collaborator.avatar}
              </div>
            ))}
            <Users className="w-4 h-4 text-gray-400 ml-2" />
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        {showFileExplorer && (
          <div className="w-64 bg-gray-850 border-r border-gray-700 p-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-300">Files</h3>
              <button
                onClick={createNewFile}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors ${
                    activeFileId === file.id 
                      ? "bg-gray-700 text-white" 
                      : "text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  <FileText className={`w-4 h-4 ${getLanguageColor(file.language)}`} />
                  <span className="text-sm">{file.name}</span>
                  {file.isUnsaved && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Git Panel */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Git Changes</h4>
              <div className="space-y-2">
                <div className="text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Modified files:</span>
                    <span>{gitStatus.changes}</span>
                  </div>
                </div>
                {gitStatus.changes > 0 && (
                  <button
                    onClick={commitChanges}
                    className="w-full flex items-center gap-2 px-2 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
                  >
                    <GitCommit className="w-3 h-3" />
                    Commit Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Code Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* File Tabs */}
          <div className="bg-gray-800 border-b border-gray-700 flex overflow-x-auto">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-700 transition-colors ${
                  activeFileId === file.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <span>{file.name}</span>
                {file.isUnsaved && (
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                )}
                <button className="ml-2 hover:bg-gray-600 rounded p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            {activeFile && (
              <div className="h-full flex">
                {/* Line Numbers */}
                <div className="w-12 bg-gray-850 border-r border-gray-700 p-2 text-xs text-gray-500 font-mono">
                  {activeFile.content.split('\n').map((_, index) => (
                    <div key={index} className="h-5 flex items-center justify-end pr-2">
                      {index + 1}
                    </div>
                  ))}
                </div>

                {/* Code Area */}
                <div className="flex-1 relative">
                  <textarea
                    ref={editorRef}
                    value={activeFile.content}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none outline-none"
                    style={{ lineHeight: '1.25rem' }}
                    spellCheck={false}
                  />

                  {/* Collaborator Cursors */}
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="absolute w-0.5 h-5 animate-pulse"
                      style={{
                        backgroundColor: collaborator.color,
                        top: `${collaborator.cursor.line * 20 + 16}px`,
                        left: `${collaborator.cursor.column * 8 + 16}px`
                      }}
                    >
                      <div
                        className="absolute -top-6 left-0 px-2 py-1 rounded text-xs text-white"
                        style={{ backgroundColor: collaborator.color }}
                      >
                        {collaborator.name}
                      </div>
                    </div>
                  ))}

                  {/* Autocomplete Suggestions */}
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-20 left-20 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 w-64"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          onClick={() => setShowSuggestions(false)}
                        >
                          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs">
                            {suggestion.type === "function" ? "f" : 
                             suggestion.type === "variable" ? "v" : 
                             suggestion.type === "keyword" ? "k" : "s"}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium">{suggestion.text}</div>
                            <div className="text-xs text-gray-400">{suggestion.description}</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
              <span className={`${getLanguageColor(activeFile?.language || "")} font-medium`}>
                {activeFile?.language?.toUpperCase()}
              </span>
              <span className="text-gray-400">UTF-8</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Terminal className="w-3 h-3" />
                Terminal
              </button>
              <span className="text-gray-400">
                {collaborators.filter(c => c.isActive).length} online
              </span>
            </div>
          </div>

          {/* Terminal */}
          {showTerminal && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 200 }}
              className="bg-black border-t border-gray-700 p-4 font-mono text-sm overflow-y-auto"
            >
              <div className="text-green-400">$ npm run dev</div>
              <div className="text-gray-300">Starting development server...</div>
              <div className="text-gray-300">✓ Ready on http://localhost:3000</div>
              <div className="text-green-400 mt-2">$ █</div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Save,
  Download,
  Share2,
  Copy,
  RotateCcw,
  Terminal,
  CheckCircle,
  Code2
} from "lucide-react";

interface Language {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  bgColor: string;
  template: string;
}

const LANGUAGES: Language[] = [
  {
    id: "java",
    name: "java",
    displayName: "Java",
    icon: "☕",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10 border-orange-500/30",
    template: `public class Main {
    public static void main(String[] args) {
        // Write your Java code here
        System.out.println("Hello from Java!");
        
        // Example: Variables
        String name = "PathWise";
        int year = 2024;
        
        // Example: Arrays
        int[] numbers = {1, 2, 3, 4, 5};
        for (int num : numbers) {
            System.out.println(num);
        }
    }
}`
  },
  {
    id: "python",
    name: "python",
    displayName: "Python",
    icon: "🐍",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10 border-blue-500/30",
    template: `# Write your Python code here
def main():
    """PathWise Python Example"""
    print("Hello from Python!")
    
    # Example: Variables
    name = "PathWise"
    year = 2024
    
    # Example: Lists and loops
    numbers = [1, 2, 3, 4, 5]
    for num in numbers:
        print(num)
    
    # Example: List comprehension
    squared = [n**2 for n in numbers]
    print(f"Squared: {squared}")

if __name__ == "__main__":
    main()`
  },
  {
    id: "cpp",
    name: "cpp",
    displayName: "C++",
    icon: "⚡",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10 border-purple-500/30",
    template: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    // Write your C++ code here
    cout << "Hello from C++!" << endl;
    
    // Example: Variables
    string name = "PathWise";
    int year = 2024;
    
    // Example: Vectors
    vector<int> numbers = {1, 2, 3, 4, 5};
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    return 0;
}`
  },
  {
    id: "javascript",
    name: "javascript",
    displayName: "JavaScript",
    icon: "🟨",
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10 border-yellow-500/30",
    template: `// Write your JavaScript code here
console.log("Hello from JavaScript!");

// Example: Variables
const name = "PathWise";
const year = 2024;

// Example: Arrays
const numbers = [1, 2, 3, 4, 5];
numbers.forEach(num => console.log(num));

// Example: Map function
const squared = numbers.map(n => n ** 2);
console.log("Squared:", squared);

// Example: Async/await
async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error:", error);
    }
}`
  },
  {
    id: "csharp",
    name: "csharp",
    displayName: "C#",
    icon: "#️⃣",
    color: "text-green-600",
    bgColor: "bg-green-500/10 border-green-500/30",
    template: `using System;
using System.Linq;
using System.Collections.Generic;

namespace PathWise
{
    class Program
    {
        static void Main(string[] args)
        {
            // Write your C# code here
            Console.WriteLine("Hello from C#!");
            
            // Example: Variables
            string name = "PathWise";
            int year = 2024;
            
            // Example: Lists
            var numbers = new List<int> { 1, 2, 3, 4, 5 };
            foreach (var num in numbers)
            {
                Console.WriteLine(num);
            }
            
            // Example: LINQ
            var squared = numbers.Select(n => n * n).ToList();
            Console.WriteLine($"Squared: {string.Join(", ", squared)}");
        }
    }
}`
  }
];

export default function AdvancedCodeEditor() {
  const [activeLanguage, setActiveLanguage] = useState<Language>(LANGUAGES[0]);
  const [code, setCode] = useState<string>(LANGUAGES[0].template);
  const [output, setOutput] = useState<string>("");
  const [showTerminal, setShowTerminal] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  const switchLanguage = (language: Language) => {
    setActiveLanguage(language);
    setCode(language.template);
    setIsSaved(false);
    setOutput("");
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setIsSaved(false);
  };

  const handleRun = () => {
    setShowTerminal(true);
    setOutput(`Running ${activeLanguage.displayName} code...\n\nOutput:\nCode execution is simulated. In a real environment, this would compile and run your code.`);
  };

  const handleSave = () => {
    setIsSaved(true);
    // Simulate save operation
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleReset = () => {
    setCode(activeLanguage.template);
    setIsSaved(false);
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      java: '.java',
      python: '.py',
      cpp: '.cpp',
      javascript: '.js',
      csharp: '.cs'
    };
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code${extensions[activeLanguage.id] || '.txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header with Language Buttons */}
      <div className="bg-gray-800/50 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Code2 className="w-6 h-6 text-blue-500" />
              Code Editor
            </h2>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaved 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={isSaved}
              >
                {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={handleCopy}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Copy code"
              >
                {copySuccess ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
              <button
                onClick={handleReset}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Reset to template"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Download code"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className={`p-2 rounded-lg transition-colors ${
                  showTerminal 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                title="Toggle terminal"
              >
                <Terminal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Language Selection Buttons */}
          <div className="flex gap-2 flex-wrap">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => switchLanguage(lang)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  activeLanguage.id === lang.id
                    ? `${lang.bgColor} border-current font-semibold scale-105`
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'
                }`}
              >
                <span className="text-2xl">{lang.icon}</span>
                <span className={activeLanguage.id === lang.id ? lang.color : 'text-gray-300'}>
                  {lang.displayName}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 relative">
            <div className="h-full flex">
              {/* Line Numbers */}
              <div className="w-14 bg-gray-850 border-r border-gray-700 p-2 text-xs text-gray-500 font-mono select-none overflow-hidden">
                {code.split('\n').map((_, index) => (
                  <div key={index} className="h-6 flex items-center justify-end pr-3">
                    {index + 1}
                  </div>
                ))}
              </div>

              {/* Code Area */}
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="flex-1 p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none outline-none leading-6"
                spellCheck={false}
                placeholder={`Write your ${activeLanguage.displayName} code here...`}
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Lines: {code.split('\n').length}</span>
              <span className="text-gray-400">Characters: {code.length}</span>
              <span className={`${activeLanguage.color} font-medium flex items-center gap-1`}>
                <span>{activeLanguage.icon}</span>
                {activeLanguage.displayName}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-400">UTF-8</span>
              <span className={isSaved ? 'text-green-400' : 'text-orange-400'}>
                {isSaved ? '● Saved' : '● Unsaved'}
              </span>
            </div>
          </div>

          {/* Terminal Output */}
          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 200 }}
                exit={{ height: 0 }}
                className="bg-black border-t border-gray-700 overflow-hidden"
              >
                <div className="p-4 font-mono text-sm h-full overflow-y-auto">
                  <div className="text-green-400 mb-2">$ PathWise Code Runner</div>
                  <div className="text-gray-300 whitespace-pre-wrap">{output || 'Click "Run" to execute your code'}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Video,
  Share2,
  Code,
  MessageSquare,
  Lightbulb,
  Target,
  Clock,
  Star,
  Trophy,
  Zap,
  BookOpen,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Camera,
  Mic,
  ScreenShare,
  FileText,
  Download,
  Upload,
  Edit3,
  Save,
  GitBranch,
  Eye,
  EyeOff,
  Heart,
  MessageCircle,
  ThumbsUp,
  Send
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away" | "busy";
  role: "host" | "moderator" | "participant";
  isPresenting?: boolean;
  isMuted?: boolean;
  hasVideo?: boolean;
  cursor?: { x: number; y: number };
}

interface SharedCode {
  id: string;
  title: string;
  language: string;
  content: string;
  author: string;
  lastModified: Date;
  collaborators: string[];
  isLive: boolean;
}

interface LearningSession {
  id: string;
  title: string;
  description: string;
  type: "code_review" | "pair_programming" | "study_group" | "presentation";
  participants: Participant[];
  sharedCode: SharedCode[];
  startTime: Date;
  duration: number;
  isRecording: boolean;
  chatMessages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: "text" | "code_share" | "file_share" | "reaction";
  metadata?: any;
}

interface WhiteboardStroke {
  id: string;
  points: number[];
  color: string;
  width: number;
  tool: "pen" | "highlighter" | "eraser";
  userId: string;
}

export default function CollaborativeLearningHub() {
  const [activeSession, setActiveSession] = useState<LearningSession | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sharedCode, setSharedCode] = useState<SharedCode[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedCodeTab, setSelectedCodeTab] = useState(0);
  const [whiteboardStrokes, setWhiteboardStrokes] = useState<WhiteboardStroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<"pen" | "highlighter" | "eraser">("pen");
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "focus" | "presentation">("grid");

  useEffect(() => {
    // Initialize a demo session
    const demoSession: LearningSession = {
      id: "demo-session",
      title: "React Hooks Deep Dive",
      description: "Interactive coding session exploring advanced React patterns",
      type: "pair_programming",
      participants: [
        {
          id: "user-1",
          name: "You",
          avatar: "👤",
          status: "online",
          role: "host",
          isPresenting: false,
          isMuted: false,
          hasVideo: true
        },
        {
          id: "user-2",
          name: "Sarah Chen",
          avatar: "👩‍💻",
          status: "online",
          role: "participant",
          isPresenting: false,
          isMuted: false,
          hasVideo: true
        },
        {
          id: "user-3",
          name: "Mike Rodriguez",
          avatar: "👨‍💻",
          status: "online",
          role: "moderator",
          isPresenting: true,
          isMuted: false,
          hasVideo: true
        }
      ],
      sharedCode: [
        {
          id: "code-1",
          title: "useEffect Hook Example",
          language: "javascript",
          content: `import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(\`/api/users/\${userId}\`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const userData = await response.json();
        
        if (!isCancelled) {
          setUser(userData);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
          setUser(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    // Cleanup function to prevent memory leaks
    return () => {
      isCancelled = true;
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <img src={user.avatar} alt="Avatar" />
    </div>
  );
}`,
          author: "Mike Rodriguez",
          lastModified: new Date(),
          collaborators: ["Sarah Chen", "You"],
          isLive: true
        }
      ],
      startTime: new Date(),
      duration: 90,
      isRecording: false,
      chatMessages: [
        {
          id: "msg-1",
          userId: "user-2",
          userName: "Sarah Chen",
          content: "Great example! I like how you handled the cleanup function to prevent memory leaks.",
          timestamp: new Date(Date.now() - 120000),
          type: "text"
        },
        {
          id: "msg-2",
          userId: "user-3",
          userName: "Mike Rodriguez",
          content: "Thanks! This is a common pattern when dealing with async operations in useEffect.",
          timestamp: new Date(Date.now() - 60000),
          type: "text"
        }
      ]
    };

    setActiveSession(demoSession);
    setParticipants(demoSession.participants);
    setSharedCode(demoSession.sharedCode);
    setChatMessages(demoSession.chatMessages);
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: "user-1",
      userName: "You",
      content: newMessage.trim(),
      timestamp: new Date(),
      type: "text"
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const shareCode = () => {
    const newCode: SharedCode = {
      id: Date.now().toString(),
      title: "New Code Snippet",
      language: "javascript",
      content: "// Your code here\nconsole.log('Hello, World!');",
      author: "You",
      lastModified: new Date(),
      collaborators: [],
      isLive: true
    };

    setSharedCode(prev => [...prev, newCode]);
    setSelectedCodeTab(sharedCode.length);
  };

  const togglePresenting = () => {
    setIsPresenting(!isPresenting);
    setParticipants(prev => prev.map(p => 
      p.id === "user-1" ? { ...p, isPresenting: !isPresenting } : p
    ));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const getParticipantsByRole = () => {
    const presenter = participants.find(p => p.isPresenting);
    const others = participants.filter(p => !p.isPresenting);
    return { presenter, others };
  };

  const { presenter, others } = getParticipantsByRole();

  return (
    <div className="h-screen bg-neutral-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-neutral-800 border-b border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <h1 className="text-xl font-semibold">
                {activeSession?.title || "Collaborative Learning Hub"}
              </h1>
              <p className="text-sm text-neutral-400">
                {activeSession?.participants.length || 0} participants • {activeSession?.type?.replace('_', ' ')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Controls */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? "bg-red-500 hover:bg-red-600" : "bg-neutral-700 hover:bg-neutral-600"
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setHasVideo(!hasVideo)}
              className={`p-2 rounded-lg transition-colors ${
                !hasVideo ? "bg-red-500 hover:bg-red-600" : "bg-neutral-700 hover:bg-neutral-600"
              }`}
            >
              <Camera className="w-5 h-5" />
            </button>
            
            <button
              onClick={togglePresenting}
              className={`p-2 rounded-lg transition-colors ${
                isPresenting ? "bg-blue-500 hover:bg-blue-600" : "bg-neutral-700 hover:bg-neutral-600"
              }`}
            >
              <Screen className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-lg transition-colors ${
                isRecording ? "bg-red-500 hover:bg-red-600" : "bg-neutral-700 hover:bg-neutral-600"
              }`}
            >
              <Video className="w-5 h-5" />
            </button>

            {/* View Mode Selector */}
            <div className="flex bg-neutral-700 rounded-lg p-1">
              {[
                { mode: "grid", icon: Users },
                { mode: "focus", icon: Eye },
                { mode: "presentation", icon: Maximize }
              ].map((view) => {
                const IconComponent = view.icon;
                return (
                  <button
                    key={view.mode}
                    onClick={() => setViewMode(view.mode as typeof viewMode)}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === view.mode ? "bg-neutral-600" : "hover:bg-neutral-600"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid / Participants */}
        <div className={`${viewMode === "presentation" ? "w-1/4" : "w-1/3"} bg-neutral-800 border-r border-neutral-700 flex flex-col`}>
          <div className="p-4 border-b border-neutral-700">
            <h3 className="font-semibold mb-3">Participants ({participants.length})</h3>
            
            {/* Presenter View */}
            {presenter && viewMode !== "grid" && (
              <div className="mb-4">
                <div className="bg-neutral-900 rounded-lg p-4 relative">
                  <div className="aspect-video bg-neutral-700 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-4xl">{presenter.avatar}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{presenter.name}</p>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-neutral-400">Presenting</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!presenter.isMuted && <Mic className="w-4 h-4 text-green-500" />}
                      {presenter.hasVideo && <Camera className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Participants Grid */}
            <div className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-1" : "grid-cols-2"}`}>
              {(viewMode === "grid" ? participants : others).map((participant) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-neutral-900 rounded-lg p-3 relative"
                >
                  <div className={`${viewMode === "grid" ? "aspect-video" : "aspect-square"} bg-neutral-700 rounded-lg flex items-center justify-center mb-2`}>
                    <span className={`${viewMode === "grid" ? "text-3xl" : "text-2xl"}`}>
                      {participant.avatar}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{participant.name}</p>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          participant.status === "online" ? "bg-green-500" :
                          participant.status === "away" ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                        <span className="text-xs text-neutral-400 capitalize">
                          {participant.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!participant.isMuted && <Mic className="w-3 h-3 text-green-500" />}
                      {participant.hasVideo && <Camera className="w-3 h-3 text-green-500" />}
                    </div>
                  </div>
                  
                  {participant.isPresenting && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Presenting
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-neutral-700">
              <h3 className="font-semibold">Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
                <div key={message.id} className="text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-blue-400">{message.userName}:</span>
                    <span className="text-neutral-300">{message.content}</span>
                  </div>
                  <span className="text-xs text-neutral-500 ml-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-neutral-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor / Shared Content */}
        <div className="flex-1 flex flex-col bg-neutral-900">
          {/* Tabs */}
          <div className="bg-neutral-800 border-b border-neutral-700 flex items-center gap-1 px-4">
            {sharedCode.map((code, index) => (
              <button
                key={code.id}
                onClick={() => setSelectedCodeTab(index)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  selectedCodeTab === index
                    ? "bg-neutral-900 text-white border-t-2 border-blue-500"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {code.title}
                  {code.isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                </div>
              </button>
            ))}
            <button
              onClick={shareCode}
              className="ml-2 p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Code Editor */}
          {sharedCode[selectedCodeTab] && (
            <div className="flex-1 flex flex-col">
              {/* Editor Header */}
              <div className="bg-neutral-800 border-b border-neutral-700 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{sharedCode[selectedCodeTab].title}</span>
                  <span className="text-xs text-neutral-400">
                    {sharedCode[selectedCodeTab].language}
                  </span>
                  <div className="flex items-center gap-1">
                    {sharedCode[selectedCodeTab].collaborators.map((collaborator, i) => (
                      <div key={i} className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">
                        {collaborator.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-1 text-neutral-400 hover:text-white">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-neutral-400 hover:text-white">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-neutral-400 hover:text-white">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Code Content */}
              <div className="flex-1 p-4 font-mono text-sm overflow-auto">
                <pre className="text-neutral-100 whitespace-pre-wrap">
                  {sharedCode[selectedCodeTab].content}
                </pre>
              </div>
            </div>
          )}

          {/* Bottom Toolbar */}
          <div className="bg-neutral-800 border-t border-neutral-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowWhiteboard(!showWhiteboard)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                  showWhiteboard ? "bg-blue-500 text-white" : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Whiteboard
              </button>
              
              <button className="flex items-center gap-2 px-3 py-1 bg-neutral-700 text-neutral-300 hover:bg-neutral-600 rounded-lg text-sm transition-colors">
                <GitBranch className="w-4 h-4" />
                Version Control
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live collaboration active
              </div>
              <span>•</span>
              <span>Last saved: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Whiteboard Overlay */}
      {showWhiteboard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl w-11/12 h-5/6 flex flex-col">
            <div className="bg-neutral-100 px-6 py-4 rounded-t-2xl border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Collaborative Whiteboard</h3>
              <button
                onClick={() => setShowWhiteboard(false)}
                className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 relative bg-white">
              {/* Whiteboard content would go here */}
              <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                <div className="text-center">
                  <Edit3 className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">Interactive Whiteboard</p>
                  <p className="text-sm">Draw, annotate, and collaborate in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

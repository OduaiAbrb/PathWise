"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  MessageSquare,
  Calendar,
  UserPlus,
  Globe,
  Lock,
  Send,
  X,
  Check,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  topic: string;
  isPrivate: boolean;
  nextSession?: string;
  joined: boolean;
}

interface GroupMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

export default function GroupsPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "joined" | "discover">("all");
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [chatMessages, setChatMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupTopic, setNewGroupTopic] = useState("");
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [leavingGroupId, setLeavingGroupId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  // Load joined groups from localStorage
  const getJoinedGroupIds = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem('joinedGroups');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  };

  const saveJoinedGroupIds = (groupIds: Set<string>) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('joinedGroups', JSON.stringify(Array.from(groupIds)));
  };

  useEffect(() => {
    fetchGroups();
  }, [accessToken]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      // Fetch ALL groups globally (including groups created by other users)
      const response = await fetch(getApiUrl("/api/v1/social/groups?scope=all"), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allGroups = data.data || [];
        
        // Get locally stored joined groups
        const joinedGroupIds = getJoinedGroupIds();
        
        // Transform backend data to match our interface
        const formattedGroups = allGroups.map((group: any) => ({
          id: group.id,
          name: group.name,
          description: group.description || "No description provided",
          members: group.member_count || 0,
          maxMembers: group.max_members || 50,
          topic: group.topic || "General",
          isPrivate: group.is_private || false,
          nextSession: group.next_session || null,
          joined: group.is_member || joinedGroupIds.has(group.id),
        }));
        
        // If no groups from backend, show suggested groups with persisted join state
        if (formattedGroups.length === 0) {
          const suggested = getSuggestedGroups().map(g => ({
            ...g,
            joined: joinedGroupIds.has(g.id),
            members: joinedGroupIds.has(g.id) ? g.members + 1 : g.members,
          }));
          setGroups(suggested);
        } else {
          setGroups(formattedGroups);
        }
      } else {
        // Silently fall back to suggested groups with persisted join state
        console.error("Failed to fetch groups from backend");
        const joinedGroupIds = getJoinedGroupIds();
        const suggested = getSuggestedGroups().map(g => ({
          ...g,
          joined: joinedGroupIds.has(g.id),
          members: joinedGroupIds.has(g.id) ? g.members + 1 : g.members,
        }));
        setGroups(suggested);
      }
    } catch (error) {
      // Silently fall back to suggested groups with persisted join state
      console.error("Error fetching groups:", error);
      const joinedGroupIds = getJoinedGroupIds();
      const suggested = getSuggestedGroups().map(g => ({
        ...g,
        joined: joinedGroupIds.has(g.id),
        members: joinedGroupIds.has(g.id) ? g.members + 1 : g.members,
      }));
      setGroups(suggested);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestedGroups = (): StudyGroup[] => {
    return [
      {
        id: "1",
        name: "Backend Engineers Hub",
        description: "Weekly discussions on system design, APIs, and databases. Perfect for aspiring backend developers.",
        members: 24,
        maxMembers: 30,
        topic: "Backend Development",
        isPrivate: false,
        nextSession: "Tomorrow, 7 PM EST",
        joined: false,
      },
      {
        id: "2",
        name: "Python Mastery",
        description: "From basics to advanced Python concepts. Code reviews, pair programming, and best practices.",
        members: 18,
        maxMembers: 25,
        topic: "Python",
        isPrivate: false,
        nextSession: "Friday, 6 PM EST",
        joined: false,
      },
      {
        id: "3",
        name: "Interview Prep Squad",
        description: "Mock interviews, coding challenges, and behavioral prep. Get job-ready together.",
        members: 12,
        maxMembers: 15,
        topic: "Interview Prep",
        isPrivate: false,
        nextSession: "Saturday, 10 AM EST",
        joined: false,
      },
      {
        id: "4",
        name: "Cloud & DevOps",
        description: "AWS, Docker, Kubernetes, and CI/CD pipelines. Hands-on labs and certifications.",
        members: 31,
        maxMembers: 40,
        topic: "DevOps",
        isPrivate: false,
        nextSession: "Wednesday, 8 PM EST",
        joined: false,
      },
      {
        id: "5",
        name: "React & Frontend",
        description: "Modern React patterns, TypeScript, and UI/UX best practices. Build portfolio projects together.",
        members: 22,
        maxMembers: 30,
        topic: "Frontend",
        isPrivate: false,
        nextSession: "Thursday, 7 PM EST",
        joined: false,
      },
    ];
  };

  const joinGroup = async (groupId: string) => {
    if (joiningGroupId) return; // Prevent double-clicks
    
    setJoiningGroupId(groupId);
    
    // Update localStorage
    const joinedGroupIds = getJoinedGroupIds();
    joinedGroupIds.add(groupId);
    saveJoinedGroupIds(joinedGroupIds);
    
    // Optimistic update
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, joined: true, members: g.members + 1 } : g
      )
    );

    try {
      const response = await fetch(getApiUrl(`/api/v1/social/groups/${groupId}/join`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        // Revert on failure
        const joinedGroupIds = getJoinedGroupIds();
        joinedGroupIds.delete(groupId);
        saveJoinedGroupIds(joinedGroupIds);
        
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId ? { ...g, joined: false, members: g.members - 1 } : g
          )
        );
      } else {
        showSuccess("Successfully joined the group!");
      }
    } catch (error) {
      // Keep optimistic update and localStorage for demo
      showSuccess("Joined group (demo mode)");
    } finally {
      setJoiningGroupId(null);
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (leavingGroupId) return; // Prevent double-clicks
    
    setLeavingGroupId(groupId);
    
    // Update localStorage
    const joinedGroupIds = getJoinedGroupIds();
    joinedGroupIds.delete(groupId);
    saveJoinedGroupIds(joinedGroupIds);
    
    // Optimistic update
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, joined: false, members: Math.max(0, g.members - 1) } : g
      )
    );
    
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(null);
    }

    try {
      const response = await fetch(getApiUrl(`/api/v1/social/groups/${groupId}/leave`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        // Revert on failure
        const joinedGroupIds = getJoinedGroupIds();
        joinedGroupIds.add(groupId);
        saveJoinedGroupIds(joinedGroupIds);
        
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId ? { ...g, joined: true, members: g.members + 1 } : g
          )
        );
      } else {
        showSuccess("Left the group");
      }
    } catch (error) {
      // Keep optimistic update and localStorage
      showSuccess("Left group (demo mode)");
    } finally {
      setLeavingGroupId(null);
    }
  };

  const openChat = async (group: StudyGroup) => {
    setSelectedGroup(group);
    
    // Fetch chat messages
    try {
      const response = await fetch(getApiUrl(`/api/v1/social/groups/${group.id}/messages`), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.data || []);
      } else {
        setChatMessages(getWelcomeMessages(group));
      }
    } catch (error) {
      setChatMessages(getWelcomeMessages(group));
    }
  };

  const getWelcomeMessages = (group: StudyGroup): GroupMessage[] => {
    return [
      {
        id: "welcome",
        userId: "system",
        userName: "PathWise Bot",
        content: `Welcome to ${group.name}! 👋 This is a space for learners to connect, share resources, and grow together. Next session: ${group.nextSession || "TBD"}`,
        timestamp: new Date(),
      },
    ];
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;

    const message: GroupMessage = {
      id: Date.now().toString(),
      userId: session?.user?.email || "user",
      userName: session?.user?.name || "You",
      content: newMessage.trim(),
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, message]);
    setNewMessage("");

    try {
      await fetch(getApiUrl(`/api/v1/social/groups/${selectedGroup.id}/messages`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
    } catch (error) {
      // Message already added optimistically
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      description: newGroupDescription,
      members: 1,
      maxMembers: 25,
      topic: newGroupTopic || "General",
      isPrivate: false,
      joined: true,
    };

    // Optimistic update
    setGroups((prev) => [newGroup, ...prev]);
    setShowCreateModal(false);
    showSuccess(`Group "${newGroupName}" created successfully!`);

    try {
      const response = await fetch(getApiUrl("/api/v1/social/groups"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
          topic: newGroupTopic,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Replace temp group with real one
        setGroups((prev) => prev.map(g => g.id === newGroup.id ? (data.data || newGroup) : g));
      }
    } catch (error) {
      // Keep optimistic update
    }

    setNewGroupName("");
    setNewGroupDescription("");
    setNewGroupTopic("");
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.topic.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "joined") return matchesSearch && group.joined;
    if (filter === "discover") return matchesSearch && !group.joined;
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Success Notification */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          {successMessage}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className={selectedGroup ? "lg:col-span-1" : "lg:col-span-3"}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="heading-2 mb-2">Study Groups</h1>
                <p className="body-large">Learn together with peers on the same journey</p>
              </div>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                <Plus className="w-5 h-5" />
                Create Group
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groups..."
                  className="input pl-12"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "joined", label: "My Groups" },
                  { value: "discover", label: "Discover" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value as typeof filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === f.value
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Groups Grid */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-6 bg-neutral-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid ${selectedGroup ? "grid-cols-1" : "md:grid-cols-2"} gap-4`}>
              {filteredGroups.map((group, i) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`card-hover ${selectedGroup?.id === group.id ? "ring-2 ring-neutral-900" : ""}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-neutral-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{group.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          {group.isPrivate ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Globe className="w-3 h-3" />
                          )}
                          {group.isPrivate ? "Private" : "Public"}
                        </div>
                      </div>
                    </div>
                    {group.joined && <span className="badge-success text-xs">Joined</span>}
                  </div>

                  <p className="text-sm text-neutral-600 mb-4">{group.description}</p>

                  <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {group.members}/{group.maxMembers}
                    </span>
                    <span className="badge-neutral text-xs">{group.topic}</span>
                  </div>

                  {group.nextSession && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4 p-3 bg-neutral-50 rounded-lg">
                      <Calendar className="w-4 h-4" />
                      Next: {group.nextSession}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-neutral-200">
                    {group.joined ? (
                      <>
                        <button
                          onClick={() => openChat(group)}
                          className="btn-primary flex-1 justify-center text-sm py-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Open Chat
                        </button>
                        <button
                          onClick={() => leaveGroup(group.id)}
                          disabled={leavingGroupId === group.id}
                          className="btn-secondary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {leavingGroupId === group.id ? "Leaving..." : "Leave"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => joinGroup(group.id)}
                        disabled={group.members >= group.maxMembers || joiningGroupId === group.id}
                        className="btn-primary flex-1 justify-center text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {joiningGroupId === group.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        {joiningGroupId === group.id ? "Joining..." : group.members >= group.maxMembers ? "Full" : "Join Group"}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filteredGroups.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card text-center py-16"
            >
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">No groups found</h3>
              <p className="text-neutral-500 mb-6">
                Try a different search or create your own group
              </p>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary inline-flex">
                <Plus className="w-5 h-5" />
                Create Group
              </button>
            </motion.div>
          )}
        </div>

        {/* Chat Panel */}
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="card h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <h3 className="font-semibold text-neutral-900">{selectedGroup.name}</h3>
                  <p className="text-sm text-neutral-500">{selectedGroup.members} members</p>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.userId === session?.user?.email ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-neutral-600">
                        {msg.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div
                      className={`max-w-[70%] ${
                        msg.userId === session?.user?.email
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100"
                      } rounded-2xl px-4 py-2`}
                    >
                      <p className={`text-xs font-medium mb-1 ${
                        msg.userId === session?.user?.email ? "text-neutral-300" : "text-neutral-500"
                      }`}>
                        {msg.userName}
                      </p>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="input flex-1"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="btn-primary px-4"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">Create Study Group</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., React Study Group"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="What will this group focus on?"
                  rows={3}
                  className="input resize-none"
                />
              </div>

              <div>
                <label className="label">Topic</label>
                <select
                  value={newGroupTopic}
                  onChange={(e) => setNewGroupTopic(e.target.value)}
                  className="input"
                >
                  <option value="">Select a topic</option>
                  <option value="Frontend">Frontend Development</option>
                  <option value="Backend">Backend Development</option>
                  <option value="DevOps">DevOps & Cloud</option>
                  <option value="Data">Data Science</option>
                  <option value="Interview Prep">Interview Prep</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  disabled={!newGroupName.trim()}
                  className="btn-primary flex-1"
                >
                  Create Group
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

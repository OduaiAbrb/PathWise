"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Plus, Users, MessageCircle, Search, Lock, Globe } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import toast from "react-hot-toast";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  member_count: number;
  max_members: number;
  is_private: boolean;
  role?: string;
}

export default function GroupsPage() {
  const { data: session } = useSession();
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [allGroups, setAllGroups] = useState<StudyGroup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    topic: "",
    max_members: 10,
    is_private: false,
  });
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    fetchMyGroups();
    fetchAllGroups();
  }, [accessToken]);

  const fetchMyGroups = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch("/api/v1/social/groups/my-groups", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMyGroups(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch my groups:", error);
    }
  };

  const fetchAllGroups = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch("/api/v1/social/groups/search", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAllGroups(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  const createGroup = async () => {
    if (!newGroup.name || !newGroup.topic) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/v1/social/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newGroup),
      });

      if (!response.ok) throw new Error("Failed to create group");

      toast.success("Group created!");
      setShowCreateModal(false);
      setNewGroup({ name: "", description: "", topic: "", max_members: 10, is_private: false });
      fetchMyGroups();
      fetchAllGroups();
    } catch (error) {
      toast.error("Failed to create group");
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const response = await fetch("/api/v1/social/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ group_id: groupId }),
      });

      if (!response.ok) throw new Error("Failed to join group");

      toast.success("Joined group!");
      fetchMyGroups();
      fetchAllGroups();
    } catch (error) {
      toast.error("Failed to join group");
    }
  };

  const filteredGroups = allGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Study Groups</h1>
            <p className="text-dark-400">Learn together with peers</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Group
          </Button>
        </motion.div>

        {/* Create Group Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Create Study Group</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="Group Name"
                    className="w-full bg-dark-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={newGroup.topic}
                    onChange={(e) => setNewGroup({ ...newGroup, topic: e.target.value })}
                    placeholder="Topic (e.g., React, Python)"
                    className="w-full bg-dark-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Description"
                    className="w-full bg-dark-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                  />
                  <div className="flex gap-4">
                    <Button onClick={createGroup}>Create</Button>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* My Groups */}
        {myGroups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">My Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((group) => (
                <Card key={group.id} className="bg-dark-900/50 border-dark-800 hover:border-primary-500/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-semibold">{group.name}</h3>
                      {group.role === "admin" && (
                        <Badge variant="primary" className="text-xs">Admin</Badge>
                      )}
                    </div>
                    <p className="text-dark-400 text-sm mb-3 line-clamp-2">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-dark-500 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{group.member_count}/{group.max_members}</span>
                      </div>
                      <Button size="sm" variant="secondary">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-500 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="w-full bg-dark-900 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* All Groups */}
        <h2 className="text-xl font-semibold text-white mb-4">Discover Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{group.name}</h3>
                    <Badge variant="secondary" className="text-xs">{group.topic}</Badge>
                  </div>
                  {group.is_private ? (
                    <Lock className="w-4 h-4 text-dark-500" />
                  ) : (
                    <Globe className="w-4 h-4 text-dark-500" />
                  )}
                </div>
                <p className="text-dark-400 text-sm mb-4 line-clamp-2">{group.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-dark-500 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{group.member_count}/{group.max_members}</span>
                  </div>
                  <Button size="sm" onClick={() => joinGroup(group.id)}>
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

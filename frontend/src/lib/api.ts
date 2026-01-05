import type {
  Roadmap,
  RoadmapGenerationInput,
  Progress,
  Resource,
  ChatMessage,
  ResumeAnalysis,
  JobMatch,
  ApiResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}/api/v1${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: async (data: { name: string; email: string; password: string }) =>
    fetchApi<ApiResponse<{ token: string }>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: async (data: { email: string; password: string }) =>
    fetchApi<ApiResponse<{ token: string }>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: async () =>
    fetchApi<ApiResponse<null>>("/auth/logout", { method: "POST" }),

  getProfile: async () => fetchApi<ApiResponse<{ user: unknown }>>("/auth/me"),
};

// Roadmap API
export const roadmapApi = {
  generate: async (data: RoadmapGenerationInput) => {
    const formData = new FormData();
    formData.append("job_description", data.jobDescription);
    formData.append("skill_level", data.skillLevel);
    formData.append("industry", data.industry);
    if (data.resumeFile) {
      formData.append("resume", data.resumeFile);
    }

    const response = await fetch(`${API_BASE}/api/v1/roadmaps/generate`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to generate roadmap");
    }

    return response.json() as Promise<ApiResponse<Roadmap>>;
  },

  getAll: async () => fetchApi<ApiResponse<Roadmap[]>>("/roadmaps"),

  getById: async (id: string) =>
    fetchApi<ApiResponse<Roadmap>>(`/roadmaps/${id}`),

  update: async (id: string, data: Partial<Roadmap>) =>
    fetchApi<ApiResponse<Roadmap>>(`/roadmaps/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: async (id: string) =>
    fetchApi<ApiResponse<null>>(`/roadmaps/${id}`, { method: "DELETE" }),
};

// Progress API
export const progressApi = {
  getByRoadmap: async (roadmapId: string) =>
    fetchApi<ApiResponse<Progress[]>>(`/progress/${roadmapId}`),

  updateSkill: async (data: {
    roadmapId: string;
    skillId: string;
    status: Progress["status"];
  }) =>
    fetchApi<ApiResponse<Progress>>("/progress/update", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logTime: async (data: { roadmapId: string; skillId: string; minutes: number }) =>
    fetchApi<ApiResponse<Progress>>("/progress/time", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Resources API
export const resourcesApi = {
  search: async (params: { skill?: string; difficulty?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.skill) searchParams.append("skill", params.skill);
    if (params.difficulty) searchParams.append("difficulty", params.difficulty);

    return fetchApi<ApiResponse<Resource[]>>(
      `/resources/search?${searchParams.toString()}`
    );
  },

  recommend: async (skillId: string) =>
    fetchApi<ApiResponse<Resource[]>>("/resources/recommend", {
      method: "POST",
      body: JSON.stringify({ skillId }),
    }),
};

// Chat API
export const chatApi = {
  ask: async (data: { roadmapId: string; question: string }) =>
    fetchApi<ApiResponse<ChatMessage>>("/chat/ask", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getHistory: async (roadmapId: string) =>
    fetchApi<ApiResponse<ChatMessage[]>>(`/chat/history/${roadmapId}`),
};

// Resume API
export const resumeApi = {
  analyze: async (file: File, roadmapId?: string) => {
    const formData = new FormData();
    formData.append("resume", file);
    if (roadmapId) formData.append("roadmap_id", roadmapId);

    const response = await fetch(`${API_BASE}/api/v1/resume/analyze`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to analyze resume");
    }

    return response.json() as Promise<ApiResponse<ResumeAnalysis>>;
  },
};

// Jobs API
export const jobsApi = {
  getMatches: async (roadmapId: string) =>
    fetchApi<ApiResponse<JobMatch[]>>(`/jobs/matches/${roadmapId}`),

  triggerScan: async (roadmapId: string) =>
    fetchApi<ApiResponse<{ status: string }>>("/jobs/scan", {
      method: "POST",
      body: JSON.stringify({ roadmapId }),
    }),
};

// Payments API
export const paymentsApi = {
  createCheckout: async (tier: "pro" | "enterprise") =>
    fetchApi<ApiResponse<{ checkoutUrl: string }>>("/payments/checkout", {
      method: "POST",
      body: JSON.stringify({ tier }),
    }),

  getStatus: async () =>
    fetchApi<ApiResponse<{ tier: string; expiresAt: string | null }>>(
      "/payments/status"
    ),
};

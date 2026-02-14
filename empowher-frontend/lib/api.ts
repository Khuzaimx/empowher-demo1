/**
 * API Client for EmpowHer Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  data?: any;
}

async function apiClient(endpoint: string, options: FetchOptions = {}) {
  const { data, ...customConfig } = options;

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...customConfig.headers,
    },
    credentials: 'include', // Important for cookies
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    // Log detailed error information for debugging
    console.error('API Error Details:', {
      url: `${API_URL}${endpoint}`,
      status: response.status,
      statusText: response.statusText,
      method: config.method
    });

    const error = await response.json().catch(() => ({ error: 'Network error' }));
    console.error('API Error Response:', error);

    // Provide more specific error messages
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (response.status === 400) {
      throw new Error(error.error || error.errors?.[0]?.msg || 'Invalid request data');
    } else if (response.status === 404) {
      throw new Error('API endpoint not found');
    } else {
      throw new Error(error.error || `API request failed (${response.status})`);
    }
  }

  return response.json();
}

// Auth endpoints
export const auth = {
  signup: (email: string, password: string) =>
    apiClient('/auth/signup', { data: { email, password } }),

  login: (email: string, password: string) =>
    apiClient('/auth/login', { data: { email, password } }),

  logout: () =>
    apiClient('/auth/logout', { method: 'POST' }),

  getCurrentUser: () =>
    apiClient('/auth/me'),

  createAnonymousSession: () =>
    apiClient('/auth/anonymous', { method: 'POST' }),
};

// Emotional tracking endpoints
export const emotional = {
  submitCheckin: (data: {
    // Research instruments (new format)
    phq2_q1?: number;
    phq2_q2?: number;
    gad2_q1?: number;
    gad2_q2?: number;
    who5_q1?: number;
    who5_q2?: number;
    who5_q3?: number;
    // Legacy format (backward compatible)
    mood_score?: number;
    energy_level?: string;
    stress_level?: string;
    // Common fields
    journal?: string;
    interests?: string[];
  }) =>
    apiClient('/emotional/checkin', { data }),

  getHistory: (days: number = 7) =>
    apiClient(`/emotional/history?days=${days}`),

  getCurrentLevel: () =>
    apiClient('/emotional/current-level'),

  getEntry: (id: string) =>
    apiClient(`/emotional/entry/${id}`),
};

// Skills endpoints
export const skills = {
  getRecommendations: () =>
    apiClient('/skills/recommended'),

  getSkillModule: (id: string) =>
    apiClient(`/skills/${id}`),

  startSkill: (id: string) =>
    apiClient(`/skills/${id}/start`, { method: 'POST' }),

  updateProgress: (id: string, progress_percentage: number) =>
    apiClient(`/skills/${id}/progress`, {
      method: 'PUT',
      data: { progress_percentage }
    }),

  completeSkill: (id: string) =>
    apiClient(`/skills/${id}/complete`, { method: 'POST' }),

  getUserProgress: () =>
    apiClient('/skills/progress'),
};

// User endpoints
export const user = {
  getDashboard: () =>
    apiClient('/user/dashboard'),

  exportData: () =>
    apiClient('/user/export'),

  deleteAccount: () =>
    apiClient('/user/account', { method: 'DELETE' }),

  updateConsent: (consent_type: string, consented: boolean) =>
    apiClient('/user/consent', {
      data: { consent_type, consented }
    }),
};

// Crisis endpoints
export const crisis = {
  getHelplines: (region?: string) =>
    apiClient(`/crisis/helplines${region ? `?region=${region}` : ''}`),
};

// Admin endpoints
export const admin = {
  getStats: () =>
    apiClient('/admin/stats'),

  getHelplines: () =>
    apiClient('/admin/helplines'),

  createHelpline: (data: any) =>
    apiClient('/admin/helplines', { data }),

  updateHelpline: (id: string, data: any) =>
    apiClient(`/admin/helplines/${id}`, { method: 'PUT', data }),

  createSkillModule: (data: any) =>
    apiClient('/admin/skills', { data }),

  updateSkillModule: (id: string, data: any) =>
    apiClient(`/admin/skills/${id}`, { method: 'PUT', data }),
};

// Agent endpoints
export const agents = {
  recordOutcome: (data: {
    decisionId: string;
    action: string;
    completed: boolean;
    rating?: number;
    timeToComplete?: number;
  }) =>
    apiClient('/agents/outcomes', { data }),

  getDecisions: () =>
    apiClient('/agents/decisions'),

  getMemory: () =>
    apiClient('/agents/memory'),

  getAnalytics: () =>
    apiClient('/agents/analytics'),
};

// Unified API export
export const api = {
  auth,
  emotional,
  skills,
  user,
  crisis,
  admin,
  agents,
};

export default api;

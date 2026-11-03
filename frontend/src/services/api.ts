import {
  Project,
  ProjectDetail,
  Material,
  Resource,
  Alert,
  DashboardSummary,
  ChartData,
  AnalyticsOverview,
  RiskAssessment,
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'API Request failed' }));
    throw new Error(errorData.detail || `HTTP Error ${res.status}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Projects
  getProjects: (params?: { search?: string; status?: string; manager?: string; risk_level?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.manager) query.append('manager', params.manager);
    if (params?.risk_level) query.append('risk_level', params.risk_level);
    return fetchJSON<Project[]>(`${API_BASE}/projects?${query.toString()}`);
  },

  getProjectDetail: (id: number) => fetchJSON<ProjectDetail>(`${API_BASE}/projects/${id}`),

  createProject: (data: Partial<Project>) =>
    fetchJSON<Project>(`${API_BASE}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProject: (id: number, data: Partial<Project>) =>
    fetchJSON<Project>(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProject: (id: number) =>
    fetchJSON<void>(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    }),

  // Materials
  getMaterials: (params?: { project_id?: number; supplier?: string; category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.project_id) query.append('project_id', params.project_id.toString());
    if (params?.supplier) query.append('supplier', params.supplier);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    return fetchJSON<Material[]>(`${API_BASE}/materials?${query.toString()}`);
  },

  createMaterial: (data: Partial<Material>) =>
    fetchJSON<Material>(`${API_BASE}/materials`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMaterial: (id: number, data: Partial<Material>) =>
    fetchJSON<Material>(`${API_BASE}/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMaterial: (id: number) =>
    fetchJSON<void>(`${API_BASE}/materials/${id}`, {
      method: 'DELETE',
    }),

  // Resources
  getResources: (params?: { type?: string; availability?: string; project_id?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.availability) query.append('availability', params.availability);
    if (params?.project_id) query.append('project_id', params.project_id.toString());
    if (params?.search) query.append('search', params.search);
    return fetchJSON<Resource[]>(`${API_BASE}/resources?${query.toString()}`);
  },

  createResource: (data: Partial<Resource>) =>
    fetchJSON<Resource>(`${API_BASE}/resources`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateResource: (id: number, data: Partial<Resource>) =>
    fetchJSON<Resource>(`${API_BASE}/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteResource: (id: number) =>
    fetchJSON<void>(`${API_BASE}/resources/${id}`, {
      method: 'DELETE',
    }),

  // Risk Intelligence
  getRiskOverview: () => fetchJSON<any[]>(`${API_BASE}/risk-intelligence/overview`),
  reevaluateRisk: (projectId: number) => fetchJSON<any>(`${API_BASE}/risk-intelligence/reevaluate/${projectId}`, { method: 'POST' }),

  // Analytics & Dashboard
  getDashboardSummary: () => fetchJSON<DashboardSummary>(`${API_BASE}/analytics/dashboard-summary`),
  getDashboardCharts: () => fetchJSON<ChartData>(`${API_BASE}/analytics/charts`),
  getAnalyticsOverview: () => fetchJSON<AnalyticsOverview>(`${API_BASE}/analytics/overview`),

  // Alerts
  getAlerts: (unreadOnly = false) => fetchJSON<Alert[]>(`${API_BASE}/alerts?unread_only=${unreadOnly}`),
  markAlertRead: (id: number) => fetchJSON<Alert>(`${API_BASE}/alerts/${id}/read`, { method: 'PUT' }),

  // Seed Data
  seedDatabase: () => fetchJSON<{ message: string; project_count: number }>(`${API_BASE}/seed`, { method: 'POST' }),
};

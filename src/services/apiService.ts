import type {
  CustomToolItem,
  RouteSEOConfig,
  GlobalSEOSettings,
  AnnouncementConfig,
  BrandingConfig,
  SiteConfigState,
} from '../types/admin';

const API_BASE = '/api';

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Universal Request Helper with timeout
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.error || errorJson.message || errorMsg;
      } catch {
        // Fallback for HTML or non-JSON error pages (like 502 Bad Gateway)
      }
      return {
        success: false,
        error: errorMsg,
        status: res.status,
      };
    }

    const json = await res.json();
    return json;
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: err.name === 'AbortError' ? 'API request timed out' : err.message || 'Network error',
    };
  }
}

export const apiService = {
  // Health & Database status
  async checkHealth(): Promise<{ connected: boolean; database?: any; server?: string }> {
    try {
      const res = await request('/health', { method: 'GET' });
      if (res.status === 'ok') {
        return { connected: true, database: res.database, server: res.server };
      }
      return { connected: false };
    } catch {
      return { connected: false };
    }
  },

  // Auth / PIN
  async verifyPin(pin: string): Promise<ApiResponse<{ authenticated: boolean; token?: string }>> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },

  async changePin(newPin: string): Promise<ApiResponse> {
    return request('/auth/change-pin', {
      method: 'POST',
      body: JSON.stringify({ newPin }),
    });
  },

  // Full Site Config
  async fetchConfig(): Promise<ApiResponse<SiteConfigState>> {
    return request<SiteConfigState>('/config', { method: 'GET' });
  },

  async saveConfig(payload: Partial<SiteConfigState>): Promise<ApiResponse> {
    return request('/config', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Tools CRUD
  async fetchTools(): Promise<ApiResponse<CustomToolItem[]>> {
    return request<CustomToolItem[]>('/tools', { method: 'GET' });
  },

  async addTool(tool: Omit<CustomToolItem, 'isCustom'>): Promise<ApiResponse<CustomToolItem>> {
    return request<CustomToolItem>('/tools', {
      method: 'POST',
      body: JSON.stringify(tool),
    });
  },

  async updateTool(id: string, tool: Partial<CustomToolItem>): Promise<ApiResponse<CustomToolItem>> {
    return request<CustomToolItem>(`/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tool),
    });
  },

  async toggleTool(id: string): Promise<ApiResponse<CustomToolItem>> {
    return request<CustomToolItem>(`/tools/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  async deleteTool(id: string): Promise<ApiResponse> {
    return request(`/tools/${id}`, {
      method: 'DELETE',
    });
  },

  // SEO Routes
  async fetchSEO(): Promise<ApiResponse<Record<string, RouteSEOConfig>>> {
    return request<Record<string, RouteSEOConfig>>('/seo', { method: 'GET' });
  },

  async saveSEORoute(path: string, config: RouteSEOConfig): Promise<ApiResponse> {
    return request('/seo', {
      method: 'PUT',
      body: JSON.stringify({ ...config, path }),
    });
  },

  async deleteSEORoute(path: string): Promise<ApiResponse> {
    return request('/seo', {
      method: 'DELETE',
      body: JSON.stringify({ path }),
    });
  },

  // Announcements
  async updateAnnouncement(config: Partial<AnnouncementConfig>): Promise<ApiResponse> {
    return request('/announcement', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  // Branding & Global SEO
  async updateBranding(
    branding?: Partial<BrandingConfig>,
    globalSEO?: Partial<GlobalSEOSettings>
  ): Promise<ApiResponse> {
    return request('/branding', {
      method: 'PUT',
      body: JSON.stringify({ branding, globalSEO }),
    });
  },

  // Analytics
  async fetchAnalytics(): Promise<ApiResponse> {
    return request('/analytics', { method: 'GET' });
  },

  async trackTask(type: string, count = 1): Promise<ApiResponse> {
    return request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ type, count }),
    });
  },

  // Backups & Reset
  async restoreBackup(backupData: any): Promise<ApiResponse> {
    return request('/backup/import', {
      method: 'POST',
      body: JSON.stringify(backupData),
    });
  },

  async resetDefaults(): Promise<ApiResponse> {
    return request('/reset', {
      method: 'POST',
    });
  },
};

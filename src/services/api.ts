const API_BASE = (typeof window !== 'undefined' && window.location.port === '5000')
  ? '/api'
  : (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:5000/api'
    : 'http://localhost:5000/api';

const authHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? window.sessionStorage.getItem('solarcare_access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export const authApi = {
  async checkEmail(email: string): Promise<{ exists: boolean; valid: boolean; email?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      return await res.json();
    } catch {
      return { exists: false, valid: true };
    }
  },

  async sendVerificationCode(email: string): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: 'Could not connect to authentication server. Please make sure the backend server is running.',
      };
    }
  },

  async verifyCode(email: string, code: string): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), code: code.trim() }),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: 'Verification failed. Backend server may be offline.',
      };
    }
  },

  async session(): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/session`, { headers: authHeaders() });
      return await res.json();
    } catch {
      return { success: false, message: 'Could not validate the current session.' };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: authHeaders() });
    } catch {
      // The local token is cleared by AuthContext regardless of network availability.
    }
  },

  async register(data: { email: string; password: string; name?: string; preferredLanguage?: string }): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed.' };
    }
  },

  async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        message: 'Could not connect to authentication server. Please ensure the backend is running.',
      };
    }
  },

  async forgotSendCode(email: string): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Server request failed. Backend may be offline.' };
    }
  },

  async forgotVerifyCode(email: string, code: string): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), code: code.trim() }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Verification failed.' };
    }
  },

  async forgotReset(data: { email: string; code: string; newPassword: string }): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Password reset request failed.' };
    }
  },
};

export const solarSystemsApi = {
  async getSystemsForUser(): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/systems`, { headers: authHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Could not fetch solar systems from server.' };
    }
  },

  async addSystem(systemData: any): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/systems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(systemData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Could not save solar system to database.' };
    }
  },

  async updateSystem(id: string, updates: any): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/systems/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Could not update system.' };
    }
  },

  async refreshMonitoring(id: string, admin = false): Promise<ApiResponse> {
    try {
      const path = admin ? `/admin/systems/${id}/monitoring/refresh` : `/systems/${id}/monitoring/refresh`;
      const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: authHeaders() });
      return await res.json();
    } catch {
      return { success: false, message: 'Could not request live FusionSolar readings.' };
    }
  },
};

export const adminSystemsApi = {
  async getAllSystems(): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/admin/systems`, { headers: authHeaders() });
      return await res.json();
    } catch {
      return { success: false, message: 'Could not fetch the system fleet.' };
    }
  },

  async linkFusionSolarStation(systemId: string, stationCode: string): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/admin/systems/${systemId}/provider`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ stationCode }),
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Could not link the FusionSolar station.' };
    }
  },
};

export const databaseApi = {
  async getOverview(): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/database/overview`, { headers: authHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Could not fetch database stats.' };
    }
  },

  async reset(): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE}/database/reset`, { method: 'POST', headers: authHeaders() });
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Could not reset database.' };
    }
  },
};

export const chatApi = {
  async askAssistant(query: string, language: string): Promise<{ reply: string; suggestions: string[]; isWarning?: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language }),
      });
      const data = await res.json();
      if (data.success) {
        return {
          reply: data.reply,
          suggestions: data.suggestions,
          isWarning: data.isWarning,
        };
      }
    } catch (err) {
      console.warn('Backend chat API offline, using client brain fallback');
    }
    // Fallback import
    const { findChatbotResponse } = await import('../data/mockChatbot');
    return findChatbotResponse(query, language as any);
  },
};

// API Client for Django Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  data?: any;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, ...fetchOptions } = options;

  const config: RequestInit = {
    ...fetchOptions,
    credentials: 'include', // Include cookies for session auth
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  };

  // Add CSRF token if available
  if (typeof window !== 'undefined') {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method || '')) {
      config.headers = {
        ...config.headers,
        'X-CSRFToken': csrfToken,
      };
    }
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }
      return {} as T;
    }

    const responseData = await response.json();

    if (!response.ok) {
      // Don't throw for 403 on /me endpoint (user not authenticated)
      if (response.status === 403 && endpoint.includes('/auth/me/')) {
        throw new ApiError('Not authenticated', response.status, responseData);
      }
      
      throw new ApiError(
        responseData.detail || responseData.message || 'An error occurred',
        response.status,
        responseData
      );
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0);
  }
}

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Get CSRF token from Django
export async function getCSRFToken(): Promise<void> {
  try {
    // Fetch from a public endpoint that exists
    await fetch(`${API_BASE_URL}/api/classlevels/`, {
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
}

// Authentication APIs
export const authAPI = {
  async login(username: string, password: string) {
    return request('/api/auth/login/', {
      method: 'POST',
      data: { username, password },
    });
  },

  async logout() {
    return request('/api/auth/logout/', {
      method: 'POST',
    });
  },

  async signup(data: {
    first_name: string;
    last_name: string;
    matricule: string;
    class_level: number;
    field?: number;
    password: string;
  }) {
    return request('/api/auth/signup/', {
      method: 'POST',
      data,
    });
  },

  async getCurrentUser() {
    return request<{
      id: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      role: 'student' | 'lecturer' | 'hod' | 'cellule' | 'admin';
      student_profile?: any;
      lecturer_profile?: any;
    }>('/api/auth/me/', {
      method: 'GET',
    });
  },
};

// Class Levels API
export const classLevelsAPI = {
  async list() {
    return request<any[]>('/api/classlevels/', {
      method: 'GET',
    });
  },

  async get(id: number) {
    return request<any>(`/api/classlevels/${id}/`, {
      method: 'GET',
    });
  },
};

// Fields API
export const fieldsAPI = {
  async list(levelId?: number) {
    const params = levelId ? `?level_id=${levelId}` : '';
    return request<any[]>(`/api/fields/${params}`, {
      method: 'GET',
    });
  },

  async get(id: number) {
    return request<any>(`/api/fields/${id}/`, {
      method: 'GET',
    });
  },
};

// Axes API
export const axesAPI = {
  async list(fieldId?: number) {
    const params = fieldId ? `?field_id=${fieldId}` : '';
    return request<any[]>(`/api/axes/${params}`, {
      method: 'GET',
    });
  },

  async get(id: number) {
    return request<any>(`/api/axes/${id}/`, {
      method: 'GET',
    });
  },
};

// Subjects API
export const subjectsAPI = {
  async list(params?: { field_id?: number; level_id?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.field_id) searchParams.append('field_id', params.field_id.toString());
    if (params?.level_id) searchParams.append('level_id', params.level_id.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<any[]>(`/api/subjects/${query}`, {
      method: 'GET',
    });
  },

  async get(id: number) {
    return request<any>(`/api/subjects/${id}/`, {
      method: 'GET',
    });
  },
};

// Requests API
export const requestsAPI = {
  async list(params?: { status?: string; type?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<any>(`/api/requests/${query}`, {
      method: 'GET',
    });
  },

  async get(id: string) {
    return request<any>(`/api/requests/${id}/`, {
      method: 'GET',
    });
  },

  async create(data: {
    class_level: number;
    field: number;
    axis?: number;
    subject: number;
    type: 'cc' | 'exam';
    current_score?: number;
    description: string;
  }) {
    return request<any>('/api/requests/', {
      method: 'POST',
      data,
    });
  },

  async update(id: string, data: any) {
    return request<any>(`/api/requests/${id}/`, {
      method: 'PATCH',
      data,
    });
  },

  async delete(id: string) {
    return request<any>(`/api/requests/${id}/`, {
      method: 'DELETE',
    });
  },

  async acknowledge(id: string) {
    return request<any>(`/api/requests/${id}/acknowledge/`, {
      method: 'POST',
    });
  },

  async decision(id: string, decision: 'approved' | 'rejected', reason?: string, new_score?: number) {
    const data: any = { decision }
    if (reason) data.reason = reason
    if (new_score !== undefined) data.new_score = new_score
    return request<any>(`/api/requests/${id}/decision/`, {
      method: 'POST',
      data,
    });
  },

  async sendToCellule(id: string) {
    return request<any>(`/api/requests/${id}/send_to_cellule/`, {
      method: 'POST',
    });
  },

  async returnFromCellule(id: string) {
    return request<any>(`/api/requests/${id}/return_from_cellule/`, {
      method: 'POST',
    });
  },

  async complete(id: string, data: {
    status: 'accepted' | 'rejected';
    new_score?: number;
    reason?: string;
  }) {
    return request<any>(`/api/requests/${id}/complete/`, {
      method: 'POST',
      data,
    });
  },

  async uploadAttachment(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const csrfToken = getCookie('csrftoken');
    const headers: any = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/api/requests/${id}/upload_attachment/`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.detail || 'Upload failed', response.status, error);
    }

    return response.json();
  },
};

// Notifications API
export const notificationsAPI = {
  async list() {
    return request<any[]>('/api/notifications/', {
      method: 'GET',
    });
  },

  async markRead(id: number) {
    return request<any>(`/api/notifications/${id}/mark_read/`, {
      method: 'POST',
    });
  },

  async unreadCount() {
    return request<{ unread_count: number }>('/api/notifications/unread_count/', {
      method: 'GET',
    });
  },
};

export default {
  authAPI,
  classLevelsAPI,
  fieldsAPI,
  axesAPI,
  subjectsAPI,
  requestsAPI,
  notificationsAPI,
};


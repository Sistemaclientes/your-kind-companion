const API_URL = 'http://localhost:3001/api';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Erro de conexão' }));
    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('saas_token');
      localStorage.removeItem('saas_user');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    throw new Error(err.error || 'Erro na requisição');
  }
  return response.json();
}

function getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = localStorage.getItem('saas_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(response);
    localStorage.setItem('saas_token', data.token);
    localStorage.setItem('saas_user', JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
  },

  getUser: () => {
    const user = localStorage.getItem('saas_user');
    return user ? JSON.parse(user) : null;
  }
};

export default api;